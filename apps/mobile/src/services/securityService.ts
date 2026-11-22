import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

const PIN_HASH_KEY = 'goflushly_app_pin_hash';
const APP_LOCK_ENABLED_KEY = 'goflushly_app_lock_enabled';
const BIOMETRIC_ENABLED_KEY = 'goflushly_biometric_enabled';
const SEC_QUESTION_IDX_KEY = 'goflushly_sec_question_idx';
const SEC_ANSWER_HASH_KEY = 'goflushly_sec_answer_hash';

export const SECURITY_QUESTIONS = {
  id: [
    'Siapa nama hewan peliharaan pertamamu?',
    'Di kota apa kamu dilahirkan?',
    'Apa makanan favorit masa kecilmu?',
    'Siapa nama sahabat masa kecilmu?',
  ],
  en: [
    'What was the name of your first pet?',
    'What city were you born in?',
    'What was your favorite childhood food?',
    'What was your childhood best friend\'s name?',
  ],
};

export async function hashSecuritySecret(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, normalized);
}

export async function saveAppPin(pin: string): Promise<void> {
  const hash = await hashSecuritySecret(pin);
  await SecureStore.setItemAsync(PIN_HASH_KEY, hash);
  await SecureStore.setItemAsync(APP_LOCK_ENABLED_KEY, 'true');
}

export async function verifyAppPin(pin: string): Promise<boolean> {
  const storedHash = await SecureStore.getItemAsync(PIN_HASH_KEY);
  if (!storedHash) return true; // Tidak ada PIN terpasang
  const incomingHash = await hashSecuritySecret(pin);
  return storedHash === incomingHash;
}

export async function isPinSet(): Promise<boolean> {
  const storedHash = await SecureStore.getItemAsync(PIN_HASH_KEY);
  return Boolean(storedHash && storedHash.length > 0);
}

export async function deleteAppPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_HASH_KEY).catch(() => {});
  await SecureStore.setItemAsync(APP_LOCK_ENABLED_KEY, 'false');
}

export async function saveAppLockEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(APP_LOCK_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function getAppLockEnabled(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(APP_LOCK_ENABLED_KEY);
  // Default true jika PIN sudah disetel
  if (val === null) {
    const hasPin = await isPinSet();
    return hasPin;
  }
  return val === 'true';
}

export async function saveBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function getBiometricEnabled(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  if (val === null) {
    // Default true jika perangkat mendukung biometrik
    const hasHardware = await LocalAuthentication.hasHardwareAsync().catch(() => false);
    const isEnrolled = await LocalAuthentication.isEnrolledAsync().catch(() => false);
    return hasHardware && isEnrolled;
  }
  return val === 'true';
}

export async function saveSecurityQuestion(questionIdx: number, answer: string): Promise<void> {
  await SecureStore.setItemAsync(SEC_QUESTION_IDX_KEY, questionIdx.toString());
  const answerHash = await hashSecuritySecret(answer);
  await SecureStore.setItemAsync(SEC_ANSWER_HASH_KEY, answerHash);
}

export async function getSecurityQuestionIndex(): Promise<number> {
  const val = await SecureStore.getItemAsync(SEC_QUESTION_IDX_KEY);
  return val !== null ? parseInt(val, 10) : 0;
}

export async function verifySecurityAnswer(answer: string): Promise<boolean> {
  const storedHash = await SecureStore.getItemAsync(SEC_ANSWER_HASH_KEY);
  if (!storedHash) return false;
  const incomingHash = await hashSecuritySecret(answer);
  return storedHash === incomingHash;
}

export async function hasSecurityQuestionSet(): Promise<boolean> {
  const val = await SecureStore.getItemAsync(SEC_ANSWER_HASH_KEY);
  return Boolean(val && val.length > 0);
}

/**
 * Autentikasi darurat dengan passcode / biometrik bawaan sistem operasi (OS-level verification).
 * Digunakan saat pengguna lupa PIN dan lupa jawaban pertanyaan keamanan, namun merupakan pemilik sah HP.
 */
export async function authenticateWithDeviceOS(promptMessage = 'Verifikasi Pemilik Perangkat untuk Reset PIN'): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Gunakan Passcode / Pola HP',
      cancelLabel: 'Batal',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch (err) {
    console.error('Device OS authentication error:', err);
    return false;
  }
}
