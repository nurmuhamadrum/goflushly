import { create } from 'zustand';
import { AppLanguage, Log } from '@go-flushly/shared';
import * as SecureStore from 'expo-secure-store';
import {
  getLocalLogs,
  insertLocalLog,
  insertMultipleLocalLogs,
  updateLocalLogMoodAndNote,
  deleteLocalLog,
  getDatabase,
  getUnlockedBadgeIds,
  saveUnlockedBadge,
  getUserPreference,
  setUserPreference,
} from '../db/sqlite';
import { BadgeDefinition, findNewlyUnlockedBadges } from '../services/badgeEvaluator';
import {
  getAppLockEnabled,
  saveAppLockEnabled,
  getBiometricEnabled,
  saveBiometricEnabled,
  isPinSet,
} from '../services/securityService';
import * as Crypto from 'expo-crypto';

interface AppState {
  logs: Log[];
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  isAnonymous: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  showWelcomeModal: boolean;
  isAppLocked: boolean;

  // Lencana Baru yang Perlu Ditampilkan di Modal
  unlockedBadgeQueue: BadgeDefinition[];
  dismissActiveBadgeModal: () => void;

  mapFilter: 'ALL' | 'PEE' | 'POOP' | 'COMBO';
  mapTheme: 'DARK' | 'RETRO' | 'STANDARD';
  gpsRadiusMeter: number;
  appLockEnabled: boolean;
  biometricEnabled: boolean;
  language: AppLanguage;

  initialize: () => Promise<void>;
  setUser: (userId: string, email?: string | null, isAnonymous?: boolean) => void;
  setUserName: (name: string) => Promise<void>;
  setShowWelcomeModal: (show: boolean) => void;
  setAppLocked: (locked: boolean) => void;
  setAppLockEnabled: (enabled: boolean) => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  syncWithCloud: () => Promise<{ success: boolean; uploadedCount: number; downloadedCount: number }>;
  addLog: (logData: Omit<Log, 'id' | 'userId' | 'clientCreatedAt' | 'syncStatus'>) => Promise<Log>;
  importLogs: (importedLogs: Log[]) => Promise<number>;
  updateLogMoodAndNote: (id: string, mood: string, note: string) => Promise<void>;
  removeLog: (id: string) => Promise<void>;
  setMapFilter: (filter: 'ALL' | 'PEE' | 'POOP' | 'COMBO') => void;
  setMapTheme: (theme: 'DARK' | 'RETRO' | 'STANDARD') => void;
  setGpsRadiusMeter: (radius: number) => void;
  toggleAppLock: () => void;
  setLanguage: (lang: AppLanguage) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  logs: [],
  userId: null,
  userName: null,
  userEmail: null,
  isAnonymous: true,
  isLoading: true,
  isSyncing: false,
  lastSyncedAt: null,
  showWelcomeModal: false,
  isAppLocked: false,
  unlockedBadgeQueue: [],
  mapFilter: 'ALL',
  mapTheme: 'RETRO',
  gpsRadiusMeter: 30,
  appLockEnabled: true,
  biometricEnabled: true,
  language: 'id',

  dismissActiveBadgeModal: () => {
    set((state) => ({
      unlockedBadgeQueue: state.unlockedBadgeQueue.slice(1),
    }));
  },

  setUser: (userId: string, email?: string | null, isAnonymous: boolean = false) => {
    set({ userId, userEmail: email ?? null, isAnonymous });
  },

  setUserName: async (name: string) => {
    const trimmed = name.trim();
    await setUserPreference('profile_name', trimmed);
    set({ userName: trimmed });
  },

  setShowWelcomeModal: (show: boolean) => {
    set({ showWelcomeModal: show });
  },

  setAppLocked: (locked: boolean) => {
    set({ isAppLocked: locked });
  },

  setAppLockEnabled: async (enabled: boolean) => {
    await saveAppLockEnabled(enabled);
    set({ appLockEnabled: enabled });
  },

