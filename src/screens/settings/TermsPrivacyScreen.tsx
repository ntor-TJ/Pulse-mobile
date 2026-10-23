import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PulseCard } from '../../components/PulseCard';
import { PulseHeader } from '../../components/PulseHeader';
import { useTheme } from '../../context/ThemeContext';
import { radius, spacing, typography } from '../../theme';

interface TermsPrivacyScreenProps {
  route: any;
  navigation: any;
}

export const TermsPrivacyScreen: React.FC<TermsPrivacyScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const type = route.params?.type || 'terms';
  const isTerms = type === 'terms';

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <PulseHeader
        title={isTerms ? 'Terms of Service' : 'Privacy Policy'}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <PulseCard style={styles.card}>
          <Text style={[styles.heading, { color: theme.text }]}>
            {isTerms ? 'Axiora Pulse Terms of Service' : 'Axiora Pulse Privacy Policy'}
          </Text>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>Effective: October 1, 2026 | Version 1.0 (DPDP & GDPR Compliant)</Text>

          {isTerms ? (
            <View style={styles.body}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Acceptance & Age Eligibility</Text>
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                By accessing Axiora Pulse, you confirm that you are at least 18 years of age (or have verified parental/guardian permission) and legally competent to enter into binding agreements.
              </Text>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>2. AI Decision-Support & Non-Reliance</Text>
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                Axiora Pulse delivers AI-assisted startup validation, survey intelligence, and market feasibility insights. All outputs, scores, and projections are educational decision-support tools and do not constitute certified legal, financial, accounting, investment, or tax advice. Axiora Pulse makes no guarantees of commercial funding or venture success.
              </Text>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>3. 100% User Intellectual Property Ownership</Text>
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                Founders retain 100% exclusive intellectual property ownership of all business concepts, pitch decks, uploaded documents, survey results, and custom prompt inputs. Axiora Pulse does not claim ownership or license your proprietary ideas to third parties.
              </Text>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Transparent Billing & 1-Click Cancellation</Text>
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                Subscription plans grant defined workspace, AI mentor, and survey quotas. You may cancel your subscription at any time directly through your account settings with zero dark patterns or cancellation penalties.
              </Text>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Statutory Grievance Redressal</Text>
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                In compliance with the DPDP Act 2023 and IT Intermediary Rules, any disputes or grievances may be submitted to our designated Grievance Officer at grievance@axiorapulse.com with a guaranteed 24-hour acknowledgment SLA and 15-day resolution window.
              </Text>
            </View>
          ) : (
            <View style={styles.body}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>1. Data Collection & Lawful Processing</Text>
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                We collect your registration details, workspace materials, and survey inputs strictly to provide idea validation and platform services. We do not sell, rent, or trade your personal data to data brokers.
              </Text>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>2. Zero Foundation Model Training</Text>
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                Your business plans, prompts, and confidential attachments are processed via enterprise-grade AI APIs that do not use your private workspace data to train foundation models.
              </Text>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>3. Data Subject Rights (Export & Deletion)</Text>
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                Under the DPDP Act 2023 and GDPR, you possess the right to export your entire business workspace history in structured JSON format and the right to permanently delete your account at any time via Settings.
              </Text>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>4. Security & Hardware-Backed Storage</Text>
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                All data in transit is encrypted using TLS 1.3, and data at rest is secured via AES-256 encryption. Authentication tokens on mobile are secured within the device's hardware-backed Keystore / Keychain.
              </Text>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>5. Grievance & Data Protection Officer</Text>
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                For data privacy requests or concerns, contact our Data Protection and Grievance Officer at privacy@axiorapulse.com or grievance@axiorapulse.com.
              </Text>
            </View>
          )}
        </PulseCard>
      </ScrollView>
    </View>
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
  card: {
    padding: spacing.xl,
  },
  heading: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  dateText: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  body: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  paragraph: {
    fontSize: typography.fontSizes.xs,
    lineHeight: 20,
  },
});
