import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Globe,
  Mic,
  MicOff,
  Pause,
  Play,
  Volume2,
  X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SUPPORTED_INDIAN_LOCALES, VoiceSessionManager } from '../../services/voiceService';
import { useTheme } from '../../context/ThemeContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { colors, radius, spacing, typography } from '../../theme';
import { VoiceLocale } from '../../types';

interface AryaVoiceAssistantModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AryaVoiceAssistantModal: React.FC<AryaVoiceAssistantModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { activeWorkspace } = useWorkspace();

  const [selectedLocale, setSelectedLocale] = useState<VoiceLocale>(SUPPORTED_INDIAN_LOCALES[0]);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [isListening, setIsListening] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [liveTranscript, setLiveTranscript] = useState('Listening to your startup ideas...');
  const [assistantResponse, setAssistantResponse] = useState('Hello! I am Arya. Speak to me about your startup concept.');

  const waveAnim1 = useRef(new Animated.Value(0.4)).current;
  const waveAnim2 = useRef(new Animated.Value(0.6)).current;
  const waveAnim3 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible && isListening && !isPaused) {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(waveAnim1, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(waveAnim1, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim2, { toValue: 1.2, duration: 750, useNativeDriver: true }),
            Animated.timing(waveAnim2, { toValue: 0.4, duration: 750, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim3, { toValue: 0.9, duration: 900, useNativeDriver: true }),
            Animated.timing(waveAnim3, { toValue: 0.5, duration: 900, useNativeDriver: true }),
          ]),
        ])
      ).start();
    }
  }, [visible, isListening, isPaused]);

  useEffect(() => {
    const requestMicPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'Arya Voice Assistant needs microphone access to talk with you in real time.',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setLiveTranscript('Microphone permission was denied. Tap the mic to try again.');
          }
        } catch (err) {
          console.warn('Mic permission error:', err);
        }
      }
    };

    if (visible) {
      requestMicPermission();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && activeWorkspace) {
      const session = new VoiceSessionManager(activeWorkspace.id, selectedLocale.code, {
        onStatusChange: (newStatus) => setStatus(newStatus),
        onMessage: (msg) => {
          if (msg.transcript) setLiveTranscript(msg.transcript);
          if (msg.response || msg.content) setAssistantResponse(msg.response || msg.content);
        },
      });

      session.connect();

      return () => {
        session.disconnect();
      };
    }
  }, [visible, activeWorkspace, selectedLocale]);

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsListening(!isListening);
  };

  const togglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(!isPaused);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: theme.surfaceCard, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.statusDot, { backgroundColor: status === 'connected' ? colors.success : colors.warning }]} />
              <Text style={[styles.headerTitle, { color: theme.text }]}>Arya Live Voice</Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowLanguagePicker(!showLanguagePicker)}
              style={[styles.langBadge, { backgroundColor: theme.surface2, borderColor: theme.border }]}
            >
              <Globe size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.langText, { color: theme.text }]}>{selectedLocale.label}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surface2 }]}>
              <X size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Language Picker Dropdown */}
          {showLanguagePicker && (
            <View style={[styles.langPickerContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.pickerTitle, { color: theme.textMuted }]}>Select Voice Accent</Text>
              <ScrollView style={{ maxHeight: 180 }}>
                {SUPPORTED_INDIAN_LOCALES.map((loc) => (
                  <TouchableOpacity
                    key={loc.code}
                    onPress={() => {
                      setSelectedLocale(loc);
                      setShowLanguagePicker(false);
                    }}
                    style={[
                      styles.langOption,
                      selectedLocale.code === loc.code && { backgroundColor: colors.primarySoft },
                    ]}
                  >
                    <Text
                      style={[
                        styles.langOptionText,
                        {
                          color: selectedLocale.code === loc.code ? colors.primary : theme.text,
                          fontWeight: selectedLocale.code === loc.code ? 'bold' : 'normal',
                        },
                      ]}
                    >
                      {loc.label} ({loc.native_label})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Visualizer Waves */}
          <View style={styles.visualizerContainer}>
            <Animated.View
              style={[
                styles.waveCircle,
                { transform: [{ scale: waveAnim3 }], opacity: 0.15, backgroundColor: colors.primary },
              ]}
            />
            <Animated.View
              style={[
                styles.waveCircle,
                { transform: [{ scale: waveAnim2 }], opacity: 0.3, backgroundColor: colors.primary },
              ]}
            />
            <Animated.View
              style={[
                styles.waveCircle,
                { transform: [{ scale: waveAnim1 }], opacity: 0.6, backgroundColor: colors.primary },
              ]}
            />

            <LinearGradient colors={colors.brandGradient} style={styles.micCenter}>
              {isListening && !isPaused ? (
                <Volume2 size={36} color={colors.white} />
              ) : (
                <MicOff size={36} color={colors.white} />
              )}
            </LinearGradient>
          </View>

          {/* Conversation Transcripts */}
          <View style={[styles.transcriptBox, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <Text style={[styles.transcriptLabel, { color: theme.textMuted }]}>LIVE SPEECH</Text>
            <Text style={[styles.transcriptText, { color: theme.text }]}>
              "{isPaused ? 'Session Paused' : liveTranscript}"
            </Text>

            <View style={styles.divider} />

            <Text style={[styles.transcriptLabel, { color: colors.primary }]}>ARYA'S RESPONSE</Text>
            <Text style={[styles.assistantText, { color: theme.textSecondary }]}>{assistantResponse}</Text>
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              onPress={toggleMute}
              style={[
                styles.controlBtn,
                { backgroundColor: isListening ? theme.surface2 : colors.dangerLight },
              ]}
            >
              {isListening ? <Mic size={20} color={theme.text} /> : <MicOff size={20} color={colors.danger} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePause}
              style={[styles.pauseBtn, { backgroundColor: colors.primary }]}
            >
              {isPaused ? <Play size={24} color={colors.white} /> : <Pause size={24} color={colors.white} />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.controlBtn, { backgroundColor: theme.surface2 }]}
            >
              <X size={20} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginRight: 6,
  },
  headerTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  langText: {
    fontSize: 11,
    fontWeight: typography.fontWeights.semibold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langPickerContainer: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  pickerTitle: {
    fontSize: 10,
    fontWeight: typography.fontWeights.bold,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  langOption: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  langOptionText: {
    fontSize: typography.fontSizes.xs,
  },
  visualizerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    position: 'relative',
  },
  waveCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  micCenter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  transcriptBox: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginVertical: spacing.md,
    maxHeight: 160,
  },
  transcriptLabel: {
    fontSize: 9,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  transcriptText: {
    fontSize: typography.fontSizes.sm,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: spacing.xs,
  },
  assistantText: {
    fontSize: typography.fontSizes.xs,
    lineHeight: 18,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  pauseBtn: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
});
