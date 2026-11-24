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
  Dimensions,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { SirFlushIcon, LilDripIcon, MrPlopIcon } from './MascotIcons';
import { useAppStore } from '../store/useAppStore';
import { useMobileI18n } from '../i18n/translations';
import {
  ShieldCheck,
  Fingerprint,
  ChevronLeft,
  ChevronDown,
  AlertCircle,
} from 'lucide-react-native';
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

const SCREEN_HEIGHT = Dimensions.get('window').height;

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

  // Dynamic scroll indicator state for Step 2 (with anti-blink hysteresis + absolute fade)
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scrollContainerHeight = useRef(0);
  const scrollContentHeight = useRef(0);
  const currentScrollY = useRef(0);
  const canScrollDownRef = useRef(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollCueOpacity = useRef(new Animated.Value(0)).current;

  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const questions = lang === 'en' ? SECURITY_QUESTIONS.en : SECURITY_QUESTIONS.id;

  const setCueVisible = (next: boolean) => {
    if (canScrollDownRef.current === next) return;
    canScrollDownRef.current = next;
    setCanScrollDown(next);
    Animated.timing(scrollCueOpacity, {
      toValue: next ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const updateScrollCue = (scrollY: number) => {
    if (scrollContainerHeight.current <= 0 || scrollContentHeight.current <= 0) return;
    const remaining = scrollContentHeight.current - scrollContainerHeight.current - scrollY;
    if (canScrollDownRef.current) {
      if (remaining <= 16) setCueVisible(false);
    } else {
      if (remaining >= 42) setCueVisible(true);
    }
  };

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
      currentScrollY.current = 0;
      canScrollDownRef.current = false;
      setCanScrollDown(false);
      scrollCueOpacity.setValue(0);
    }
  }, [visible]);

  const handleGoToSecurity = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    currentScrollY.current = 0;
    canScrollDownRef.current = false;
    setCanScrollDown(false);
    scrollCueOpacity.setValue(0);
    setStep(2);
    setErrorMessage(null);
  };

  const handleFinishSetup = async () => {
    setErrorMessage(null);

    // Validasi PIN
    if (pin.length !== 4) {
      setErrorMessage(t.welcome.pinTooShort);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (pin !== confirmPin) {
      setErrorMessage(t.welcome.pinMismatch);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (!recoveryAnswer.trim()) {
      setErrorMessage(t.welcome.answerEmpty);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      scrollViewRef.current?.scrollToEnd({ animated: true });
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

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    currentScrollY.current = y;
    updateScrollCue(y);
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
          {/* Step Progress Pill */}
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{t.welcome.stepIndicator(step)}</Text>
          </View>

          {/* Header Maskot */}
          <View style={[styles.mascotBanner, step === 2 && styles.mascotBannerCompact]}>
            <View
              style={[
                styles.mascotCircle,
                step === 2 && styles.mascotCircleSmall,
                { backgroundColor: '#F0F7FF', borderColor: '#BAE6FD', borderWidth: 1 },
              ]}
            >
              <LilDripIcon size={step === 2 ? 28 : 34} />
            </View>
            <View
              style={[
                styles.mascotCirclePrimary,
                step === 2 && styles.mascotCirclePrimarySmall,
                { backgroundColor: Colors.primary },
              ]}
            >
              <SirFlushIcon size={step === 2 ? 36 : 44} />
            </View>
            <View
              style={[
                styles.mascotCircle,
                step === 2 && styles.mascotCircleSmall,
                { backgroundColor: '#FAF4EE', borderColor: '#EEDFD3', borderWidth: 1 },
              ]}
            >
              <MrPlopIcon size={step === 2 ? 28 : 34} />
            </View>
          </View>

          {/* LANGKAH 1: NAMA PENGGUNA */}
          {step === 1 && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Text style={styles.title}>{t.welcome.title}</Text>
              <Text style={styles.subtitle}>{t.welcome.subtitle}</Text>

              {/* Offline Principle Card */}
              <View style={styles.privacyBox}>
                <ShieldCheck size={18} color={Colors.primary} style={{ marginTop: 1 }} />
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
                style={styles.submitButtonFull}
                onPress={handleGoToSecurity}
                activeOpacity={0.88}
              >
                <Text style={styles.submitButtonText} numberOfLines={1}>
                  {t.welcome.step1Btn}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* LANGKAH 2: SETUP PIN & KEAMANAN DEFAULT */}
          {step === 2 && (
            <View style={styles.step2Wrapper}>
              {/* Fixed Step 2 Title Header */}
              <Text style={styles.title}>{t.welcome.step2Title}</Text>
              <Text style={styles.subtitle}>{t.welcome.step2Sub}</Text>

              {/* Scrollable Form Body */}
              <View style={styles.scrollAreaWrapper}>
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.step2Scroll}
                  contentContainerStyle={styles.step2ScrollContent}
                  showsVerticalScrollIndicator={true}
                  persistentScrollbar={true}
                  keyboardShouldPersistTaps="handled"
                  scrollEventThrottle={16}
                  onScroll={handleScroll}
                  onLayout={(e) => {
                    scrollContainerHeight.current = e.nativeEvent.layout.height;
                    updateScrollCue(currentScrollY.current);
                  }}
                  onContentSizeChange={(_, h) => {
                    scrollContentHeight.current = h;
                    updateScrollCue(currentScrollY.current);
                  }}
                >
                  {errorMessage && (
                    <View style={styles.errorBox}>
                      <AlertCircle size={16} color={Colors.emergencyRed} />
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                  )}

                  {/* PIN Inputs Row */}
                  <View style={styles.pinInputContainer}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel} numberOfLines={1}>
                        {t.welcome.pinLabel}
                      </Text>
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
                      <Text style={styles.inputLabel} numberOfLines={1}>
                        {t.welcome.confirmPinLabel}
                      </Text>
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
                  <View style={[styles.inputSection, { marginBottom: 4 }]}>
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
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.questionChipText,
                                isSelected && styles.questionChipTextActive,
                              ]}
                              numberOfLines={1}
                            >
                              {q}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Answer Field with Clear Separation & Sub-Label */}
                    <View style={styles.answerInputGroup}>
                      <Text style={styles.inputLabel}>{t.welcome.secAnswerLabel}</Text>
                      <TextInput
                        style={styles.textInput}
                        value={recoveryAnswer}
                        onChangeText={setRecoveryAnswer}
                        placeholder={t.welcome.secAnswerPlaceholder}
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="none"
                        returnKeyType="done"
                        onSubmitEditing={handleFinishSetup}
                      />
                    </View>
                  </View>
                </ScrollView>

                {/* Floating Scroll Hint Pill (absolute overlay — 0px layout shift, zero blink) */}
                <Animated.View
                  style={[styles.scrollCueOverlay, { opacity: scrollCueOpacity }]}
                  pointerEvents={canScrollDown ? 'auto' : 'none'}
                >
                  <TouchableOpacity
                    style={styles.scrollCuePill}
                    activeOpacity={0.85}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }}
                  >
                    <Text style={styles.scrollCueText}>{t.welcome.scrollHint}</Text>
                    <ChevronDown size={13} color={Colors.primary} strokeWidth={2.5} />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Sticky Footer Action Buttons — ALWAYS VISIBLE */}
              <View style={styles.stickyFooter}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setStep(1);
                    }}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                  >
                    <ChevronLeft size={16} color="#475569" strokeWidth={2.5} />
                    <Text style={styles.backButtonText} numberOfLines={1}>
                      {t.welcome.backBtn}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitButtonFlex, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleFinishSetup}
                    activeOpacity={0.88}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitButtonText} numberOfLines={1}>
                        {t.welcome.startBtn}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
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
    paddingHorizontal: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(12, 16, 42, 0.72)',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: Math.min(SCREEN_HEIGHT * 0.88, 680),
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  stepBadge: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D7FE',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 999,
    marginBottom: 10,
  },
  stepBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  mascotBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    gap: -8,
  },
  mascotBannerCompact: {
    marginBottom: 8,
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
  mascotCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mascotCirclePrimarySmall: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 12,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 11,
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C7D7FE',
  },
  privacyText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 16.5,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  step2Wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  scrollAreaWrapper: {
    width: '100%',
    position: 'relative',
  },
  step2Scroll: {
    width: '100%',
    maxHeight: Math.min(SCREEN_HEIGHT * 0.42, 330),
  },
  step2ScrollContent: {
    alignItems: 'center',
    paddingBottom: 42,
    paddingRight: 4,
  },
  answerInputGroup: {
    width: '100%',
    marginTop: 16,
  },
  scrollCueOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrollCuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D7FE',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    shadowColor: '#0C102A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  scrollCueText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.primary,
  },
  inputSection: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  textInput: {
    width: '100%',
    height: 46,
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
    gap: 10,
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    width: '100%',
    marginBottom: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  questionChipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF2FF',
  },
  questionChipText: {
    fontSize: 11.5,
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
    padding: 9,
    borderRadius: 10,
    width: '100%',
    marginBottom: 10,
  },
  errorText: {
    color: Colors.emergencyRed,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  stickyFooter: {
    width: '100%',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  backButton: {
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
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
  submitButtonFull: {
    width: '100%',
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonFlex: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
