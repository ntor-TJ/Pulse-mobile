import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Archive,
  Bot,
  Building2,
  ChevronRight,
  Clock,
  Crown,
  FolderPlus,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PulseBadge } from '../../components/PulseBadge';
import { PulseButton } from '../../components/PulseButton';
import { PulseCard } from '../../components/PulseCard';
import { PulseHeader } from '../../components/PulseHeader';
import { PulseLoader } from '../../components/PulseLoader';
import { CreateWorkspaceModal } from '../workspace/CreateWorkspaceModal';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import { Workspace } from '../../types';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { workspaces, refreshWorkspaces, isLoading, selectWorkspace, deleteWorkspace } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    refreshWorkspaces();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshWorkspaces();
    setRefreshing(false);
  };

  const filteredWorkspaces = workspaces.filter((ws) => {
    const q = searchQuery.toLowerCase();
    return (
      ws.name.toLowerCase().includes(q) ||
      (ws.description && ws.description.toLowerCase().includes(q)) ||
      (ws.industry && ws.industry.toLowerCase().includes(q))
    );
  });

  const handleDeleteWorkspace = (ws: Workspace) => {
    Alert.alert('Delete Workspace', `Are you sure you want to delete "${ws.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkspace(ws.id, true);
          await refreshWorkspaces();
        },
      },
    ]);
  };

  const renderWorkspaceCard = ({ item }: { item: Workspace }) => {
    const formattedDate = new Date(item.created_at || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          selectWorkspace(item);
          navigation.navigate('WorkspaceDetail', { workspaceId: item.id });
        }}
        style={[
          styles.cardContainer,
          {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
          },
        ]}
      >
        <View style={styles.cardMain}>
          {/* Building Icon Badge */}
          <View
            style={[
              styles.iconBadge,
              {
                backgroundColor: isDark ? 'rgba(230, 81, 0, 0.15)' : 'rgba(230, 81, 0, 0.1)',
                borderColor: 'rgba(230, 81, 0, 0.2)',
              },
            ]}
          >
            <Building2 size={20} color={colors.primary} />
          </View>

          {/* Details */}
          <View style={styles.cardContent}>
            <Text numberOfLines={1} style={[styles.wsTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              {item.name}
            </Text>
            <Text numberOfLines={2} style={[styles.wsDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              {item.description || 'No description provided.'}
            </Text>
          </View>

          {/* Delete Action Button */}
          <TouchableOpacity
            onPress={(e) => {
              handleDeleteWorkspace(item);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.moreBtn}
          >
            <MoreHorizontal size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View
          style={[
            styles.cardFooter,
            {
              borderTopColor: isDark ? '#2C2C2E' : '#F3F4F6',
              backgroundColor: isDark ? '#18181A' : '#FAFAFA',
            },
          ]}
        >
          <View style={styles.footerLeft}>
            <Clock size={13} color={isDark ? '#9CA3AF' : '#6B7280'} style={{ marginRight: 5 }} />
            <Text style={[styles.footerDate, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Created {formattedDate}
            </Text>
          </View>
          <ChevronRight size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#F9FAFB' }]}>
      {/* Top Application Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
            borderBottomColor: isDark ? '#2C2C2E' : '#E5E7EB',
            paddingTop: Math.max(insets.top, 16) + 4,
          },
        ]}
      >
        <View style={styles.topBarRow}>
          <View style={styles.brandRow}>
            <Image
              source={require('../../../assets/pulse-mark.png')}
              style={{ width: 22, height: 22, marginRight: 8 }}
              resizeMode="contain"
            />
            <Text style={[styles.brandText, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Axiora <Text style={{ color: colors.primary }}>Pulse</Text>
            </Text>
          </View>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              onPress={() => setCreateModalOpen(true)}
              style={[styles.newWsBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.newWsBtnText}>New Workspace</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content List */}
      <FlatList
        data={filteredWorkspaces}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderWorkspaceCard}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: insets.bottom + 90 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={[styles.pageHeading, { color: isDark ? '#FFFFFF' : '#111827' }]}>
              Workspaces
            </Text>
            <Text style={[styles.pageSub, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
              Organize your ideas, chats, and reports into workspaces.
            </Text>

            {/* Search Bar */}
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
                },
              ]}
            >
              <Search size={18} color={isDark ? '#9CA3AF' : '#9CA3AF'} style={{ marginRight: 8 }} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search workspaces..."
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#111827' }]}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View
              style={[
                styles.emptyContainer,
                {
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: isDark ? 'rgba(230, 81, 0, 0.15)' : 'rgba(230, 81, 0, 0.1)' },
                ]}
              >
                <Building2 size={32} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}>
                No workspaces yet
              </Text>
              <Text style={[styles.emptyDesc, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
                Create your first workspace to start exploring ideas with your AI mentor.
              </Text>
              <PulseButton
                title="Create workspace"
                leftIcon={<Plus size={16} color="#FFFFFF" />}
                onPress={() => setCreateModalOpen(true)}
                style={styles.emptyCreateBtn}
              />
            </View>
          ) : (
            <PulseLoader message="Loading workspaces..." />
          )
        }
      />

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        visible={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          refreshWorkspaces();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + 2,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: typography.fontWeights.black,
    letterSpacing: -0.3,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newWsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.md,
  },
  newWsBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: typography.fontWeights.semibold,
  },
  listContainer: {
    padding: spacing.md,
  },
  headerSection: {
    marginBottom: spacing.md,
  },
  pageHeading: {
    fontSize: 22,
    fontWeight: typography.fontWeights.bold,
  },
  pageSub: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  cardContainer: {
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardMain: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  wsTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeights.semibold,
    lineHeight: 22,
  },
  wsDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  moreBtn: {
    padding: 4,
    marginLeft: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerDate: {
    fontSize: 12,
  },
  emptyContainer: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: spacing.xxl,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  emptyCreateBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
  },
});
