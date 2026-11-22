import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  X,
  MessageCircle,
  Send,
  Star,
  CheckCircle,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Button, ButtonText, ButtonSpinner, Heading } from '@/components/ui';
import { useMobileI18n } from '@/src/i18n/translations';
import { submitMobileFeedback, MobileFeedbackCategory } from '@/src/services/feedbackService';
import { SirFlushIcon, MrPlopIcon, LilDripIcon } from '@/src/components/MascotIcons';
import * as Haptics from 'expo-haptics';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  userEmail?: string | null;
  userId?: string | null;
  onSuccess?: () => void;
}

const CATEGORIES: MobileFeedbackCategory[] = ['SUGGESTION', 'BUG', 'PRAISE', 'OTHER'];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  userEmail,
  userId,
  onSuccess,
}) => {
  const { t } = useMobileI18n();
  const copy = t.feedbackModal;

  const [category, setCategory] = useState<MobileFeedbackCategory>('SUGGESTION');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      if (userEmail) setEmail(userEmail);
      setIsSubmitted(false);
      setErrorText(null);
    }
  }, [visible, userEmail]);

  const handleSelectCategory = (cat: MobileFeedbackCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setCategory(cat);
  };

  const handleSelectRating = (star: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setRating(star);
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setErrorText(copy.errorEmptyMessage);
      return;
    }

    setIsSubmitting(true);
    setErrorText(null);

    const res = await submitMobileFeedback({
      category,
      message,
      rating,
      email: email.trim() || undefined,
      userId: userId || undefined,
    });

    setIsSubmitting(false);

    if (res.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setErrorText(res.error || copy.errorSend);
    }
  };

  const handleClose = () => {
    setMessage('');
    setIsSubmitted(false);
    setErrorText(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalWrapper}>
          {/* Overlapping Floating Mint Icon Badge (Exact Mobile Mockup) */}
          <View style={styles.floatingMintBadge}>
            <MessageCircle size={26} color="#FFFFFF" strokeWidth={2.2} />
          </View>

          <View style={styles.modalContainer}>
            {/* Subtle Close X Button */}
            <TouchableOpacity
              onPress={handleClose}
              style={styles.modalCloseIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color={Colors.slate} />
            </TouchableOpacity>

            {isSubmitted ? (
              <View style={styles.successContainer}>
                <View style={styles.mascotRow}>
                  <View style={[styles.mascotBubble, { backgroundColor: '#FAF4EE', borderColor: '#EEDFD3', borderWidth: 1 }]}>
                    <MrPlopIcon size={38} />
                  </View>
                  <View style={[styles.mascotBubble, { backgroundColor: '#2447F9', borderColor: '#1D4ED8', borderWidth: 1.5, marginTop: -8 }]}>
                    <SirFlushIcon size={42} />
                  </View>
                  <View style={[styles.mascotBubble, { backgroundColor: '#F0F7FF', borderColor: '#BAE6FD', borderWidth: 1 }]}>
                    <LilDripIcon size={38} />
                  </View>
                </View>

                <Text style={styles.successTitle}>{copy.successTitle}</Text>
                <Text style={styles.successDesc}>{copy.successDesc}</Text>

                <Button
                  action="primary"
                  size="lg"
                  style={styles.doneButton}
                  onPress={handleClose}
                >
                  <CheckCircle size={16} color="#FFFFFF" />
                  <ButtonText style={styles.doneButtonText}>{copy.closeBtn}</ButtonText>
                </Button>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 6 }}
              >
                <Heading size="xl" style={styles.modalHeading}>{copy.title}</Heading>

                {/* Centered Category Pills (Exact Mobile Mockup) */}
                <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.categoryChip,
                          isSelected && styles.categoryChipActive,
                        ]}
                        onPress={() => handleSelectCategory(cat)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            isSelected && styles.categoryChipTextActive,
                          ]}
                        >
                          {copy.categories[cat]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Centered 5 Gold Rating Stars */}
                <View style={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= rating;
                    return (
                      <TouchableOpacity
                        key={star}
                        onPress={() => handleSelectRating(star)}
                        style={styles.starTouch}
                        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                      >
                        <Star
                          size={30}
                          color={isFilled ? Colors.star : '#CBD5E1'}
                          fill={isFilled ? Colors.star : 'transparent'}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Clean Textarea */}
                <TextInput
                  style={styles.textAreaInput}
                  placeholder={copy.messagePlaceholder}
                  placeholderTextColor={Colors.muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={message}
                  onChangeText={(text) => {
                    setMessage(text);
                    if (errorText) setErrorText(null);
                  }}
                />

                {/* Optional Email Input */}
                <TextInput
                  style={styles.textInput}
                  placeholder={copy.emailPlaceholder}
                  placeholderTextColor={Colors.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                {errorText && (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorText}>{errorText}</Text>
                  </View>
                )}

                {/* Full-Width Gluestack Primary Pill CTA */}
                <Button
                  action="primary"
                  size="lg"
                  style={[styles.submitButton, isSubmitting && { opacity: 0.65 }]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ButtonSpinner color="#FFFFFF" />
                  ) : (
                    <>
                      <Send size={15} color="#FFFFFF" />
                      <ButtonText style={styles.submitButtonText}>{copy.submitBtn}</ButtonText>
                    </>
                  )}
                </Button>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 16, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 380,
    position: 'relative',
    paddingTop: 30,
  },
  floatingMintBadge: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    zIndex: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingTop: 42,
    paddingHorizontal: 20,
    paddingBottom: 22,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.navy,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.navy,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  starTouch: {
    padding: 2,
  },
  textAreaInput: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    fontSize: 13,
    color: Colors.navy,
    fontWeight: '500',
    minHeight: 92,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 12,
    color: Colors.navy,
    fontWeight: '500',
    marginBottom: 14,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.emergencyRed,
    textAlign: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  mascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  mascotBubble: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.navy,
    marginBottom: 6,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.slate,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 999,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
