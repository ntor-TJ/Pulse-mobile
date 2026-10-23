import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_ENABLED_KEY = 'axiora_pulse_biometric_enabled';
const BIOMETRIC_CREDENTIALS_KEY = 'axiora_pulse_biometric_creds';

export const biometricService = {
  async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  },

  async isEnabled(): Promise<boolean> {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  },

  async setEnabled(enabled: boolean, credentials?: { email: string; password: string }): Promise<void> {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    if (enabled && credentials) {
      await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
    } else if (!enabled) {
      await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    }
  },

  async authenticateAndGetCredentials(): Promise<{ email: string; password: string } | null> {
    const isAvail = await this.isAvailable();
    const isEn = await this.isEnabled();

    if (!isAvail || !isEn) return null;

    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in to Axiora Pulse',
      fallbackLabel: 'Use password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (authResult.success) {
      const stored = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    }

    return null;
  },
};
