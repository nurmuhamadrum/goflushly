import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';
import { darkMapStyle, retroMapStyle } from '@/constants/MapStyle';
import { useAppStore } from '@/src/store/useAppStore';
import { useMobileI18n } from '@/src/i18n/translations';
import { useToast } from '@/src/context/ToastContext';
import { getUserPreference, setUserPreference } from '@/src/db/sqlite';
import { MrPlopIcon, LilDripIcon, SirFlushIcon } from '@/src/components/MascotIcons';
import { BristolStoolIcon } from '@/src/components/BristolStoolIcons';
import { LocationPermissionModal } from '@/src/components/LocationPermissionModal';
import { Log } from '@go-flushly/shared';
import {
  Navigation,
  X,
  ChevronRight,
  Calendar,
  Clock,
  Smile,
  FileText,
  MapPin,
  Sparkles,
  Layers,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Mock seed pins awal (lokasi representatif Jakarta)
const DEFAULT_INITIAL_PINS: Partial<Log>[] = [
  {
    id: 'seed-menteng',
    type: 'PEE',
    district: 'Menteng',
    city: 'Jakarta Pusat',
    mood: 'Lega Banget',
    note: 'Setelah meeting 3 jam akhirnya plong!',
    latitude: -6.1944,
    longitude: 106.8229,
    loggedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'seed-gi',
    type: 'POOP',
    district: 'Grand Indonesia',
    city: 'Jakarta Pusat',
    mood: 'Plong Sekali',
    note: 'Kloset otomatisnya dingin bgt',
    latitude: -6.1952,
    longitude: 106.8202,
    loggedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'seed-scbd',
    type: 'COMBO',
    district: 'SCBD Sudirman',
    city: 'Jakarta Selatan',
    mood: 'Kombo Sukses',
    note: 'Paket kombo pee & poop sebelum makan siang',
    latitude: -6.2255,
    longitude: 106.8094,
    loggedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'seed-gbk',
    type: 'PEE',
    district: 'Gelora Bung Karno',
    city: 'Jakarta Pusat',
    mood: 'Nahan Lama',
    note: 'Jogging sore lalu kebelet',
    latitude: -6.2185,
    longitude: 106.8026,
    loggedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

interface LocationGroup {
  key: string;
  latitude: number;
  longitude: number;
  district: string;
  city: string;
  logs: Log[];
  latestLog: Log;
}

export default function MapScreen() {
  const {
    logs,
    mapFilter,
    setMapFilter,
    initialize,
    mapTheme,
    gpsRadiusMeter,
    splashFinished,
    isLoading,
    showWelcomeModal,
    isAppLocked,
  } = useAppStore();
  const { t } = useMobileI18n();
  const { showToast } = useToast();

  const mapRef = useRef<MapView>(null);
  const [selectedGroup, setSelectedGroup] = useState<LocationGroup | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [canAskLocationAgain, setCanAskLocationAgain] = useState(true);
  const permissionDismissedRef = useRef(false);
  const [currentCoord, setCurrentCoord] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [currentAddress, setCurrentAddress] = useState<string>('Mencari lokasi...');

  // Animasi pulsing radar untuk current location
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Animasi Bottom Sheet Detail Lokasi (Disamakan persis dengan QuickLogModal / Add Log)
  const detailSlideAnim = useRef(new Animated.Value(320)).current;
  const detailFadeAnim = useRef(new Animated.Value(0)).current;

  // Animasi Popup Card Preview Pin Map
  const popupCardSlideAnim = useRef(new Animated.Value(60)).current;
  const popupCardFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (detailModalVisible) {
      Animated.parallel([
        Animated.spring(detailSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(detailFadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      detailSlideAnim.setValue(320);
      detailFadeAnim.setValue(0);
    }
  }, [detailModalVisible]);

  useEffect(() => {
    if (selectedGroup) {
      Animated.parallel([
        Animated.spring(popupCardSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(popupCardFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      popupCardSlideAnim.setValue(60);
      popupCardFadeAnim.setValue(0);
    }
  }, [selectedGroup]);

  const handleCloseDetailModal = (afterClose?: () => void) => {
    Animated.parallel([
      Animated.timing(detailSlideAnim, {
        toValue: 350,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(detailFadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDetailModalVisible(false);
      if (afterClose) afterClose();
    });
  };

  const handleClosePopupCard = () => {
    Animated.parallel([
      Animated.timing(popupCardSlideAnim, {
        toValue: 60,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(popupCardFadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedGroup(null);
    });
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    initialize();
  }, []);

  // Orkestrasi Izin Lokasi: Hanya dijalankan SETELAH Splash, Welcome/Security, dan AppLock selesai!
  useEffect(() => {
    if (!splashFinished || isLoading || showWelcomeModal || isAppLocked) {
      return;
    }

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const checkLocationPermission = async () => {
      try {
        const perm = await Location.getForegroundPermissionsAsync();
        if (cancelled) return;

        if (perm.status === 'granted') {
          setPermissionModalVisible(false);
          fetchGrantedLocation();
        } else {
          setCanAskLocationAgain(perm.canAskAgain !== false);
          setCurrentAddress('Izin lokasi mati');
          const savedDismissed = await getUserPreference('location_permission_dismissed').catch(() => null);
          if (cancelled) return;

          if (!permissionDismissedRef.current && savedDismissed !== 'true') {
            timer = setTimeout(() => {
              if (!cancelled) {
                setPermissionModalVisible(true);
              }
            }, 350);
          }
        }
      } catch (err) {
        console.log('Permission check error:', err);
      }
    };

    checkLocationPermission();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [splashFinished, isLoading, showWelcomeModal, isAppLocked]);

  const fetchGrantedLocation = async () => {
    try {
      setCurrentAddress('Mencari lokasi...');
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const targetCoord = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };

      setCurrentCoord(targetCoord);

      // Reverse geocode untuk mendapatkan nama kota/kabupaten
      try {
        const rev = await Location.reverseGeocodeAsync(targetCoord);
        if (rev && rev.length > 0) {
          const loc = rev[0];
          const name = loc.subregion || loc.city || loc.district || loc.region || 'Sekitar Sini';
          setCurrentAddress(name);
        } else {
          setCurrentAddress('Lokasi Anda');
        }
      } catch {
        setCurrentAddress('Lokasi Anda');
      }

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          ...targetCoord,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02 * ASPECT_RATIO,
        });
      }
    } catch (err) {
      console.log('Location fetch error:', err);
      setCurrentAddress('Gagal ambil GPS');
    }
  };

  const handleRequestLocationFromModal = async () => {
    setPermissionModalVisible(false);
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      setCanAskLocationAgain(canAskAgain !== false);
      if (status === 'granted') {
        await setUserPreference('location_permission_dismissed', 'false').catch(() => {});
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        showToast({ message: t.locationPermission.grantedToast, type: 'success' });
        await fetchGrantedLocation();
      } else {
        setCurrentAddress('Izin lokasi mati');
        permissionDismissedRef.current = true;
        await setUserPreference('location_permission_dismissed', 'true').catch(() => {});
      }
    } catch (err) {
      console.log('Location permission request error:', err);
    }
  };

  const displayLogs: any[] = logs.length > 0 ? logs : DEFAULT_INITIAL_PINS;

  // Filter jenis buang air
  // Normalisasi type menjadi UPPERCASE agar konsisten saat perbandingan
  const filteredLogs = useMemo(() => {
    return displayLogs.filter((log) => {
      const logType = String(log.type || '').toUpperCase();
      if (mapFilter === 'ALL') return true;
      if (mapFilter === 'PEE') return logType === 'PEE';
      if (mapFilter === 'POOP') return logType === 'POOP';
      if (mapFilter === 'COMBO') return logType === 'COMBO';
      return true;
    });
  }, [displayLogs, mapFilter]);

  // Hitung jumlah masing-masing kategori untuk badge di filter pills
  const counts = useMemo(() => {
    let pee = 0;
    let poop = 0;
    let combo = 0;
    displayLogs.forEach((l) => {
      const t = String(l.type || '').toUpperCase();
      if (t === 'PEE') pee++;
      else if (t === 'POOP') poop++;
      else if (t === 'COMBO') combo++;
    });
    return { all: displayLogs.length, pee, poop, combo };
  }, [displayLogs]);

  // GROUPING LOGS PADA LOKASI YANG SAMA
  const locationGroups: LocationGroup[] = useMemo(() => {
    const map = new Map<string, LocationGroup>();

    filteredLogs.forEach((log) => {
      const latKey = log.latitude.toFixed(4);
      const lngKey = log.longitude.toFixed(4);
      const groupKey = `${latKey}_${lngKey}`;

      if (!map.has(groupKey)) {
        map.set(groupKey, {
          key: groupKey,
          latitude: log.latitude,
          longitude: log.longitude,
          district: log.district || 'Sekitar Sini',
          city: log.city || 'Jakarta',
          logs: [log],
          latestLog: log,
        });
      } else {
        const group = map.get(groupKey)!;
        group.logs.push(log);
        // Pastikan latestLog adalah log yang lebih baru
        if (new Date(log.loggedAt).getTime() > new Date(group.latestLog.loggedAt).getTime()) {
          group.latestLog = log;
        }
      }
    });

    return Array.from(map.values());
  }, [filteredLogs]);

  const handleSelectGroup = (group: LocationGroup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedGroup(group);

    // Animasi kamera memusatkan pin agak sedikit di atas agar tidak tertutup popup card
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: group.latitude - 0.0035,
        longitude: group.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012 * ASPECT_RATIO,
      }, 350);
    }
  };

  const centerOnUser = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (currentCoord && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentCoord,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015 * ASPECT_RATIO,
      });
      return;
    }

    const perm = await Location.getForegroundPermissionsAsync().catch(() => null);
    if (perm?.status === 'granted') {
      fetchGrantedLocation();
    } else {
      setCanAskLocationAgain(perm?.canAskAgain !== false);
      setPermissionModalVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 1. NATIVE MAP VIEW */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: currentCoord ? currentCoord.latitude : -6.1944,
          longitude: currentCoord ? currentCoord.longitude : 106.8229,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        customMapStyle={
          mapTheme === 'DARK'
            ? darkMapStyle
            : mapTheme === 'RETRO'
            ? retroMapStyle
            : undefined
        }
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* Pulsing Live User GPS Marker (sesuai Mockup & Radius Terpilih) */}
        {currentCoord && (
          <Marker
            coordinate={currentCoord}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={true}
            zIndex={999}
          >
            <View
              style={[
                styles.userLocationMarkerContainer,
                {
                  width: Math.max(50, gpsRadiusMeter * 1.5),
                  height: Math.max(50, gpsRadiusMeter * 1.5),
                },
              ]}
            >
              {/* Animated Radar Pulse Ring */}
              <Animated.View
                style={[
                  styles.userLocationRadar,
                  {
                    width: Math.max(36, gpsRadiusMeter * 1.1),
                    height: Math.max(36, gpsRadiusMeter * 1.1),
                    borderRadius: Math.max(18, (gpsRadiusMeter * 1.1) / 2),
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.6, 2.2],
                        }),
                      },
                    ],
                    opacity: pulseAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.6, 0.3, 0],
                    }),
                  },
                ]}
              />
              {/* Outer Dashed Halo Ring */}
              <View
                style={[
                  styles.userLocationHalo,
                  {
                    width: Math.max(46, gpsRadiusMeter * 1.3),
                    height: Math.max(46, gpsRadiusMeter * 1.3),
                    borderRadius: Math.max(23, (gpsRadiusMeter * 1.3) / 2),
                  },
                ]}
              />
              {/* Inner Glowing Center Dot */}
              <View style={styles.userLocationDot}>
                <View style={styles.userLocationDotInner} />
              </View>
            </View>
          </Marker>
        )}

        {locationGroups.map((group) => {
          // Ketika filter aktif adalah COMBO, PEE, atau POOP, cari log yang cocok
          const matchingLog =
            mapFilter === 'ALL'
              ? group.latestLog
              : group.logs.find(
                  (l) => String(l.type || '').toUpperCase() === mapFilter
                ) || group.latestLog;

          const log = matchingLog;
          const logType = String(log.type || '').toUpperCase();
          const isPee = logType === 'PEE';
          const isPoop = logType === 'POOP';
          const isCombo = logType === 'COMBO';
          const isSelected = selectedGroup?.key === group.key;
          const count = group.logs.length;

          const markerBorder = isPee ? '#BAE6FD' : isPoop ? '#EEDFD3' : '#C7D7FE';
          const markerAccent = isPee ? Colors.primary : isPoop ? Colors.poopBrown : Colors.bothTeal;

          return (
            <Marker
              key={`${group.key}_${mapFilter}`}
              coordinate={{ latitude: group.latitude, longitude: group.longitude }}
              onPress={() => handleSelectGroup(group)}
              tracksViewChanges={true}
              anchor={{ x: 0.5, y: 0.88 }}
            >
              {/* Outer fixed canvas wrapper untuk mencegah clipping/terpotong di iOS & Android */}
              <View style={styles.markerAnchorWrapper}>
                <View style={styles.markerContainer}>
                  {/* Pin Circle Mascot Avatar (Clean White Circle + 3D Mascot) */}
                  <View
                    style={[
                      styles.pinCircle,
                      {
                        backgroundColor: '#FFFFFF',
                        borderColor: isSelected ? Colors.primary : markerBorder,
                      },
                      isSelected && styles.pinCircleSelected,
                    ]}
                  >
                    {isPee && <LilDripIcon size={26} />}
                    {isPoop && <MrPlopIcon size={26} />}
                    {isCombo && <SirFlushIcon size={26} />}

                    {/* Badge Counter jika lebih dari 1 log di titik ini */}
                    {count > 1 && (
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{count}</Text>
                      </View>
                    )}
                  </View>

                  {/* Tiny needle pointer */}
                  <View style={[styles.pinNeedle, { backgroundColor: isSelected ? Colors.primary : '#FFFFFF' }]} />

                  {/* Pulsing selection ring glow */}
                  {isSelected && <View style={[styles.selectionPulse, { borderColor: markerAccent }]} />}
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* 2. TOP FILTER PILLS BAR */}
      <SafeAreaView style={styles.safeTopBar} pointerEvents="box-none">
        <View style={styles.topFilterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsScroll}
          >
            <TouchableOpacity
              style={[styles.pill, mapFilter === 'ALL' && styles.pillActive]}
              onPress={() => setMapFilter('ALL')}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, mapFilter === 'ALL' && styles.pillTextActive]}>
                {t.map.all} ({counts.all})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pill, mapFilter === 'PEE' && styles.pillActive]}
              onPress={() => setMapFilter('PEE')}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, mapFilter === 'PEE' && styles.pillTextActive]}>
                {t.map.pee} ({counts.pee})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pill, mapFilter === 'POOP' && styles.pillActive]}
              onPress={() => setMapFilter('POOP')}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, mapFilter === 'POOP' && styles.pillTextActive]}>
                {t.map.poop} ({counts.poop})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.pill,
                mapFilter === 'COMBO' && styles.pillActiveFlush,
              ]}
              onPress={() => setMapFilter('COMBO')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pillText,
                  mapFilter === 'COMBO' && styles.pillTextActiveDark,
                ]}
              >
                {t.map.flush} ({counts.combo})
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Top Floating Area & Stats Pill (Sesuai Mockup) */}
        <View style={styles.mapInfoPillRow} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.locationAreaPill}
            activeOpacity={0.8}
            onPress={() => {
              if (!currentCoord) {
                centerOnUser();
              }
            }}
          >
            <View
              style={[
                styles.liveIndicatorDot,
                !currentCoord && currentAddress === 'Izin lokasi mati' && { backgroundColor: '#F59E0B' },
              ]}
            />
            <Text style={styles.locationAreaText} numberOfLines={1}>
              {currentAddress === 'Mencari lokasi...'
                ? t.map.searchingGps
                : currentAddress === 'Izin lokasi mati'
                ? t.map.locationOff
                : currentAddress}
            </Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>{t.map.liveGps}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.mapInfoPill}>
            <MapPin size={11} color={Colors.peeAmber} />
            <Text style={styles.mapInfoPillText}>
              <Text style={{ fontWeight: '900', color: Colors.creamBg }}>{locationGroups.length}</Text> {t.map.spots}
            </Text>
            <View style={styles.infoPillDivider} />
            <Layers size={11} color={Colors.bothTeal} />
            <Text style={styles.mapInfoPillText}>
              <Text style={{ fontWeight: '900', color: Colors.creamBg }}>{filteredLogs.length}</Text> {t.map.logs}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* 3. FLOATING ACTION: RE-CENTER KE LOKASI GPS PENGGUNA */}
      <TouchableOpacity style={styles.recenterBtn} onPress={centerOnUser} activeOpacity={0.85}>
        <Navigation size={20} color={Colors.creamBg} />
      </TouchableOpacity>

      {/* 4. BOTTOM POPUP CARD: SELECTED LOCATION PIN GROUP */}
      {selectedGroup && (() => {
        const popupLog =
          mapFilter === 'ALL'
            ? selectedGroup.latestLog
            : selectedGroup.logs.find(
                (l) => String(l.type || '').toUpperCase() === mapFilter
              ) || selectedGroup.latestLog;
        const pType = String(popupLog.type || '').toUpperCase();
        const pBg = pType === 'PEE' ? '#F0F7FF' : pType === 'POOP' ? '#FAF4EE' : '#2447F9';
        const pBorder = pType === 'PEE' ? '#BAE6FD' : pType === 'POOP' ? '#EEDFD3' : '#1D4ED8';

        return (
          <Animated.View
            style={[
              styles.popupCard,
              {
                opacity: popupCardFadeAnim,
                transform: [{ translateY: popupCardSlideAnim }],
              },
            ]}
          >
            <View style={styles.popupRow}>
              <View style={[styles.popupAvatar, { backgroundColor: pBg, borderColor: pBorder, borderWidth: 1 }]}>
                {pType === 'PEE' && <LilDripIcon size={26} />}
                {pType === 'POOP' && <MrPlopIcon size={26} />}
                {pType === 'COMBO' && <SirFlushIcon size={26} />}
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.popupTitleRow}>
                  <Text style={styles.popupTitle}>
                    {pType === 'PEE'
                      ? "Lil' Drip • "
                      : pType === 'POOP'
                      ? "Mr. Plop • "
                      : "Sir Flush • "}
                    {popupLog.mood || 'Lega Banget'}
                  </Text>
                  <Text style={styles.popupTime}>
                    {new Date(popupLog.loggedAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <Text style={styles.popupLocation}>
                  {selectedGroup.district}, {selectedGroup.city}
                </Text>

                {Boolean(popupLog.note) && (
                  <Text style={styles.popupNote} numberOfLines={2}>
                    "{popupLog.note}"
                  </Text>
                )}
              </View>

              <TouchableOpacity onPress={handleClosePopupCard} style={styles.popupCloseBtn}>
                <X size={16} color={Colors.peachTint} />
              </TouchableOpacity>
            </View>

            {/* Footer Pop-up Info & Lihat Detail Button */}
            <View style={styles.popupFooter}>
              <Text style={styles.popupLocationCount}>
                📍 {selectedGroup.logs.length} {t.map.timesAtSpot}
              </Text>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => setDetailModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.detailButtonText}>{t.map.seeDetail}</Text>
                <ChevronRight size={14} color={Colors.peeAmber} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      })()}

      {/* 5. MODAL DETAIL RIWAYAT LOKASI PIN */}
      {selectedGroup && (
        <Modal
          visible={detailModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => handleCloseDetailModal()}
        >
          <Animated.View style={[styles.modalOverlay, { opacity: detailFadeAnim }]}>
            {/* Tapping backdrop outside automatically dismisses */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => handleCloseDetailModal()}
            />

            <Animated.View
              style={[
                styles.modalContent,
                { transform: [{ translateY: detailSlideAnim }] },
              ]}
            >
              {/* Grabber Bar matching QuickLogModal */}
              <View style={styles.modalGrabber} />

              {/* Header Modal */}
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.modalTitle}>{t.map.detailTitle}</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {selectedGroup.district}, {selectedGroup.city}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCloseDetailModal()}
                  style={styles.modalCloseBtn}
                  activeOpacity={0.7}
                >
                  <X size={16} color={Colors.slate} />
                </TouchableOpacity>
              </View>

              <View style={styles.statSummaryBox}>
                <View style={styles.statSummaryItem}>
                  <Text style={styles.statSummaryNumber}>{selectedGroup.logs.length}</Text>
                  <Text style={styles.statSummaryLabel}>Total Kunjungan</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statSummaryItem}>
                  <Text style={[styles.statSummaryNumber, { color: Colors.primary }]}>
                    {selectedGroup.logs.filter((l) => String(l.type).toUpperCase() === 'PEE').length}
                  </Text>
                  <Text style={styles.statSummaryLabel}>Pee</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statSummaryItem}>
                  <Text style={[styles.statSummaryNumber, { color: Colors.peachTint }]}>
                    {selectedGroup.logs.filter((l) => String(l.type).toUpperCase() === 'POOP').length}
                  </Text>
                  <Text style={styles.statSummaryLabel}>Poop</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statSummaryItem}>
                  <Text style={[styles.statSummaryNumber, { color: Colors.bothTeal }]}>
                    {selectedGroup.logs.filter((l) => String(l.type).toUpperCase() === 'COMBO').length}
                  </Text>
                  <Text style={styles.statSummaryLabel}>Sir Flush</Text>
                </View>
              </View>

              <Text style={styles.timelineSectionTitle}>{t.map.historyAtSpot}</Text>

              <ScrollView style={styles.logList} showsVerticalScrollIndicator={false}>
                {selectedGroup.logs.map((item, idx) => {
                  const t = String(item.type || '').toUpperCase();
                  const isPee = t === 'PEE';
                  const isPoop = t === 'POOP';
                  const isCombo = t === 'COMBO';
                  const logColor = isPee
                    ? Colors.peeAmber
                    : isPoop
                    ? Colors.poopBrown
                    : Colors.bothTeal;

                  const dateObj = new Date(item.loggedAt);
                  const formattedDate = dateObj.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <View key={item.id || idx} style={styles.logItemCard}>
                      <View
                        style={[
                          styles.logItemAvatar,
                          {
                            backgroundColor: isPee ? '#F0F7FF' : isPoop ? '#FAF4EE' : '#2447F9',
                            borderColor: isPee ? '#BAE6FD' : isPoop ? '#EEDFD3' : '#1D4ED8',
                            borderWidth: 1,
                          },
                        ]}
                      >
                        {isPee && <LilDripIcon size={22} />}
                        {isPoop && <MrPlopIcon size={22} />}
                        {isCombo && <SirFlushIcon size={22} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.logItemHeaderRow}>
                          <Text style={styles.logItemTitle}>
                            {isPee
                              ? "Lil' Drip (Pee)"
                              : isPoop
                              ? "Mr. Plop (Poop)"
                              : "Sir Flush (Combo)"}
                          </Text>
                          <Text style={styles.logItemTime}>{formattedTime}</Text>
                        </View>
                        <Text style={styles.logItemDate}>{formattedDate}</Text>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {Boolean(item.mood) && (
                            <View style={styles.logItemMoodPill}>
                              <Smile size={11} color={Colors.peeAmber} />
                              <Text style={styles.logItemMoodText}>{item.mood}</Text>
                            </View>
                          )}

                          {Boolean(item.stoolDensity) && (() => {
                            const dInfo = (t as any).quickLog?.stoolScale?.find(
                              (s: any) => s.level === item.stoolDensity
                            );
                            if (!dInfo) return null;
                            return (
                              <View
                                style={[
                                  styles.logItemDensityPill,
                                  { backgroundColor: `${dInfo.color}15`, borderColor: `${dInfo.color}35` },
                                ]}
                              >
                                <BristolStoolIcon type={dInfo.level} width={18} height={11} />
                                <Text style={[styles.logItemDensityText, { color: dInfo.color }]}>
                                  Tipe {dInfo.level} • {dInfo.label}
                                </Text>
                              </View>
                            );
                          })()}
                        </View>

                        {Boolean(item.note) && (
                          <View style={styles.logItemNoteBox}>
                            <FileText size={11} color={Colors.peachTint} />
                            <Text style={styles.logItemNoteText}>"{item.note}"</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}

      {/* 6. MODAL IZIN LOKASI GPS KUSTOM (Tampil rapi setelah Splash & Welcome selesai) */}
      <LocationPermissionModal
        visible={permissionModalVisible}
        canAskAgain={canAskLocationAgain}
        onRequestPermission={handleRequestLocationFromModal}
        onDismiss={() => {
          permissionDismissedRef.current = true;
          setPermissionModalVisible(false);
          setUserPreference('location_permission_dismissed', 'true').catch(() => {});
          showToast({ message: t.locationPermission.manualModeToast, type: 'info' });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.darkBg,
  },
  safeTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topFilterBar: {
    marginTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) + 10 : 10,
    marginHorizontal: 12,
  },
  filterPillsScroll: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 24,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    gap: 4,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  pillActiveFlush: {
    backgroundColor: Colors.bothTeal,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  pillTextActiveDark: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  mapInfoPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
  },
  locationAreaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: '55%',
    shadowColor: '#0C102A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  liveIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.bothTeal,
  },
  locationAreaText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.navy,
    flexShrink: 1,
  },
  liveBadge: {
    backgroundColor: 'rgba(0, 186, 157, 0.14)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: Colors.bothTeal,
    fontSize: 8.5,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  mapInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0C102A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  mapInfoPillText: {
    fontSize: 10,
    color: Colors.slate,
  },
  infoPillDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
  },
  recenterBtn: {
    position: 'absolute',
    right: 16,
    bottom: 95,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0C102A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  // User Location Radar & Dot Styles
  userLocationMarkerContainer: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationRadar: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#3BA3E8',
  },
  userLocationHalo: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 163, 232, 0.35)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(59, 163, 232, 0.08)',
  },
  userLocationDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#3BA3E8',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3BA3E8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  userLocationDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  markerAnchorWrapper: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  pinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0C102A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    elevation: 5,
  },
  pinCircleSelected: {
    borderWidth: 2.5,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
  },
  countBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.emergencyRed,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.darkBg,
  },
  countBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  pinNeedle: {
    width: 7,
    height: 7,
    transform: [{ rotate: '45deg' }],
    marginTop: -3,
    borderRadius: 1,
  },
  selectionPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    opacity: 0.7,
  },
  popupCard: {
    position: 'absolute',
    bottom: 92,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  popupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  popupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  popupTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popupTitle: {
    color: '#0C102A',
    fontSize: 13,
    fontWeight: '900',
  },
  popupTime: {
    color: '#94A3B8',
    fontSize: 10,
  },
  popupLocation: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  popupNote: {
    color: Colors.primary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 3,
  },
  popupCloseBtn: {
    padding: 4,
  },
  popupFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popupLocationCount: {
    color: Colors.bothTeal,
    fontSize: 11,
    fontWeight: '800',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF5FC',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(36, 71, 249, 0.25)',
  },
  detailButtonText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 16, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
    maxHeight: '88%',
    shadowColor: '#0C102A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  modalGrabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.creamBg,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.peachTint,
    opacity: 0.7,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statSummaryBox: {
    flexDirection: 'row',
    backgroundColor: Colors.darkSurface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  statSummaryItem: {
    alignItems: 'center',
  },
  statSummaryNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.creamBg,
  },
  statSummaryLabel: {
    fontSize: 10,
    color: Colors.peachTint,
    opacity: 0.6,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.darkBorder,
  },
  timelineSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.creamBg,
    marginBottom: 12,
  },
  logList: {
    marginBottom: 10,
  },
  logItemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.darkSurface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    gap: 12,
  },
  logItemAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logItemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logItemTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.creamBg,
  },
  logItemTime: {
    fontSize: 10,
    color: Colors.peachTint,
    opacity: 0.6,
  },
  logItemDate: {
    fontSize: 10,
    color: Colors.peachTint,
    opacity: 0.5,
    marginTop: 1,
  },
  logItemMoodPill: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: 'rgba(36, 71, 249, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    borderRadius: 7,
    marginTop: 6,
  },
  logItemMoodText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  logItemDensityPill: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    borderRadius: 7,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  logItemDensityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  logItemNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    borderRadius: 10,
  },
  logItemNoteText: {
    fontSize: 11,
    color: Colors.slate,
    flex: 1,
  },
});
