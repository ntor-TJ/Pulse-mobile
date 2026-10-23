import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Archive, ArrowRight, FolderPlus, Plus, Search } from 'lucide-react-native';
import { PulseBadge } from '../../components/PulseBadge';
import { PulseButton } from '../../components/PulseButton';
import { PulseCard } from '../../components/PulseCard';
import { PulseEmptyState } from '../../components/PulseEmptyState';
import { PulseHeader } from '../../components/PulseHeader';
import { PulseInput } from '../../components/PulseInput';
import { PulseProgressBar } from '../../components/PulseProgressBar';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { colors, radius, spacing, typography } from '../../theme';
import { Workspace } from '../../types';

interface WorkspaceListScreenProps {
  navigation: any;
}

export const WorkspaceListScreen: React.FC<WorkspaceListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { workspaces, refreshWorkspaces, isLoading, selectWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'in_progress' | 'completed'>('all');

  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchesSearch =
      ws.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ws.industry && ws.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ws.description && ws.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedFilter === 'all') return true;
    return ws.status === selectedFilter;
  });

  const renderWorkspaceItem = ({ item }: { item: Workspace }) => (
    <PulseCard
      variant="elevated"
      onPress={() => {
        selectWorkspace(item);
        navigation.navigate('WorkspaceDetail', { workspaceId: item.id });
      }}
      style={styles.wsCard}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.wsName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.wsIndustry, { color: colors.primary }]}>
            {item.industry || 'General Startup'}
          </Text>
        </View>
        <PulseBadge
          label={item.status}
          variant={item.status === 'completed' ? 'success' : item.status === 'in_progress' ? 'primary' : 'draft'}
        />
      </View>

      <Text numberOfLines={2} style={[styles.wsDescription, { color: theme.textMuted }]}>
        {item.description || 'No idea description recorded yet.'}
      </Text>

      <PulseProgressBar
        progress={item.progress || 0}
        label="Validation Completion"
        height={6}
        style={{ marginTop: spacing.md }}
      />

      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <Text style={[styles.dateText, { color: theme.textMuted }]}>
          Created {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <View style={styles.openLink}>
          <Text style={styles.openText}>Open</Text>
          <ArrowRight size={14} color={colors.primary} />
        </View>
      </View>
    </PulseCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <PulseHeader
        title="My Workspaces"
        subtitle={`${workspaces.length} active projects`}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('WorkspaceArchive')}
            style={[styles.archiveBtn, { backgroundColor: theme.surface2 }]}
          >
            <Archive size={18} color={theme.textMuted} />
          </TouchableOpacity>
        }
      />

      {/* Search & Filter Bar */}
      <View style={styles.searchSection}>
        <PulseInput
          placeholder="Search workspaces by name or industry..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearable
          leftIcon={<Search size={18} color={theme.textMuted} />}
          style={{ marginBottom: spacing.xs }}
        />

        <View style={styles.filterRow}>
          {(['all', 'in_progress', 'completed'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedFilter === filter ? colors.primary : theme.surface2,
                  borderColor: selectedFilter === filter ? colors.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedFilter === filter ? colors.white : theme.textSecondary,
                    fontWeight: selectedFilter === filter ? 'bold' : 'normal',
                  },
                ]}
              >
                {filter === 'all' ? 'All' : filter === 'in_progress' ? 'In Progress' : 'Completed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Workspaces List */}
      <FlatList
        data={filteredWorkspaces}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderWorkspaceItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshWorkspaces} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <PulseEmptyState
            icon={FolderPlus}
            title="No Workspaces Found"
            description={
              searchQuery
                ? 'No workspaces match your search criteria. Try a different keyword.'
                : 'Create your first workspace to start validating and researching your business idea.'
            }
            actionTitle="Create Workspace"
            onAction={() => navigation.navigate('CreateWorkspaceModal')}
          />
        }
      />

      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <PulseButton
          title="New Workspace"
          leftIcon={<Plus size={18} color={colors.white} />}
          onPress={() => navigation.navigate('CreateWorkspaceModal')}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  archiveBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  filterChipText: {
    fontSize: typography.fontSizes.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  wsCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  wsName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  wsIndustry: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    marginTop: 2,
  },
  wsDescription: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  dateText: {
    fontSize: typography.fontSizes.xs,
  },
  openLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openText: {
    color: colors.primary,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.bold,
    marginRight: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    borderTopWidth: 1,
  },
});
