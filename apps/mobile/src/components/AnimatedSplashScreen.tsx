import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
} from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import { SirFlushIcon } from '@/src/components/MascotIcons';
import { useMobileI18n } from '@/src/i18n/translations';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
  onReady?: () => void;
}

export const AnimatedSplashScreen: React.FC<SplashScreenProps> = ({ onFinish, onReady }) => {
  const { lang } = useMobileI18n();
  const isEn = lang === 'en';
  const hasSignaledReady = useRef(false);

  // Hero squircle entrance & subtle breathing float
  const heroScale = useRef(new Animated.Value(0.76)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroFloat = useRef(new Animated.Value(0)).current;

  // Single ultra-thin expanding pulse ring
  const pulseAnim = useRef(new Animated.Value(0)).current;

  // Brand wordmark & tagline entrance
  const brandOpacity = useRef(new Animated.Value(0)).current;
  const brandSlide = useRef(new Animated.Value(18)).current;

  // Footer & slim progress bar
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Seamless screen exit
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Subtle pulse ring loop
    const pulseLoop = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    pulseLoop.start();

    // 2. Gentle breathing float loop for hero squircle
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: -5,
          duration: 850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 850,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // 3. Snappy, modern entrance -> progress -> seamless exit (~1.9s total)
    const sequence = Animated.sequence([
      Animated.parallel([
        // Hero squircle pops in smoothly
        Animated.spring(heroScale, {
          toValue: 1,
          friction: 6.5,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 320,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        // Brand wordmark & tagline glide up with slight stagger
        Animated.sequence([
          Animated.delay(160),
          Animated.parallel([
            Animated.timing(brandOpacity, {
              toValue: 1,
              duration: 340,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.spring(brandSlide, {
              toValue: 0,
              friction: 7,
              tension: 60,
              useNativeDriver: true,
            }),
          ]),
        ]),
        // Footer fades in & slim bar smoothly loads
        Animated.sequence([
          Animated.delay(260),
          Animated.parallel([
            Animated.timing(footerOpacity, {
              toValue: 1,
              duration: 280,
              useNativeDriver: true,
            }),
            Animated.timing(progressAnim, {
              toValue: 1,
              duration: 1120,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: false,
            }),
          ]),
        ]),
      ]),

      // Short visual breath at 100%
      Animated.delay(140),

      // Smooth fade & slight scale-out into the main screen
      Animated.parallel([
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 340,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(exitScale, {
          toValue: 1.04,
          duration: 340,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    sequence.start(() => {
      onFinish();
    });

    return () => {
      pulseLoop.stop();
      floatLoop.stop();
      sequence.stop();
    };
  }, []);

  const ringScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.92, 1.78],
  });
  const ringOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0.42, 0.2, 0],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      onLayout={() => {
        if (!hasSignaledReady.current) {
          hasSignaledReady.current = true;
          onReady?.();
        }
      }}
      style={[
        styles.container,
        {
          opacity: exitOpacity,
          transform: [{ scale: exitScale }],
        },
      ]}
    >
      <StatusBar barStyle="light-content" />

      {/* Full-Bleed Modern Royal Blue Gradient & Subtle Radial Spotlight */}
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <LinearGradient id="royalBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2F55FF" />
            <Stop offset="50%" stopColor="#2447F9" />
            <Stop offset="100%" stopColor="#1631C2" />
          </LinearGradient>
          <RadialGradient id="centerGlow" cx="50%" cy="44%" r="48%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
            <Stop offset="55%" stopColor="#60A5FA" stopOpacity="0.08" />
            <Stop offset="100%" stopColor="#2447F9" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#royalBg)" />
        <Circle cx={width / 2} cy={height * 0.44} r={width * 0.62} fill="url(#centerGlow)" />
      </Svg>

      {/* Center Hero Composition */}
      <View style={styles.centerContent}>
        {/* Hero Squircle + Single Thin Pulse Ring */}
        <View style={styles.heroStage}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.heroSquircle,
              {
                opacity: heroOpacity,
                transform: [
                  { scale: heroScale },
                  { translateY: heroFloat },
                ],
              },
            ]}
          >
            <SirFlushIcon size={76} />
          </Animated.View>
        </View>

        {/* Crisp Brand Wordmark & Clean Tagline */}
        <Animated.View
          style={[
            styles.brandBlock,
            {
              opacity: brandOpacity,
              transform: [{ translateY: brandSlide }],
            },
          ]}
        >
          <View style={styles.wordmarkRow}>
            <Text style={styles.wordmark}>GoFlushly</Text>
            <View style={styles.accentDot} />
          </View>
          <Text style={styles.tagline}>Track. Log. Plong.</Text>
        </Animated.View>
      </View>

      {/* Minimal Bottom Progress & Privacy Signature */}
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.privacyText}>
          {isEn ? '100% Private • Offline-First' : '100% Privat • Offline-First'}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2447F9',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  heroStage: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pulseRing: {
    position: 'absolute',
    width: 116,
    height: 116,
    borderRadius: 38,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  heroSquircle: {
    width: 112,
    height: 112,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.34)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A196E',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  brandBlock: {
    alignItems: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  wordmark: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.0,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#67E8F9',
    marginLeft: 3,
  },
  tagline: {
    marginTop: 8,
    fontSize: 14.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.82)',
    letterSpacing: 1.2,
  },
  footer: {
    position: 'absolute',
    bottom: 52,
    alignItems: 'center',
  },
  progressTrack: {
    width: 112,
    height: 3.5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  privacyText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: 0.3,
  },
});
