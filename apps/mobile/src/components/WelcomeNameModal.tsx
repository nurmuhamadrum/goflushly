import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Switch,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { SirFlushIcon, LilDripIcon, MrPlopIcon } from './MascotIcons';
import { useAppStore } from '../store/useAppStore';
import { useMobileI18n } from '../i18n/translations';
import { ShieldCheck, Lock, Fingerprint, ChevronLeft, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  saveAppPin,
  saveBiometricEnabled,
  saveSecurityQuestion,
  SECURITY_QUESTIONS,
} from '../services/securityService';

interface WelcomeNameModalProps {
  visible: boolean;
}

export function WelcomeNameModal({ visible }: WelcomeNameModalProps) {
  const { setUserName, userName, setShowWelcomeModal, setAppLockEnabled, setBiometricEnabled } = useAppStore();
  const { t, lang } = useMobileI18n();

  // Wizard Step: 1 = Name, 2 = PIN & Security
  const [step, setStep] = useState<1 | 2>(1);

  // Form States
  const [inputName, setInputName] = useState(userName || '');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [enableBiometric, setEnableBiometric] = useState(true);
  const [hasBiometricHardware, setHasBiometricHardware] = useState(false);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [recoveryAnswer, setRecoveryAnswer] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const questions = lang === 'en' ? SECURITY_QUESTIONS.en : SECURITY_QUESTIONS.id;

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync()
      .then((hasHw) => {
        if (hasHw) {
          LocalAuthentication.isEnrolledAsync().then((isEnrolled) => {
            setHasBiometricHardware(hasHw && isEnrolled);
            setEnableBiometric(hasHw && isEnrolled);
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
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
    } else {
      scaleAnim.setValue(0.88);
      fadeAnim.setValue(0);
      setStep(1);
      setErrorMessage(null);
    }
  }, [visible]);

  const handleGoToSecurity = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setStep(2);
    setErrorMessage(null);
  };

  const handleFinishSetup = async () => {
    setErrorMessage(null);

    // Validasi PIN
    if (pin.length !== 4) {
      setErrorMessage(t.welcome.pinTooShort);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    if (pin !== confirmPin) {
      setErrorMessage(t.welcome.pinMismatch);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    if (!recoveryAnswer.trim()) {
      setErrorMessage(t.welcome.answerEmpty);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    try {
      // 1. Simpan Nama Profil
      const finalName = inputName.trim() || t.welcome.defaultName;
      await setUserName(finalName);

      // 2. Simpan PIN & Kunci Keamanan Default
      await saveAppPin(pin);
      await setAppLockEnabled(true);

      // 3. Simpan Pengaturan Biometrik
      await setBiometricEnabled(enableBiometric);
      await saveBiometricEnabled(enableBiometric);

      // 4. Simpan Pertanyaan Pemulihan Lupa PIN
      await saveSecurityQuestion(questionIdx, recoveryAnswer.trim());

      // Selesai
      setShowWelcomeModal(false);
    } catch (err) {
      console.error('Error completing security setup:', err);
      setErrorMessage('Terjadi kesalahan saat menyimpan pengaturan keamanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
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
          {/* Header Maskot */}
          <View style={styles.mascotBanner}>
            <View style={[styles.mascotCircle, { backgroundColor: '#F0F7FF', borderColor: '#BAE6FD', borderWidth: 1 }]}>
              <LilDripIcon size={34} />
            </View>
            <View style={[styles.mascotCirclePrimary, { backgroundColor: Colors.bothTeal }]}>
              <SirFlushIcon size={44} />
            </View>
            <View style={[styles.mascotCircle, { backgroundColor: '#FAF4EE', borderColor: '#EEDFD3', borderWidth: 1 }]}>
              <MrPlopIcon size={34} />
            </View>
          </View>

          {/* LANGKAH 1: NAMA PENGGUNA */}
          {step === 1 && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={styles.title}>{t.welcome.title}</Text>
              <Text style={styles.subtitle}>{t.welcome.subtitle}</Text>

              {/* Offline Principle Card */}
              <View style={styles.privacyBox}>
                <ShieldCheck size={18} color={Colors.bothTeal} style={{ marginTop: 2 }} />
                <Text style={styles.privacyText}>{t.welcome.offlineHighlight}</Text>
              </View>

              {/* Name Input Area */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>{t.welcome.namePrompt}</Text>
                <TextInput
                  style={styles.textInput}
                  value={inputName}
                  onChangeText={setInputName}
                  placeholder={t.welcome.namePlaceholder}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={30}
                  returnKeyType="done"
                  onSubmitEditing={handleGoToSecurity}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleGoToSecurity}
                activeOpacity={0.88}
              >
                <Text style={styles.submitButtonText}>{t.welcome.step1Btn}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* LANGKAH 2: SETUP PIN & KEAMANAN DEFAULT */}
          {step === 2 && (
            <ScrollView
              style={{ width: '100%', maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', paddingBottom: 10 }}
            >
              <Text style={styles.title}>{t.welcome.step2Title}</Text>
              <Text style={styles.subtitle}>{t.welcome.step2Sub}</Text>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <AlertCircle size={16} color={Colors.emergencyRed} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* PIN Inputs Row */}
              <View style={styles.pinInputContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{t.welcome.pinLabel}</Text>
                  <TextInput
                    style={[styles.textInput, styles.pinInput]}
                    value={pin}
                    onChangeText={(val) => setPin(val.replace(/[^0-9]/g, '').slice(0, 4))}
                    placeholder="••••"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>{t.welcome.confirmPinLabel}</Text>
                  <TextInput
                    style={[styles.textInput, styles.pinInput]}
                    value={confirmPin}
                    onChangeText={(val) => setConfirmPin(val.replace(/[^0-9]/g, '').slice(0, 4))}
                    placeholder="••••"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={4}
                  />
                </View>
              </View>

              {/* Biometrics Toggle (jika hardware ada) */}
              {hasBiometricHardware && (
                <View style={styles.biometricRow}>
                  <View style={styles.biometricLeft}>
                    <Fingerprint size={20} color={Colors.primary} />
                    <Text style={styles.biometricText}>{t.welcome.biometricSwitch}</Text>
                  </View>
                  <Switch
                    value={enableBiometric}
                    onValueChange={setEnableBiometric}
                    trackColor={{ false: '#CBD5E1', true: Colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              )}

              {/* Recovery Question & Answer */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>{t.welcome.secQuestionLabel}</Text>

                {/* Predefined Questions Chip Select */}
                <View style={styles.questionsList}>
                  {questions.map((q, idx) => {
                    const isSelected = questionIdx === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.questionChip, isSelected && styles.questionChipActive]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setQuestionIdx(idx);
                        }}
                      >
                        <Text
                          style={[styles.questionChipText, isSelected && styles.questionChipTextActive]}
                          numberOfLines={1}
                        >
                          {q}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Answer Field */}
                <TextInput
                  style={[styles.textInput, { marginTop: 8 }]}
                  value={recoveryAnswer}
                  onChangeText={setRecoveryAnswer}
                  placeholder={t.welcome.secAnswerPlaceholder}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleFinishSetup}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setStep(1)}
                  activeOpacity={0.8}
                >
                  <ChevronLeft size={18} color="#64748B" />
                  <Text style={styles.backButtonText}>{t.welcome.backBtn}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, { flex: 2 }]}
                  onPress={handleFinishSetup}
                  activeOpacity={0.88}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>{t.welcome.startBtn}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  card: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  mascotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: -8,
  },
  mascotCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 1,
  },
  mascotCirclePrimary: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    zIndex: 2,
    shadowColor: Colors.bothTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 14,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(47, 184, 172, 0.1)',
    borderRadius: 14,
    padding: 10,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(47, 184, 172, 0.25)',
  },
  privacyText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#0D9488',
    fontWeight: '600',
  },
  inputSection: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
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
  },
  pinInputContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 12,
  },
  pinInput: {
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 4,
    fontWeight: '800',
  },
  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 10,
    width: '100%',
    marginBottom: 14,
  },
  biometricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 6,
  },
  biometricText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  questionsList: {
    gap: 6,
  },
  questionChip: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(36, 71, 249, 0.08)',
  },
  questionChipText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  questionChipTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 8,
    width: '100%',
    marginBottom: 10,
  },
  errorText: {
    color: Colors.emergencyRed,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 6,
  },
  backButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  backButtonText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  submitButton: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
