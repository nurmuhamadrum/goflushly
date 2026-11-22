import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useMobileI18n } from '@/src/i18n/translations';
import { ChevronLeft, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react-native';
import { SirFlushIcon } from '@/src/components/MascotIcons';
import * as Haptics from 'expo-haptics';

export default function TermsScreen() {
  const router = useRouter();
  const { t } = useMobileI18n();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <ChevronLeft size={24} color={Colors.creamBg} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t.terms.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconBox}>
            <SirFlushIcon size={44} />
          </View>
          <Text style={styles.heroTitle}>{t.terms.title}</Text>
          <Text style={styles.heroSubtitle}>{t.terms.subtitle}</Text>
          <View style={styles.badgeRow}>
            <ShieldCheck size={14} color={Colors.bothTeal} />
            <Text style={styles.badgeText}>{t.terms.lastUpdated}</Text>
          </View>
        </View>

        {/* Sections */}
        {t.terms.sections.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionHeading}>{section.heading}</Text>
            </View>
            <Text style={styles.sectionBody}>{section.content}</Text>
          </View>
        ))}

        {/* Bottom Back Button */}
        <TouchableOpacity style={styles.bottomBackBtn} onPress={handleBack} activeOpacity={0.88}>
          <Text style={styles.bottomBackBtnText}>{t.terms.back}</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.creamBg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    padding: 20,
    alignItems: 'center',
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  heroIconBox: {
    width: 64,
    height: 64,
    borderRadius: 24,
    backgroundColor: Colors.bothTeal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.creamBg,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: Colors.peachTint,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(47, 184, 172, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.bothTeal,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.creamBg,
    flex: 1,
  },
  sectionBody: {
    fontSize: 12,
    lineHeight: 19,
    color: Colors.slate,
  },
  bottomBackBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  bottomBackBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
