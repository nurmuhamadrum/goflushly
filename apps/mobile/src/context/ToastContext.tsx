import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  Animated,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { CheckCircle2, AlertCircle, Info, Trash2 } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

type ToastType = 'success' | 'error' | 'info' | 'delete';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextProps {
  showToast: (options: ToastOptions | string) => void;
}

const ToastContext = createContext<ToastContextProps>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((options: ToastOptions | string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const message = typeof options === 'string' ? options : options.message;
    const type = typeof options === 'string' ? 'success' : options.type || 'success';
    const duration = typeof options === 'string' ? 2600 : options.duration || 2600;

    setToast({ message, type });

    // Animate in (Slide down with spring)
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast(null);
      });
    }, duration);
  }, [translateY, opacity]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <SafeAreaView style={styles.safeContainer} pointerEvents="none">
          <Animated.View
            style={[
              styles.toastContainer,
              toast.type === 'success' && styles.toastSuccess,
              toast.type === 'delete' && styles.toastDelete,
              toast.type === 'error' && styles.toastError,
              toast.type === 'info' && styles.toastInfo,
              {
                transform: [{ translateY }],
                opacity,
              },
            ]}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} color={Colors.bothTeal} />}
            {toast.type === 'delete' && <Trash2 size={18} color={Colors.emergencyRed} />}
            {toast.type === 'error' && <AlertCircle size={18} color={Colors.emergencyRed} />}
            {toast.type === 'info' && <Info size={18} color={Colors.primary} />}

            <Text style={styles.toastText} numberOfLines={2}>
              {toast.message}
            </Text>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 36 : 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 11,
    paddingHorizontal: 18,
    marginHorizontal: 20,
    maxWidth: Dimensions.get('window').width - 40,
    borderWidth: 1.5,
    shadowColor: Colors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
  },
  toastSuccess: {
    borderColor: Colors.bothTeal,
  },
  toastDelete: {
    borderColor: Colors.emergencyRed,
  },
  toastError: {
    borderColor: Colors.emergencyRed,
  },
  toastInfo: {
    borderColor: Colors.primary,
  },
  toastText: {
    color: Colors.navy,
    fontSize: 13,
    fontWeight: '800',
    flexShrink: 1,
  },
});
