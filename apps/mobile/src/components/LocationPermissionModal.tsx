import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { Navigation, MapPin, ShieldCheck, Settings } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { SirFlushIcon } from './MascotIcons';
import { useMobileI18n } from '../i18n/translations';

interface LocationPermissionModalProps {
  visible: boolean;
  canAskAgain: boolean;
  onRequestPermission: () => Promise<void>;
  onDismiss: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  visible,
  canAskAgain,
  onRequestPermission,
  onDismiss,
}) => {
  const { t } = useMobileI18n();
  const [isRequesting, setIsRequesting] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const radar1 = useRef(new Animated.Value(0)).current;
  const radar2 = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let radarLoop: Animated.CompositeAnimation | null = null;
    let floatLoop: Animated.CompositeAnimation | null = null;

    if (visible) {
      radar1.setValue(0);
      radar2.setValue(0);
      floatAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6.5,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      radarLoop = Animated.loop(
        Animated.stagger(650, [
          Animated.timing(radar1, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(radar2, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      radarLoop.start();

      floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -5,
            duration: 850,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 850,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      floatLoop.start();
    } else {
      scaleAnim.setValue(0.88);
      fadeAnim.setValue(0);
    }

    return () => {
      if (radarLoop) radarLoop.stop();
      if (floatLoop) floatLoop.stop();
    };
  }, [visible]);

  const handleCloseAnimated = (after?: () => void, notifyDismiss: boolean = true) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (notifyDismiss) {
        onDismiss();
      }
      if (after) after();
    });
  };

  const handleAllowPress = async () => {
    if (isRequesting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    if (!canAskAgain) {
      handleCloseAnimated(() => {
        Linking.openSettings().catch(() => {});
      }, true);
      return;
    }

    // Tutup modal kustom secara mulus terlebih dahulu agar TIDAK bertumpuk dengan dialog konfirmasi sensor OS
    setIsRequesting(true);
    handleCloseAnimated(async () => {
      try {
        await onRequestPermission();
      } finally {
        setIsRequesting(false);
      }
    }, false);
  };

  if (!visible) return null;

  const r1Scale = radar1.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.75] });
  const r1Opacity = radar1.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.45, 0.22, 0] });
  const r2Scale = radar2.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.95] });
  const r2Opacity = radar2.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.35, 0.16, 0] });

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Animated Hero Radar Stage */}
          <View style={styles.heroStage}>
            <Animated.View
              style={[
                styles.radarRing,
                { transform: [{ scale: r1Scale }], opacity: r1Opacity },
              ]}
            />
            <Animated.View
              style={[
                styles.radarRing,
                { transform: [{ scale: r2Scale }], opacity: r2Opacity },
              ]}
            />

            <Animated.View
              style={[
                styles.heroPod,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              <SirFlushIcon size={54} />
              <View style={styles.pinFloatingBadge}>
                <MapPin size={13} color="#FFFFFF" strokeWidth={2.6} />
              </View>
            </Animated.View>
          </View>

          {/* Eyebrow Badge */}
          <View style={styles.eyebrowPill}>
            <Navigation size={10} color={Colors.primary} />
            <Text style={styles.eyebrowText}>{t.locationPermission.badge}</Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>{t.locationPermission.title}</Text>
          <Text style={styles.subtitle}>{t.locationPermission.subtitle}</Text>

          {/* Benefits & Privacy Card */}
          <View style={styles.benefitsCard}>
            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconBox, { backgroundColor: '#EEF2FF' }]}>
                <Navigation size={15} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{t.locationPermission.benefit1Title}</Text>
                <Text style={styles.benefitDesc}>{t.locationPermission.benefit1Desc}</Text>
              </View>
            </View>

            <View style={styles.benefitDivider} />

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconBox, { backgroundColor: '#FEF7E0' }]}>
                <MapPin size={15} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{t.locationPermission.benefit2Title}</Text>
                <Text style={styles.benefitDesc}>{t.locationPermission.benefit2Desc}</Text>
              </View>
            </View>

            <View style={styles.benefitDivider} />

            <View style={styles.benefitRow}>
              <View style={[styles.benefitIconBox, { backgroundColor: '#ECFDF5' }]}>
                <ShieldCheck size={15} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.benefitTitle}>{t.locationPermission.benefit3Title}</Text>
                <Text style={styles.benefitDesc}>{t.locationPermission.benefit3Desc}</Text>
              </View>
            </View>
          </View>

          {!canAskAgain && (
            <Text style={styles.deniedNote}>{t.locationPermission.deniedNote}</Text>
          )}

          {/* Primary CTA Button */}
          <TouchableOpacity
            style={[styles.primaryBtn, isRequesting && { opacity: 0.7 }]}
            onPress={handleAllowPress}
            activeOpacity={0.88}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                {canAskAgain ? (
                  <Navigation size={16} color="#FFFFFF" />
                ) : (
                  <Settings size={16} color="#FFFFFF" />
                )}
                <Text style={styles.primaryBtnText}>
                  {canAskAgain
                    ? t.locationPermission.allowBtn
                    : t.locationPermission.openSettingsBtn}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Secondary Clear Opt-Out Button */}
          <TouchableOpacity
            style={styles.laterBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              handleCloseAnimated(undefined, true);
            }}
            activeOpacity={0.75}
            disabled={isRequesting}
          >
            <Text style={styles.laterBtnText}>{t.locationPermission.laterBtn}</Text>
          </TouchableOpacity>

          {canAskAgain && (
            <Text style={styles.osConfirmHint}>{t.locationPermission.osConfirmHint}</Text>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12, 16, 42, 0.72)',
  },
  card: {
    width: '100%',
    maxWidth: 385,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 16,
    alignItems: 'center',
    shadowColor: '#0C102A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 18,
  },
  heroStage: {
    width: 120,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  radarRing: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(36, 71, 249, 0.06)',
  },
  heroPod: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 10,
  },
  pinFloatingBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16A34A',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  eyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D7FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  eyebrowText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.navy,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17.5,
    color: Colors.slate,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  benefitsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.navy,
  },
  benefitDesc: {
    fontSize: 10.5,
    lineHeight: 14.5,
    color: Colors.slate,
    marginTop: 1,
  },
  benefitDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 9,
  },
  deniedNote: {
    fontSize: 10.5,
    color: '#D97706',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  laterBtn: {
    width: '100%',
    height: 44,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  osConfirmHint: {
    marginTop: 10,
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
  },
});
