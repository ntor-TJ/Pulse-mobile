import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PulseButton } from '../../components/PulseButton';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme';

interface OtpVerificationScreenProps {
  route: any;
  navigation: any;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { verifyOtp } = useAuth();
  const initialEmail = route.params?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    const newValues = [...otpValues];
    newValues[index] = value;
    setOtpValues(newValues);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otpValues.join('');
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }

    if (!email) {
      setError('Email address is missing.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyOtp({ email, otp: otpCode });
      Alert.alert('Success', 'Your account has been verified successfully!');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    try {
      await authService.resendOtp(email);
      setTimer(60);
      setCanResend(false);
      Alert.alert('Code Sent', 'A new 6-digit OTP code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
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

        <Text style={[styles.title, { color: theme.text, textAlign: 'center' }]}>Enter Verification Code</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted, textAlign: 'center' }]}>
          We sent a 6-digit verification code to{' '}
          <Text style={{ color: theme.text, fontWeight: 'bold' }}>{email || 'your email'}</Text>
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* 6-Digit OTP Box inputs */}
        <View style={styles.otpContainer}>
          {otpValues.map((val, idx) => (
            <TextInput
              key={idx}
              ref={(ref) => {
                inputRefs.current[idx] = ref;
              }}
              value={val}
              onChangeText={(text) => handleOtpChange(text, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpInput,
                {
                  backgroundColor: theme.surface,
                  borderColor: val ? colors.primary : theme.border,
                  color: theme.text,
                },
              ]}
            />
          ))}
        </View>

        <PulseButton
          title="Verify & Continue"
          loading={loading}
          onPress={handleVerify}
          style={styles.verifyButton}
        />

        <View style={styles.resendRow}>
          <Text style={[styles.resendText, { color: theme.textMuted }]}>Didn't receive the code? </Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.resendLink, { opacity: 0.5 }]}>Resend in {timer}s</Text>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backToLogin}>
          <Text style={[styles.backLink, { color: theme.textMuted }]}>Back to Sign In</Text>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderWidth: 1.5,
    borderRadius: radius.md,
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  resendText: {
    fontSize: typography.fontSizes.sm,
  },
  resendLink: {
    color: colors.primary,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  backToLogin: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  backLink: {
    fontSize: typography.fontSizes.xs,
  },
});
