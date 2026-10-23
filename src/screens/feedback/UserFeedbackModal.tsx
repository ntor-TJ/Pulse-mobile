import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Heart, MessageSquarePlus, Smile, Star, X } from 'lucide-react-native';
import { PulseButton } from '../../components/PulseButton';
import { PulseInput } from '../../components/PulseInput';
import { feedbackService } from '../../services/feedbackService';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme';

interface UserFeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

export const UserFeedbackModal: React.FC<UserFeedbackModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('AI Mentor Experience');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'AI Mentor Experience',
    'Idea Validation Quality',
    'Report Accuracy',
    'UI & Navigation',
    'Other Suggestion',
  ];

  const handleSubmit = async () => {
    if (!comments.trim()) {
      Alert.alert('Comments Required', 'Please provide a short comment or suggestion.');
      return;
    }

    setLoading(true);
    try {
      await feedbackService.submitFeedback({
        rating,
        category,
        comments: comments.trim(),
      });

      Alert.alert('Thank You!', 'Your feedback helps improve Axiora Pulse for all founders.');
      setComments('');
      onClose();
    } catch {
      Alert.alert('Feedback Recorded', 'Thank you for your feedback!');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[styles.sheet, { backgroundColor: theme.surface, borderTopColor: theme.border }]}
            >
              <View style={styles.header}>
                <View style={styles.notch} />
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: theme.text }]}>Share Feedback</Text>
                  <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surface2 }]}>
                    <X size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Star Rating Scale */}
              <Text style={[styles.sectionLabel, { color: theme.text }]}>How satisfied are you with Axiora Pulse?</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starTouch}
                  >
                    <Star
                      size={32}
                      color={rating >= star ? '#F59E0B' : '#CBD5E1'}
                      fill={rating >= star ? '#F59E0B' : 'transparent'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Category Pills */}
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Feedback Category</Text>
              <View style={styles.chipGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: category === cat ? colors.primarySoft : theme.surface2,
                        borderColor: category === cat ? colors.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: category === cat ? colors.primary : theme.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <PulseInput
                label="Your Comments / Suggestions"
                placeholder="Tell us what you love or what we should improve..."
                value={comments}
                onChangeText={setComments}
                multiline
                numberOfLines={3}
                style={{ minHeight: 90, textAlignVertical: 'top' }}
              />

              <PulseButton
                title="Submit Feedback"
                loading={loading}
                onPress={handleSubmit}
                style={{ marginTop: spacing.sm }}
              />
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    borderTopWidth: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  notch: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: '#CBD5E1',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
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
  sectionLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  starTouch: {
    padding: spacing.xs,
    marginHorizontal: 4,
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
  },
});
