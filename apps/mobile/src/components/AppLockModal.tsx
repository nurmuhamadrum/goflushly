import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  Vibration,
  TextInput,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { SirFlushIcon } from './MascotIcons';
import { useAppStore } from '../store/useAppStore';
import { useMobileI18n } from '../i18n/translations';
import {
  Fingerprint,
  Delete,
  ShieldCheck,
  HelpCircle,
  Smartphone,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  verifyAppPin,
  saveAppPin,
  getSecurityQuestionIndex,
  verifySecurityAnswer,
  authenticateWithDeviceOS,
  SECURITY_QUESTIONS,
} from '../services/securityService';
import { authenticateWithBiometrics } from '../services/auth';

export function AppLockModal() {
  const { isAppLocked, setAppLocked, biometricEnabled, userName } = useAppStore();
  const { t, lang } = useMobileI18n();

  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Recovery States
  const [recoveryModalVisible, setRecoveryModalVisible] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState<'SELECT' | 'QUESTION' | 'NEW_PIN'>('SELECT');
  const [storedQuestionIdx, setStoredQuestionIdx] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [answerError, setAnswerError] = useState<string | null>(null);

  // New PIN States
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const confirmNewPinRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [newPinError, setNewPinError] = useState<string | null>(null);

  // Shake Animation for wrong PIN
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Engaging Unlock Animations
  const mascotScale = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const rippleScale = useRef(new Animated.Value(0.8)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  const keypadOpacity = useRef(new Animated.Value(1)).current;
  const keypadScale = useRef(new Animated.Value(1)).current;
  const successTextAnim = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale = useRef(new Animated.Value(1)).current;

  const questions = lang === 'en' ? SECURITY_QUESTIONS.en : SECURITY_QUESTIONS.id;

  const resetAnimationValues = () => {
    setIsUnlocking(false);
    mascotScale.setValue(1);
    badgeScale.setValue(0);
    rippleScale.setValue(0.8);
    rippleOpacity.setValue(0);
    keypadOpacity.setValue(1);
    keypadScale.setValue(1);
    successTextAnim.setValue(0);
    containerOpacity.setValue(1);
    containerScale.setValue(1);
  };

  const triggerUnlockAnimation = (onFinished?: () => void) => {
    setIsUnlocking(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Animated.parallel([
      // 1. Keypad & PIN dots smoothly fade and scale down
      Animated.timing(keypadOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(keypadScale, {
        toValue: 0.92,
        duration: 200,
        useNativeDriver: true,
      }),
      // 2. Ripple pulse emerges radiating outward
      Animated.sequence([
        Animated.timing(rippleOpacity, {
          toValue: 0.8,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 380,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(rippleScale, {
        toValue: 2.5,
        duration: 500,
        useNativeDriver: true,
      }),
      // 3. Mascot scale bounce
      Animated.spring(mascotScale, {
        toValue: 1.15,
        friction: 4,
        tension: 65,
        useNativeDriver: true,
      }),
      // 4. Pop-in checkmark badge
      Animated.sequence([
        Animated.delay(100),
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      // 5. Success text fade-in
      Animated.sequence([
        Animated.delay(90),
        Animated.timing(successTextAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Hold celebration for satisfying micro-interaction (~180ms)
      setTimeout(() => {
        // 6. Smooth zoom-dissolve exit of the entire modal
        Animated.parallel([
          Animated.timing(containerOpacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(containerScale, {
            toValue: 1.05,
            duration: 220,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setAppLocked(false);
          setEnteredPin('');
          if (onFinished) onFinished();
          resetAnimationValues();
        });
      }, 180);
    });
  };

  // Auto-trigger biometric upon lock screen appearance
  useEffect(() => {
    if (isAppLocked) {
      resetAnimationValues();
      setEnteredPin('');
      setErrorMessage(null);
      if (biometricEnabled) {
        authenticateWithBiometrics(t.lockScreen.biometricPrompt).then((success) => {
          if (success) {
            triggerUnlockAnimation();
          }
        });
      }
    }
  }, [isAppLocked, biometricEnabled]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = async (val: string) => {
    if (isUnlocking || enteredPin.length >= 4) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setErrorMessage(null);

    const nextPin = enteredPin + val;
    setEnteredPin(nextPin);

    if (nextPin.length === 4) {
      const isValid = await verifyAppPin(nextPin);
      if (isValid) {
        triggerUnlockAnimation();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        triggerShake();
        setErrorMessage(t.lockScreen.wrongPin);
        setTimeout(() => {
          setEnteredPin('');
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    if (isUnlocking) return;
    if (enteredPin.length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setEnteredPin(enteredPin.slice(0, -1));
      setErrorMessage(null);
    }
  };

  const handleBiometricPress = async () => {
    if (isUnlocking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const success = await authenticateWithBiometrics(t.lockScreen.biometricPrompt);
    if (success) {
      triggerUnlockAnimation();
    }
  };

  // RECOVERY HANDLERS
  const openRecoveryFlow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const idx = await getSecurityQuestionIndex();
    setStoredQuestionIdx(idx);
    setRecoveryMode('SELECT');
    setAnswerInput('');
    setAnswerError(null);
    setNewPin('');
    setConfirmNewPin('');
    setNewPinError(null);
    setRecoveryModalVisible(true);
  };

  // Recovery Option 1: Biometric
  const handleRecoverViaBiometric = async () => {
    const success = await authenticateWithBiometrics(t.lockScreen.biometricPrompt);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setRecoveryMode('NEW_PIN');
    }
  };

  // Recovery Option 2: Security Question
  const handleVerifyAnswer = async () => {
    if (!answerInput.trim()) {
      setAnswerError(t.lockScreen.answerWrong);
      return;
    }
    const match = await verifySecurityAnswer(answerInput.trim());
    if (match) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setRecoveryMode('NEW_PIN');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setAnswerError(t.lockScreen.answerWrong);
    }
  };

  // Recovery Option 3: Device OS Passcode
  const handleRecoverViaDeviceOS = async () => {
    const success = await authenticateWithDeviceOS('Verifikasi Otoritas Pemilik HP');
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setRecoveryMode('NEW_PIN');
    }
  };

  // Save New PIN after recovery
  const handleSaveNewPin = async () => {
    if (newPin.length !== 4) {
      setNewPinError(t.welcome.pinTooShort);
      return;
    }
    if (newPin !== confirmNewPin) {
      setNewPinError(t.welcome.pinMismatch);
      return;
    }

    await saveAppPin(newPin);
    setRecoveryModalVisible(false);
    triggerUnlockAnimation();
  };

  if (!isAppLocked) return null;

  return (
    <Modal visible={isAppLocked} transparent={false} animationType="none" statusBarTranslucent>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: containerOpacity,
            transform: [{ scale: containerScale }],
          },
        ]}
      >
        {/* Header Mascot with Animations */}
        <Animated.View style={[styles.header, { transform: [{ scale: mascotScale }] }]}>
          <View style={styles.mascotWrapper}>
            {/* Expanding Ripple Wave */}
            <Animated.View
              style={[
                styles.rippleRing,
                {
                  opacity: rippleOpacity,
                  transform: [{ scale: rippleScale }],
                },
              ]}
              pointerEvents="none"
            />

            {/* Mascot Circle */}
            <View style={[styles.mascotCircle, isUnlocking && styles.mascotCircleSuccess]}>
              <SirFlushIcon size={52} />
            </View>

            {/* Success Badge Checkmark Overlay */}
            <Animated.View
              style={[
                styles.successBadge,
                {
                  transform: [{ scale: badgeScale }],
                },
              ]}
              pointerEvents="none"
            >
              <CheckCircle size={22} color="#FFFFFF" strokeWidth={3} />
            </Animated.View>
          </View>

          {isUnlocking ? (
            <Animated.View
              style={[
                styles.successTextContainer,
                {
                  opacity: successTextAnim,
                  transform: [
                    {
                      translateY: successTextAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.successTitle}>{t.lockScreen.accessGranted}</Text>
              <Text style={styles.successSubtitle}>
                {t.lockScreen.welcomeBack},{' '}
                <Text style={styles.userNameHighlight}>{userName || 'Explorer'}</Text>!
              </Text>
            </Animated.View>
          ) : (
            <>
              <Text style={styles.title}>{t.lockScreen.title}</Text>
              <Text style={styles.subtitle}>{t.lockScreen.subtitle}</Text>
            </>
          )}
        </Animated.View>

        {/* Body Content (Dots + Keypad + Forgot PIN) with Fade/Scale Transition */}
        <Animated.View
          style={[
            styles.bodyContent,
            {
              opacity: keypadOpacity,
              transform: [{ scale: keypadScale }],
            },
          ]}
          pointerEvents={isUnlocking ? 'none' : 'auto'}
        >
          {/* PIN Dots Display */}
          <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = enteredPin.length > idx || isUnlocking;
              return (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    isFilled && styles.dotFilled,
                    isUnlocking && styles.dotSuccess,
                    errorMessage && styles.dotError,
                  ]}
                />
              );
            })}
          </Animated.View>

          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : (
            <View style={{ height: 22 }} />
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
            ].map((row, rIdx) => (
              <View key={rIdx} style={styles.keypadRow}>
                {row.map((digit) => (
                  <TouchableOpacity
                    key={digit}
                    style={styles.keypadButton}
                    onPress={() => handleKeyPress(digit)}
                    activeOpacity={0.65}
                    disabled={isUnlocking}
                  >
                    <Text style={styles.keypadDigit}>{digit}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {/* Bottom Row: Biometrics, 0, Backspace */}
            <View style={styles.keypadRow}>
              {biometricEnabled ? (
                <TouchableOpacity
                  style={styles.keypadActionBtn}
                  onPress={handleBiometricPress}
                  activeOpacity={0.65}
                  disabled={isUnlocking}
                >
                  <Fingerprint size={28} color={Colors.primary} />
                </TouchableOpacity>
              ) : (
                <View style={styles.keypadActionBtn} />
              )}

              <TouchableOpacity
                style={styles.keypadButton}
                onPress={() => handleKeyPress('0')}
                activeOpacity={0.65}
                disabled={isUnlocking}
              >
                <Text style={styles.keypadDigit}>0</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.keypadActionBtn}
                onPress={handleDelete}
                activeOpacity={0.65}
                disabled={isUnlocking}
              >
                <Delete size={26} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot PIN Link */}
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={openRecoveryFlow}
            disabled={isUnlocking}
          >
            <Text style={styles.forgotText}>{t.lockScreen.forgotPin}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* MODAL PEMULIHAN LUPA PIN */}
        <Modal
          visible={recoveryModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setRecoveryModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <View style={styles.modalIconRing}>
                  <ShieldCheck size={22} color={Colors.primary} />
                </View>
                <TouchableOpacity
                  onPress={() => setRecoveryModalVisible(false)}
                  style={styles.modalCloseIcon}
                >
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* TAHAP 1: PILIH METODE PEMULIHAN */}
              {recoveryMode === 'SELECT' && (
                <View style={{ width: '100%' }}>
                  <Text style={styles.modalHeading}>{t.lockScreen.recoveryTitle}</Text>
                  <Text style={styles.modalDescription}>{t.lockScreen.recoverySub}</Text>

                  {/* Opsi 1: Biometrik */}
                  {biometricEnabled && (
                    <TouchableOpacity
                      style={styles.recoveryOptionCard}
                      onPress={handleRecoverViaBiometric}
                    >
                      <Fingerprint size={22} color={Colors.primary} />
                      <View style={{ flex: 1, paddingLeft: 10 }}>
                        <Text style={styles.recoveryOptionTitle}>{t.lockScreen.optionBiometric}</Text>
                        <Text style={styles.recoveryOptionDesc}>{t.lockScreen.optionBiometricDesc}</Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Opsi 2: Pertanyaan Keamanan */}
                  <TouchableOpacity
                    style={styles.recoveryOptionCard}
                    onPress={() => setRecoveryMode('QUESTION')}
                  >
                    <HelpCircle size={22} color={Colors.bothTeal} />
                    <View style={{ flex: 1, paddingLeft: 10 }}>
                      <Text style={styles.recoveryOptionTitle}>{t.lockScreen.optionSecQuestion}</Text>
                      <Text style={styles.recoveryOptionDesc}>{t.lockScreen.optionSecQuestionDesc}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Opsi 3: Kunci Layar HP / OS */}
                  <TouchableOpacity
                    style={styles.recoveryOptionCard}
                    onPress={handleRecoverViaDeviceOS}
                  >
                    <Smartphone size={22} color={Colors.peeAmber} />
                    <View style={{ flex: 1, paddingLeft: 10 }}>
                      <Text style={styles.recoveryOptionTitle}>{t.lockScreen.optionDeviceAuth}</Text>
                      <Text style={styles.recoveryOptionDesc}>{t.lockScreen.optionDeviceAuthDesc}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* TAHAP 2: JAWAB PERTANYAAN KEAMANAN */}
              {recoveryMode === 'QUESTION' && (
                <View style={{ width: '100%' }}>
                  <Text style={styles.modalHeading}>{t.lockScreen.optionSecQuestion}</Text>
                  <View style={styles.questionHighlightBox}>
                    <Text style={styles.questionHighlightText}>
                      {questions[storedQuestionIdx] || questions[0]}
                    </Text>
                  </View>

                  {answerError && (
                    <View style={styles.miniErrorBox}>
                      <AlertCircle size={14} color={Colors.emergencyRed} />
                      <Text style={styles.miniErrorText}>{answerError}</Text>
                    </View>
                  )}

                  <Text style={styles.answerInputLabel}>{t.welcome.secAnswerLabel}</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={answerInput}
                    onChangeText={(val) => {
                      setAnswerInput(val);
                      setAnswerError(null);
                    }}
                    placeholder={t.welcome.secAnswerPlaceholder}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoFocus
                  />

                  <View style={styles.modalBtnRow}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setRecoveryMode('SELECT')}
                    >
                      <Text style={styles.modalCancelBtnText}>{t.lockScreen.cancel}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalSubmitBtn}
                      onPress={handleVerifyAnswer}
                    >
                      <Text style={styles.modalSubmitBtnText}>{t.lockScreen.submitAnswer}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAHAP 3: ATUR ULANG PIN BARU */}
              {recoveryMode === 'NEW_PIN' && (
                <View style={{ width: '100%' }}>
                  <Text style={styles.modalHeading}>{t.lockScreen.newPinTitle}</Text>
                  <Text style={styles.modalDescription}>{t.lockScreen.newPinSub}</Text>

                  {newPinError && (
                    <View style={styles.miniErrorBox}>
                      <AlertCircle size={14} color={Colors.emergencyRed} />
                      <Text style={styles.miniErrorText}>{newPinError}</Text>
                    </View>
                  )}

                  <TextInput
                    style={[styles.modalInput, { textAlign: 'center', fontSize: 18, letterSpacing: 6 }]}
                    value={newPin}
                    onChangeText={(val) => {
                      const cleaned = val.replace(/[^0-9]/g, '').slice(0, 4);
                      setNewPin(cleaned);
                      setNewPinError(null);
                      if (cleaned.length === 4) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        confirmNewPinRef.current?.focus();
                      }
                    }}
                    placeholder="••••"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                  />

                  <Text style={[styles.modalDescription, { marginTop: 10 }]}>{t.lockScreen.confirmNewPinSub}</Text>
                  <TextInput
                    ref={confirmNewPinRef}
                    style={[styles.modalInput, { textAlign: 'center', fontSize: 18, letterSpacing: 6 }]}
                    value={confirmNewPin}
                    onChangeText={(val) => {
                      setConfirmNewPin(val.replace(/[^0-9]/g, '').slice(0, 4));
                      setNewPinError(null);
                    }}
                    placeholder="••••"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                  />

                  <View style={styles.modalBtnRow}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setRecoveryModalVisible(false)}
                    >
                      <Text style={styles.modalCancelBtnText}>{t.lockScreen.cancel}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalSubmitBtn}
                      onPress={handleSaveNewPin}
                    >
                      <Text style={styles.modalSubmitBtnText}>Simpan PIN Baru</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 96 : 64,
    paddingBottom: Platform.OS === 'ios' ? 42 : 30,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 26,
  },
  mascotWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  rippleRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  mascotCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.bothTeal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: Colors.bothTeal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  mascotCircleSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#0F766E',
    shadowColor: '#10B981',
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  successBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0F172A',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  successTextContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
    fontWeight: '600',
  },
  userNameHighlight: {
    color: Colors.star,
    fontWeight: '800',
  },
  bodyContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 18,
    marginVertical: 10,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#475569',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  dotError: {
    backgroundColor: Colors.emergencyRed,
    borderColor: Colors.emergencyRed,
  },
  errorMessage: {
    color: Colors.emergencyRed,
    fontSize: 12,
    fontWeight: '700',
    height: 22,
  },
  keypad: {
    width: '100%',
    maxWidth: 290,
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keypadButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  keypadDigit: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  keypadActionBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalIconRing: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(36, 71, 249, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  modalDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  questionHighlightBox: {
    width: '100%',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D7FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  questionHighlightText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 18,
  },
  answerInputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  recoveryOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    width: '100%',
  },
  recoveryOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  recoveryOptionDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  modalInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    flex: 2,
    height: 46,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  miniErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  miniErrorText: {
    fontSize: 11,
    color: Colors.emergencyRed,
    fontWeight: '700',
  },
});
