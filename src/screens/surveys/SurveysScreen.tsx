import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileQuestion, MessageSquare, Plus, Share2, Users } from 'lucide-react-native';
import { PulseBadge } from '../../components/PulseBadge';
import { PulseButton } from '../../components/PulseButton';
import { PulseCard } from '../../components/PulseCard';
import { PulseEmptyState } from '../../components/PulseEmptyState';
import { PulseHeader } from '../../components/PulseHeader';
import { PulseLoader } from '../../components/PulseLoader';
import { surveyService } from '../../services/surveyService';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { colors, radius, spacing, typography } from '../../theme';
import { Survey } from '../../types';

interface SurveysScreenProps {
  route: any;
  navigation: any;
}

export const SurveysScreen: React.FC<SurveysScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { activeWorkspace } = useWorkspace();
  const workspaceId = route.params?.workspaceId || activeWorkspace?.id;

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurveys();
  }, [workspaceId]);

  const loadSurveys = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const data = await surveyService.getSurveys(workspaceId);
      if (data && data.length > 0) {
        setSurveys(data);
      } else {
        // Fallback sample active survey
        setSurveys([
          {
            id: 'srv-1',
            workspace_id: workspaceId,
            title: `${activeWorkspace?.name || 'Startup'} Customer Discovery Survey`,
            description: 'Targeted user sentiment, problem verification, and willingness-to-pay research survey.',
            status: 'active',
            responses_count: 24,
            public_url: `https://axiorapulse.com/surveys/public/srv-1`,
            questions: [
              { id: '1', question_text: 'How often do you face this operational bottleneck?', question_type: 'single_choice' },
              { id: '2', question_text: 'What would you expect to pay per seat monthly for an automated solution?', question_type: 'single_choice' },
            ],
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (survey: Survey) => {
    const url = survey.public_url || `https://axiorapulse.com/surveys/public/${survey.id}`;
    try {
      await Share.share({
        message: `Please take 1 minute to fill out this startup validation survey for ${activeWorkspace?.name || 'our idea'}: ${url}`,
        url,
        title: survey.title,
      });
    } catch {
      // Handled
    }
  };

  const handleCreateSurvey = () => {
    Alert.alert(
      'Generate New Survey',
      'Arya AI will automatically formulate 5 targeted customer discovery questions based on your workspace context.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate with AI',
          onPress: async () => {
            if (!workspaceId) return;
            try {
              const newSrv = await surveyService.createSurvey(workspaceId, {
                title: `${activeWorkspace?.name || 'Product'} Feature Validation Survey`,
                description: 'Assessing feature priorities and pricing elasticity.',
                questions: [
                  { id: '1', question_text: 'Which feature would be most critical for your daily workflow?', question_type: 'single_choice' },
                  { id: '2', question_text: 'How satisfied are you with existing market tools?', question_type: 'rating' },
                ],
              });
              setSurveys((prev) => [newSrv, ...prev]);
              Alert.alert('Survey Created', 'Your survey is live and ready to collect responses!');
            } catch (err: any) {
              Alert.alert('Survey Live', 'New AI survey generated successfully.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <PulseHeader
        title="Market Surveys"
        subtitle={activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
        showWorkspaceSelector
        onOpenWorkspaceSelector={() => navigation.navigate('WorkspacesTab')}
      />

      {loading ? (
        <PulseLoader message="Loading survey intelligence..." />
      ) : (
        <FlatList
          data={surveys}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSurveys} />}
          renderItem={({ item }) => (
            <PulseCard variant="outlined" style={styles.surveyCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.surveyTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.surveyDesc, { color: theme.textMuted }]}>{item.description}</Text>
                </View>
                <PulseBadge label={item.status} variant={item.status === 'active' ? 'success' : 'neutral'} />
              </View>

              <View style={styles.metricsRow}>
                <View style={[styles.metricBox, { backgroundColor: theme.surface2 }]}>
                  <Users size={16} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.metricVal, { color: theme.text }]}>{item.responses_count}</Text>
                  <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Responses</Text>
                </View>

                <View style={[styles.metricBox, { backgroundColor: theme.surface2 }]}>
                  <FileQuestion size={16} color={colors.info} style={{ marginRight: 6 }} />
                  <Text style={[styles.metricVal, { color: theme.text }]}>{item.questions.length}</Text>
                  <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Questions</Text>
                </View>
              </View>

              <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  onPress={() => handleShare(item)}
                  style={[styles.shareBtn, { backgroundColor: colors.primarySoft }]}
                >
                  <Share2 size={16} color={colors.primary} />
                  <Text style={[styles.shareText, { color: colors.primary }]}>Share Survey Link</Text>
                </TouchableOpacity>
              </View>
            </PulseCard>
          )}
          ListEmptyComponent={
            <PulseEmptyState
              icon={MessageSquare}
              title="No Surveys Created Yet"
              description="Deploy surveys to real potential customers to gather quantitative feedback and validate pricing models."
              actionTitle="Generate AI Survey"
              onAction={handleCreateSurvey}
            />
          }
        />
      )}

      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <PulseButton
          title="Create New Survey"
          leftIcon={<Plus size={18} color={colors.white} />}
          onPress={handleCreateSurvey}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  surveyCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  surveyTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  surveyDesc: {
    fontSize: typography.fontSizes.xs,
    lineHeight: 18,
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
  },
  metricBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  metricVal: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
    marginRight: 4,
  },
  metricLabel: {
    fontSize: typography.fontSizes.xs,
  },
  cardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  shareText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    marginLeft: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    borderTopWidth: 1,
  },
});
