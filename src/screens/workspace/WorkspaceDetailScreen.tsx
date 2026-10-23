import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Copy,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Mic,
  MoreVertical,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  Share2,
  Sparkles,
  Trash2,
  UploadCloud,
  User as UserIcon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { PulseAvatar } from '../../components/PulseAvatar';
import { PulseBadge } from '../../components/PulseBadge';
import { PulseButton } from '../../components/PulseButton';
import { PulseCard } from '../../components/PulseCard';
import { PulseHeader } from '../../components/PulseHeader';
import { PulseLoader } from '../../components/PulseLoader';
import { PulseProgressBar } from '../../components/PulseProgressBar';
import { chatService } from '../../services/chatService';
import { surveyService } from '../../services/surveyService';
import { validationService } from '../../services/validationService';
import { workspaceService } from '../../services/workspaceService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import { MentorMessage, SuggestedPrompt, Survey, Workspace } from '../../types';

interface WorkspaceDetailScreenProps {
  route: any;
  navigation: any;
}

type ActiveTab = 'mentor' | 'survey' | 'attachments';

export const WorkspaceDetailScreen: React.FC<WorkspaceDetailScreenProps> = ({ route, navigation }) => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { deleteWorkspace } = useWorkspace();
  const workspaceId = route.params?.workspaceId;

  const [activeTab, setActiveTab] = useState<ActiveTab>('mentor');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  // Mentor Chat State
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [validationRunning, setValidationRunning] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([]);

  // Intake State (for new workspaces)
  const [intakeTitle, setIntakeTitle] = useState('');
  const [intakeDesc, setIntakeDesc] = useState('');
  const [intakeSubmitting, setIntakeSubmitting] = useState(false);

  // Survey State
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyLoading, setSurveyLoading] = useState(false);

  // Attachments State
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceData();
    }
  }, [workspaceId]);

  const loadWorkspaceData = async () => {
    setLoading(true);
    try {
      const wsData = await workspaceService.getWorkspaceById(workspaceId);
      setWorkspace(wsData);
      setIntakeTitle(wsData.name || '');
      setIntakeDesc(wsData.description || '');

      // Load Chat Messages
      const msgs = await chatService.getMessages(workspaceId);
      setMessages(msgs || []);

      // Load Suggestions
      const suggestions = await chatService.getSuggestedPrompts(workspaceId);
      setSuggestedPrompts(suggestions || []);

      // Load Surveys
      try {
        const surveysData = await surveyService.getSurveys(workspaceId);
        setSurveys(surveysData || []);
      } catch {}

      // Load Attachments
      try {
        const attachData = await workspaceService.getAttachments(workspaceId);
        setAttachments(attachData || []);
      } catch {}
    } catch (err: any) {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  const hasStartedConversation = messages.length > 0 || (workspace?.description && workspace.description.trim().length > 10);

  const handleIntakeSubmit = async () => {
    if (!intakeTitle.trim() || !intakeDesc.trim()) {
      Alert.alert('Required Fields', 'Please provide both an idea title and description.');
      return;
    }

    setIntakeSubmitting(true);
    try {
      // Send initial formatted message
      const formatted = `**Idea Title:** ${intakeTitle.trim()}\n\n**Idea Description:** ${intakeDesc.trim()}`;
      await chatService.sendMessage(workspaceId, formatted);
      await loadWorkspaceData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit idea.');
    } finally {
      setIntakeSubmitting(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputText).trim();
    if (!text || chatLoading) return;

    setInputText('');
    setChatLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const tempUserMsg: MentorMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const resp = await chatService.sendMessage(workspaceId, text);
      const assistantMsg: MentorMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: resp.content || 'Analysis updated.',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to receive AI Mentor response.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleRunValidation = async () => {
    setValidationRunning(true);
    try {
      await validationService.runFullValidation(workspaceId);
      Alert.alert('Validation Analysis', 'AI validation orchestration running. Check your report when complete.');
      await loadWorkspaceData();
    } catch (err: any) {
      Alert.alert('Validation', err.message || 'Validation request submitted.');
    } finally {
      setValidationRunning(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      const file = res.assets[0];
      setUploading(true);
      await workspaceService.uploadAttachment(workspaceId, {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      });
      const updated = await workspaceService.getAttachments(workspaceId);
      setAttachments(updated || []);
      Alert.alert('Uploaded', 'File successfully attached to workspace.');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteWorkspace = () => {
    Alert.alert('Delete Workspace', `Are you sure you want to delete "${workspace?.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkspace(workspaceId, true);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <PulseHeader title="Workspace" />
        <PulseLoader message="Loading workspace & AI Mentor..." />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Top Header */}
      <View style={[styles.topHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border, paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.topHeaderRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={20} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.titleCol}>
            <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.text }]}>
              {workspace?.name || 'Workspace'}
            </Text>
            <Text style={[styles.headerSub, { color: theme.textMuted }]}>
              {workspace?.industry || 'Startup Workspace'}
            </Text>
          </View>

          <TouchableOpacity onPress={handleDeleteWorkspace} style={styles.moreBtn}>
            <Trash2 size={18} color={colors.danger || '#EF4444'} />
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs (AI Mentor | Survey Intelligence | Attachments) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('mentor')}
            style={[styles.tabItem, activeTab === 'mentor' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Bot size={16} color={activeTab === 'mentor' ? colors.primary : theme.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'mentor' ? colors.primary : theme.textMuted }]}>
              AI Mentor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('survey')}
            style={[styles.tabItem, activeTab === 'survey' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <ClipboardList size={16} color={activeTab === 'survey' ? colors.primary : theme.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'survey' ? colors.primary : theme.textMuted }]}>
              Surveys
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('attachments')}
            style={[styles.tabItem, activeTab === 'attachments' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
          >
            <Paperclip size={16} color={activeTab === 'attachments' ? colors.primary : theme.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'attachments' ? colors.primary : theme.textMuted }]}>
              Attachments
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TAB 1: AI MENTOR (Intake or Chat) */}
      {activeTab === 'mentor' && (
        !hasStartedConversation ? (
          /* WORKSPACE INTAKE FORM */
          <ScrollView
            contentContainerStyle={[styles.intakeContainer, { paddingBottom: insets.bottom + 90 }]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.intakeHeading, { color: theme.text }]}>Let's start with your idea.</Text>
            <Text style={[styles.intakeDesc, { color: theme.textMuted }]}>
              Share your startup idea in your own words. The more context you provide, the better your AI Mentor can understand your vision and guide you with personalized insights.
            </Text>

            <PulseCard style={styles.intakeCard}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>Idea Title</Text>
              <TextInput
                value={intakeTitle}
                onChangeText={setIntakeTitle}
                placeholder="Give your idea a short, memorable title"
                placeholderTextColor={theme.textMuted}
                style={[styles.textInputStyle, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
              />
            </PulseCard>

            <PulseCard style={styles.intakeCard}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>Idea Description</Text>
              <TextInput
                value={intakeDesc}
                onChangeText={setIntakeDesc}
                placeholder="Describe your idea, target audience, and the problem you're solving..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={6}
                style={[styles.textAreaStyle, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
              />
            </PulseCard>

            <PulseButton
              title="Continue"
              loading={intakeSubmitting}
              onPress={handleIntakeSubmit}
              style={styles.continueBtn}
            />
          </ScrollView>
        ) : (
          /* LIVE CHAT & VALIDATION */
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            {/* Agent Progress Header Banner */}
            <View style={[styles.agentStatusBar, { backgroundColor: theme.surface2, borderBottomColor: theme.border }]}>
              <View style={styles.agentStatusLeft}>
                <View style={styles.pulseDot} />
                <Text style={[styles.agentStatusText, { color: theme.text }]}>
                  Stage: <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Market Validation</Text>
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleRunValidation}
                disabled={validationRunning}
                style={[styles.valBtn, { backgroundColor: colors.primary }]}
              >
                <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.valBtnText}>
                  {validationRunning ? 'Analyzing...' : 'Run Validation'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => {
                const isUser = item.sender === 'user';
                return (
                  <View style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowAssistant]}>
                    {!isUser && (
                      <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
                        <Bot size={16} color="#FFFFFF" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        isUser
                          ? { backgroundColor: colors.primary }
                          : { backgroundColor: theme.surfaceCard, borderColor: theme.border, borderWidth: 1 },
                      ]}
                    >
                      <Text style={[styles.bubbleText, { color: isUser ? '#FFFFFF' : theme.text }]}>
                        {item.content}
                      </Text>
                    </View>
                  </View>
                );
              }}
              contentContainerStyle={styles.chatList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Suggested Prompts */}
            {suggestedPrompts.length > 0 && (
              <View style={[styles.chipsContainer, { borderTopColor: theme.border }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                  {suggestedPrompts.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => handleSendMessage(p.text)}
                      style={[styles.chip, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}
                    >
                      <Sparkles size={12} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={[styles.chipText, { color: theme.text }]}>{p.text}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Input Bar */}
            <View style={[styles.inputBar, { backgroundColor: theme.surface, borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 10) }]}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask Arya about your market, pricing, or validation..."
                placeholderTextColor={theme.textMuted}
                multiline
                style={[styles.chatInput, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
              />
              <TouchableOpacity
                onPress={() => handleSendMessage()}
                disabled={!inputText.trim() || chatLoading}
                style={[
                  styles.sendButton,
                  { backgroundColor: inputText.trim() && !chatLoading ? colors.primary : theme.border },
                ]}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )
      )}

      {/* TAB 2: SURVEY INTELLIGENCE */}
      {activeTab === 'survey' && (
        <ScrollView contentContainerStyle={[styles.surveyTabContent, { paddingBottom: insets.bottom + 90 }]}>
          <View style={styles.surveyHeader}>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>Survey Intelligence</Text>
            <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
              Validate problem-solution fit directly with target respondents.
            </Text>
          </View>

          {surveys.length > 0 ? (
            surveys.map((srv) => (
              <PulseCard key={srv.id} style={styles.surveyCardItem}>
                <View style={styles.surveyTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.srvTitle, { color: theme.text }]}>{srv.title}</Text>
                    <Text style={[styles.srvDesc, { color: theme.textMuted }]}>{srv.description}</Text>
                  </View>
                  <PulseBadge label={srv.status} variant={srv.status === 'active' ? 'success' : 'neutral'} />
                </View>

                <View style={styles.srvStatsRow}>
                  <View style={[styles.statBox, { backgroundColor: theme.surface2 }]}>
                    <Text style={[styles.statNum, { color: theme.text }]}>{srv.responses_count || 0}</Text>
                    <Text style={[styles.statLbl, { color: theme.textMuted }]}>Responses</Text>
                  </View>
                  <View style={[styles.statBox, { backgroundColor: theme.surface2 }]}>
                    <Text style={[styles.statNum, { color: theme.text }]}>{srv.questions?.length || 0}</Text>
                    <Text style={[styles.statLbl, { color: theme.textMuted }]}>Questions</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    if (srv.public_url) {
                      Share.share({ message: `Please take our survey: ${srv.public_url}` });
                    }
                  }}
                  style={[styles.shareSrvBtn, { backgroundColor: colors.primarySoft }]}
                >
                  <Share2 size={16} color={colors.primary} />
                  <Text style={[styles.shareSrvText, { color: colors.primary }]}>Share Survey Link</Text>
                </TouchableOpacity>
              </PulseCard>
            ))
          ) : (
            <PulseCard style={styles.emptyCard}>
              <ClipboardList size={36} color={theme.textMuted} style={{ alignSelf: 'center', marginBottom: spacing.sm }} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Surveys Generated Yet</Text>
              <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                Once you complete the idea intake, your AI mentor will design a targeted questionnaire for user feedback.
              </Text>
            </PulseCard>
          )}
        </ScrollView>
      )}

      {/* TAB 3: ATTACHMENTS */}
      {activeTab === 'attachments' && (
        <ScrollView contentContainerStyle={[styles.surveyTabContent, { paddingBottom: insets.bottom + 90 }]}>
          <View style={styles.surveyHeader}>
            <Text style={[styles.sectionHeading, { color: theme.text }]}>Workspace Attachments</Text>
            <Text style={[styles.sectionSub, { color: theme.textMuted }]}>
              Pitch decks, business models, financial sheets, and research docs.
            </Text>
          </View>

          {/* Upload Button */}
          <PulseCard style={styles.uploadCard}>
            <TouchableOpacity onPress={handlePickDocument} disabled={uploading} style={styles.uploadInner}>
              <UploadCloud size={32} color={colors.primary} style={{ marginBottom: spacing.xs }} />
              <Text style={[styles.uploadTitle, { color: theme.text }]}>
                {uploading ? 'Uploading Document...' : 'Upload New Document'}
              </Text>
              <Text style={[styles.uploadSub, { color: theme.textMuted }]}>
                Supports PDF, DOCX, XLSX, and PNG/JPEG
              </Text>
            </TouchableOpacity>
          </PulseCard>

          {/* Attachments List */}
          {attachments.length > 0 ? (
            attachments.map((att, idx) => (
              <PulseCard key={att.id || idx} style={styles.attachCard}>
                <View style={styles.attachRow}>
                  <FileText size={24} color={colors.primary} style={{ marginRight: spacing.md }} />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={[styles.attachName, { color: theme.text }]}>
                      {att.file_name || att.name || 'Document'}
                    </Text>
                    <Text style={[styles.attachMeta, { color: theme.textMuted }]}>
                      {att.file_size ? `${Math.round(att.file_size / 1024)} KB` : 'Uploaded file'}
                    </Text>
                  </View>
                </View>
              </PulseCard>
            ))
          ) : (
            <PulseCard style={styles.emptyCard}>
              <Paperclip size={36} color={theme.textMuted} style={{ alignSelf: 'center', marginBottom: spacing.sm }} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No Attachments Uploaded</Text>
              <Text style={[styles.emptySub, { color: theme.textMuted }]}>
                Attach documents above to give your AI Mentor more context.
              </Text>
            </PulseCard>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    borderBottomWidth: 1,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    padding: 4,
    marginRight: spacing.sm,
  },
  titleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  headerSub: {
    fontSize: 12,
  },
  moreBtn: {
    padding: 6,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: typography.fontWeights.semibold,
    marginLeft: 6,
  },
  intakeContainer: {
    padding: spacing.lg,
  },
  intakeHeading: {
    fontSize: 22,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.xs,
  },
  intakeDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  intakeCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  textInputStyle: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    fontSize: 14,
  },
  textAreaStyle: {
    minHeight: 120,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  continueBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
  },
  agentStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
  },
  agentStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  agentStatusText: {
    fontSize: 12,
  },
  valBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
  },
  valBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: typography.fontWeights.bold,
  },
  chatList: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  msgRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  msgRowUser: {
    justifyContent: 'flex-end',
  },
  msgRowAssistant: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '82%',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipsContainer: {
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
  },
  chipsScroll: {
    paddingHorizontal: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  chipText: {
    fontSize: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderWidth: 1,
    fontSize: 14,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surveyTabContent: {
    padding: spacing.md,
  },
  surveyHeader: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: typography.fontWeights.bold,
  },
  sectionSub: {
    fontSize: 13,
    marginTop: 2,
  },
  surveyCardItem: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  surveyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  srvTitle: {
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
  srvDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  srvStatsRow: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    marginRight: spacing.sm,
  },
  statNum: {
    fontSize: 13,
    fontWeight: typography.fontWeights.bold,
    marginRight: 4,
  },
  statLbl: {
    fontSize: 11,
  },
  shareSrvBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  shareSrvText: {
    fontSize: 13,
    fontWeight: typography.fontWeights.bold,
    marginLeft: 6,
  },
  uploadCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    alignItems: 'center',
  },
  uploadInner: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
  uploadSub: {
    fontSize: 12,
    marginTop: 4,
  },
  attachCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachName: {
    fontSize: 14,
    fontWeight: typography.fontWeights.semibold,
  },
  attachMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: typography.fontWeights.bold,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
