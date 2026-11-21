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
import { Colors } from '@/constants/Colors';
import { MrPlopIcon, LilDripIcon, SirFlushIcon } from '@/src/components/MascotIcons';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const AnimatedSplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Ripple wave animation values
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;

  // Mascot physics & entry values
  const plopBounce = useRef(new Animated.Value(60)).current;
  const plopOpacity = useRef(new Animated.Value(0)).current;
  const plopScale = useRef(new Animated.Value(0.7)).current;

  const dripBounce = useRef(new Animated.Value(70)).current;
  const dripOpacity = useRef(new Animated.Value(0)).current;
  const dripScale = useRef(new Animated.Value(0.6)).current;
  const dripFloat = useRef(new Animated.Value(0)).current;

  const flushBounce = useRef(new Animated.Value(60)).current;
  const flushOpacity = useRef(new Animated.Value(0)).current;
  const flushScale = useRef(new Animated.Value(0.7)).current;

  // Sparkles
  const sparkleScale = useRef(new Animated.Value(0)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  // Text & branding sequence
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(24)).current;

  const trackFade = useRef(new Animated.Value(0)).current;
  const logFade = useRef(new Animated.Value(0)).current;
  const plongFade = useRef(new Animated.Value(0)).current;
  const plongScale = useRef(new Animated.Value(0.5)).current;

  const badgeFade = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Screen exit transition
  const screenFadeOut = useRef(new Animated.Value(1)).current;
  const screenScaleOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Loop ripple animation (efek riak air kloset segar / pulse wave)
    const runRipple = () => {
      Animated.loop(
        Animated.stagger(650, [
          Animated.timing(ripple1, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(ripple2, {
            toValue: 1,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    runRipple();

    // 2. Idle floating loop untuk Lil' Drip di tengah
    const runFloat = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dripFloat, {
            toValue: -7,
            duration: 700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(dripFloat, {
            toValue: 0,
            duration: 700,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // 3. Main entrance sequence
    Animated.sequence([
      // Muncul trio maskot secara staggered dengan efek spring bouncy
      Animated.stagger(130, [
        // Mr. Plop (Coklat - Kiri)
        Animated.parallel([
          Animated.spring(plopBounce, {
            toValue: 0,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.spring(plopScale, {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(plopOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Lil' Drip (Kuning - Tengah, paling tinggi & dominan)
        Animated.parallel([
          Animated.spring(dripBounce, {
            toValue: 0,
            friction: 4.5,
            tension: 55,
            useNativeDriver: true,
          }),
          Animated.spring(dripScale, {
            toValue: 1.1,
            friction: 4.5,
            tension: 55,
            useNativeDriver: true,
          }),
          Animated.timing(dripOpacity, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
        ]),
        // Sir Flush (Teal - Kanan)
        Animated.parallel([
          Animated.spring(flushBounce, {
            toValue: 0,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.spring(flushScale, {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(flushOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Mulai animasi idle floating Lil' Drip & munculkan bintang sparkle
      Animated.parallel([
        Animated.timing(sparkleScale, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleRotate, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),

      // Brand Title "GoFlushly"
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlide, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),

      // Staggered reveal tagline: "Track." -> "Log." -> "Plong!"
      Animated.stagger(120, [
        Animated.timing(trackFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(logFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(plongFade, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(plongScale, {
            toValue: 1,
            friction: 4,
            tension: 60,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // Feature badge & progress bar
      Animated.parallel([
        Animated.timing(badgeFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(progressWidth, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),

      // Tahan sebentar untuk kepuasan visual user
      Animated.delay(450),

      // Seamless Exit: Scale up slightly + Fade out
      Animated.parallel([
        Animated.timing(screenFadeOut, {
          toValue: 0,
          duration: 420,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(screenScaleOut, {
          toValue: 1.06,
          duration: 420,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onFinish();
    });

    runFloat();
  }, []);

  // Interpolations for ripples
  const rippleScale1 = ripple1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1.8],
  });
  const rippleOpacity1 = ripple1.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.55, 0.25, 0],
  });

  const rippleScale2 = ripple2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 2.1],
  });
  const rippleOpacity2 = ripple2.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.45, 0.2, 0],
  });

  // Sparkle rotation
  const spin = sparkleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenFadeOut,
          transform: [{ scale: screenScaleOut }],
        },
      ]}
    >
      <StatusBar barStyle="dark-content" />

      {/* Ripple wave rings (efek riak air membesar) */}
      <View style={styles.rippleCenterWrapper}>
        <Animated.View
          style={[
            styles.rippleRing,
            {
              transform: [{ scale: rippleScale1 }],
              opacity: rippleOpacity1,
              borderColor: '#00BA9D',
            },
          ]}
        />
        <Animated.View
          style={[
            styles.rippleRing,
            styles.rippleRingBlue,
            {
              transform: [{ scale: rippleScale2 }],
              opacity: rippleOpacity2,
              borderColor: '#2447F9',
            },
          ]}
        />
      </View>

      {/* Ambient background glow */}
      <View style={styles.ambientGlow} />

      <View style={styles.centerContent}>
        {/* Trio Mascot Avatars Overlapping Row */}
        <View style={styles.mascotsRow}>
          {/* Sparkles dekorasi */}
          <Animated.Text
            style={[
              styles.sparkleLeft,
              {
                opacity: sparkleScale,
                transform: [{ scale: sparkleScale }, { rotate: spin }],
              },
            ]}
          >
            ✨
          </Animated.Text>
          <Animated.Text
            style={[
              styles.sparkleRight,
              {
                opacity: sparkleScale,
                transform: [{ scale: sparkleScale }],
              },
            ]}
          >
            💧
          </Animated.Text>

          {/* Mr. Plop (Kiri) */}
          <Animated.View
            style={[
              styles.mascotBadge,
              styles.mascotPlop,
              {
                opacity: plopOpacity,
                transform: [
                  { translateY: plopBounce },
                  { scale: plopScale },
                  { rotate: '-6deg' },
                ],
              },
            ]}
          >
            <MrPlopIcon size={58} />
          </Animated.View>

          {/* Lil' Drip (Tengah - Terbesar & mengambang) */}
          <Animated.View
            style={[
              styles.mascotBadge,
              styles.mascotDrip,
              {
                opacity: dripOpacity,
                transform: [
                  { translateY: Animated.add(dripBounce, dripFloat) },
                  { scale: dripScale },
                ],
              },
            ]}
          >
            <LilDripIcon size={66} />
          </Animated.View>

          {/* Sir Flush (Kanan) */}
          <Animated.View
            style={[
              styles.mascotBadge,
              styles.mascotFlush,
              {
                opacity: flushOpacity,
                transform: [
                  { translateY: flushBounce },
                  { scale: flushScale },
                  { rotate: '6deg' },
                ],
              },
            ]}
          >
            <SirFlushIcon size={58} />
          </Animated.View>
        </View>

        {/* Brand App Name */}
        <Animated.View
          style={{
            opacity: titleFade,
            transform: [{ translateY: titleSlide }],
            alignItems: 'center',
          }}
        >
          <View style={styles.appNameRow}>
            <Text style={styles.appName}>GoFlushly</Text>
            <View style={styles.logoBadgeDot} />
          </View>
        </Animated.View>

        {/* Staggered Tagline "Track. Log. Plong!" */}
        <View style={styles.taglineBox}>
          <Animated.Text style={[styles.taglineTrack, { opacity: trackFade }]}>
            Track.{' '}
          </Animated.Text>
          <Animated.Text style={[styles.taglineLog, { opacity: logFade }]}>
            Log.{' '}
          </Animated.Text>
          <Animated.View
            style={[
              styles.plongBadge,
              {
                opacity: plongFade,
                transform: [{ scale: plongScale }],
              },
            ]}
          >
            <Text style={styles.taglinePlong}>Plong!</Text>
          </Animated.View>
        </View>

        {/* Feature Highlights Pills */}
        <Animated.View style={[styles.bottomPillContainer, { opacity: badgeFade }]}>
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>⚡ 3-Detik Sat-set</Text>
          </View>
          <View style={styles.pillBadge}>
            <Text style={styles.pillText}>🛡️ 100% Offline & Privat</Text>
          </View>
        </Animated.View>

        {/* Shimmer Progress Mini Bar */}
        <Animated.View style={[styles.loaderWrapper, { opacity: badgeFade }]}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Menyiapkan radar kelegaan...</Text>
        </Animated.View>
      </View>

      {/* Clean Footer Branding */}
      <Animated.View style={[styles.footer, { opacity: badgeFade }]}>
        <Text style={styles.footerSub}>Personal Digestive & Hydration Tracker</Text>
        <Text style={styles.versionText}>v1.0.0 • 100% Privat</Text>
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
    backgroundColor: '#F8FAFC',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleCenterWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2.5,
    backgroundColor: 'rgba(0, 186, 157, 0.04)',
  },
  rippleRingBlue: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 2,
    backgroundColor: 'rgba(36, 71, 249, 0.03)',
  },
  ambientGlow: {
    position: 'absolute',
    width: width * 1.3,
    height: width * 1.3,
    borderRadius: (width * 1.3) / 2,
    backgroundColor: 'rgba(36, 71, 249, 0.04)',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mascotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  sparkleLeft: {
    position: 'absolute',
    left: -20,
    top: -10,
    fontSize: 22,
    zIndex: 10,
  },
  sparkleRight: {
    position: 'absolute',
    right: -20,
    top: 4,
    fontSize: 20,
    zIndex: 10,
  },
  mascotBadge: {
    borderRadius: 999,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
  },
  mascotPlop: {
    width: 82,
    height: 82,
    backgroundColor: '#FDE6C9',
    marginRight: -18,
    zIndex: 1,
  },
  mascotDrip: {
    width: 96,
    height: 96,
    backgroundColor: '#D4F0FF',
    zIndex: 3,
  },
  mascotFlush: {
    width: 82,
    height: 82,
    backgroundColor: '#C6F6E2',
    marginLeft: -18,
    zIndex: 2,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0C102A',
    letterSpacing: -1.2,
  },
  logoBadgeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#2447F9',
    marginLeft: 3,
  },
  taglineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  taglineTrack: {
    fontSize: 17,
    fontWeight: '800',
    color: '#64748B',
  },
  taglineLog: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2447F9',
  },
  plongBadge: {
    backgroundColor: '#E7F7F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  taglinePlong: {
    fontSize: 17,
    fontWeight: '900',
    color: '#00BA9D',
  },
  bottomPillContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
  },
  pillBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  loaderWrapper: {
    alignItems: 'center',
    marginTop: 26,
    width: 170,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2447F9',
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 44,
    alignItems: 'center',
  },
  footerSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    opacity: 0.8,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2447F9',
    marginTop: 3,
  },
});
