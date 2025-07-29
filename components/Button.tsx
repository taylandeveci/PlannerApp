import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  gradient?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  gradient = true,
}: ButtonProps) {
  const { theme } = useTheme();
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyle = [
    styles.button,
    styles[`${size}Button`],
    {
      borderRadius: theme.borderRadius.medium,
      opacity: disabled ? 0.5 : 1,
    },
    variant === 'outline' && {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      backgroundColor: 'transparent',
    },
    variant === 'secondary' && {
      backgroundColor: theme.colors.surfaceVariant,
    },
    style,
  ];

  const textColor = 
    variant === 'primary' ? (theme.isDark ? '#000000' : '#FFFFFF') :
    variant === 'outline' ? theme.colors.primary :
    theme.colors.text;

  const activityIndicatorColor = 
    variant === 'primary' ? (theme.isDark ? '#000000' : '#FFFFFF') : theme.colors.primary;

  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    { color: textColor, fontWeight: '600' as any },
  ];

  if (variant === 'primary' && gradient) {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, theme.shadows.medium]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={buttonStyle}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.accent]}
            style={[styles.gradient, { borderRadius: theme.borderRadius.medium }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {loading ? (
              <ActivityIndicator color={activityIndicatorColor} />
            ) : (
              <Text style={textStyle}>{title}</Text>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, theme.shadows.small]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          buttonStyle,
          variant === 'primary' && { backgroundColor: theme.colors.primary },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={activityIndicatorColor} />
        ) : (
          <Text style={textStyle}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 52,
  },
  text: {
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mediumText: {
    fontSize: 16,
    lineHeight: 24,
  },
  largeText: {
    fontSize: 18,
    lineHeight: 28,
  },
});
