import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface PulseLoaderProps {
  message?: string;
  overlay?: boolean;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  message = 'Loading...',
  overlay = false,
}) => {
  const { theme } = useTheme();

  const content = (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? <Text style={[styles.message, { color: theme.text }]}>{message}</Text> : null}
    </View>
  );

  if (overlay) {
    return (
      <Modal transparent visible animationType="fade">
        <View style={styles.overlayContainer}>{content}</View>
      </Modal>
    );
  }

  return <View style={styles.inlineContainer}>{content}</View>;
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  inlineContainer: {
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    textAlign: 'center',
  },
});
