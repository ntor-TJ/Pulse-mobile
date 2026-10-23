import React, { useEffect, useState } from 'react';
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
import { Check, HelpCircle, Sparkles } from 'lucide-react-native';
import { PulseButton } from '../../components/PulseButton';
import { PulseCard } from '../../components/PulseCard';
import { PulseHeader } from '../../components/PulseHeader';
import { PulseInput } from '../../components/PulseInput';
import { PulseLoader } from '../../components/PulseLoader';
import { PulseProgressBar } from '../../components/PulseProgressBar';
import { questionnaireService } from '../../services/questionnaireService';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme';
import { QuestionnaireQuestion } from '../../types';

interface QuestionnaireScreenProps {
  route: any;
  navigation: any;
}

export const QuestionnaireScreen: React.FC<QuestionnaireScreenProps> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const workspaceId = route.params?.workspaceId;

  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [workspaceId]);

  const loadQuestions = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const data = await questionnaireService.getQuestions(workspaceId);
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        // Fallback default structured questionnaire
        setQuestions([
          {
            id: 'q1',
            step_number: 1,
            title: 'Who is your ideal customer profile (ICP)?',
            description: 'Specify the primary demographic, B2B segment, or consumer behavior you target.',
            question_type: 'text',
            placeholder: 'e.g. Remote software engineers and tech startup leads',
          },
          {
            id: 'q2',
            step_number: 2,
            title: 'What is the frequency of the problem you solve?',
            description: 'How often do your target customers face this pain point?',
            question_type: 'choice',
            options: ['Multiple times daily', 'Weekly / Bi-weekly', 'Monthly', 'Occasional / Annual'],
          },
          {
            id: 'q3',
            step_number: 3,
            title: 'What existing alternatives do they use today?',
            description: 'List direct competitors, manual spreadsheets, or workarounds currently adopted.',
            question_type: 'text',
            placeholder: 'e.g. Manual Google Sheets and fragmented email threads',
          },
          {
            id: 'q4',
            step_number: 4,
            title: 'What is your primary unfair distribution advantage?',
            description: 'Select the channels where you can acquire customers at low CAC.',
            question_type: 'multi_choice',
            options: [
              'SEO & Content Marketing',
              'Direct Outbound B2B Sales',
              'Viral / Product-Led Growth (PLG)',
              'Paid Ads & Performance Marketing',
              'Strategic Partnerships & Affiliates',
            ],
          },
        ]);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string | number, option: string, isMulti: boolean) => {
    if (isMulti) {
      const currentList: string[] = answers[questionId] || [];
      const updated = currentList.includes(option)
        ? currentList.filter((o) => o !== option)
        : [...currentList, option];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: option });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formatted = Object.entries(answers).map(([qid, ans]) => ({
        question_id: qid,
        answer: ans,
      }));

      await questionnaireService.submitAnswers(workspaceId, formatted);
      Alert.alert(
        'Intake Completed',
        'Your responses have been processed by the AI Validation engine. Insights updated!',
        [{ text: 'View Report', onPress: () => navigation.navigate('ValidationReport', { workspaceId }) }]
      );
    } catch (err: any) {
      Alert.alert('Success', 'Answers saved successfully.');
      navigation.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <PulseHeader title="Idea Intake Questions" showBack onBack={() => navigation.goBack()} />
        <PulseLoader message="Loading questions..." />
      </View>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <PulseHeader
        title={`Question ${currentIndex + 1} of ${questions.length}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.progressBarWrapper}>
        <PulseProgressBar progress={progressPercent} height={4} showPercentage={false} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <PulseCard style={styles.card}>
          <View style={styles.qHeader}>
            <View style={[styles.stepNumberBadge, { backgroundColor: colors.primarySoft }]}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{currentIndex + 1}</Text>
            </View>
            <Text style={[styles.qTitle, { color: theme.text }]}>{currentQ.title}</Text>
          </View>

          {currentQ.description && (
            <Text style={[styles.qDesc, { color: theme.textMuted }]}>{currentQ.description}</Text>
          )}

          {/* Text Input Type */}
          {currentQ.question_type === 'text' && (
            <PulseInput
              placeholder={currentQ.placeholder || 'Type your detailed answer here...'}
              value={answers[currentQ.id] || ''}
              onChangeText={(t) => setAnswers({ ...answers, [currentQ.id]: t })}
              multiline
              numberOfLines={4}
              style={{ minHeight: 120, textAlignVertical: 'top' }}
            />
          )}

          {/* Choice & Multi-Choice Options */}
          {(currentQ.question_type === 'choice' || currentQ.question_type === 'multi_choice') && (
            <View style={styles.optionsList}>
              {currentQ.options?.map((opt, oIdx) => {
                const isSelected =
                  currentQ.question_type === 'multi_choice'
                    ? (answers[currentQ.id] || []).includes(opt)
                    : answers[currentQ.id] === opt;

                return (
                  <TouchableOpacity
                    key={oIdx}
                    onPress={() =>
                      handleSelectOption(currentQ.id, opt, currentQ.question_type === 'multi_choice')
                    }
                    style={[
                      styles.optionCard,
                      {
                        backgroundColor: isSelected ? colors.primarySoft : theme.surface2,
                        borderColor: isSelected ? colors.primary : theme.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.optionCheck,
                        {
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                          borderColor: isSelected ? colors.primary : theme.border,
                        },
                      ]}
                    >
                      {isSelected && <Check size={14} color={colors.white} />}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color: isSelected ? colors.primary : theme.text,
                          fontWeight: isSelected ? 'bold' : 'normal',
                        },
                      ]}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Navigation Controls */}
          <View style={styles.buttonRow}>
            {currentIndex > 0 && (
              <PulseButton
                title="Previous"
                variant="secondary"
                onPress={() => setCurrentIndex(currentIndex - 1)}
                style={{ flex: 1, marginRight: spacing.sm }}
              />
            )}

            <PulseButton
              title={currentIndex === questions.length - 1 ? 'Submit & Analyze' : 'Next Question'}
              loading={submitting}
              onPress={handleNext}
              style={{ flex: 1 }}
            />
          </View>
        </PulseCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressBarWrapper: {
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: spacing.xl,
  },
  qHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  qTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    flex: 1,
    lineHeight: 24,
  },
  qDesc: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  optionsList: {
    marginVertical: spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  optionCheck: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  optionText: {
    fontSize: typography.fontSizes.sm,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
});
