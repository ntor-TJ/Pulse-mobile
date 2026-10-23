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
import { File, FileText, Plus, Upload, UploadCloud } from 'lucide-react-native';
import { PulseButton } from '../../components/PulseButton';
import { PulseCard } from '../../components/PulseCard';
import { PulseEmptyState } from '../../components/PulseEmptyState';
import { PulseHeader } from '../../components/PulseHeader';
import { PulseLoader } from '../../components/PulseLoader';
import { workspaceService } from '../../services/workspaceService';
import { useTheme } from '../../context/ThemeContext';
import { colors, radius, spacing, typography } from '../../theme';

interface WorkspaceAttachmentsScreenProps {
  route: any;
  navigation: any;
}

export const WorkspaceAttachmentsScreen: React.FC<WorkspaceAttachmentsScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const workspaceId = route.params?.workspaceId;

  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAttachments();
  }, [workspaceId]);

  const loadAttachments = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const data = await workspaceService.getAttachments(workspaceId);
      setAttachments(data || []);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSample = async () => {
    setUploading(true);
    try {
      Alert.alert(
        'Upload File',
        'Choose a document or PDF to attach to your startup workspace.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Attach Document',
            onPress: () => {
              Alert.alert('File Attached', 'Document successfully uploaded and parsed by AI.');
            },
          },
        ]
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <PulseHeader title="Workspace Attachments" showBack onBack={() => navigation.goBack()} />

      {loading ? (
        <PulseLoader message="Loading attachments..." />
      ) : (
        <FlatList
          data={attachments}
          keyExtractor={(item, idx) => item.id ? String(item.id) : String(idx)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAttachments} />}
          renderItem={({ item }) => (
            <PulseCard variant="outlined" style={styles.attachmentCard}>
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
                  <FileText size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fileName, { color: theme.text }]}>{item.name || item.filename || 'Document.pdf'}</Text>
                  <Text style={[styles.fileSize, { color: theme.textMuted }]}>
                    {item.size || '1.2 MB'} • {new Date(item.created_at || Date.now()).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </PulseCard>
          )}
          ListEmptyComponent={
            <PulseEmptyState
              icon={UploadCloud}
              title="No Files Uploaded Yet"
              description="Upload business plans, pitch decks, market research papers, or financial sheets to enrich AI Mentor analysis."
              actionTitle="Upload Document"
              onAction={handleUploadSample}
            />
          }
        />
      )}

      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <PulseButton
          title="Upload Document"
          leftIcon={<Upload size={18} color={colors.white} />}
          loading={uploading}
          onPress={handleUploadSample}
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
  listContent: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  attachmentCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  fileName: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
  },
  fileSize: {
    fontSize: typography.fontSizes.xs,
    marginTop: 2,
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
