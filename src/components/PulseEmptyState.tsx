import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { radius, spacing, typography } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { PulseButton } from './PulseButton';

interface PulseEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const PulseEmptyState: React.FC<PulseEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {Icon && (
        <View style={[styles.iconCircle, { backgroundColor: theme.surface2 }]}>
          <Icon size={36} color={theme.textMuted} />
        </View>
      )}

      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.description, { color: theme.textMuted }]}>{description}</Text>

      {actionTitle && onAction && (
        <PulseButton
          title={actionTitle}
          onPress={onAction}
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '85%',
    marginBottom: spacing.lg,
  },
  actionButton: {
    minWidth: 160,
  },
});
