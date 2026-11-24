import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  FileText,
  X,
  Calendar,
  FileDown,
  Printer,
  ShieldCheck,
  AlertCircle,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/Colors';
import { useAppStore } from '@/src/store/useAppStore';
import { useToast } from '@/src/context/ToastContext';
import { useMobileI18n } from '@/src/i18n/translations';
import {
  PdfPeriodPreset,
  PdfTypeFilter,
  filterLogsForPdf,
  getEffectivePeriodLabel,
  exportDiaryToPdfFile,
  printDiaryPdfDirectly,
} from '@/src/services/pdfExportService';

interface ExportPdfModalProps {
  visible: boolean;
  onClose: () => void;
  initialPeriod?: PdfPeriodPreset;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

const PERIOD_OPTIONS: PdfPeriodPreset[] = ['WEEK', 'LAST_30', 'MONTH', 'YEAR', 'ALL', 'CUSTOM'];
const TYPE_OPTIONS: PdfTypeFilter[] = ['ALL', 'POOP', 'PEE', 'COMBO'];

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  visible,
  onClose,
  initialPeriod = 'MONTH',
  initialStartDate,
  initialEndDate,
}) => {
  const { logs, userName } = useAppStore();
  const { showToast } = useToast();
  const { lang, t } = useMobileI18n();
  const locale = lang === 'en' ? 'en-US' : 'id-ID';

  const [period, setPeriod] = useState<PdfPeriodPreset>(initialPeriod);
  const [typeFilter, setTypeFilter] = useState<PdfTypeFilter>('ALL');
  const [includeLocationAndNotes, setIncludeLocationAndNotes] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<Date>(
    initialStartDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date>(initialEndDate || new Date());
  const [pickerTarget, setPickerTarget] = useState<'START' | 'END' | null>(null);
  const [showNativePicker, setShowNativePicker] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<'DOWNLOAD' | 'PRINT' | null>(null);

  const SCREEN_HEIGHT = Dimensions.get('window').height;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Sync defaults whenever modal opens
  useEffect(() => {
    if (visible) {
      setPeriod(initialPeriod);
      if (initialStartDate) setStartDate(initialStartDate);
      if (initialEndDate) setEndDate(initialEndDate);
      setPickerTarget(null);
      setShowNativePicker(false);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 68,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    if (isGenerating) return;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 180,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setPickerTarget(null);
      setShowNativePicker(false);
      onClose();
    });
  };

  const matchedLogs = useMemo(
    () =>
      filterLogsForPdf({
        logs,
        period,
        startDate,
        endDate,
        typeFilter,
      }),
    [logs, period, startDate, endDate, typeFilter]
  );

  const breakdown = useMemo(() => {
    let poop = 0;
    let pee = 0;
    let combo = 0;
    matchedLogs.forEach((l) => {
      if (l.type === 'POOP') poop += 1;
      else if (l.type === 'PEE') pee += 1;
      else if (l.type === 'COMBO') combo += 1;
    });
    return { poop, pee, combo };
  }, [matchedLogs]);

  const effectiveRangeLabel = useMemo(
    () => getEffectivePeriodLabel(period, startDate, endDate, lang),
    [period, startDate, endDate, lang]
  );

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowNativePicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) {
      setPickerTarget(null);
      return;
    }

    if (pickerTarget === 'START') {
      setStartDate(selectedDate);
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
    } else if (pickerTarget === 'END') {
      if (selectedDate < startDate) {
        setStartDate(selectedDate);
      }
      setEndDate(selectedDate);
    }

    if (Platform.OS === 'android') {
      setPickerTarget(null);
    }
  };

  const handleExecuteExport = async (mode: 'DOWNLOAD' | 'PRINT') => {
    if (matchedLogs.length === 0 || isGenerating) return;
    if (period === 'CUSTOM' && startDate > endDate) {
      showToast({ message: t.timeline.invalidRange, type: 'error' });
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsGenerating(mode);

    try {
      const options = {
        logs,
        period,
        startDate,
        endDate,
        typeFilter,
        includeLocationAndNotes,
        userName: userName || t.settings.defaultName,
        lang,
      };

      if (mode === 'DOWNLOAD') {
        await exportDiaryToPdfFile(options);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        showToast({ message: t.pdfExport.successToast, type: 'success' });
      } else {
        await printDiaryPdfDirectly(options);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        showToast({ message: t.pdfExport.printSuccessToast, type: 'info' });
      }
    } catch (err: any) {
      console.error('PDF export error:', err);
      const errMsg = String(err?.message || '').toLowerCase();
      if (errMsg.includes('native module') || errMsg.includes('expoprint') || errMsg.includes('cannot find')) {
        showToast({ message: t.pdfExport.nativeMissingToast, type: 'error' });
      } else if (!errMsg.includes('cancel') && !errMsg.includes('did not complete')) {
        showToast({ message: t.pdfExport.errorToast, type: 'error' });
      }
    } finally {
      setIsGenerating(null);
    }
  };

  if (!visible) return null;

  const isEmpty = matchedLogs.length === 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />

        <Animated.View
          style={[
            styles.sheetContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Grabber Bar */}
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <FileText size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{t.pdfExport.modalTitle}</Text>
                <Text style={styles.modalSubtitle}>{t.pdfExport.modalSubtitle}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={18} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Period Selection */}
            <Text style={styles.sectionLabel}>{t.pdfExport.periodSection}</Text>
            <View style={styles.chipGrid}>
              {PERIOD_OPTIONS.map((opt) => {
                const active = period === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.periodChip, active && styles.periodChipActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setPeriod(opt);
                      if (opt !== 'CUSTOM') {
                        setPickerTarget(null);
                        setShowNativePicker(false);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    {opt === 'CUSTOM' && (
                      <Calendar size={13} color={active ? '#FFFFFF' : Colors.primary} />
                    )}
                    <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>
                      {t.pdfExport.periods[opt]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Date Range Pickers */}
            {period === 'CUSTOM' && (
              <View style={styles.customRangeBox}>
                <View style={styles.dateRow}>
                  <TouchableOpacity
                    style={[
                      styles.dateCard,
                      pickerTarget === 'START' && styles.dateCardActive,
                    ]}
                    onPress={() => {
                      setPickerTarget('START');
                      setShowNativePicker(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dateCardLabel}>{t.timeline.fromDate}</Text>
                    <Text style={styles.dateCardValue}>
                      {startDate.toLocaleDateString(locale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.dateCardHint}>{t.timeline.tapToChange}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.dateCard,
                      pickerTarget === 'END' && styles.dateCardActive,
                    ]}
                    onPress={() => {
                      setPickerTarget('END');
                      setShowNativePicker(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dateCardLabel}>{t.timeline.toDate}</Text>
                    <Text style={styles.dateCardValue}>
                      {endDate.toLocaleDateString(locale, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.dateCardHint}>{t.timeline.tapToChange}</Text>
                  </TouchableOpacity>
                </View>

                {showNativePicker && pickerTarget && (
                  <View style={styles.pickerContainer}>
                    <DateTimePicker
                      value={pickerTarget === 'START' ? startDate : endDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      maximumDate={new Date()}
                      onChange={onDateChange}
                      themeVariant="light"
                    />
                    {Platform.OS === 'ios' && (
                      <TouchableOpacity
                        style={styles.donePickBtn}
                        onPress={() => {
                          setShowNativePicker(false);
                          setPickerTarget(null);
                        }}
                      >
                        <Text style={styles.donePickText}>{t.timeline.donePick}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* 2. Activity Type Filter */}
            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>{t.pdfExport.typeSection}</Text>
            <View style={styles.typeRow}>
              {TYPE_OPTIONS.map((opt) => {
                const active = typeFilter === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.typeChip, active && styles.typeChipActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                      setTypeFilter(opt);
                    }}
                    activeOpacity={0.8}
                  >
                    {active && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>
                      {t.pdfExport.types[opt]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* 3. Privacy Toggle */}
            <View style={styles.privacyRow}>
              <View style={styles.privacyLeft}>
                <View style={styles.privacyIconWrap}>
                  <ShieldCheck size={16} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.privacyTitle}>{t.pdfExport.privacyTitle}</Text>
                  <Text style={styles.privacyDesc}>{t.pdfExport.privacyDesc}</Text>
                </View>
              </View>
              <Switch
                value={includeLocationAndNotes}
                onValueChange={setIncludeLocationAndNotes}
                trackColor={{ false: '#CBD5E1', true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* 4. Live Summary Preview Card */}
            <View style={[styles.previewCard, isEmpty && styles.previewCardEmpty]}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewLabel}>{t.pdfExport.previewTitle}</Text>
                <View style={styles.rangeBadge}>
                  <Text style={styles.rangeBadgeText} numberOfLines={1}>
                    {effectiveRangeLabel}
                  </Text>
                </View>
              </View>

              {isEmpty ? (
                <View style={styles.emptyPreviewRow}>
                  <AlertCircle size={16} color="#D97706" />
                  <Text style={styles.emptyPreviewText}>{t.pdfExport.previewEmpty}</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.previewCountText}>
                    {t.pdfExport.previewReady(matchedLogs.length)}
                  </Text>
                  <View style={styles.breakdownRow}>
                    <View style={[styles.breakdownPill, { backgroundColor: '#FAF4EE', borderColor: '#EEDFD3' }]}>
                      <Text style={[styles.breakdownText, { color: '#8B5E3C' }]}>
                        {t.pdfExport.types.POOP}: {breakdown.poop}
                      </Text>
                    </View>
                    <View style={[styles.breakdownPill, { backgroundColor: '#F0F7FF', borderColor: '#BAE6FD' }]}>
                      <Text style={[styles.breakdownText, { color: '#0284C7' }]}>
                        {t.pdfExport.types.PEE}: {breakdown.pee}
                      </Text>
                    </View>
                    <View style={[styles.breakdownPill, { backgroundColor: '#EEF2FF', borderColor: '#C7D7FE' }]}>
                      <Text style={[styles.breakdownText, { color: '#2447F9' }]}>
                        {t.pdfExport.types.COMBO}: {breakdown.combo}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </ScrollView>

          {/* Sticky Bottom CTA Footer */}
          <View style={styles.stickyFooter}>
            <TouchableOpacity
              style={[
                styles.printBtn,
                (isEmpty || Boolean(isGenerating)) && styles.btnDisabled,
              ]}
              onPress={() => handleExecuteExport('PRINT')}
              disabled={isEmpty || Boolean(isGenerating)}
              activeOpacity={0.8}
            >
              {isGenerating === 'PRINT' ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Printer size={16} color={Colors.primary} />
                  <Text style={styles.printBtnText}>{t.pdfExport.printBtn}</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.downloadBtn,
                (isEmpty || Boolean(isGenerating)) && styles.btnDisabled,
              ]}
              onPress={() => handleExecuteExport('DOWNLOAD')}
              disabled={isEmpty || Boolean(isGenerating)}
              activeOpacity={0.85}
            >
              {isGenerating === 'DOWNLOAD' ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.downloadBtnText}>{t.pdfExport.generating}</Text>
                </>
              ) : (
                <>
                  <FileDown size={17} color="#FFFFFF" />
                  <Text style={styles.downloadBtnText}>{t.pdfExport.downloadBtn}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 16, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '82%',
    maxHeight: '90%',
    paddingTop: 10,
    shadowColor: '#0C102A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 16,
  },
  grabber: {
    width: 42,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: Colors.slate,
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.slate,
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  periodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.navy,
  },
  periodChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  customRangeBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  dateCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF2FF',
  },
  dateCardLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.slate,
    letterSpacing: 0.5,
  },
  dateCardValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.navy,
    marginTop: 3,
  },
  dateCardHint: {
    fontSize: 9.5,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  pickerContainer: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  donePickBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    alignItems: 'center',
  },
  donePickText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  typeChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  typeChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.slate,
  },
  typeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  privacyRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  privacyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.navy,
  },
  privacyDesc: {
    fontSize: 10.5,
    color: Colors.slate,
    marginTop: 1,
    lineHeight: 14,
  },
  previewCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D7FE',
  },
  previewCardEmpty: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  rangeBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    maxWidth: '62%',
  },
  rangeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.navy,
  },
  previewCountText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.navy,
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  breakdownPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  breakdownText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  emptyPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyPreviewText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  stickyFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D7FE',
  },
  printBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  downloadBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.45,
  },
});
