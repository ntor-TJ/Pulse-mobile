import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';
import { radius, shadows, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface PulseCardProps {
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: keyof typeof spacing;
  style?: any;
}

export const PulseCard: React.FC<PulseCardProps> = ({
  children,
  onPress,
  variant = 'elevated',
  padding = 'md',
  style,
}) => {
  const { theme } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: theme.surfaceCard,
      borderColor: theme.border,
      padding: spacing[padding],
    },
    variant === 'elevated' && shadows.sm,
    variant === 'outlined' && { borderWidth: 1 },
    variant === 'flat' && { backgroundColor: theme.surface2 },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    marginVertical: spacing.xs + 2,
    borderWidth: 1,
  },
});
