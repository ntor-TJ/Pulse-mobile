import React, { useState } from 'react';
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
import { Check, Lock, Mail, User as UserIcon } from 'lucide-react-native';
import { PulseButton } from '../../components/PulseButton';
import { PulseInput } from '../../components/PulseInput';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!isAgeConfirmed) {
      setError('You must confirm that you are at least 18 years of age (or have verified parental permission).');
      return;
    }

    if (!agreedToTerms) {
      setError('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirm_password: confirmPassword,
        is_age_confirmed: isAgeConfirmed,
        terms_version_accepted: '1.0',
        privacy_version_accepted: '1.0',
      });

      Alert.alert(
        'Account Created',
        'Verification OTP has been sent to your email. Please enter the OTP to continue.',
        [
          {
            text: 'Verify Now',
            onPress: () => navigation.navigate('OtpVerification', { email: email.trim().toLowerCase() }),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
              Create your account
            </Text>
            <Text style={[styles.formSub, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Start validating your startup ideas with AI Mentor.
            </Text>

            <View style={[styles.divider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB' }]} />

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
            ) : null}

            <PulseInput
              label="Full Name"
              placeholder="Alex Mercer"
              value={fullName}
              onChangeText={(t) => {
                setFullName(t);
                setError('');
              }}
              leftIcon={<UserIcon size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />}
            />

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
              placeholder="Create a strong password (min 8 chars)"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError('');
              }}
              isPassword
              leftIcon={<Lock size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />}
            />

            <PulseInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setError('');
              }}
              isPassword
              leftIcon={<Lock size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />}
            />

            {/* 18+ Statutory Age Declaration Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setIsAgeConfirmed(!isAgeConfirmed)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: isAgeConfirmed ? colors.primary : isDark ? '#4B5563' : '#D1D5DB',
                    backgroundColor: isAgeConfirmed ? colors.primary : 'transparent',
                  },
                ]}
              >
                {isAgeConfirmed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.termsText, { color: isDark ? '#D1D5DB' : '#374151', fontWeight: '500' }]}>
                I confirm that I am <Text style={{ color: colors.primary, fontWeight: '700' }}>18 years of age or older</Text>.
              </Text>
            </TouchableOpacity>

            {/* Terms & Privacy Policy Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: agreedToTerms ? colors.primary : isDark ? '#4B5563' : '#D1D5DB',
                    backgroundColor: agreedToTerms ? colors.primary : 'transparent',
                  },
                ]}
              >
                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.termsText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                I accept the <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
                <Text style={{ color: colors.primary }}>Privacy Policy</Text>.
              </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <PulseButton
              title="Get started"
              loading={loading}
              disabled={!isAgeConfirmed || !agreedToTerms}
              onPress={handleRegister}
              style={[
                styles.submitBtn,
                (!isAgeConfirmed || !agreedToTerms) && { opacity: 0.5 },
              ]}
            />

            {/* Footer Row */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.registerLink}>Sign In</Text>
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: spacing.md,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: typography.fontWeights.bold,
  },
});
