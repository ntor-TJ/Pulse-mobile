import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bot, Lightbulb, Rocket, Sparkles, Target, Zap } from 'lucide-react-native';
import { PulseButton } from '../../components/PulseButton';
import { PulseCard } from '../../components/PulseCard';
import { PulseInput } from '../../components/PulseInput';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme';

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { createWorkspace } = useWorkspace();

  const [step, setStep] = useState(1);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const industries = [
    'SaaS & B2B Software',
    'Fintech & Payments',
    'HealthTech & Wellness',
    'E-Commerce & Retail',
    'AI & Automation',
    'EdTech & Learning',
    'ClimateTech & Energy',
    'Consumer & Media',
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!ideaTitle.trim()) {
        setError('Please provide a name or title for your business idea.');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!problemDescription.trim()) {
        setError('Please describe the problem you are solving.');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      await createWorkspace({
        name: ideaTitle.trim(),
        description: problemDescription.trim(),
        industry: industry || 'SaaS & B2B Software',
        target_audience: targetAudience || 'Early adopters',
      });
      navigation.replace('MainApp');
    } catch (err: any) {
      setError(err.message || 'Failed to create your initial workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Banner */}
        <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
          <Image
            source={require('../../../assets/pulse-hero-landscape.png')}
            style={{ width: '100%', height: 100, borderRadius: radius.md }}
            resizeMode="contain"
          />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={styles.stepItem}>
              <View
                style={[
                  styles.stepBadge,
                  {
                    backgroundColor: step >= s ? colors.primary : theme.surface2,
                    borderColor: step >= s ? colors.primary : theme.border,
                  },
                ]}
              >
                <Text style={{ color: step >= s ? colors.white : theme.textMuted, fontWeight: 'bold' }}>{s}</Text>
              </View>
              {s < 3 && <View style={[styles.stepLine, { backgroundColor: step > s ? colors.primary : theme.border }]} />}
            </View>
          ))}
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {step === 1 && (
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <View style={styles.headerRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
                <Lightbulb size={24} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>What are you building?</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Give your startup concept a name and select its domain.
            </Text>

            <PulseInput
              label="Startup or Idea Name *"
              placeholder="e.g. EcoRoute or FlowPilot"
              value={ideaTitle}
              onChangeText={(t) => {
                setIdeaTitle(t);
                setError('');
              }}
            />

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

            <PulseButton title="Continue" onPress={handleNext} style={{ marginTop: spacing.lg }} />
          </View>
        )}

        {step === 2 && (
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <View style={styles.headerRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
                <Target size={24} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Problem & Market</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Help Arya and the AI Mentor understand the problem and ideal customer profile.
            </Text>

            <PulseInput
              label="What problem does it solve? *"
              placeholder="Describe the pain point your customers experience..."
              value={problemDescription}
              onChangeText={(t) => {
                setProblemDescription(t);
                setError('');
              }}
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />

            <PulseInput
              label="Target Audience / Ideal Customer"
              placeholder="e.g. Freelancers, Mid-market B2B HR teams, College students"
              value={targetAudience}
              onChangeText={setTargetAudience}
            />

            <View style={styles.buttonRow}>
              <PulseButton
                title="Back"
                variant="secondary"
                onPress={() => setStep(1)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <PulseButton title="Continue" onPress={handleNext} style={{ flex: 1 }} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={[styles.card, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
            <View style={styles.headerRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
                <Sparkles size={24} color={colors.primary} />
              </View>
              <Text style={[styles.title, { color: theme.text }]}>Ready for Validation</Text>
            </View>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Your startup workspace will be initialized with the 12-stage validation journey.
            </Text>

            <View style={styles.featureHighlights}>
              <View style={styles.highlightItem}>
                <Bot size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
                <Text style={[styles.highlightText, { color: theme.text }]}>
                  Instant access to Arya & AI Mentor for idea refinement
                </Text>
              </View>
              <View style={styles.highlightItem}>
                <Zap size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
                <Text style={[styles.highlightText, { color: theme.text }]}>
                  Comprehensive market, financial, and competitor analysis
                </Text>
              </View>
              <View style={styles.highlightItem}>
                <Rocket size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
                <Text style={[styles.highlightText, { color: theme.text }]}>
                  Downloadable official Idea Validation Certificate
                </Text>
              </View>
            </View>

            {/* Legal & Age Verification Section */}
            <View style={[styles.consentBox, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
              {/* 18+ Age Declaration */}
              <TouchableOpacity
                style={styles.consentRow}
                onPress={() => setIsAgeConfirmed(!isAgeConfirmed)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: isAgeConfirmed ? colors.primary : theme.border,
                      backgroundColor: isAgeConfirmed ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {isAgeConfirmed && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.consentText, { color: theme.text }]}>
                  I confirm that I am <Text style={{ color: colors.primary, fontWeight: '700' }}>18 years of age or older</Text>.
                </Text>
              </TouchableOpacity>

              {/* Terms & Privacy Policy Acceptance */}
              <TouchableOpacity
                style={styles.consentRow}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: agreedToTerms ? colors.primary : theme.border,
                      backgroundColor: agreedToTerms ? colors.primary : 'transparent',
                    },
                  ]}
                >
                  {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.consentText, { color: theme.textMuted }]}>
                  I accept the{' '}
                  <Text
                    style={{ color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' }}
                    onPress={() => navigation.navigate('TermsPrivacy', { type: 'terms' })}
                  >
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={{ color: colors.primary, fontWeight: '600', textDecorationLine: 'underline' }}
                    onPress={() => navigation.navigate('TermsPrivacy', { type: 'privacy' })}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <PulseButton
                title="Back"
                variant="secondary"
                onPress={() => setStep(2)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
              <PulseButton
                title="Launch Workspace"
                loading={loading}
                disabled={!isAgeConfirmed || !agreedToTerms}
                onPress={handleFinishOnboarding}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 48,
    height: 2,
    marginHorizontal: spacing.xs,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    flex: 1,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
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
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  featureHighlights: {
    marginVertical: spacing.lg,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  highlightText: {
    fontSize: typography.fontSizes.sm,
    flex: 1,
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
  consentBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  consentText: {
    fontSize: typography.fontSizes.xs,
    flex: 1,
    lineHeight: 18,
  },
});
