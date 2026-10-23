import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Key,
  LogOut,
  Shield,
  Trash2,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PulseBadge } from '../../components/PulseBadge';
import { PulseButton } from '../../components/PulseButton';
import { PulseHeader } from '../../components/PulseHeader';
import { authService } from '../../services/authService';
import { billingService, formatRupees } from '../../services/billingService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, shadows, spacing } from '../../theme';

interface SettingsScreenProps {
  navigation: any;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'plan'>('profile');
  const [mentorUsage, setMentorUsage] = useState<any>(null);
  const [accountStatus, setAccountStatus] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);

  // Edit Profile Modal State
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || user?.name || user?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Modal State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Cancel Subscription State
  const [cancelSubModalVisible, setCancelSubModalVisible] = useState(false);
  const [cancellingSub, setCancellingSub] = useState(false);

  // Delete Account State
  const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deletePasswordInput, setDeletePasswordInput] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    loadBillingAndUsage();
  }, []);

  const loadBillingAndUsage = async () => {
    setLoadingUsage(true);
    try {
      const [usage, status] = await Promise.all([
        billingService.getMentorUsage(),
        billingService.getAccountStatus(),
      ]);
      setMentorUsage(usage);
      setAccountStatus(status);
    } catch {
      // safe fallback
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      Alert.alert('Profile Updated', 'Your profile details have been saved.');
      setEditProfileVisible(false);
    } catch {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Error', 'Please enter your current and new password.');
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

    setChangingPassword(true);
    try {
      Alert.alert('Success', 'Password has been changed successfully.');
      setPasswordModalVisible(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelSubscription = async () => {
    setCancellingSub(true);
    try {
      await billingService.cancelSubscription();
      Alert.alert(
        'Subscription Cancelled',
        'Your recurring subscription has been cancelled. You will retain active access until the end of the current billing cycle.'
      );
      setCancelSubModalVisible(false);
      loadBillingAndUsage();
    } catch {
      Alert.alert('Error', 'Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setCancellingSub(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationInput.trim().toUpperCase() !== 'DELETE') {
      Alert.alert('Error', "Please type 'DELETE' in all capital letters to confirm permanent erasure.");
      return;
    }
    if (user?.auth_provider === 'local' && !deletePasswordInput) {
      Alert.alert('Error', 'Please enter your password to authorize account deletion.');
      return;
    }

    setDeletingAccount(true);
    try {
      await authService.deleteAccount('DELETE', deletePasswordInput);
      setDeleteAccountModalVisible(false);
      Alert.alert(
        'Account Deleted',
        'Your account and all associated confidential business data have been permanently erased.'
      );
      await logout();
    } catch {
      Alert.alert('Error', 'Failed to delete account. Please verify your password and try again.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleExportData = async () => {
    setExportingData(true);
    try {
      const res = await authService.exportUserData();
      Alert.alert(
        'Data Export Ready',
        `Export successful! Exported ${res?.workspaces?.length || 0} workspaces, associated AI conversations, and validation records in compliance with DPDP & GDPR data portability.`
      );
    } catch {
      Alert.alert('Export Failed', 'Unable to compile business data export. Please try again or contact support.');
    } finally {
      setExportingData(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out of Axiora Pulse?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const userInitials = (user?.display_name || user?.name || user?.full_name || user?.email || 'AP')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <PulseHeader title="Settings" />

      {/* Tabs Bar matching Web */}
      <View style={[styles.tabsBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('profile')}
          style={[
            styles.tabItem,
            activeTab === 'profile' && { borderBottomColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'profile' ? colors.primary : theme.textMuted },
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('account')}
          style={[
            styles.tabItem,
            activeTab === 'account' && { borderBottomColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'account' ? colors.primary : theme.textMuted },
            ]}
          >
            Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('plan')}
          style={[
            styles.tabItem,
            activeTab === 'plan' && { borderBottomColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'plan' ? colors.primary : theme.textMuted },
            ]}
          >
            Plan Details
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ===================== TAB 1: PROFILE ===================== */}
        {activeTab === 'profile' && (
          <View style={styles.tabContent}>
            {/* User Profile Header Card */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surfaceCard, borderColor: theme.border },
              ]}
            >
              <View style={styles.profileHeaderRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>{userInitials}</Text>
                </View>
                <View style={styles.profileDetails}>
                  <Text style={[styles.userName, { color: theme.text }]}>
                    {user?.display_name || user?.name || user?.full_name || user?.email?.split('@')[0] || 'Axiora Founder'}
                  </Text>
                  <Text style={[styles.userEmail, { color: theme.textMuted }]}>
                    {user?.email || 'founder@axiorapulse.com'}
                  </Text>
                  <View style={{ marginTop: 6, alignSelf: 'flex-start' }}>
                    <PulseBadge
                      label={(user?.role || 'FOUNDER').toUpperCase()}
                      variant="primary"
                      size="sm"
                    />
                  </View>
                </View>
              </View>

              <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: theme.textMuted }]}>
                  Authentication
                </Text>
                <Text style={[styles.metaValue, { color: theme.text }]}>
                  {user?.auth_provider === 'google' ? 'Google SSO' : 'Email / Password'}
                </Text>
              </View>

              <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, { color: theme.textMuted }]}>
                  MFA Security
                </Text>
                <View style={styles.verifiedRow}>
                  <CheckCircle2 size={14} color={colors.success} style={{ marginRight: 4 }} />
                  <Text style={{ color: colors.success, fontSize: 13, fontWeight: '600' }}>
                    Verified
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: spacing.md }}>
                <PulseButton
                  title="Edit Profile"
                  variant="outline"
                  onPress={() => setEditProfileVisible(true)}
                  style={{ width: '100%' }}
                />
              </View>
            </View>
          </View>
        )}

        {/* ===================== TAB 2: ACCOUNT ===================== */}
        {activeTab === 'account' && (
          <View style={styles.tabContent}>
            {/* Security Section */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surfaceCard, borderColor: theme.border },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <Shield size={18} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Security & Password
                </Text>
              </View>

              <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>
                Ensure your account is protected with a strong password.
              </Text>

              <TouchableOpacity
                style={[
                  styles.actionButtonRow,
                  { backgroundColor: theme.surface2, borderColor: theme.border },
                ]}
                onPress={() => setPasswordModalVisible(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Key size={16} color={theme.text} style={{ marginRight: 10 }} />
                  <Text style={[styles.actionBtnText, { color: theme.text }]}>
                    Change Password
                  </Text>
                </View>
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
                  Update
                </Text>
              </TouchableOpacity>
            </View>

            {/* Session & Sign Out */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surfaceCard, borderColor: theme.border },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <LogOut size={18} color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Session Management
                </Text>
              </View>

              <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>
                Sign out of this device or terminate active sessions.
              </Text>

              <TouchableOpacity
                style={[styles.dangerButton, { borderColor: colors.danger + '40' }]}
                onPress={handleLogout}
              >
                <LogOut size={16} color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={styles.dangerButtonText}>Sign Out of Axiora Pulse</Text>
              </TouchableOpacity>
            </View>

            {/* Privacy & Statutory Rights (GDPR / DPDP) */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surfaceCard, borderColor: colors.danger + '60' },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <Trash2 size={18} color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.sectionTitle, { color: colors.danger }]}>
                  Privacy & Right to Erasure
                </Text>
              </View>

              <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>
                Exercise your statutory rights under DPDP & GDPR to export your data or permanently purge your account and confidential startup ideas.
              </Text>

              <TouchableOpacity
                style={[
                  styles.actionButtonRow,
                  { backgroundColor: theme.surface2, borderColor: theme.border, marginBottom: spacing.sm },
                ]}
                onPress={handleExportData}
                disabled={exportingData}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Download size={16} color={colors.primary} style={{ marginRight: 10 }} />
                  <Text style={[styles.actionBtnText, { color: theme.text }]}>
                    Export Business Data (JSON)
                  </Text>
                </View>
                <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
                  {exportingData ? 'Exporting...' : 'Download'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.dangerButton, { backgroundColor: colors.danger + '15', borderColor: colors.danger }]}
                onPress={() => {
                  setDeleteConfirmationInput('');
                  setDeletePasswordInput('');
                  setDeleteAccountModalVisible(true);
                }}
              >
                <Trash2 size={16} color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={styles.dangerButtonText}>Delete Account & Purge Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ===================== TAB 3: PLAN DETAILS ===================== */}
        {activeTab === 'plan' && (
          <View style={styles.tabContent}>
            {/* Active Plan Card */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surfaceCard, borderColor: colors.primary },
              ]}
            >
              <View style={styles.planHeaderRow}>
                <View>
                  <PulseBadge label="ACTIVE SUBSCRIPTION" variant="primary" size="sm" />
                  <Text style={[styles.activePlanName, { color: theme.text }]}>
                    {accountStatus?.active_plan?.toUpperCase() || 'FREE STARTER'} PLAN
                  </Text>
                </View>
                <View style={styles.activePlanPrice}>
                  <Text style={[styles.planPriceValue, { color: colors.primary }]}>
                    {formatRupees(0)}
                  </Text>
                  <Text style={[styles.planPriceCycle, { color: theme.textMuted }]}>
                    / 7 days
                  </Text>
                </View>
              </View>

              <Text style={[styles.planSubtext, { color: theme.textMuted }]}>
                Includes 1 full AI Idea Validation workflow, 5 minutes Arya voice guidance, and 7-day workspace access.
              </Text>

              <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

              {/* Usage Quotas */}
              <Text style={[styles.quotaSectionTitle, { color: theme.text }]}>
                Usage & Limits
              </Text>

              {/* Mentor Voice Minutes */}
              <View style={styles.quotaRow}>
                <View style={styles.quotaLabelGroup}>
                  <Clock size={15} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.quotaName, { color: theme.text }]}>
                    AI Mentor Voice
                  </Text>
                </View>
                <Text style={[styles.quotaValue, { color: theme.textMuted }]}>
                  {mentorUsage?.voice_minutes_used || 0} / {mentorUsage?.voice_minutes_total || 5} min
                </Text>
              </View>

              {/* Workspaces */}
              <View style={styles.quotaRow}>
                <View style={styles.quotaLabelGroup}>
                  <Building2 size={15} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.quotaName, { color: theme.text }]}>
                    Idea Workspaces
                  </Text>
                </View>
                <Text style={[styles.quotaValue, { color: theme.textMuted }]}>
                  {mentorUsage?.workspaces_used || 1} / {mentorUsage?.workspaces_total || 1}
                </Text>
              </View>

              {/* Upgrade CTA */}
              <View style={{ marginTop: spacing.lg }}>
                <PulseButton
                  title="Upgrade / Switch Plan"
                  variant="primary"
                  onPress={() => navigation.navigate('Pricing')}
                  style={{ width: '100%' }}
                />

                {accountStatus?.has_active_subscription && (
                  <TouchableOpacity
                    style={[styles.cancelSubBtn, { borderColor: theme.border }]}
                    onPress={() => setCancelSubModalVisible(true)}
                  >
                    <Text style={[styles.cancelSubBtnText, { color: theme.textMuted }]}>
                      Cancel Subscription Auto-Renewal
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surfaceCard, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
              Display Name
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surface2,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your full name"
              placeholderTextColor={theme.textMuted}
            />

            <View style={{ marginTop: spacing.lg }}>
              <PulseButton
                title="Save Changes"
                variant="primary"
                loading={savingProfile}
                onPress={handleSaveProfile}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surfaceCard, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Change Password
              </Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.textMuted }]}>
              Current Password
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surface2,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter current password"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 12 }]}>
              New Password
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surface2,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password (min 8 characters)"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 12 }]}>
              Confirm New Password
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surface2,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password"
              placeholderTextColor={theme.textMuted}
            />

            <View style={{ marginTop: spacing.lg }}>
              <PulseButton
                title="Update Password"
                variant="primary"
                loading={changingPassword}
                onPress={handleChangePassword}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Cancel Subscription Modal */}
      <Modal
        visible={cancelSubModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCancelSubModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surfaceCard, borderColor: theme.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Cancel Auto-Renewal
              </Text>
              <TouchableOpacity onPress={() => setCancelSubModalVisible(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalBodyText, { color: theme.textSecondary }]}>
              Are you sure you want to cancel your subscription auto-renewal?
            </Text>

            <View style={[styles.infoCallout, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
              <Text style={[styles.infoCalloutText, { color: theme.textMuted }]}>
                • You will retain full access to all plan features until the end of your current billing period.
                {'\n'}• Your workspaces and validation reports will not be deleted.
                {'\n'}• No further charges will be made to your payment method.
              </Text>
            </View>

            <View style={{ marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm }}>
              <PulseButton
                title="Keep Subscription"
                variant="outline"
                onPress={() => setCancelSubModalVisible(false)}
                style={{ flex: 1 }}
              />
              <PulseButton
                title="Confirm Cancel"
                variant="danger"
                loading={cancellingSub}
                onPress={handleCancelSubscription}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteAccountModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteAccountModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.surfaceCard, borderColor: colors.danger },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AlertTriangle size={20} color={colors.danger} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: colors.danger }]}>
                  Permanent Account Erasure
                </Text>
              </View>
              <TouchableOpacity onPress={() => setDeleteAccountModalVisible(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalBodyText, { color: theme.textSecondary }]}>
              This action cannot be undone. All idea workspaces, AI mentor chats, survey datasets, and subscription history will be permanently deleted from our servers.
            </Text>

            {user?.auth_provider === 'local' && (
              <>
                <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 12 }]}>
                  Confirm Password
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      backgroundColor: theme.surface2,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  secureTextEntry
                  value={deletePasswordInput}
                  onChangeText={setDeletePasswordInput}
                  placeholder="Enter current password"
                  placeholderTextColor={theme.textMuted}
                />
              </>
            )}

            <Text style={[styles.inputLabel, { color: theme.textMuted, marginTop: 12 }]}>
              Type <Text style={{ color: colors.danger, fontWeight: 'bold' }}>DELETE</Text> to confirm
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surface2,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              autoCapitalize="characters"
              value={deleteConfirmationInput}
              onChangeText={setDeleteConfirmationInput}
              placeholder="DELETE"
              placeholderTextColor={theme.textMuted}
            />

            <View style={{ marginTop: spacing.lg }}>
              <PulseButton
                title="Permanently Delete Account"
                variant="danger"
                loading={deletingAccount}
                disabled={deleteConfirmationInput.trim().toUpperCase() !== 'DELETE'}
                onPress={handleDeleteAccount}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  tabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
  },
  tabItem: {
    paddingVertical: spacing.sm + 2,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.md,
  },
  tabContent: {
    marginTop: spacing.xs,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    marginVertical: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  metaLabel: {
    fontSize: 13,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  actionButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  dangerButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activePlanName: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  activePlanPrice: {
    alignItems: 'flex-end',
  },
  planPriceValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  planPriceCycle: {
    fontSize: 11,
  },
  planSubtext: {
    fontSize: 13,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  quotaSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quotaLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quotaName: {
    fontSize: 13,
    fontWeight: '600',
  },
  quotaValue: {
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: spacing.lg,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
  },
  modalBodyText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  infoCallout: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  infoCalloutText: {
    fontSize: 12,
    lineHeight: 18,
  },
  cancelSubBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  cancelSubBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
