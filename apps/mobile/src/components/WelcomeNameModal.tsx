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
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { SirFlushIcon, LilDripIcon, MrPlopIcon } from './MascotIcons';
import { useAppStore } from '../store/useAppStore';
import { useMobileI18n } from '../i18n/translations';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface WelcomeNameModalProps {
  visible: boolean;
}

export function WelcomeNameModal({ visible }: WelcomeNameModalProps) {
  const { setUserName, userName } = useAppStore();
  const { t, lang } = useMobileI18n();

  const [inputName, setInputName] = useState(userName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const finalName = inputName.trim() || t.welcome.defaultName;
    await setUserName(finalName);
    setIsSubmitting(false);
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
          {/* Mascot Header Badge */}
          <View style={styles.mascotBanner}>
            <View style={[styles.mascotCircle, { backgroundColor: '#E0F2FE' }]}>
              <LilDripIcon size={36} />
            </View>
            <View style={[styles.mascotCirclePrimary, { backgroundColor: Colors.bothTeal }]}>
              <SirFlushIcon size={46} />
            </View>
            <View style={[styles.mascotCircle, { backgroundColor: '#FEF3C7' }]}>
              <MrPlopIcon size={36} />
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>{t.welcome.title}</Text>
          <Text style={styles.subtitle}>{t.welcome.subtitle}</Text>

          {/* Offline Principle Card */}
          <View style={styles.privacyBox}>
            <ShieldCheck size={20} color={Colors.bothTeal} style={{ marginTop: 2 }} />
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
              onSubmitEditing={handleSubmit}
            />
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.88}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>{t.welcome.startBtn}</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
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
    marginBottom: 16,
    gap: -8,
  },
  mascotCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 1,
  },
  mascotCirclePrimary: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(47, 184, 172, 0.1)',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(47, 184, 172, 0.25)',
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#0D9488',
    fontWeight: '600',
  },
  inputSection: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    height: 50,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  submitButton: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
