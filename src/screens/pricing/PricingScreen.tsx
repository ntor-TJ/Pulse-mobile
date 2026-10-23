import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PulseBadge } from '../../components/PulseBadge';
import { PulseButton } from '../../components/PulseButton';
import { PulseHeader } from '../../components/PulseHeader';
import { PulseLoader } from '../../components/PulseLoader';
import { billingService, formatRupees, getPlanFeatureItems } from '../../services/billingService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, shadows, spacing } from '../../theme';
import { Plan } from '../../types';

interface PricingScreenProps {
  navigation: any;
}

export const PricingScreen: React.FC<PricingScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await billingService.getPlans();
      if (data && data.length > 0) {
        setPlans(data);
      } else {
        // Live production fallback matching Axiora Pulse backend
        setPlans([
          {
            id: 'starter',
            name: 'Free',
            code: 'starter',
            price_monthly: 0,
            price_yearly: 0,
            old_price: 499,
            currency: 'INR',
            description: 'Validate your first idea. Discover what to do next.',
            workspace_limit: 1,
            mentor_minutes: 5,
            storage_limit: 200,
            popular: false,
          } as any,
          {
            id: 'builder',
            name: 'Builder',
            code: 'builder',
            price_monthly: 399,
            price_yearly: 0,
            old_price: 999,
            offer_percent: 60,
            currency: 'INR',
            popular: true,
            description: 'Turn your validated idea into market-backed decisions.',
            workspace_limit: 3,
            mentor_minutes: 60,
            survey_response_cap: 500,
            regeneration_limit: 5,
            stage_rerun: 3,
            export_enabled: true,
            market_research: true,
            survey_intelligence: true,
            storage_limit: 500,
          } as any,
          {
            id: 'pro',
            name: 'Pro',
            code: 'pro',
            price_monthly: 799,
            price_yearly: 0,
            old_price: 1999,
            offer_percent: 60,
            currency: 'INR',
            description: 'For serious founders ready to execute, improve and grow.',
            workspace_limit: 10,
            mentor_minutes: 180,
            survey_response_cap: 2000,
            regeneration_limit: 10,
            stage_rerun: 5,
            export_enabled: true,
            market_research: true,
            survey_intelligence: true,
            advanced_intelligence: true,
            priority_processing: true,
            storage_limit: 2048,
            popular: false,
          } as any,
        ]);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    const isFree = (plan.code || '').toLowerCase() === 'starter' || plan.price_monthly === 0;
    if (isFree) {
      setActionLoading(plan.code || 'free');
      try {
        await billingService.selectFreeTrial('starter');
        Alert.alert('Plan Active', 'You are on the Free Starter plan with 7-day access!');
      } catch {
        Alert.alert('Free Plan Active', 'Your Free Starter plan is ready to use.');
      } finally {
        setActionLoading(null);
      }
    } else {
      Alert.alert(
        `Upgrade to ${plan.name} (${formatRupees(plan.price_monthly)}/mo)`,
        'To complete your subscription checkout via Razorpay, please open Axiora Pulse in your web browser or contact support for direct billing.',
        [
          { text: 'OK', style: 'default' },
        ]
      );
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <PulseHeader
        title="Plans & Pricing"
        showBack
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.center}>
          <PulseLoader message="Loading plans..." />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Banner */}
          <View style={styles.heroBanner}>
            <PulseBadge label="FOUNDER PLANS" variant="primary" size="sm" />
            <Text style={[styles.heroTitle, { color: theme.text }]}>
              Invest in your startup idea
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.textMuted }]}>
              Full 12-stage validation, live AI mentor guidance, market research, and survey intelligence.
            </Text>
          </View>

          {/* Plan Cards */}
          {plans.map((plan: any) => {
            const isPopular = Boolean(plan.popular);
            const isFree = (plan.code || '').toLowerCase() === 'starter' || plan.price_monthly === 0;
            const features = getPlanFeatureItems(plan);
            const price = plan.price_monthly ?? 0;
            const oldPrice = plan.old_price;

            return (
              <View
                key={plan.code || String(plan.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.surfaceCard,
                    borderColor: isPopular ? colors.primary : theme.border,
                  },
                  isPopular && styles.popularCard,
                ]}
              >
                {/* Top Badge Row */}
                <View style={styles.cardHeader}>
                  <Text style={[styles.tierStage, { color: colors.primary }]}>
                    {isFree ? 'EXPLORATION' : isPopular ? 'SCALE & VALIDATE' : 'ADVANCED'}
                  </Text>
                  {isPopular ? (
                    <View style={styles.popularBadge}>
                      <Sparkles size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                    </View>
                  ) : plan.offer_percent ? (
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerBadgeText}>{plan.offer_percent}% OFF</Text>
                    </View>
                  ) : null}
                </View>

                {/* Plan Name & Description */}
                <Text style={[styles.planName, { color: theme.text }]}>
                  {plan.name}
                </Text>
                <Text style={[styles.planDescription, { color: theme.textMuted }]}>
                  {plan.description || ''}
                </Text>

                {/* Price Display */}
                <View style={styles.priceRow}>
                  <Text style={[styles.priceAmount, { color: theme.text }]}>
                    {formatRupees(price)}
                  </Text>
                  <Text style={[styles.pricePeriod, { color: theme.textMuted }]}>
                    {isFree ? ' / 7 days' : ' / month'}
                  </Text>
                  {oldPrice != null && oldPrice > price ? (
                    <Text style={[styles.oldPrice, { color: theme.textMuted }]}>
                      {formatRupees(oldPrice)}
                    </Text>
                  ) : null}
                </View>

                {/* Action Button */}
                <View style={styles.ctaContainer}>
                  <PulseButton
                    title={
                      isFree
                        ? 'Get Started Free'
                        : `Upgrade to ${plan.name}`
                    }
                    variant={isPopular ? 'primary' : 'outline'}
                    loading={actionLoading === (plan.code || 'free')}
                    onPress={() => handleSelectPlan(plan)}
                    style={{ width: '100%' }}
                  />
                </View>

                {/* Features List */}
                <View style={[styles.featuresSection, { borderTopColor: theme.border }]}>
                  <Text style={[styles.featuresTitle, { color: theme.text }]}>
                    What's included:
                  </Text>
                  {features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <View
                        style={[
                          styles.checkCircle,
                          { backgroundColor: isPopular ? colors.primary + '25' : colors.success + '20' },
                        ]}
                      >
                        <Check size={12} color={isPopular ? colors.primary : colors.success} />
                      </View>
                      <Text
                        style={[
                          styles.featureLabel,
                          {
                            color: feat.comingSoon ? theme.textMuted : theme.text,
                            fontStyle: feat.comingSoon ? 'italic' : 'normal',
                          },
                        ]}
                      >
                        {feat.label}
                        {feat.comingSoon ? ' (coming soon)' : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
  },
  heroBanner: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  popularCard: {
    borderWidth: 2,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tierStage: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  offerBadge: {
    backgroundColor: 'rgba(217, 75, 35, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  offerBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  planDescription: {
    fontSize: 13,
    marginTop: 4,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: spacing.md,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pricePeriod: {
    fontSize: 12,
    marginLeft: 4,
  },
  oldPrice: {
    fontSize: 12,
    marginLeft: spacing.sm,
    textDecorationLine: 'line-through',
  },
  ctaContainer: {
    marginBottom: spacing.md,
  },
  featuresSection: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  featureLabel: {
    fontSize: 13,
    flex: 1,
  },
});
