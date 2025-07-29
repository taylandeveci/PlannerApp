import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  color?: string;
  style?: any;
}

export default function LoadingAnimation({
  size = 'medium',
  text,
  color,
  style,
}: LoadingAnimationProps) {
  const { theme } = useTheme();
  
  // Animated values for different loading effects
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Start animations
  React.useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1200,
        easing: Easing.linear,
      }),
      -1
    );

    // Pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1
    );

    // Fade animation
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1
    );
  }, [rotation, scale, opacity]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sizeConfig = {
    small: { size: 24, textSize: 12 },
    medium: { size: 40, textSize: 14 },
    large: { size: 56, textSize: 16 },
  };

  const config = sizeConfig[size];
  const loadingColor = color || theme.colors.primary;

  return (
    <View style={[styles.container, style]}>
      {/* Rotating spinner */}
      <Animated.View style={[styles.spinner, rotationStyle]}>
        <View
          style={[
            styles.spinnerRing,
            {
              width: config.size,
              height: config.size,
              borderColor: `${loadingColor}20`,
              borderTopColor: loadingColor,
            },
          ]}
        />
      </Animated.View>

      {/* Pulsing dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              pulseStyle,
              styles.dot,
              {
                backgroundColor: loadingColor,
                animationDelay: `${index * 200}ms`,
              },
            ]}
          />
        ))}
      </View>

      {/* Loading text */}
      {text && (
        <Animated.Text
          style={[
            fadeStyle,
            styles.loadingText,
            {
              fontSize: config.textSize,
              color: theme.colors.text,
              marginTop: 12,
            },
          ]}
        >
          {text}
        </Animated.Text>
      )}
    </View>
  );
}

// Alternative minimalist loading component
export function MinimalLoader({ 
  size = 'medium', 
  color 
}: { 
  size?: 'small' | 'medium' | 'large';
  color?: string;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 600 }),
        withTiming(1, { duration: 600 })
      ),
      -1
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeValue = {
    small: 20,
    medium: 32,
    large: 44,
  }[size];

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
          backgroundColor: color || theme.colors.primary,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginBottom: 8,
  },
  spinnerRing: {
    borderWidth: 3,
    borderRadius: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  loadingText: {
    textAlign: 'center',
    fontWeight: '500',
  },
});
