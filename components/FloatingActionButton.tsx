import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium' | 'large';
  style?: any;
  disabled?: boolean;
}

export default function FloatingActionButton({
  onPress,
  icon = 'add',
  size = 'medium',
  style,
  disabled = false,
}: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const pressed = useSharedValue(0);
  const scale = useSharedValue(1);

  const sizeConfig = {
    small: { button: 40, icon: 20 },
    medium: { button: 56, icon: 24 },
    large: { button: 72, icon: 32 },
  };

  const config = sizeConfig[size];

  const handlePressIn = () => {
    if (disabled) return;
    pressed.value = 1;
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    pressed.value = 0;
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const handlePress = () => {
    if (disabled) return;
    runOnJS(onPress)();
  };

  const animatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(pressed.value, [0, 1], [0.3, 0.6]);
    const elevation = interpolate(pressed.value, [0, 1], [6, 12]);

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity,
      elevation,
    };
  });

  const buttonStyle = [
    styles.fab,
    {
      width: config.button,
      height: config.button,
      borderRadius: config.button / 2,
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.text,
      opacity: disabled ? 0.5 : 1,
    },
    style,
  ];

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View style={[buttonStyle, animatedStyle]}>
        <Ionicons 
          name={icon} 
          size={config.icon} 
          color={theme.isDark ? theme.colors.background : '#FFFFFF'} 
        />
      </Animated.View>
    </Pressable>
  );
}

// Multi-action floating button
export function MultiFAB({
  actions,
  mainIcon = 'add',
  size = 'medium',
  style,
}: {
  actions: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
  }[];
  mainIcon?: keyof typeof Ionicons.glyphMap;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const rotation = useSharedValue(0);
  const actionScale = useSharedValue(0);

  const toggleMenu = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    rotation.value = withSpring(newExpanded ? 45 : 0, { damping: 15, stiffness: 200 });
    actionScale.value = withTiming(newExpanded ? 1 : 0, { duration: 200 });
  };

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const actionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: actionScale.value }],
    opacity: actionScale.value,
  }));

  return (
    <Animated.View style={[styles.multiFabContainer, style]}>
      {/* Action buttons */}
      {actions.map((action, index) => (
        <Animated.View
          key={action.label}
          style={[
            actionStyle,
            styles.actionButton,
            { marginBottom: 12 * (index + 1) + 56 },
          ]}
        >
          <FloatingActionButton
            icon={action.icon}
            onPress={() => {
              action.onPress();
              toggleMenu();
            }}
            size="small"
          />
        </Animated.View>
      ))}

      {/* Main button */}
      <Animated.View style={rotationStyle}>
        <FloatingActionButton
          icon={mainIcon}
          onPress={toggleMenu}
          size={size}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fab: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 5,
  },
  multiFabContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  actionButton: {
    position: 'absolute',
    bottom: 0,
  },
});
