import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Mic } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, radius, shadows } from '../theme';

interface PulseVoiceFABProps {
  onPress: () => void;
  isListening?: boolean;
  style?: ViewStyle;
}

export const PulseVoiceFAB: React.FC<PulseVoiceFABProps> = ({
  onPress,
  isListening = false,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: pulseAnim }] }, style]}>
      <TouchableOpacity activeOpacity={0.85} onPress={handlePress} style={styles.fab}>
        <LinearGradient
          colors={isListening ? ['#DC2626', '#EF4444', '#F87171'] : colors.brandGradient}
          style={styles.gradient}
        >
          <Mic size={26} color={colors.white} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    zIndex: 999,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    ...shadows.lg,
  },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
