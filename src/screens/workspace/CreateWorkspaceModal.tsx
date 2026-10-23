import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Sparkles, X } from 'lucide-react-native';
import { PulseButton } from '../../components/PulseButton';
import { PulseInput } from '../../components/PulseInput';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { colors, radius, spacing, typography } from '../../theme';

import { Modal } from 'react-native';

interface CreateWorkspaceModalProps {
  navigation?: any;
  visible?: boolean;
  onClose?: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ navigation, visible, onClose }) => {
  const { theme, isDark } = useTheme();
  const { createWorkspace } = useWorkspace();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  };

  const industries = [
    'SaaS & Software',
    'FinTech & Banking',
    'Healthcare & Bio',
    'E-Commerce & D2C',
    'AI & Machine Learning',
    'EdTech & Education',
    'CleanTech & Energy',
    'Logistics & Mobility',
  ];

  const businessModels = [
    'Subscription / SaaS',
    'Marketplace / Commission',
    'Transactional / Pay-as-you-go',
    'Direct to Consumer (D2C)',
    'Enterprise Licensing',
    'Freemium',
  ];

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please provide a workspace name.');
      return;
    }

    if (!description.trim()) {
      setError('Please describe your startup idea.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const created = await createWorkspace({
        name: name.trim(),
        description: description.trim(),
        industry: industry || 'SaaS & Software',
        target_audience: targetAudience || 'General Consumers',
        business_model: businessModel || 'Subscription / SaaS',
      });

      handleClose();
      if (navigation?.navigate) {
        navigation.navigate('WorkspaceDetail', { workspaceId: created.id });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace. Check your plan quota.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerTitleRow}>
          <Sparkles size={20} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>New Idea Workspace</Text>
        </View>
        <TouchableOpacity
          onPress={handleClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[styles.closeBtn, { backgroundColor: theme.surface2 }]}
        >
          <X size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <PulseInput
          label="Workspace / Idea Name *"
          placeholder="e.g. HealthBridge or PulseAI"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError('');
          }}
        />

        <PulseInput
          label="Idea Description & Problem Statement *"
          placeholder="Describe the problem, target users, and your proposed solution in detail..."
          value={description}
          onChangeText={(t) => {
            setDescription(t);
            setError('');
          }}
          multiline
          numberOfLines={4}
          style={{ minHeight: 110, textAlignVertical: 'top' }}
        />

        {/* Industry Selection */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Industry Domain</Text>
        <View style={styles.chipGrid}>
          {industries.map((ind) => (
            <TouchableOpacity
              key={ind}
              onPress={() => setIndustry(ind)}
              style={[
                styles.chip,
                {
                  backgroundColor: industry === ind ? colors.primarySoft : theme.surface2,
                  borderColor: industry === ind ? colors.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: industry === ind ? colors.primary : theme.textSecondary },
                ]}
              >
                {ind}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Business Model */}
        <Text style={[styles.sectionLabel, { color: theme.text }]}>Business Model</Text>
        <View style={styles.chipGrid}>
          {businessModels.map((bm) => (
            <TouchableOpacity
              key={bm}
              onPress={() => setBusinessModel(bm)}
              style={[
                styles.chip,
                {
                  backgroundColor: businessModel === bm ? colors.primarySoft : theme.surface2,
                  borderColor: businessModel === bm ? colors.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: businessModel === bm ? colors.primary : theme.textSecondary },
                ]}
              >
                {bm}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <PulseInput
          label="Target Audience (Optional)"
          placeholder="e.g. Small business owners, B2B sales leads"
          value={targetAudience}
          onChangeText={setTargetAudience}
        />

        <PulseButton
          title="Create Workspace & Start Validation"
          loading={loading}
          onPress={handleCreate}
          style={styles.submitBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (visible !== undefined) {
    return (
      <Modal visible={visible} onRequestClose={handleClose} animationType="slide" presentationStyle="pageSheet">
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  sectionLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  chipText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  submitBtn: {
    marginTop: spacing.md,
    width: '100%',
  },
});
