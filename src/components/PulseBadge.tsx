import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'starter'
  | 'builder'
  | 'pro'
  | 'draft'
  | 'neutral';

interface PulseBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const PulseBadge: React.FC<PulseBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'sm',
  style,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primarySoft, text: colors.primary };
      case 'success':
        return { bg: colors.successLight, text: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger };
      case 'info':
        return { bg: colors.infoLight, text: colors.info };
      case 'starter':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'builder':
        return { bg: '#F3E8FF', text: '#7E22CE' };
      case 'pro':
        return { bg: colors.primarySoft, text: colors.primary };
      case 'draft':
        return { bg: '#F1F5F9', text: '#64748B' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const { bg, text } = getBadgeColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg },
        size === 'md' ? styles.badgeMd : styles.badgeSm,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: text },
          size === 'md' ? styles.textMd : styles.textSm,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  text: {
    fontWeight: typography.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: typography.fontSizes.xs,
  },
});
