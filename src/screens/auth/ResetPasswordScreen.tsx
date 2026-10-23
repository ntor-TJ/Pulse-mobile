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
import { KeyRound, Lock } from 'lucide-react-native';
import { PulseButton } from '../../components/PulseButton';
import { PulseInput } from '../../components/PulseInput';
import { authService } from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme';

interface ResetPasswordScreenProps {
  route: any;
  navigation: any;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const initialEmail = route.params?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!email.trim() || !token.trim() || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.resetPassword({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        new_password: newPassword,
      });

      Alert.alert('Password Updated', 'Your password has been successfully reset. Please sign in.', [
        { text: 'Sign In', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your token.');
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
        <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
          <Image
            source={require('../../../assets/pulse-mark.png')}
            style={{ width: 44, height: 44, marginBottom: 8 }}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: theme.text, textAlign: 'center' }]}>Set New Password</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted, textAlign: 'center' }]}>
          Enter the reset token received via email and create a new secure password.
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <PulseInput
          label="Reset Token / OTP"
          placeholder="Paste token or OTP code"
          value={token}
          onChangeText={(t) => {
            setToken(t);
            setError('');
          }}
          leftIcon={<KeyRound size={18} color={theme.textMuted} />}
        />

        <PulseInput
          label="New Password"
          placeholder="Min. 8 characters"
          value={newPassword}
          onChangeText={(t) => {
            setNewPassword(t);
            setError('');
          }}
          isPassword
          leftIcon={<Lock size={18} color={theme.textMuted} />}
        />

        <PulseInput
          label="Confirm New Password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChangeText={(t) => {
            setConfirmPassword(t);
            setError('');
          }}
          isPassword
          leftIcon={<Lock size={18} color={theme.textMuted} />}
        />

        <PulseButton
          title="Update Password"
          loading={loading}
          onPress={handleResetPassword}
          style={styles.button}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
          <Text style={[styles.backText, { color: theme.textMuted }]}>Return to </Text>
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
