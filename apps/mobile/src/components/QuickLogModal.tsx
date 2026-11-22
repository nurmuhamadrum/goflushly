import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Button, ButtonText, Heading } from '@/components/ui';
import { MrPlopIcon, LilDripIcon, SirFlushIcon } from './MascotIcons';
import { BristolStoolIcon } from './BristolStoolIcons';
import { useAppStore } from '../store/useAppStore';
import { getCurrentLocationWithAddress } from '../services/location';
import { useToast } from '../context/ToastContext';
import { useMobileI18n } from '../i18n/translations';
import { LogType } from '@go-flushly/shared';
import { Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface QuickLogModalProps {
  visible: boolean;
  onClose: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { lang, t } = useMobileI18n();
  const isEn = lang === 'en';
  const addLog = useAppStore((state: any) => state.addLog);

  const [selectedType, setSelectedType] = useState<LogType>('POOP');
  const [selectedMood, setSelectedMood] = useState<string>('Lega Banget');
  const [stoolDensity, setStoolDensity] = useState<number>(4);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(320);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleSelectType = (type: LogType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedType(type);
  };

  const handleSaveLog = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsSubmitting(true);

    try {
      const loc = await getCurrentLocationWithAddress();
      const now = new Date().toISOString();

      await addLog({
        type: selectedType,
        latitude: loc.latitude,
        longitude: loc.longitude,
        altitude: loc.altitude,
        city: loc.city,
        district: loc.district,
        subdistrict: loc.subdistrict,
        country: loc.country,
        mood: selectedMood,
        note: note.trim(),
        stoolDensity: (selectedType === 'POOP' || selectedType === 'COMBO') ? stoolDensity : undefined,
        loggedAt: now,
        isBlurred: false,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setIsSubmitting(false);

      const typeLabel =
        selectedType === 'PEE'
          ? "Lil' Drip (BAK)"
          : selectedType === 'POOP'
          ? 'Mr. Plop (BAB)'
          : 'Sir Flush (Kombo)';
      showToast({
        message: t.quickLog.toastLogged(typeLabel),
        type: 'success',
      });

      handleFinish(() => {
        setTimeout(() => {
          router.push('/(tabs)/timeline');
        }, 120);
      });
    } catch (error) {
      console.error('Error logging:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setIsSubmitting(false);
      showToast({
        message: t.quickLog.toastFailed,
        type: 'error',
      });
    }
  };

  const handleFinish = (afterClose?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNote('');
      onClose();
      if (afterClose) afterClose();
    });
  };

  const mascotOptions: { type: LogType; name: string; label: string }[] = [
    { type: 'POOP', name: 'Mr. Plop', label: isEn ? 'Poop' : 'BAB' },
    { type: 'PEE', name: "Lil' Drip", label: isEn ? 'Pee' : 'BAK' },
    { type: 'COMBO', name: 'Sir Flush', label: isEn ? 'Both' : 'Keduanya' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => handleFinish()}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => handleFinish()}
        />
        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Grabber Bar */}
          <View style={styles.grabber} />

          {/* Centered Header matching Mobile Mockup */}
          <View style={styles.headerRow}>
            <View style={{ width: 32 }} />
            <Heading size="xl" style={styles.title}>{isEn ? 'Log Now' : 'Catat Sekarang'}</Heading>
            <TouchableOpacity onPress={() => handleFinish()} style={styles.closeBtn}>
              <X size={16} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 3 Side-by-Side 3D Mascot Cards (Exact Mobile Mockup Layout) */}
            <View style={styles.mascotGrid}>
              {mascotOptions.map((item) => {
                const isSelected = selectedType === item.type;
                return (
                  <TouchableOpacity
                    key={item.type}
                    style={[
                      styles.mascotCard,
                      isSelected && styles.mascotCardActive,
                    ]}
                    onPress={() => handleSelectType(item.type)}
                    activeOpacity={0.85}
                    disabled={isSubmitting}
                  >
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Check size={11} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}

                    <View style={styles.mascotImgWrap}>
                      {item.type === 'POOP' && <MrPlopIcon size={58} />}
                      {item.type === 'PEE' && <LilDripIcon size={58} />}
                      {item.type === 'COMBO' && <SirFlushIcon size={58} />}
                    </View>

                    <Text style={styles.mascotName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.mascotLabel, isSelected && styles.mascotLabelActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Stool Density Section (Bristol Scale 1-7) - Only for POOP & COMBO */}
            {(selectedType === 'POOP' || selectedType === 'COMBO') && (
              <View style={styles.densityContainer}>
                <View style={styles.densityHeaderRow}>
                  <Text style={styles.sectionLabel}>{t.quickLog.stoolDensityTitle}</Text>
                  <Text style={styles.densitySub}>{t.quickLog.stoolDensitySubtitle}</Text>
                </View>

                {/* 7 Bristol Scale Custom Vector Row (Exact Attachment Style) */}
                <View style={styles.bristolScaleRow}>
                  {t.quickLog.stoolScale.map((item) => {
                    const isSelected = stoolDensity === item.level;
                    return (
                      <TouchableOpacity
                        key={item.level}
                        style={[
                          styles.bristolItem,
                          isSelected && {
                            backgroundColor: `${item.color}14`,
                            borderColor: item.color,
                          },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                          setStoolDensity(item.level);
                        }}
                        activeOpacity={0.75}
                      >
                        <View style={styles.bristolIconWrap}>
                          <BristolStoolIcon type={item.level} width={38} height={22} />
                        </View>
                        <Text
                          style={[
                            styles.bristolNumber,
                            { color: item.color },
                            isSelected && styles.bristolNumberSelected,
                          ]}
                        >
                          {item.level}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Selected Density Explanation Card */}
                {(() => {
                  const currentInfo =
                    t.quickLog.stoolScale.find((s) => s.level === stoolDensity) ||
                    t.quickLog.stoolScale[3];
                  return (
                    <View
                      style={[
                        styles.densityExplainCard,
                        { borderLeftColor: currentInfo.color },
                      ]}
                    >
                      <View style={styles.densityExplainHeader}>
                        <Text style={styles.densityExplainTitle}>
                          Tipe {currentInfo.level}: {currentInfo.name}
                        </Text>
                        <View
                          style={[
                            styles.densityStatusBadge,
                            { backgroundColor: `${currentInfo.color}18` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.densityStatusText,
                              { color: currentInfo.color },
                            ]}
                          >
                            {currentInfo.status}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.densityExplainDesc}>{currentInfo.desc}</Text>
                    </View>
                  );
                })()}
              </View>
            )}

            {/* Mood Section */}
            <Text style={styles.sectionLabel}>{isEn ? 'Mood' : 'Mood'}</Text>
            <View style={styles.moodRow}>
              {t.quickLog.moods.map((m) => {
                const isSelected = selectedMood === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.moodChip, isSelected && styles.moodChipActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setSelectedMood(m.key);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodText, isSelected && styles.moodTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Note Input */}
            <View style={styles.labelRow}>
              <Text style={styles.sectionLabel}>{isEn ? 'Note' : 'Catatan'}</Text>
              <Text style={styles.charCount}>{note.length}/100</Text>
            </View>
            <TextInput
              style={styles.noteInput}
              placeholder={t.quickLog.notePlaceholder}
              placeholderTextColor={Colors.muted}
              multiline
              maxLength={100}
              textAlignVertical="top"
              value={note}
              onChangeText={setNote}
            />
          </ScrollView>

          {/* Sticky CTA Save Button at Bottom */}
          <View style={styles.stickyFooter}>
            <Button
              action="primary"
              size="lg"
              style={[styles.saveButton, isSubmitting && { opacity: 0.7 }]}
              onPress={handleSaveLog}
              disabled={isSubmitting}
            >
              <ButtonText style={styles.saveButtonText}>
                {isSubmitting
                  ? (isEn ? 'Saving...' : 'Menyimpan...')
                  : (isEn ? 'Save Record' : 'Simpan Catatan')}
              </ButtonText>
            </Button>
          </View>

          {/* Clean Light Loading Overlay */}
          {isSubmitting && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>{t.quickLog.recording}</Text>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 16, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingBottom: 0,
    height: '86%',
    shadowColor: '#0C102A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  stickyFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.navy,
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  mascotCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mascotCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#F5F7FF',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImgWrap: {
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  mascotName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.navy,
    textAlign: 'center',
  },
  mascotLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.slate,
    marginTop: 2,
  },
  mascotLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.navy,
    marginBottom: 8,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  moodChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: Colors.primary,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate,
  },
  moodTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.muted,
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    minHeight: 76,
    fontSize: 13,
    color: Colors.navy,
    fontWeight: '500',
    marginBottom: 18,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.navy,
  },
  densityContainer: {
    marginBottom: 18,
  },
  densityHeaderRow: {
    marginBottom: 8,
  },
  densitySub: {
    fontSize: 11,
    color: Colors.slate,
    marginTop: 2,
  },
  bristolScaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  bristolItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginHorizontal: 1,
  },
  bristolIconWrap: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bristolNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  bristolNumberSelected: {
    fontWeight: '900',
    transform: [{ scale: 1.1 }],
  },
  densityExplainCard: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 4,
    padding: 12,
  },
  densityExplainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  densityExplainTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.navy,
    flex: 1,
    marginRight: 8,
  },
  densityStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  densityStatusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  densityExplainDesc: {
    fontSize: 11,
    color: Colors.slate,
    lineHeight: 16,
  },
});
