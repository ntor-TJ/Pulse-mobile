import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { PulseButton } from '../../components/PulseButton';
import { PulseInput } from '../../components/PulseInput';
import { authService } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSendReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.forgotPassword({ email: email.trim().toLowerCase() });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: theme.surface2 }]}
          >
            <ArrowLeft size={18} color={theme.text} />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/pulse-mark.png')}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>
          Enter your registered email address and we'll send you instructions to reset your password.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {submitted ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successDesc}>
              If an account exists for <Text style={{ fontWeight: 'bold' }}>{email}</Text>, a password reset link has been dispatched.
            </Text>
            <PulseButton
              title="Proceed to Reset Password"
              onPress={() => navigation.navigate('ResetPassword', { email })}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          <>
            <PulseInput
              label="Email Address"
              placeholder="founder@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={theme.textMuted} />}
            />

            <PulseButton
              title="Send Reset Instructions"
              loading={loading}
              onPress={handleSendReset}
              style={styles.button}
            />
          </>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
          <Text style={[styles.backText, { color: theme.textMuted }]}>Remember password? </Text>
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  successBox: {
    backgroundColor: colors.successLight,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  successTitle: {
    color: colors.success,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  successDesc: {
    color: '#14532D',
    fontSize: typography.fontSizes.sm,
    lineHeight: 18,
  },
  button: {
    width: '100%',
    marginTop: spacing.sm,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  backText: {
    fontSize: typography.fontSizes.sm,
  },
  loginLink: {
    color: colors.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
});
