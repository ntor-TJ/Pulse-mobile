import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface PulseProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  height?: number;
  useGradient?: boolean;
  style?: ViewStyle;
}

export const PulseProgressBar: React.FC<PulseProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  height = 8,
  useGradient = true,
  style,
}) => {
  const { theme } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.container, style]}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.percentage, { color: colors.primary }]}>{Math.round(clampedProgress)}%</Text>
          )}
        </View>
      )}

      <View style={[styles.track, { backgroundColor: theme.surface2, height, borderRadius: radius.full }]}>
        {useGradient ? (
          <LinearGradient
            colors={colors.brandGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.fill, { width: `${clampedProgress}%`, height, borderRadius: radius.full }]}
          />
        ) : (
          <View
            style={[
              styles.fill,
              {
                backgroundColor: colors.primary,
                width: `${clampedProgress}%`,
                height,
                borderRadius: radius.full,
              },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  percentage: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
