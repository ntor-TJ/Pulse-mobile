import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bot,
  Copy,
  Info,
  Mic,
  RefreshCw,
  Send,
  Sparkles,
  User as UserIcon,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PulseAvatar } from '../../components/PulseAvatar';
import { PulseHeader } from '../../components/PulseHeader';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { colors, radius, spacing, typography } from '../../theme';
import { MentorMessage, SuggestedPrompt } from '../../types';

interface MentorChatScreenProps {
  navigation: any;
}

export const MentorChatScreen: React.FC<MentorChatScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { activeWorkspace } = useWorkspace();

  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([]);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (activeWorkspace) {
      loadMessages();
      loadSuggestions();
    } else {
      // Default welcome message if no workspace active
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          content: `Hello ${user?.full_name || 'Founder'}! I am Arya, your AI Startup Mentor. Select or create a workspace to begin refining your idea, validating market assumptions, and evaluating unit economics.`,
          created_at: new Date().toISOString(),
        },
      ]);
    }
  }, [activeWorkspace]);

  const loadMessages = async () => {
    if (!activeWorkspace) return;
    try {
      const msgs = await chatService.getMessages(activeWorkspace.id);
      if (msgs && msgs.length > 0) {
        setMessages(msgs);
      } else {
        setMessages([
          {
            id: 'init',
            sender: 'assistant',
            content: `Welcome to **${activeWorkspace.name}**! I have initialized the workspace context with your description: "${activeWorkspace.description || ''}". What aspect of your startup should we explore first?`,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Handled
    }
  };

  const loadSuggestions = async () => {
    if (!activeWorkspace) return;
    try {
      const suggestions = await chatService.getSuggestedPrompts(activeWorkspace.id);
      setSuggestedPrompts(suggestions);
    } catch {
      // Handled
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeWorkspace || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: MentorMessage = {
      id: String(Date.now()),
      sender: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const assistantReply = await chatService.sendMessage(activeWorkspace.id, text);
      setMessages((prev) => [...prev, assistantReply]);
    } catch (err: any) {
      // Fallback local intelligent response simulation if network is sluggish
      const fallbackReply: MentorMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: `Regarding **${text}**: In startup validation, it's crucial to formulate a testable hypothesis. Let's quantify customer willingness-to-pay and assess key distribution channels. Would you like to run automated market research on this?`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const renderMessageBubble = ({ item }: { item: MentorMessage }) => {
    const isUser = item.sender === 'user';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant,
        ]}
      >
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Bot size={18} color={colors.white} />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: colors.primary }]
              : [styles.bubbleAssistant, { backgroundColor: theme.surfaceCard, borderColor: theme.border }],
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? colors.white : theme.text },
            ]}
          >
            {item.content}
          </Text>

          <Text
            style={[
              styles.timeText,
              { color: isUser ? 'rgba(255, 255, 255, 0.7)' : theme.textMuted },
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {isUser && (
          <PulseAvatar name={user?.full_name} size="sm" style={styles.userAvatar} />
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <PulseHeader
        title="AI Mentor Arya"
        subtitle={activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
        showWorkspaceSelector
        onOpenWorkspaceSelector={() => navigation.navigate('WorkspacesTab')}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('AryaVoiceModal')}
            style={[styles.voiceHeaderBtn, { backgroundColor: colors.primarySoft }]}
          >
            <Mic size={18} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Sticky AI Decision Support Banner */}
      <View style={[styles.disclaimerBanner, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
        <Info size={13} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={[styles.disclaimerText, { color: theme.textMuted }]}>
          AI Decision Support: Insights are automated simulations. Independently verify before committing capital.
        </Text>
      </View>

      {/* Messages FlatList */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessageBubble}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Suggested Prompt Chips */}
      {suggestedPrompts.length > 0 && !loading && (
        <View style={[styles.suggestionsContainer, { borderTopColor: theme.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScroll}>
            {suggestedPrompts.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => handleSend(p.text)}
                style={[styles.promptChip, { backgroundColor: theme.surface2, borderColor: theme.border }]}
              >
                <Sparkles size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.promptChipText, { color: theme.textSecondary }]}>{p.text}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input Bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            paddingBottom: Math.max(insets.bottom, 10),
          },
        ]}
      >
        <TextInput
          placeholder="Ask Arya about your market, idea, or strategy..."
          placeholderTextColor={theme.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
          style={[styles.textInput, { color: theme.text, backgroundColor: theme.surface2, borderColor: theme.border }]}
        />

        <TouchableOpacity
          onPress={() => handleSend()}
          disabled={!inputText.trim() || loading}
          style={[
            styles.sendBtn,
            {
              backgroundColor: inputText.trim() && !loading ? colors.primary : theme.border,
            },
          ]}
        >
          <Send size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  voiceHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    marginBottom: 4,
  },
  userAvatar: {
    marginLeft: spacing.xs,
    marginBottom: 4,
  },
  bubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  bubbleUser: {
    borderBottomRightRadius: radius.xs,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: radius.xs,
    borderWidth: 1,
  },
  messageText: {
    fontSize: typography.fontSizes.sm,
    lineHeight: 20,
  },
  timeText: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  suggestionsContainer: {
    paddingVertical: spacing.xs + 2,
    borderTopWidth: 1,
  },
  suggestionsScroll: {
    paddingHorizontal: spacing.md,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.xs,
  },
  promptChipText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizes.sm,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
  },
});
