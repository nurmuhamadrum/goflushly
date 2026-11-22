import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  Share,
  Animated,
  Easing,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { MrPlopIcon, LilDripIcon, SirFlushIcon } from './MascotIcons';
import { BadgeDefinition } from '../services/badgeEvaluator';
import { useMobileI18n } from '../i18n/translations';
import { Award, Sparkles, Share2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface BadgeUnlockedModalProps {
  visible: boolean;
  badge: BadgeDefinition | null;
  onClose: () => void;
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({
  visible,
  badge,
  onClose,
}) => {
  const { t } = useMobileI18n();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && badge) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 75,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
  }, [visible, badge]);

  if (!badge) return null;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await Share.share({
        title: `Lencana Baru Terbuka: ${badge.title}`,
        message: `🎉 Saya baru saja membuka lencana "${badge.title}" di GoFlushly! (${badge.description}) #GoFlushly #TrackLogPlong`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Close Icon Top Right */}
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn} activeOpacity={0.8}>
            <X size={18} color={Colors.peachTint} />
          </TouchableOpacity>

          {/* Floating Pill Ribbon */}
          <View style={styles.ribbonPill}>
            <Sparkles size={14} color={Colors.accent} />
            <Text style={styles.ribbonText}>{t.badgeModal.ribbon}</Text>
          </View>

          {/* Mascot Center Glow */}
          <View
            style={[
              styles.avatarRing,
              {
                borderColor: badge.accentColor,
                backgroundColor:
                  badge.mascot === 'drip'
                    ? '#F0F7FF'
                    : badge.mascot === 'plop'
                    ? '#FAF4EE'
                    : '#2447F9',
              },
            ]}
          >
            {badge.mascot === 'drip' && <LilDripIcon size={64} />}
            {badge.mascot === 'plop' && <MrPlopIcon size={64} />}
            {badge.mascot === 'flush' && <SirFlushIcon size={64} />}
          </View>

          {/* Category & Badge Title */}
          <Text style={styles.categoryText}>{badge.category.toUpperCase()}</Text>
          <Text style={[styles.title, { color: Colors.navy }]}>{badge.title}</Text>
          <Text style={styles.description}>{badge.description}</Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShare}
              activeOpacity={0.85}
            >
              <Share2 size={16} color={Colors.navy} />
              <Text style={styles.shareButtonText}>{t.badgeModal.share}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.claimButton, { backgroundColor: Colors.primary }]}
              onPress={handleClose}
              activeOpacity={0.85}
            >
              <Award size={16} color="#FFFFFF" />
              <Text style={styles.claimButtonText}>{t.badgeModal.claim}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  ribbonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E7F7F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 186, 157, 0.25)',
    marginBottom: 18,
  },
  ribbonText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.accent,
    letterSpacing: 0.8,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.muted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 13,
    color: Colors.slate,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingVertical: 13,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.navy,
  },
  claimButton: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: 13,
    gap: 6,
  },
  claimButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
