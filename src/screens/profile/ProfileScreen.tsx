import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Lock, Mail, Shield, User as UserIcon } from 'lucide-react-native';
import { PulseAvatar } from '../../components/PulseAvatar';
import { PulseButton } from '../../components/PulseButton';
import { PulseCard } from '../../components/PulseCard';
import { PulseHeader } from '../../components/PulseHeader';
import { PulseInput } from '../../components/PulseInput';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { user, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      await authService.updateProfile({ full_name: fullName.trim() });
      await refreshProfile();
      Alert.alert('Profile Updated', 'Your profile details have been successfully saved.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long.');
      return;
    }

    setPassLoading(true);
    try {
      await authService.changePassword({ old_password: oldPassword, new_password: newPassword });
      Alert.alert('Password Changed', 'Your password has been updated securely.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to change password. Check your current password.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <PulseHeader title="Founder Profile" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Profile Avatar Banner */}
        <View style={styles.avatarSection}>
          <PulseAvatar name={user?.full_name} size="xl" showOnline />
          <Text style={[styles.profileName, { color: theme.text }]}>{user?.full_name}</Text>
          <Text style={[styles.profileEmail, { color: theme.textMuted }]}>{user?.email}</Text>
        </View>

        {/* Edit Info Card */}
        <PulseCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Personal Information</Text>

          <PulseInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<UserIcon size={18} color={theme.textMuted} />}
          />

          <PulseInput
            label="Email Address"
            value={email}
            editable={false}
            helperText="Email address cannot be modified."
            leftIcon={<Mail size={18} color={theme.textMuted} />}
          />

          <PulseButton
            title="Save Profile"
            loading={loading}
            onPress={handleUpdateProfile}
            style={{ marginTop: spacing.xs }}
          />
        </PulseCard>

        {/* Security / Password */}
        <PulseCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Security & Password</Text>
          <Text style={[styles.cardSub, { color: theme.textMuted }]}>
            Protect your account with a strong, distinct password.
          </Text>

          {showPasswordModal ? (
            <View style={{ marginTop: spacing.md }}>
              <PulseInput
                label="Current Password"
                placeholder="Enter current password"
                value={oldPassword}
                onChangeText={setOldPassword}
                isPassword
                leftIcon={<Lock size={18} color={theme.textMuted} />}
              />

              <PulseInput
                label="New Password"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                isPassword
                leftIcon={<Lock size={18} color={theme.textMuted} />}
              />

              <PulseInput
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                leftIcon={<Lock size={18} color={theme.textMuted} />}
              />

              <View style={styles.buttonRow}>
                <PulseButton
                  title="Cancel"
                  variant="secondary"
                  onPress={() => setShowPasswordModal(false)}
                  style={{ flex: 1, marginRight: spacing.sm }}
                />
                <PulseButton
                  title="Update"
                  loading={passLoading}
                  onPress={handleChangePassword}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <PulseButton
              title="Change Password"
              variant="outline"
              leftIcon={<Shield size={16} color={colors.primary} />}
              onPress={() => setShowPasswordModal(true)}
              style={{ marginTop: spacing.sm }}
            />
          )}
        </PulseCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  profileName: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.sm,
  },
  profileEmail: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  cardSub: {
    fontSize: typography.fontSizes.xs,
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
});
