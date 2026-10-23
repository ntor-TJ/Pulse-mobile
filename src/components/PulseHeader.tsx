import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useWorkspace } from '../context/WorkspaceContext';

interface PulseHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  showWorkspaceSelector?: boolean;
  onOpenWorkspaceSelector?: () => void;
  rightAction?: React.ReactNode;
}

export const PulseHeader: React.FC<PulseHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  showWorkspaceSelector = false,
  onOpenWorkspaceSelector,
  rightAction,
}) => {
  const { theme } = useTheme();
  const { activeWorkspace } = useWorkspace();

  return (
    <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.backButton, { backgroundColor: theme.surface2 }]}
          >
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>
        )}

        {showWorkspaceSelector ? (
          <TouchableOpacity
            onPress={onOpenWorkspaceSelector}
            style={[styles.workspaceSelector, { backgroundColor: theme.surface2, borderColor: theme.border }]}
          >
            <View style={styles.wsDot} />
            <Text numberOfLines={1} style={[styles.wsTitle, { color: theme.text }]}>
              {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
            </Text>
            <ChevronDown size={16} color={theme.textMuted} />
          </TouchableOpacity>
        ) : (
          <View style={styles.titleContainer}>
            {title && <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>{title}</Text>}
            {subtitle && <Text numberOfLines={1} style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>}
          </View>
        )}
      </View>

      {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  subtitle: {
    fontSize: typography.fontSizes.xs,
    marginTop: 1,
  },
  workspaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    maxWidth: '85%',
  },
  wsDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    marginRight: spacing.xs + 2,
  },
  wsTitle: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    marginRight: spacing.xs,
  },
  rightAction: {
    marginLeft: spacing.sm,
  },
});
