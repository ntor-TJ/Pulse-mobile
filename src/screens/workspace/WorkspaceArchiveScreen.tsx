import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Archive, RotateCcw, Trash2 } from 'lucide-react-native';
import { PulseCard } from '../../components/PulseCard';
import { PulseEmptyState } from '../../components/PulseEmptyState';
import { PulseHeader } from '../../components/PulseHeader';
import { PulseLoader } from '../../components/PulseLoader';
import { workspaceService } from '../../services/workspaceService';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { colors, radius, spacing, typography } from '../../theme';
import { Workspace } from '../../types';

interface WorkspaceArchiveScreenProps {
  navigation: any;
}

export const WorkspaceArchiveScreen: React.FC<WorkspaceArchiveScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { restoreWorkspace, deleteWorkspace } = useWorkspace();

  const [archivedList, setArchivedList] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArchived();
  }, []);

  const loadArchived = async () => {
    setLoading(true);
    try {
      const data = await workspaceService.getArchivedWorkspaces();
      setArchivedList(data || []);
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string | number) => {
    try {
      await restoreWorkspace(id);
      setArchivedList((prev) => prev.filter((w) => String(w.id) !== String(id)));
      Alert.alert('Restored', 'Workspace has been restored to your active projects.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to restore workspace.');
    }
  };

  const handlePermanentDelete = (id: string | number) => {
    Alert.alert(
      'Permanently Delete',
      'This will permanently erase all workspace data, reports, and survey responses. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkspace(id, true);
            setArchivedList((prev) => prev.filter((w) => String(w.id) !== String(id)));
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <PulseHeader title="Archived Workspaces" showBack onBack={() => navigation.goBack()} />

      {loading ? (
        <PulseLoader message="Loading archive..." />
      ) : (
        <FlatList
          data={archivedList}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadArchived} />}
          renderItem={({ item }) => (
            <PulseCard variant="outlined" style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.wsTitle, { color: theme.text }]}>{item.name}</Text>
                  <Text numberOfLines={2} style={[styles.wsDesc, { color: theme.textMuted }]}>
                    {item.description || 'No description.'}
                  </Text>
                </View>
              </View>

              <View style={[styles.actionsRow, { borderTopColor: theme.border }]}>
                <TouchableOpacity
                  onPress={() => handleRestore(item.id)}
                  style={[styles.actionBtn, { backgroundColor: theme.surface2 }]}
                >
                  <RotateCcw size={16} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>Restore</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handlePermanentDelete(item.id)}
                  style={[styles.actionBtn, { backgroundColor: colors.dangerLight }]}
                >
                  <Trash2 size={16} color={colors.danger} />
                  <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </PulseCard>
          )}
          ListEmptyComponent={
            <PulseEmptyState
              icon={Archive}
              title="Archive is Empty"
              description="When you archive workspaces you are not actively working on, they will appear here safely for future retrieval."
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wsTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  wsDesc: {
    fontSize: typography.fontSizes.xs,
    marginTop: 4,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    marginLeft: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    marginLeft: 4,
  },
});
