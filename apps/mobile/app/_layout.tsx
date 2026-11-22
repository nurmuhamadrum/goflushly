import { useFonts } from 'expo-font';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { GluestackUIProvider } from '@/components/ui';
import { AnimatedSplashScreen } from '@/src/components/AnimatedSplashScreen';
import { AppLockModal } from '@/src/components/AppLockModal';
import { ToastProvider } from '@/src/context/ToastContext';
import { useAppStore } from '@/src/store/useAppStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Sembunyikan splash native bawaan OS agar animasi kustom kita langsung mengambil alih
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Listener AppState: Kunci aplikasi secara otomatis saat kembali dari background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const { appLockEnabled, setAppLocked } = useAppStore.getState();
      if (nextAppState === 'active' && appLockEnabled) {
        setAppLocked(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <RootLayoutNav />
      {showSplash && <AnimatedSplashScreen onFinish={() => setShowSplash(false)} />}
      <AppLockModal />
    </>
  );
}

function RootLayoutNav() {
  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={DefaultTheme}>
        <ToastProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="terms" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ToastProvider>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
