import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fingerprint, Lock, Mail } from 'lucide-react-native';
import { PulseButton } from '../../components/PulseButton';
import { PulseInput } from '../../components/PulseInput';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { login, biometricLogin, isBiometricAvailable, isBiometricEnabled } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isBiometricAvailable && isBiometricEnabled) {
      handleBiometricAuth();
    }
  }, [isBiometricAvailable, isBiometricEnabled]);

  const handleBiometricAuth = async () => {
    const success = await biometricLogin();
    if (success) {
      // Auto logged in
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      if (msg.toLowerCase().includes('not verified')) {
        Alert.alert(
          'Email Not Verified',
          'Would you like to verify your account with an OTP?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Verify OTP',
              onPress: () => navigation.navigate('OtpVerification', { email }),
            },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: '#141414' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Hero Section with Glowing Axiora Pulse Logo Banner */}
          <View style={[styles.heroContainer, { paddingTop: Math.max(insets.top, 16) + 8 }]}>
            {/* Ambient Glows */}
            <LinearGradient
              colors={['transparent', 'rgba(217, 75, 35, 0.45)', 'rgba(217, 148, 35, 0.25)']}
              style={styles.heroGlow}
            />

            {/* Official Brand Artwork Hero Banner */}
            <Image
              source={require('../../../assets/pulse-hero-landscape.png')}
              style={styles.heroBannerImg}
              resizeMode="contain"
            />
          </View>

          {/* Overlapping Curved Card Sheet */}
          <View
            style={[
              styles.sheetCard,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
              },
            ]}
          >
            <Text style={[styles.formHeading, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Welcome back
            </Text>
            <Text style={[styles.formSub, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Sign in to continue to your workspace.
            </Text>

            <View style={[styles.divider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB' }]} />

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            <PulseInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />}
            />

            <PulseInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError('');
              }}
              isPassword
              leftIcon={<Lock size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />}
            />

            {/* Remember Me & Forgot Password */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: rememberMe ? colors.primary : isDark ? '#4B5563' : '#D1D5DB',
                      backgroundColor: rememberMe ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.rememberText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                  Remember me
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.forgotLink, { color: isDark ? '#E5E7EB' : '#111827' }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Get Started Button */}
            <PulseButton
              title="Get started"
              loading={loading}
              onPress={handleLogin}
              style={styles.submitBtn}
            />

            {/* Biometric Button */}
            {isBiometricAvailable && isBiometricEnabled && (
              <PulseButton
                title="Sign In with Biometrics"
                variant="secondary"
                leftIcon={<Fingerprint size={18} color={colors.primary} />}
                onPress={handleBiometricAuth}
                style={styles.bioBtn}
              />
            )}

            {/* Google Sign In Visual Component */}
            <TouchableOpacity
              style={[
                styles.googleBtn,
                {
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                  backgroundColor: isDark ? '#262626' : '#FFFFFF',
                },
              ]}
              onPress={() => {
                Alert.alert('Google Sign-In', 'Please use your email and password or verify via OTP.');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.googleBtnText, { color: isDark ? '#FFFFFF' : '#1F2937' }]}>
                Continue with Google
              </Text>
            </TouchableOpacity>

            {/* Register Footer */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Register</Text>
              </TouchableOpacity>
            </View>

            {/* Privacy & Legal */}
            <View style={styles.legalRow}>
              <TouchableOpacity onPress={() => navigation.navigate('TermsPrivacy', { type: 'privacy' })}>
                <Text style={[styles.legalText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                  Privacy policy
                </Text>
              </TouchableOpacity>
              <Text style={[styles.legalText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>  ·  </Text>
              <TouchableOpacity onPress={() => navigation.navigate('TermsPrivacy', { type: 'terms' })}>
                <Text style={[styles.legalText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                  Legal terms
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 140,
    opacity: 0.8,
  },
  heroBannerImg: {
    width: '100%',
    height: 140,
    borderRadius: radius.md,
  },
  pillarContainer: {
    ...StyleSheet.absoluteFill,
  },
  pillar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '18%',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  logoImg: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: typography.fontWeights.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 34,
    maxWidth: 320,
    marginTop: spacing.xs,
  },
  sheetCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    flex: 1,
  },
  formHeading: {
    fontSize: 24,
    fontWeight: typography.fontWeights.bold,
  },
  formSub: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    color: colors.danger || '#EF4444',
    fontSize: 13,
    fontWeight: typography.fontWeights.medium,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 13,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: typography.fontWeights.medium,
  },
  submitBtn: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  bioBtn: {
    marginBottom: spacing.md,
  },
  googleBtn: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: typography.fontWeights.semibold,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: typography.fontWeights.bold,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  legalText: {
    fontSize: 12,
  },
});
