import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { radius, spacing, typography } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface PulseModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const PulseModal: React.FC<PulseModalProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={[styles.sheet, { backgroundColor: theme.surface, borderTopColor: theme.border }]}
            >
              <View style={styles.header}>
                <View style={styles.notch} />
                <View style={styles.titleRow}>
                  {title && <Text style={[styles.title, { color: theme.text }]}>{title}</Text>}
                  <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={[styles.closeButton, { backgroundColor: theme.surface2 }]}
                  >
                    <X size={18} color={theme.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.content}>{children}</View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
    borderTopWidth: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  notch: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: '#CBD5E1',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    marginTop: spacing.sm,
  },
});