  setBiometricEnabled: async (enabled: boolean) => {
    await saveBiometricEnabled(enabled);
    set({ biometricEnabled: enabled });
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      await getDatabase();

      // Ambil nama profil dan user ID lokal dari SQLite
      const storedName = await getUserPreference('profile_name');
      let localUserId = await getUserPreference('local_user_id');
      if (!localUserId) {
        localUserId = Crypto.randomUUID();
        await setUserPreference('local_user_id', localUserId);
      }

      const loadedLogs = await getLocalLogs();
      const savedLang = await SecureStore.getItemAsync('goflushly_language').catch(() => null);
      const activeLang: AppLanguage = savedLang === 'id' || savedLang === 'en' ? savedLang : 'id';

      const isFirstTime = !storedName || storedName.trim().length === 0;

      const storedLockEnabled = await getAppLockEnabled();
      const storedBiometric = await getBiometricEnabled();
      const pinConfigured = await isPinSet();

      const shouldLock = Boolean(storedLockEnabled && pinConfigured && !isFirstTime);

      set({
        userId: localUserId,
        userName: storedName,
        userEmail: null,
        isAnonymous: true,
        showWelcomeModal: isFirstTime,
        appLockEnabled: storedLockEnabled,
        biometricEnabled: storedBiometric,
        isAppLocked: shouldLock,
        logs: loadedLogs,
        language: activeLang,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to initialize local store:', error);
      set({ isLoading: false });
    }
  },

  syncWithCloud: async () => {
    // 100% Offline Local mode - no cloud sync required
    return {
      success: true,
      uploadedCount: 0,
      downloadedCount: 0,
    };
  },

  addLog: async (logData) => {
    let currentUserId = get().userId;
    if (!currentUserId) {
      currentUserId = Crypto.randomUUID();
      await setUserPreference('local_user_id', currentUserId);
      set({ userId: currentUserId });
    }

    const now = new Date().toISOString();
    const newId = Crypto.randomUUID();

    const fullLog: Log = {
      ...logData,
      id: newId,
      userId: currentUserId,
      clientCreatedAt: now,
      syncStatus: 'synced',
    };

    // Simpan ke SQLite
    await insertLocalLog(fullLog);

    const updatedLogs = [fullLog, ...get().logs];

    // Evaluasi apakah ada lencana baru yang berhasil diraih
    try {
      const alreadyUnlocked = await getUnlockedBadgeIds();
      const newlyEarned = findNewlyUnlockedBadges(updatedLogs, alreadyUnlocked);

      if (newlyEarned.length > 0) {
        for (const b of newlyEarned) {
          await saveUnlockedBadge(b.id);
        }
        set((state) => ({
          logs: updatedLogs,
          unlockedBadgeQueue: [...state.unlockedBadgeQueue, ...newlyEarned],
        }));
      } else {
        set({ logs: updatedLogs });
      }
    } catch (e) {
      console.log('Badge evaluation error:', e);
      set({ logs: updatedLogs });
    }

    return fullLog;
  },

  importLogs: async (importedLogs: Log[]) => {
    // Validasi dan filter log yang valid
    const validLogs = importedLogs.filter(
      (l) => l && l.id && l.type && typeof l.latitude === 'number' && typeof l.longitude === 'number'
    );

    if (validLogs.length > 0) {
      await insertMultipleLocalLogs(validLogs);
      const reloadedLogs = await getLocalLogs();
      set({ logs: reloadedLogs });
    }

    return validLogs.length;
  },

  updateLogMoodAndNote: async (id: string, mood: string, note: string) => {
    await updateLocalLogMoodAndNote(id, mood, note);

    set((state) => ({
      logs: state.logs.map((l) => (l.id === id ? { ...l, mood, note } : l)),
    }));
  },

  removeLog: async (id: string) => {
    await deleteLocalLog(id);
    set((state) => ({
      logs: state.logs.filter((l) => l.id !== id),
    }));
  },

  setMapFilter: (filter) => set({ mapFilter: filter }),
  setMapTheme: (theme) => set({ mapTheme: theme }),
  setGpsRadiusMeter: (radius) => set({ gpsRadiusMeter: radius }),
  toggleAppLock: () => set((state) => ({ appLockEnabled: !state.appLockEnabled })),
  setLanguage: async (language: AppLanguage) => {
    set({ language });
    await SecureStore.setItemAsync('goflushly_language', language).catch(() => { });
  },
}));
