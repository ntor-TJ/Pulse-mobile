import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, typography } from '../theme';

interface PulseAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnline?: boolean;
  style?: ViewStyle;
}

export const PulseAvatar: React.FC<PulseAvatarProps> = ({
  name = 'User',
  avatarUrl,
  size = 'md',
  showOnline = false,
  style,
}) => {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  const getDimension = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 56;
      case 'xl':
        return 80;
      default:
        return 44;
    }
  };

  const dim = getDimension();

  return (
    <View style={[{ width: dim, height: dim }, style]}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.avatar, { width: dim, height: dim, borderRadius: dim / 2 }]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            styles.fallback,
            { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: colors.primarySoft },
          ]}
        >
          <Text
            style={[
              styles.initials,
              {
                color: colors.primary,
                fontSize: size === 'sm' ? 12 : size === 'lg' ? 20 : size === 'xl' ? 28 : 16,
              },
            ]}
          >
            {getInitials(name)}
          </Text>
        </View>
      )}

      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size === 'sm' ? 8 : 12,
              height: size === 'sm' ? 8 : 12,
              borderRadius: radius.full,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  initials: {
    fontWeight: typography.fontWeights.bold,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
