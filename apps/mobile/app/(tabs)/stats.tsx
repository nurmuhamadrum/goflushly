import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Card, Heading } from '@/components/ui';
import { useAppStore } from '@/src/store/useAppStore';
import { useMobileI18n } from '@/src/i18n/translations';
import { MrPlopIcon, LilDripIcon, SirFlushIcon } from '@/src/components/MascotIcons';
import {
  Flame,
  Droplet,
  Sparkles,
  Award,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react-native';

type TimeRange = 'ALL' | 'YEAR' | 'MONTH' | 'WEEK';

interface BadgeItem {
  id: string;
  title: string;
  category: string;
  description: string;
  mascot: 'drip' | 'plop' | 'flush';
  unlocked: boolean;
  progressText: string;
  accentColor: string;
}

export default function StatsScreen() {
  const { logs } = useAppStore();
  const { t } = useMobileI18n();
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL');

  // Filter logs berdasarkan periode waktu
  const filteredLogs = useMemo(() => {
    const now = new Date();
    return logs.filter((log) => {
      const logDate = new Date(log.loggedAt);
      if (timeRange === 'WEEK') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return logDate >= oneWeekAgo;
      }
      if (timeRange === 'MONTH') {
        return (
          logDate.getFullYear() === now.getFullYear() &&
          logDate.getMonth() === now.getMonth()
        );
      }
      if (timeRange === 'YEAR') {
        return logDate.getFullYear() === now.getFullYear();
      }
      return true; // 'ALL'
    });
  }, [logs, timeRange]);

  // Total counts pada filter aktif
  const totalLogs = filteredLogs.length;
  const countPeeOnly = filteredLogs.filter((l) => l.type === 'PEE').length;
  const countPoopOnly = filteredLogs.filter((l) => l.type === 'POOP').length;
  const countCombo = filteredLogs.filter((l) => l.type === 'COMBO').length;

  const totalPeeIncCombo = countPeeOnly + countCombo;
  const totalPoopIncCombo = countPoopOnly + countCombo;

  // Streak calculation (dari seluruh riwayat logs)
  const streakDays = useMemo(() => {
    if (logs.length === 0) return 0;
    const dates = Array.from(
      new Set(logs.map((l) => new Date(l.loggedAt).toDateString()))
    ).map((d) => new Date(d).getTime());
    dates.sort((a, b) => b - a);

    let streak = 0;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const today = new Date().setHours(0, 0, 0, 0);

    // Cek apakah ada catatan hari ini atau kemarin
    const mostRecent = new Date(dates[0]).setHours(0, 0, 0, 0);
    if (today - mostRecent > oneDayMs) {
      return 0; // Streak terputus
    }

    let expected = mostRecent;
    for (const d of dates) {
      const current = new Date(d).setHours(0, 0, 0, 0);
      if (current === expected) {
        streak++;
        expected -= oneDayMs;
      } else {
        break;
      }
    }
    return Math.max(streak, logs.length > 0 ? 1 : 0);
  }, [logs]);

  // Unique lokasi & kota
  const uniqueDistricts = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.district) set.add(l.district);
    });
    return set.size;
  }, [logs]);

  // Daftar Lencana Menarik & Progresnya
  const badges: BadgeItem[] = useMemo(() => {
    const allTotal = logs.length;
    const allPee = logs.filter((l) => l.type === 'PEE' || l.type === 'COMBO').length;
    const allPoop = logs.filter((l) => l.type === 'POOP' || l.type === 'COMBO').length;
    const allFlush = logs.filter((l) => l.type === 'COMBO').length;

    return [
      {
        id: 'newbie',
        title: 'Pendatang Baru',
        category: 'Awal Perjalanan',
        description: 'Mencatat buang air pertama kali di aplikasi',
        mascot: 'drip',
        unlocked: allTotal >= 1,
        progressText: allTotal >= 1 ? 'Selesai' : `${allTotal}/1 log`,
        accentColor: Colors.primary,
      },
      {
        id: 'hydration-master',
        title: 'Juara Hidrasi',
        category: 'Konsistensi',
        description: 'Mencapai total 10x catatan buang air kecil (Pee)',
        mascot: 'drip',
        unlocked: allPee >= 10,
        progressText: allPee >= 10 ? 'Selesai' : `${allPee}/10 pee`,
        accentColor: Colors.dripBlue,
      },
      {
        id: 'urban-explorer',
        title: 'Penjelajah Kota',
        category: 'Eksplorasi',
        description: 'Mencoba toilet di minimal 3 area / distrik berbeda',
        mascot: 'plop',
        unlocked: uniqueDistricts >= 3,
        progressText: uniqueDistricts >= 3 ? 'Selesai' : `${uniqueDistricts}/3 lokasi`,
        accentColor: Colors.poopBrown,
      },
      {
        id: 'flush-royale',
        title: 'Sir Flush Royale',
        category: 'Master Kloset',
        description: 'Melakukan paket kombo Pee & Poop (Sir Flush) 3 kali',
        mascot: 'flush',
        unlocked: allFlush >= 3,
        progressText: allFlush >= 3 ? 'Selesai' : `${allFlush}/3 flush`,
        accentColor: Colors.bothTeal,
      },
      {
        id: 'streak-warrior',
        title: 'Lancar Jaya (Streak 3)',
        category: 'Disiplin',
        description: 'Menjaga streak mencatat buang air 3 hari berturut-turut',
        mascot: 'plop',
        unlocked: streakDays >= 3,
        progressText: streakDays >= 3 ? 'Selesai' : `${streakDays}/3 hari`,
        accentColor: Colors.emergencyRed,
      },
      {
        id: 'centurion',
        title: 'Legenda Toilet',
        category: 'Pencapaian Akbar',
        description: 'Mencatat total 50 riwayat aktivitas biologis',
        mascot: 'flush',
        unlocked: allTotal >= 50,
        progressText: allTotal >= 50 ? 'Selesai' : `${allTotal}/50 log`,
        accentColor: '#A78BFA',
      },
    ];
  }, [logs, uniqueDistricts, streakDays]);

  const unlockedBadgeCount = badges.filter((b) => b.unlocked).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header Area */}
      <View style={styles.headerArea}>
        <Heading size="2xl" style={styles.pageTitle}>{t.stats.title}</Heading>
        <Text style={styles.pageSubtitle}>{t.stats.subtitle}</Text>
      </View>

      {/* Filter Waktu: Minggu Ini, Bulan Ini, Tahun Ini, Semua */}
      <View style={styles.filterBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsRow}>
          <TouchableOpacity
            style={[styles.timePill, timeRange === 'WEEK' && styles.timePillActive]}
            onPress={() => setTimeRange('WEEK')}
          >
            <Text style={[styles.timePillText, timeRange === 'WEEK' && styles.timePillTextActive]}>
              {t.stats.week}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timePill, timeRange === 'MONTH' && styles.timePillActive]}
            onPress={() => setTimeRange('MONTH')}
          >
            <Text style={[styles.timePillText, timeRange === 'MONTH' && styles.timePillTextActive]}>
              {t.stats.month}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timePill, timeRange === 'YEAR' && styles.timePillActive]}
            onPress={() => setTimeRange('YEAR')}
          >
            <Text style={[styles.timePillText, timeRange === 'YEAR' && styles.timePillTextActive]}>
              {t.stats.year}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timePill, timeRange === 'ALL' && styles.timePillActive]}
            onPress={() => setTimeRange('ALL')}
          >
            <Text style={[styles.timePillText, timeRange === 'ALL' && styles.timePillTextActive]}>
              {t.stats.all}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Streak Hero Banner (Gluestack Navy Card) */}
        <Card variant="navy" size="lg" style={styles.streakCard}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <View style={styles.streakHeaderTagRow}>
              <Flame size={14} color="#FBBF24" />
              <Text style={styles.streakTag}>STREAK AKTIF</Text>
            </View>
            <View style={styles.streakNumberRow}>
              <Text style={styles.streakNumber}>{streakDays} Hari 🔥</Text>
            </View>
            <Text style={styles.streakSubTitle}>Streak</Text>
            <Text style={styles.streakHint}>
              {streakDays >= 3
                ? 'Luar biasa! Disiplin biologismu terjaga sangat baik.'
                : logs.length > 0
                ? `${3 - streakDays} hari lagi menuju lencana "Lancar Jaya"!`
                : 'Catat buang air hari ini untuk memulai streak pertamamu!'}
            </Text>
          </View>

          {/* Circular Mint Progress Ring */}
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>
              {logs.length > 0 ? `${Math.min(100, Math.round((streakDays / 7) * 100))}%` : '0%'}
            </Text>
          </View>
        </Card>

        {/* 2 CRISP WHITE MASCOT KPI CARDS (Mr. Plop BAB & Lil' Drip BAK) */}
        <View style={styles.kpiRow}>
          {/* Card 1: Mr. Plop (BAB / Poop) */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <View style={[styles.kpiMascotBox, { backgroundColor: '#FAF4EE', borderColor: '#EEDFD3', borderWidth: 1 }]}>
                <MrPlopIcon size={34} />
              </View>
              <View>
                <Text style={styles.kpiBigNumber}>{totalPoopIncCombo}x</Text>
                <Text style={styles.kpiTypeLabel}>BAB</Text>
              </View>
            </View>
            <View style={styles.kpiPeriodPill}>
              <Text style={styles.kpiPeriodText}>
                {timeRange === 'WEEK'
                  ? t.stats.week
                  : timeRange === 'MONTH'
                  ? t.stats.month
                  : timeRange === 'YEAR'
                  ? t.stats.year
                  : t.stats.all}
              </Text>
            </View>
          </View>

          {/* Card 2: Lil' Drip (BAK / Pee) */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <View style={[styles.kpiMascotBox, { backgroundColor: '#F0F7FF', borderColor: '#BAE6FD', borderWidth: 1 }]}>
                <LilDripIcon size={34} />
              </View>
              <View>
                <Text style={styles.kpiBigNumber}>{totalPeeIncCombo}x</Text>
                <Text style={styles.kpiTypeLabel}>BAK</Text>
              </View>
            </View>
            <View style={styles.kpiPeriodPill}>
              <Text style={styles.kpiPeriodText}>
                {timeRange === 'WEEK'
                  ? t.stats.week
                  : timeRange === 'MONTH'
                  ? t.stats.month
                  : timeRange === 'YEAR'
                  ? t.stats.year
                  : t.stats.all}
              </Text>
            </View>
          </View>
        </View>

        {/* Card 3: Sir Flush (Combo BAB & BAK) */}
        <View style={styles.flushHighlightCard}>
          <View style={styles.flushLeft}>
            <View style={styles.flushAvatarWrapper}>
              <SirFlushIcon size={34} />
            </View>
            <View>
              <View style={styles.flushBadgeRow}>
                <Sparkles size={12} color={Colors.accent} />
                <Text style={styles.flushTag}>SIR FLUSH • KOMBO</Text>
              </View>
              <Text style={styles.flushTitle}>BAB & BAK Sekaligus</Text>
              <Text style={styles.flushSubtitle}>Efisiensi waktu & hidrasi seimbang</Text>
            </View>
          </View>

          <View style={styles.flushCountBox}>
            <Text style={styles.flushCountNumber}>{countCombo}x</Text>
            <Text style={styles.flushCountLabel}>Kombo</Text>
          </View>
        </View>

        {/* Summary Info Bar */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryBarItem}>
            <Calendar size={14} color={Colors.primary} />
            <Text style={styles.summaryBarText}>
              Total: <Text style={styles.summaryBarHighlight}>{totalLogs} Catatan</Text>
            </Text>
          </View>
          <View style={styles.summaryBarDivider} />
          <View style={styles.summaryBarItem}>
            <MapPin size={14} color={Colors.accent} />
            <Text style={styles.summaryBarText}>
              Jelajah: <Text style={styles.summaryBarHighlight}>{uniqueDistricts} Lokasi</Text>
            </Text>
          </View>
        </View>

        {/* SECTION LENCANA & PENCAPAIAN */}
        <View style={styles.badgeSectionHeader}>
          <View>
            <Text style={styles.sectionHeading}>Achievement Badges</Text>
            <Text style={styles.sectionSub}>
              {unlockedBadgeCount} dari {badges.length} lencana telah diraih
            </Text>
          </View>
          <View style={styles.badgeRatioPill}>
            <Award size={13} color={Colors.primary} />
            <Text style={styles.badgeRatioText}>{unlockedBadgeCount}/{badges.length}</Text>
          </View>
        </View>

        {/* Clean White Achievement Cards */}
        <View style={styles.badgesList}>
          {badges.map((b) => {
            const pastelBg =
              b.mascot === 'drip' ? '#F0F7FF' : b.mascot === 'plop' ? '#FAF4EE' : '#2447F9';
            const pastelBorder =
              b.mascot === 'drip' ? '#BAE6FD' : b.mascot === 'plop' ? '#EEDFD3' : '#1D4ED8';
            return (
              <View
                key={b.id}
                style={[
                  styles.badgeRowCard,
                  b.unlocked
                    ? { borderColor: Colors.primary, backgroundColor: '#FFFFFF' }
                    : styles.badgeRowCardLocked,
                ]}
              >
                <View
                  style={[
                    styles.badgeIconWrapper,
                    {
                      backgroundColor: b.unlocked ? pastelBg : '#F1F5F9',
                      borderColor: b.unlocked ? pastelBorder : '#E2E8F0',
                      borderWidth: 1,
                    },
                  ]}
                >
                  {b.mascot === 'drip' && <LilDripIcon size={30} />}
                  {b.mascot === 'plop' && <MrPlopIcon size={30} />}
                  {b.mascot === 'flush' && <SirFlushIcon size={30} />}

                  {!b.unlocked && (
                    <View style={styles.lockBadgeOverlay}>
                      <Lock size={10} color={Colors.slate} />
                    </View>
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.badgeRowHeader}>
                    <Text
                      style={[
                        styles.badgeTitleText,
                        !b.unlocked && { color: Colors.slate },
                      ]}
                    >
                      {b.title}
                    </Text>
                    {b.unlocked ? (
                      <View style={[styles.badgePillUnlocked, { backgroundColor: 'rgba(0, 186, 157, 0.14)' }]}>
                        <CheckCircle2 size={11} color={Colors.accent} />
                        <Text style={[styles.badgePillTextUnlocked, { color: Colors.accent }]}>
                          DIRAIH
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.badgePillLocked}>
                        <Text style={styles.badgePillTextLocked}>{b.progressText}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.badgeCategoryText}>{b.category}</Text>
                  <Text style={styles.badgeDescText}>{b.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    paddingBottom: 4,
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
  filterBarContainer: {
    marginTop: 10,
    marginBottom: 4,
  },
  filterPillsRow: {
    paddingHorizontal: 20,
    gap: 8,
    flexDirection: 'row',
  },
  timePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.darkSurface,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
  },
  timePillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.peachTint,
  },
  timePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  content: {
    padding: 18,
    paddingBottom: 110,
  },
  streakCard: {
    backgroundColor: Colors.navy,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  streakHeaderTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  streakTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.accent,
    letterSpacing: 0.8,
  },
  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  streakSubTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: -2,
  },
  streakHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 15,
  },
  progressCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 186, 157, 0.14)',
    borderWidth: 5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 22,
    padding: 16,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  kpiMascotBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBigNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.navy,
    lineHeight: 28,
  },
  kpiTypeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.slate,
  },
  kpiPeriodPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  kpiPeriodText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.slate,
  },
  flushHighlightCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 22,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  flushLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  flushAvatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#2447F9',
    borderWidth: 1,
    borderColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flushBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flushTag: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  flushTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.navy,
    marginTop: 1,
  },
  flushSubtitle: {
    fontSize: 11,
    color: Colors.slate,
    marginTop: 1,
  },
  flushCountBox: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  flushCountNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.navy,
  },
  flushCountLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.slate,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryBarText: {
    fontSize: 11,
    color: Colors.slate,
  },
  summaryBarHighlight: {
    fontWeight: '800',
    color: Colors.navy,
  },
  summaryBarDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border,
  },
  badgeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 11,
    color: Colors.slate,
    marginTop: 2,
  },
  badgeRatioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: 'rgba(36, 71, 249, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeRatioText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  badgesList: {
    gap: 10,
  },
  badgeRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeRowCardLocked: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.border,
    opacity: 0.85,
  },
  badgeIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadgeOverlay: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.navy,
  },
  badgeCategoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  badgeDescText: {
    fontSize: 11,
    color: Colors.slate,
    marginTop: 3,
    lineHeight: 15,
  },
  badgePillUnlocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgePillTextUnlocked: {
    fontSize: 9,
    fontWeight: '800',
  },
  badgePillLocked: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgePillTextLocked: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.slate,
  },
});
