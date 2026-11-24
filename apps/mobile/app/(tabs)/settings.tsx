import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Switch,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  Share,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/src/store/useAppStore';
import {
  ShieldCheck,
  Lock,
  Trash2,
  Download,
  Upload,
  FileText,
  CheckCircle,
  User,
  Heart,
  Share2,
  Calendar,
  Sparkles,
  MapPin,
  Flame,
  Award,
  AlertTriangle,
  X,
  ExternalLink,
  ChevronRight,
  Compass,
  Palette,
  Globe,
  MessageSquarePlus,
  Edit3,
  Key,
  Fingerprint,
  HelpCircle,
  FileCheck,
  AlertCircle,
  FileDown,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useToast } from '@/src/context/ToastContext';
import { useMobileI18n } from '@/src/i18n/translations';
import * as Haptics from 'expo-haptics';
import { MrPlopIcon, LilDripIcon, SirFlushIcon } from '@/src/components/MascotIcons';
import { FeedbackModal } from '@/src/components/FeedbackModal';
import { ExportPdfModal } from '@/src/components/ExportPdfModal';
import { clearAllLocalData } from '@/src/db/sqlite';
import { authenticateWithBiometrics } from '@/src/services/auth';
import {
  verifyAppPin,
  saveAppPin,
  getSecurityQuestionIndex,
  saveSecurityQuestion,
  SECURITY_QUESTIONS,
} from '@/src/services/securityService';
import * as Linking from 'expo-linking';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { lang, setLanguage, t } = useMobileI18n();
  const {
    appLockEnabled,
    setAppLockEnabled,
    biometricEnabled,
    setBiometricEnabled,
    userId,
    userName,
    setUserName,
    logs,
    initialize,
    importLogs,
    mapTheme,
    setMapTheme,
    gpsRadiusMeter,
    setGpsRadiusMeter,
  } = useAppStore();

  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [tempName, setTempName] = useState(userName || '');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // State untuk Import JSON
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; error?: string } | null>(null);

  // State Keamanan PIN & Recovery
  const [changePinModalVisible, setChangePinModalVisible] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [changeNewPin, setChangeNewPin] = useState('');
  const [changeConfirmPin, setChangeConfirmPin] = useState('');
  const [changePinError, setChangePinError] = useState<string | null>(null);

  const [secQuestionModalVisible, setSecQuestionModalVisible] = useState(false);
  const [editSecQuestionIdx, setEditSecQuestionIdx] = useState(0);
  const [editSecAnswer, setEditSecAnswer] = useState('');
  const [secPinVerify, setSecPinVerify] = useState('');
  const [secModalError, setSecModalError] = useState<string | null>(null);

  const [disablePinModalVisible, setDisablePinModalVisible] = useState(false);
  const [disablePinInput, setDisablePinInput] = useState('');
  const [disablePinError, setDisablePinError] = useState<string | null>(null);

  // Perhitungan statistik profil
  const totalLogs = logs.length;
  const totalPee = logs.filter((l) => l.type === 'PEE' || l.type === 'COMBO').length;
  const totalPoop = logs.filter((l) => l.type === 'POOP' || l.type === 'COMBO').length;
  const totalCombo = logs.filter((l) => l.type === 'COMBO').length;

  const uniqueLocations = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.district) set.add(l.district);
    });
    return set.size;
  }, [logs]);

  // Tanggal bergabung / log pertama
  const memberSince = useMemo(() => {
    if (logs.length === 0) return 'Pengguna Baru';
    const sorted = [...logs].sort(
      (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
    );
    const firstDate = new Date(sorted[0].loggedAt);
    return firstDate.toLocaleDateString('id-ID', {
      month: 'short',
      year: 'numeric',
    });
  }, [logs]);

  const handleToggleAppLock = async () => {
    if (appLockEnabled) {
      setDisablePinInput('');
      setDisablePinError(null);
      setDisablePinModalVisible(true);
    } else {
      await setAppLockEnabled(true);
      showToast({
        message: 'Kunci keamanan aplikasi diaktifkan.',
        type: 'success',
      });
    }
  };

  const handleExecuteChangePin = async () => {
    setChangePinError(null);
    if (oldPin.length !== 4) {
      setChangePinError('PIN lama harus 4 digit.');
      return;
    }
    const isOldValid = await verifyAppPin(oldPin);
    if (!isOldValid) {
      setChangePinError('PIN lama tidak sesuai.');
      return;
    }
    if (changeNewPin.length !== 4) {
      setChangePinError('PIN baru harus 4 digit angka.');
      return;
    }
    if (changeNewPin !== changeConfirmPin) {
      setChangePinError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    await saveAppPin(changeNewPin);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setChangePinModalVisible(false);
    showToast({
      message: 'PIN keamanan berhasil diubah!',
      type: 'success',
    });
  };

  const handleExecuteSaveSecQuestion = async () => {
    setSecModalError(null);
    if (secPinVerify.length !== 4) {
      setSecModalError('Masukkan 4 digit PIN saat ini.');
      return;
    }
    const isPinValid = await verifyAppPin(secPinVerify);
    if (!isPinValid) {
      setSecModalError('PIN saat ini tidak cocok.');
      return;
    }
    if (!editSecAnswer.trim()) {
      setSecModalError('Jawaban pemulihan tidak boleh kosong.');
      return;
    }

    await saveSecurityQuestion(editSecQuestionIdx, editSecAnswer.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSecQuestionModalVisible(false);
    showToast({
      message: 'Pertanyaan pemulihan berhasil diperbarui!',
      type: 'success',
    });
  };

  const handleExecuteDisablePin = async () => {
    setDisablePinError(null);
    const isValid = await verifyAppPin(disablePinInput);
    if (!isValid) {
      setDisablePinError('PIN tidak sesuai.');
      return;
    }

    await setAppLockEnabled(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setDisablePinModalVisible(false);
    showToast({
      message: 'Kunci keamanan aplikasi telah dinonaktifkan.',
      type: 'info',
    });
  };

  const executeShareJSON = async () => {
    try {
      setIsExporting(true);
      const dataStr = JSON.stringify(logs, null, 2);

      // Coba bagikan via expo-sharing jika tersedia, atau fallback ke Share.share bawaan
      const isSharingAvailable = await Sharing.isAvailableAsync().catch(() => false);
      if (isSharingAvailable && Paths?.cache) {
        const tempFile = new File(Paths.cache, `goflushly-backup-${Date.now()}.json`);
        await tempFile.write(dataStr);
        await Sharing.shareAsync(tempFile.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Simpan / Bagikan Cadangan GoFlushly',
          UTI: 'public.json',
        });
      } else {
        await Share.share({
          title: 'GoFlushly - Cadangan Riwayat',
          message: dataStr,
        });
      }
      setExportSuccess(true);
    } catch (err) {
      console.log('Export share error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const executePickAndImportJSON = async () => {
    try {
      setIsImporting(true);
      setImportResult(null);

      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json', '*/*'],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) {
        setIsImporting(false);
        return;
      }

      const selectedAsset = res.assets[0];
      let jsonContent = '';

      if (selectedAsset.uri) {
        const fileRef = new File(selectedAsset.uri);
        jsonContent = await fileRef.text();
      }

      if (!jsonContent) {
        setImportResult({ count: 0, error: 'Berkas kosong atau tidak dapat dibaca.' });
        setIsImporting(false);
        return;
      }

      const parsed = JSON.parse(jsonContent);
      let logsToImport: any[] = [];

      if (Array.isArray(parsed)) {
        logsToImport = parsed;
      } else if (parsed && Array.isArray(parsed.logs)) {
        logsToImport = parsed.logs;
      } else {
        setImportResult({ count: 0, error: 'Format berkas JSON tidak sesuai struktur riwayat log.' });
        setIsImporting(false);
        return;
      }

      const count = await importLogs(logsToImport);
      setImportResult({ count });
    } catch (err: any) {
      console.log('Error importing logs:', err);
      setImportResult({
        count: 0,
        error: err?.message || 'Gagal mengimpor berkas. Pastikan format valid JSON.',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const executeClearData = async () => {
    await clearAllLocalData();
    await initialize();
    setDeleteModalVisible(false);
  };

  const openDonationSaweria = () => {
    Linking.openURL('https://saweria.co/goflushly');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Area */}
      <View style={styles.headerArea}>
        <Text style={styles.pageTitle}>{t.settings.title}</Text>
        <Text style={styles.pageSubtitle}>{t.settings.subtitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Hero */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            {/* Mascot Trio Mini Group */}
            <View style={styles.profileAvatarContainer}>
              <View style={[styles.miniMascotWrapper, { backgroundColor: Colors.bothTeal }]}>
                <SirFlushIcon size={38} />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {userName || t.settings.defaultName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setTempName(userName || '');
                    setEditNameModalVisible(true);
                  }}
                  style={styles.editNameBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Edit3 size={15} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.guestBadge}>
                <ShieldCheck size={11} color={Colors.bothTeal} />
                <Text style={styles.guestBadgeText}>
                  {t.settings.localOffline}
                </Text>
              </View>
              <Text style={styles.profileMemberSince} numberOfLines={1}>
                {`${lang === 'en' ? 'Active since' : 'Aktif sejak'} ${memberSince}`}
              </Text>
              <Text style={styles.profileId} numberOfLines={1} ellipsizeMode="middle">
                ID: {userId ? `${userId.slice(0, 8)}...${userId.slice(-4)}` : 'local-user'}
              </Text>
            </View>
          </View>

          {/* Quick Metrics Strip */}
          <View style={styles.metricsStrip}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{totalLogs}</Text>
              <Text style={styles.metricLabel}>{t.settings.totalLog}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: Colors.primary }]}>{totalPee}</Text>
              <Text style={styles.metricLabel}>BAK</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: Colors.poopBrown }]}>{totalPoop}</Text>
              <Text style={styles.metricLabel}>BAB</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: Colors.bothTeal }]}>{uniqueLocations}</Text>
              <Text style={styles.metricLabel}>{t.settings.location}</Text>
            </View>
          </View>
        </View>

        {/* Dukung Aplikasi (Saweria) */}
        <TouchableOpacity style={styles.donationCard} onPress={openDonationSaweria} activeOpacity={0.88}>
          <View style={styles.donationIconBox}>
            <Heart size={20} color="#FF6B6B" fill="#FF6B6B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.donationTitle}>{t.settings.saweriaTitle}</Text>
            <Text style={styles.donationSub}>{t.settings.saweriaSub}</Text>
          </View>
          <ExternalLink size={16} color={Colors.peachTint} />
        </TouchableOpacity>

        {/* PILIHAN BAHASA / LANGUAGE */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Globe size={16} color={Colors.bothTeal} />
            <Text style={styles.sectionHeading}>{t.settings.langHeading}</Text>
          </View>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{t.settings.langLabel}</Text>
              <Text style={styles.settingDesc}>{t.settings.langDesc}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['en', 'id'] as const).map((code) => {
                const active = lang === code;
                return (
                  <TouchableOpacity
                    key={code}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
                      setLanguage(code);
                    }}
                    style={[
                      styles.radiusChip,
                      { flex: 0, paddingHorizontal: 14, paddingVertical: 7 },
                      active && styles.radiusChipActive,
                    ]}
                  >
                    <Text style={[styles.radiusChipText, active && styles.radiusChipTextActive]}>
                      {code.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* KEAMANAN & PRIVASI */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ShieldCheck size={16} color={Colors.primary} />
            <Text style={styles.sectionHeading}>{t.settings.securityHeading}</Text>
          </View>

          {/* Toggle Kunci PIN */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: 'rgba(36, 71, 249, 0.15)' }]}>
                <Lock size={16} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>{t.settings.appLock}</Text>
                <Text style={styles.settingDesc}>{t.settings.appLockDesc}</Text>
              </View>
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={handleToggleAppLock}
              trackColor={{ false: '#CBD5E1', true: Colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#CBD5E1"
            />
          </View>

          {/* Ubah PIN Keamanan */}
          {appLockEnabled && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                setOldPin('');
                setChangeNewPin('');
                setChangeConfirmPin('');
                setChangePinError(null);
                setChangePinModalVisible(true);
              }}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(245, 183, 0, 0.15)' }]}>
                  <Key size={16} color={Colors.peeAmber} />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.actionLabel} numberOfLines={1}>{t.settings.changePin}</Text>
                  <Text style={styles.actionDesc} numberOfLines={2}>{t.settings.changePinDesc}</Text>
                </View>
              </View>
              <ChevronRight size={16} color={Colors.peachTint} />
            </TouchableOpacity>
          )}

          {/* Buka Cepat Biometrik */}
          {appLockEnabled && (
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(36, 71, 249, 0.12)' }]}>
                  <Fingerprint size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>{t.settings.biometricUnlock}</Text>
                  <Text style={styles.settingDesc}>{t.settings.biometricUnlockDesc}</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={(val) => setBiometricEnabled(val)}
                trackColor={{ false: '#CBD5E1', true: Colors.primary }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#CBD5E1"
              />
            </View>
          )}

          {/* Pertanyaan Pemulihan Lupa PIN */}
          {appLockEnabled && (
            <TouchableOpacity
              style={styles.actionRow}
              onPress={async () => {
                const idx = await getSecurityQuestionIndex();
                setEditSecQuestionIdx(idx);
                setEditSecAnswer('');
                setSecPinVerify('');
                setSecModalError(null);
                setSecQuestionModalVisible(true);
              }}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: 'rgba(36, 71, 249, 0.12)' }]}>
                  <HelpCircle size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.actionLabel} numberOfLines={1}>{t.settings.secQuestion}</Text>
                  <Text style={styles.actionDesc} numberOfLines={2}>{t.settings.secQuestionDesc}</Text>
                </View>
              </View>
              <ChevronRight size={16} color={Colors.peachTint} />
            </TouchableOpacity>
          )}

          <View style={styles.privacyNoteBox}>
            <Text style={styles.privacyNoteText}>
              🛡️ <Text style={{ fontWeight: '800', color: Colors.creamBg }}>{t.settings.privacyPrincipleTitle}</Text> {t.settings.privacyPrincipleBody}
            </Text>
          </View>
        </View>

        {/* KUSTOMISASI PETA & LOKASI GPS */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Compass size={16} color={Colors.peeAmber} />
            <Text style={styles.sectionHeading}>{t.settings.mapHeading}</Text>
          </View>

          {/* Pemilihan Tema Peta */}
          <View style={styles.customSubSection}>
            <Text style={styles.customSubLabel}>{t.settings.mapThemeLabel}</Text>
            <View style={styles.themeSelectorRow}>
              {[
                { id: 'DARK' as const, label: t.settings.themes.DARK.label, desc: t.settings.themes.DARK.desc },
                { id: 'RETRO' as const, label: t.settings.themes.RETRO.label, desc: t.settings.themes.RETRO.desc },
                { id: 'STANDARD' as const, label: t.settings.themes.STANDARD.label, desc: t.settings.themes.STANDARD.desc },
              ].map((item) => {
                const isActive = mapTheme === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.themeCardOption,
                      isActive && styles.themeCardActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
                      setMapTheme(item.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.themeOptionTitle,
                        isActive && { color: Colors.creamBg, fontWeight: '900' },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    <Text style={styles.themeOptionDesc} numberOfLines={2}>
                      {item.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Pengaturan Radius GPS */}
          <View style={styles.customSubSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.customSubLabel, { flex: 1, marginBottom: 0 }]} numberOfLines={1}>
                {t.settings.radiusLabel}
              </Text>
              <Text style={styles.radiusMeterBadge}>{gpsRadiusMeter} {t.settings.meters}</Text>
            </View>
            <View style={styles.radiusButtonRow}>
              {[15, 30, 50, 100].map((r) => {
                const isSelected = gpsRadiusMeter === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.radiusChip,
                      isSelected && styles.radiusChipActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
                      setGpsRadiusMeter(r);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.radiusChipText,
                        isSelected && styles.radiusChipTextActive,
                      ]}
                    >
                      {r}m
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* CADANGAN & DATA LOKAL */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Download size={16} color={Colors.bothTeal} />
            <Text style={styles.sectionHeading} numberOfLines={1}>
              {t.settings.dataHeading}
            </Text>
          </View>

          {/* Ekspor Laporan PDF */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setPdfModalVisible(true);
            }}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: '#EEF2FF' }]}>
                <FileDown size={16} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.actionLabel} numberOfLines={1}>
                  {t.settings.exportPdfTitle}
                </Text>
                <Text style={styles.actionDesc} numberOfLines={2}>
                  {t.settings.exportPdfDesc}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={Colors.peachTint} />
          </TouchableOpacity>

          {/* Ekspor JSON */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              setExportSuccess(false);
              setExportModalVisible(true);
            }}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: 'rgba(47, 184, 172, 0.15)' }]}>
                <FileText size={16} color={Colors.bothTeal} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.actionLabel} numberOfLines={1}>
                  {t.settings.exportTitle}
                </Text>
                <Text style={styles.actionDesc} numberOfLines={2}>
                  {t.settings.exportDesc}
                </Text>
              </View>
            </View>
            <Share2 size={16} color={Colors.peachTint} />
          </TouchableOpacity>

          {/* Impor JSON */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              setImportResult(null);
              setImportModalVisible(true);
            }}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: 'rgba(245, 183, 0, 0.15)' }]}>
                <Upload size={16} color={Colors.peeAmber} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.actionLabel} numberOfLines={1}>
                  {t.settings.importTitle}
                </Text>
                <Text style={styles.actionDesc} numberOfLines={2}>
                  {t.settings.importDesc}
                </Text>
              </View>
            </View>
            <Download size={16} color={Colors.peachTint} />
          </TouchableOpacity>

          {/* Kritik & Saran */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
              setFeedbackModalVisible(true);
            }}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: 'rgba(47, 184, 172, 0.15)' }]}>
                <MessageSquarePlus size={16} color={Colors.bothTeal} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.actionLabel} numberOfLines={1}>{t.settings.feedbackTitle}</Text>
                <Text style={styles.actionDesc} numberOfLines={2}>{t.settings.feedbackDesc}</Text>
              </View>
            </View>
            <ChevronRight size={16} color={Colors.peachTint} />
          </TouchableOpacity>

          {/* Syarat & Ketentuan (Terms & Conditions) */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
              router.push('/terms');
            }}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: 'rgba(36, 71, 249, 0.15)' }]}>
                <FileCheck size={16} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.actionLabel} numberOfLines={1}>{t.settings.termsLink}</Text>
                <Text style={styles.actionDesc} numberOfLines={2}>{t.settings.termsLinkDesc}</Text>
              </View>
            </View>
            <ChevronRight size={16} color={Colors.peachTint} />
          </TouchableOpacity>
        </View>

        {/* ZONA DATA PRIBADI (HAPUS RIWAYAT) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Trash2 size={16} color={Colors.emergencyRed} />
            <Text style={[styles.sectionHeading, { color: Colors.emergencyRed }]} numberOfLines={1}>
              {t.settings.dangerHeading}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.actionRow, { borderColor: 'rgba(255, 90, 95, 0.3)' }]}
            onPress={() => setDeleteModalVisible(true)}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: 'rgba(255, 90, 95, 0.15)' }]}>
                <Trash2 size={16} color={Colors.emergencyRed} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.actionLabel, { color: Colors.emergencyRed }]} numberOfLines={1}>
                  {t.settings.deleteAllTitle}
                </Text>
                <Text style={styles.actionDesc} numberOfLines={2}>
                  {t.settings.deleteAllDesc}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>GoFlushly Mobile • v1.0.0</Text>
          <Text style={styles.footerSubText}>Dibuat dengan ❤️ untuk kenyamanan biologis Anda</Text>
        </View>
      </ScrollView>

      {/* 1. MODAL EKSPOR DATA LEBIH MENARIK */}
      <Modal
        visible={exportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconRing, { backgroundColor: 'rgba(47, 184, 172, 0.2)' }]}>
                <Download size={24} color={Colors.bothTeal} />
              </View>
              <TouchableOpacity onPress={() => setExportModalVisible(false)} style={styles.modalCloseIcon}>
                <X size={18} color={Colors.peachTint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHeading}>Ekspor Cadangan Data</Text>
            <Text style={styles.modalDescription}>
              Data Anda akan diekspor dalam format <Text style={{ fontWeight: '800', color: Colors.creamBg }}>JSON standar</Text>. Anda dapat menyimpannya ke berkas, Google Drive, atau mengirimkannya ke perangkat lain.
            </Text>

            {/* Kotak Ringkasan Data yang Diekspor */}
            <View style={styles.exportSummaryCard}>
              <View style={styles.exportSummaryRow}>
                <Text style={styles.exportSummaryKey}>Total Riwayat Log:</Text>
                <Text style={styles.exportSummaryVal}>{totalLogs} Catatan</Text>
              </View>
              <View style={styles.exportSummaryRow}>
                <Text style={styles.exportSummaryKey}>Format Berkas:</Text>
                <Text style={styles.exportSummaryVal}>application/json</Text>
              </View>
              <View style={styles.exportSummaryRow}>
                <Text style={styles.exportSummaryKey}>Status Enkripsi:</Text>
                <Text style={[styles.exportSummaryVal, { color: Colors.bothTeal }]}>Lokal & Terbaca</Text>
              </View>
            </View>

            {exportSuccess && (
              <View style={styles.successBadgeBox}>
                <CheckCircle size={14} color={Colors.bothTeal} />
                <Text style={styles.successBadgeText}>Berhasil dibagikan / dicadangkan!</Text>
              </View>
            )}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setExportModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Tutup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmExportBtn}
                onPress={executeShareJSON}
                disabled={isExporting}
              >
                <Share2 size={16} color="#000" />
                <Text style={styles.confirmExportBtnText}>
                  {isExporting ? 'Menyiapkan...' : 'Bagikan / Simpan'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. MODAL IMPOR DATA JSON */}
      <Modal
        visible={importModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconRing, { backgroundColor: 'rgba(245, 183, 0, 0.2)' }]}>
                <Upload size={24} color={Colors.peeAmber} />
              </View>
              <TouchableOpacity onPress={() => setImportModalVisible(false)} style={styles.modalCloseIcon}>
                <X size={18} color={Colors.peachTint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHeading}>Impor Cadangan Data</Text>
            <Text style={styles.modalDescription}>
              Pilih berkas <Text style={{ fontWeight: '800', color: Colors.creamBg }}>JSON</Text> cadangan GoFlushly dari penyimpanan ponsel Anda. Catatan yang ada tidak akan terhapus, data baru akan digabungkan.
            </Text>

            {/* Kotak Info Format */}
            <View style={styles.exportSummaryCard}>
              <View style={styles.exportSummaryRow}>
                <Text style={styles.exportSummaryKey}>Format Target:</Text>
                <Text style={styles.exportSummaryVal}>JSON (.json)</Text>
              </View>
              <View style={styles.exportSummaryRow}>
                <Text style={styles.exportSummaryKey}>Strategi:</Text>
                <Text style={[styles.exportSummaryVal, { color: Colors.bothTeal }]}>Merge / Insert OR Replace</Text>
              </View>
              <View style={styles.exportSummaryRow}>
                <Text style={styles.exportSummaryKey}>Jumlah Log Saat Ini:</Text>
                <Text style={styles.exportSummaryVal}>{totalLogs} Catatan</Text>
              </View>
            </View>

            {/* Notifikasi Hasil Import */}
            {importResult && (
              <View
                style={[
                  styles.successBadgeBox,
                  importResult.error
                    ? { backgroundColor: 'rgba(255, 90, 95, 0.15)' }
                    : { backgroundColor: 'rgba(47, 184, 172, 0.15)' },
                ]}
              >
                {importResult.error ? (
                  <>
                    <AlertTriangle size={15} color={Colors.emergencyRed} />
                    <Text style={[styles.successBadgeText, { color: Colors.emergencyRed, flex: 1 }]}>
                      {importResult.error}
                    </Text>
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} color={Colors.bothTeal} />
                    <Text style={[styles.successBadgeText, { color: Colors.bothTeal, flex: 1 }]}>
                      Sukses mengimpor {importResult.count} catatan baru!
                    </Text>
                  </>
                )}
              </View>
            )}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setImportModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Tutup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmExportBtn, { backgroundColor: Colors.bothTeal }]}
                onPress={executePickAndImportJSON}
                disabled={isImporting}
              >
                <Upload size={16} color="#000" />
                <Text style={styles.confirmExportBtnText}>
                  {isImporting ? 'Membaca...' : 'Pilih Berkas JSON'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. MODAL KONFIRMASI HAPUS DATA LEBIH INFORMATIF */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconRing, { backgroundColor: 'rgba(255, 90, 95, 0.2)' }]}>
                <AlertTriangle size={24} color={Colors.emergencyRed} />
              </View>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={styles.modalCloseIcon}>
                <X size={18} color={Colors.peachTint} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalHeading, { color: Colors.emergencyRed }]}>Hapus Seluruh Riwayat?</Text>
            <Text style={styles.modalDescription}>
              Tindakan ini akan menghapus permanen sebanyak <Text style={{ fontWeight: '900', color: Colors.creamBg }}>{totalLogs} catatan</Text> buang air dari memori lokal HP Anda.
            </Text>

            <View style={styles.warningAlertBox}>
              <Text style={styles.warningAlertText}>
                ⚠️ <Text style={{ fontWeight: '800' }}>Peringatan Penting:</Text> Riwayat yang telah dihapus <Text style={{ fontWeight: '800' }}>tidak dapat dipulihkan kembali</Text>. Pastikan Anda sudah mengekspor cadangan jika sewaktu-waktu masih dibutuhkan.
              </Text>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                onPress={executeClearData}
              >
                <Trash2 size={16} color="#FFF" />
                <Text style={styles.confirmDeleteBtnText}>Ya, Hapus Permanen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 4. MODAL UBAH NAMA PROFIL */}
      <Modal
        visible={editNameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditNameModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconRing, { backgroundColor: 'rgba(47, 184, 172, 0.15)' }]}>
                <User size={22} color={Colors.bothTeal} />
              </View>
              <TouchableOpacity
                onPress={() => setEditNameModalVisible(false)}
                style={styles.modalCloseIcon}
              >
                <X size={18} color={Colors.peachTint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHeading}>{t.settings.editNameTitle}</Text>
            <Text style={styles.modalDescription}>{t.settings.editNamePrompt}</Text>

            <TextInput
              style={styles.nameTextInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder={t.welcome.namePlaceholder}
              placeholderTextColor="#94A3B8"
              autoCapitalize="words"
              maxLength={30}
              returnKeyType="done"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setEditNameModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelModalBtnText}>{t.settings.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmDeleteBtn, { backgroundColor: Colors.primary }]}
                onPress={async () => {
                  const trimmed = tempName.trim() || t.settings.defaultName;
                  await setUserName(trimmed);
                  setEditNameModalVisible(false);
                  showToast({
                    message: t.settings.nameSavedToast,
                    type: 'success',
                  });
                }}
                activeOpacity={0.8}
              >
                <CheckCircle size={16} color="#FFF" />
                <Text style={styles.confirmDeleteBtnText}>{t.settings.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 5. MODAL UBAH PIN */}
      <Modal
        visible={changePinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChangePinModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconRing, { backgroundColor: 'rgba(245, 183, 0, 0.15)' }]}>
                <Key size={22} color={Colors.peeAmber} />
              </View>
              <TouchableOpacity
                onPress={() => setChangePinModalVisible(false)}
                style={styles.modalCloseIcon}
              >
                <X size={18} color={Colors.peachTint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHeading}>{t.settings.changePin}</Text>
            <Text style={styles.modalDescription}>Masukkan PIN saat ini dan buat 4-digit PIN baru.</Text>

            {changePinError && (
              <View style={styles.securityErrorBox}>
                <AlertCircle size={14} color={Colors.emergencyRed} />
                <Text style={styles.securityErrorText}>{changePinError}</Text>
              </View>
            )}

            <Text style={styles.inputSubLabel}>PIN LAMA</Text>
            <TextInput
              style={[styles.nameTextInput, styles.pinCenteredInput]}
              value={oldPin}
              onChangeText={(val) => {
                setOldPin(val.replace(/[^0-9]/g, '').slice(0, 4));
                setChangePinError(null);
              }}
              placeholder="••••"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />

            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputSubLabel}>PIN BARU</Text>
                <TextInput
                  style={[styles.nameTextInput, styles.pinCenteredInput]}
                  value={changeNewPin}
                  onChangeText={(val) => {
                    setChangeNewPin(val.replace(/[^0-9]/g, '').slice(0, 4));
                    setChangePinError(null);
                  }}
                  placeholder="••••"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputSubLabel}>KONFIRMASI</Text>
                <TextInput
                  style={[styles.nameTextInput, styles.pinCenteredInput]}
                  value={changeConfirmPin}
                  onChangeText={(val) => {
                    setChangeConfirmPin(val.replace(/[^0-9]/g, '').slice(0, 4));
                    setChangePinError(null);
                  }}
                  placeholder="••••"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setChangePinModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>{t.settings.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmDeleteBtn, { backgroundColor: Colors.primary }]}
                onPress={handleExecuteChangePin}
              >
                <CheckCircle size={16} color="#FFF" />
                <Text style={styles.confirmDeleteBtnText}>{t.settings.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 6. MODAL UBAH PERTANYAAN PEMULIHAN */}
      <Modal
        visible={secQuestionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSecQuestionModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconRing, { backgroundColor: 'rgba(47, 184, 172, 0.15)' }]}>
                <HelpCircle size={22} color={Colors.bothTeal} />
              </View>
              <TouchableOpacity
                onPress={() => setSecQuestionModalVisible(false)}
                style={styles.modalCloseIcon}
              >
                <X size={18} color={Colors.peachTint} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalHeading}>{t.settings.secQuestion}</Text>
            <Text style={styles.modalDescription}>Verifikasi PIN saat ini untuk memperbarui pertanyaan pemulihan.</Text>

            {secModalError && (
              <View style={styles.securityErrorBox}>
                <AlertCircle size={14} color={Colors.emergencyRed} />
                <Text style={styles.securityErrorText}>{secModalError}</Text>
              </View>
            )}

            <Text style={styles.inputSubLabel}>PIN SAAT INI</Text>
            <TextInput
              style={[styles.nameTextInput, styles.pinCenteredInput]}
              value={secPinVerify}
              onChangeText={(val) => {
                setSecPinVerify(val.replace(/[^0-9]/g, '').slice(0, 4));
                setSecModalError(null);
              }}
              placeholder="••••"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />

            <Text style={styles.inputSubLabel}>PILIH PERTANYAAN BARU</Text>
            <View style={{ gap: 6, marginBottom: 12, width: '100%' }}>
              {(lang === 'en' ? SECURITY_QUESTIONS.en : SECURITY_QUESTIONS.id).map((q, idx) => {
                const isSelected = editSecQuestionIdx === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.secQuestionOption,
                      isSelected && styles.secQuestionOptionActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setEditSecQuestionIdx(idx);
                    }}
                  >
                    <Text
                      style={[
                        styles.secQuestionOptionText,
                        isSelected && styles.secQuestionOptionTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {q}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputSubLabel}>JAWABAN PEMULIHAN</Text>
            <TextInput
              style={styles.nameTextInput}
              value={editSecAnswer}
              onChangeText={(val) => {
                setEditSecAnswer(val);
                setSecModalError(null);
              }}
              placeholder="Tuliskan jawaban baru..."
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setSecQuestionModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>{t.settings.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmDeleteBtn, { backgroundColor: Colors.bothTeal }]}
                onPress={handleExecuteSaveSecQuestion}
              >
                <CheckCircle size={16} color="#FFF" />
                <Text style={styles.confirmDeleteBtnText}>{t.settings.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 7. MODAL KONFIRMASI MATIKAN KUNCI PIN */}
      <Modal
        visible={disablePinModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDisablePinModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeaderRow}>
              <View style={[styles.modalIconRing, { backgroundColor: 'rgba(255, 90, 95, 0.15)' }]}>
                <Lock size={22} color={Colors.emergencyRed} />
              </View>
              <TouchableOpacity
                onPress={() => setDisablePinModalVisible(false)}
                style={styles.modalCloseIcon}
              >
                <X size={18} color={Colors.peachTint} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalHeading, { color: Colors.emergencyRed }]}>Matikan Kunci Aplikasi?</Text>
            <Text style={styles.modalDescription}>
              Masukkan 4 digit PIN Anda saat ini untuk mengonfirmasi penonaktifan proteksi layar.
            </Text>

            {disablePinError && (
              <View style={styles.securityErrorBox}>
                <AlertCircle size={14} color={Colors.emergencyRed} />
                <Text style={styles.securityErrorText}>{disablePinError}</Text>
              </View>
            )}

            <TextInput
              style={[styles.nameTextInput, styles.pinCenteredInput]}
              value={disablePinInput}
              onChangeText={(val) => {
                setDisablePinInput(val.replace(/[^0-9]/g, '').slice(0, 4));
                setDisablePinError(null);
              }}
              placeholder="••••"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setDisablePinModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>{t.settings.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmDeleteBtn, { backgroundColor: Colors.emergencyRed }]}
                onPress={handleExecuteDisablePin}
              >
                <Text style={styles.confirmDeleteBtnText}>Matikan Proteksi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 8. MODAL KRITIK & SARAN (FEEDBACK) */}
      <FeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        userEmail={null}
        userId={null}
        onSuccess={() => {
          showToast({
            message: lang === 'en' ? 'Thank you for your feedback!' : 'Terima kasih atas masukan Anda!',
            type: 'success',
          });
        }}
      />

      {/* 9. MODAL EKSPOR LAPORAN PDF */}
      <ExportPdfModal
        visible={pdfModalVisible}
        onClose={() => setPdfModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 8 : 10,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.creamBg,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 12,
    color: Colors.peachTint,
    opacity: 0.7,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileAvatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMascotWrapper: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editNameBtn: {
    padding: 6,
    backgroundColor: 'rgba(36, 71, 249, 0.1)',
    borderRadius: 8,
  },
  profileName: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: '900',
    color: Colors.creamBg,
  },
  guestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: 'rgba(47, 184, 172, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(47, 184, 172, 0.35)',
    marginTop: 4,
    marginBottom: 2,
  },
  guestBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.bothTeal,
    letterSpacing: 0.3,
  },
  profileMemberSince: {
    fontSize: 11,
    color: Colors.peachTint,
    opacity: 0.7,
    marginTop: 2,
  },
  profileId: {
    fontSize: 10,
    color: Colors.peachTint,
    opacity: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  metricsStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.darkBg,
    borderRadius: 16,
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.creamBg,
  },
  metricLabel: {
    fontSize: 9,
    color: Colors.peachTint,
    opacity: 0.6,
    marginTop: 2,
    fontWeight: '700',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.darkBorder,
  },
  donationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 107, 107, 0.35)',
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  donationIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.creamBg,
  },
  donationSub: {
    fontSize: 10,
    color: Colors.peachTint,
    opacity: 0.75,
    marginTop: 2,
  },
  section: {
    backgroundColor: Colors.darkSurface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    padding: 16,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sectionHeading: {
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    color: Colors.peachTint,
    letterSpacing: 0.8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  settingIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.creamBg,
  },
  settingDesc: {
    fontSize: 10,
    color: Colors.peachTint,
    opacity: 0.6,
    marginTop: 1,
  },
  privacyNoteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginTop: 4,
  },
  privacyNoteText: {
    fontSize: 11,
    color: Colors.slate,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.creamBg,
  },
  actionDesc: {
    fontSize: 10,
    color: Colors.peachTint,
    opacity: 0.6,
    marginTop: 1,
  },
  syncFeedbackBox: {
    backgroundColor: 'rgba(47, 184, 172, 0.12)',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(47, 184, 172, 0.3)',
  },
  syncFeedbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.bothTeal,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 14,
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.peachTint,
    opacity: 0.5,
  },
  footerSubText: {
    fontSize: 10,
    color: Colors.peachTint,
    opacity: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: Colors.darkBg,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.darkBorder,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalIconRing: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: Colors.darkSurface,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.creamBg,
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 12,
    color: Colors.peachTint,
    opacity: 0.8,
    lineHeight: 18,
    marginBottom: 14,
  },
  nameTextInput: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.darkSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    paddingHorizontal: 16,
    color: Colors.creamBg,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 20,
  },
  securityErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  securityErrorText: {
    color: Colors.emergencyRed,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  inputSubLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.peachTint,
    letterSpacing: 0.5,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  pinCenteredInput: {
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 6,
    fontWeight: '800',
    marginBottom: 12,
  },
  secQuestionOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.darkBg,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  secQuestionOptionActive: {
    borderColor: Colors.bothTeal,
    backgroundColor: 'rgba(47, 184, 172, 0.1)',
  },
  secQuestionOptionText: {
    fontSize: 11,
    color: Colors.peachTint,
    fontWeight: '600',
  },
  secQuestionOptionTextActive: {
    color: Colors.bothTeal,
    fontWeight: '800',
  },
  exportSummaryCard: {
    backgroundColor: Colors.darkSurface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    gap: 6,
    marginBottom: 14,
  },
  exportSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportSummaryKey: {
    fontSize: 11,
    color: Colors.peachTint,
    opacity: 0.6,
  },
  exportSummaryVal: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.creamBg,
  },
  successBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(47, 184, 172, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  successBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.bothTeal,
  },
  warningAlertBox: {
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.35)',
    marginBottom: 16,
  },
  warningAlertText: {
    fontSize: 11,
    color: Colors.emergencyRed,
    lineHeight: 17,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: Colors.darkSurface,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  cancelModalBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.peachTint,
  },
  confirmExportBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmExportBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  confirmDeleteBtn: {
    flex: 2,
    backgroundColor: Colors.emergencyRed,
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmDeleteBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFF',
  },
  // Custom Map Customization & Radius Styles
  customSubSection: {
    marginBottom: 14,
  },
  customSubLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.peachTint,
    marginBottom: 8,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeCardOption: {
    flex: 1,
    backgroundColor: Colors.darkBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.darkBorder,
    paddingVertical: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(36, 71, 249, 0.08)',
  },
  themeOptionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.peachTint,
    textAlign: 'center',
  },
  themeOptionDesc: {
    fontSize: 9,
    color: Colors.peachTint,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 2,
  },
  radiusMeterBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.bothTeal,
  },
  radiusButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusChip: {
    flex: 1,
    backgroundColor: Colors.darkBg,
    borderWidth: 1.5,
    borderColor: Colors.darkBorder,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusChipActive: {
    backgroundColor: 'rgba(47, 184, 172, 0.15)',
    borderColor: Colors.bothTeal,
  },
  radiusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.peachTint,
  },
  radiusChipTextActive: {
    color: Colors.bothTeal,
    fontWeight: '900',
  },
  logoutInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(47, 184, 172, 0.12)',
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  logoutInfoText: {
    fontSize: 11,
    color: Colors.bothTeal,
    fontWeight: '700',
    flex: 1,
  },
});
