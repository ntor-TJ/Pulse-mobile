import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface PulseButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  useGradient?: boolean;
}

export const PulseButton: React.FC<PulseButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  useGradient = true,
  onPress,
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const handlePress = (e: any) => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  const getContainerStyle = () => {
    const sizeStyle =
      size === 'sm'
        ? styles.sizeSm
        : size === 'lg'
        ? styles.sizeLg
        : styles.sizeMd;

    return [
      styles.button,
      sizeStyle,
      variant === 'secondary' && { backgroundColor: theme.surface2, borderColor: theme.border, borderWidth: 1 },
      variant === 'outline' && { backgroundColor: 'transparent', borderColor: colors.primary, borderWidth: 1.5 },
      variant === 'ghost' && { backgroundColor: 'transparent' },
      variant === 'danger' && { backgroundColor: colors.danger },
      (disabled || loading) && styles.disabled,
      style,
    ];
  };

  const getTextStyle = () => {
    const sizeTextStyle =
      size === 'sm'
        ? styles.textSm
        : size === 'lg'
        ? styles.textLg
        : styles.textMd;

    let textColor = colors.white;
    if (variant === 'secondary') textColor = theme.text;
    if (variant === 'outline') textColor = colors.primary;
    if (variant === 'ghost') textColor = theme.textMuted;
    if (disabled) textColor = theme.textMuted;

    return [styles.text, sizeTextStyle, { color: textColor }];
  };

  const content = (
    <View style={styles.innerRow}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'secondary' ? colors.primary : colors.white}
          style={styles.loader}
        />
      ) : (
        <>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </>
      )}
    </View>
  );

  if (variant === 'primary' && useGradient && !disabled && !loading) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        disabled={disabled || loading}
        style={[styles.gradientContainer, style]}
        {...props}
      >
        <LinearGradient
          colors={colors.brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd,
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={getContainerStyle()}
      {...props}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  button: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  sizeSm: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  sizeMd: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  sizeLg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.fontWeights.semibold,
    textAlign: 'center',
  },
  textSm: {
    fontSize: typography.fontSizes.sm,
  },
  textMd: {
    fontSize: typography.fontSizes.base,
  },
  textLg: {
    fontSize: typography.fontSizes.lg,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  loader: {
    marginRight: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});
