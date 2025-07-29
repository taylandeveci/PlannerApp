import React from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  SlideInRight,
  SlideOutLeft,
  FadeIn,
  FadeOut,
  Layout,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Screen transition wrapper component
interface ScreenTransitionProps {
  children: React.ReactNode;
  entering?: any;
  exiting?: any;
  layout?: any;
  style?: any;
}

export default function ScreenTransition({
  children,
  entering = FadeIn.duration(300),
  exiting = FadeOut.duration(200),
  layout = Layout.springify(),
  style,
}: ScreenTransitionProps) {
  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      layout={layout}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </Animated.View>
  );
}

// Slide transition from right (common for new screens)
export function SlideInFromRight({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <Animated.View
      entering={SlideInRight.duration(350).easing(Easing.out(Easing.cubic))}
      exiting={SlideOutLeft.duration(250)}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </Animated.View>
  );
}

// Fade transition (subtle and smooth)
export function FadeTransition({ 
  children, 
  duration = 300,
  style 
}: { 
  children: React.ReactNode; 
  duration?: number;
  style?: any;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(duration)}
      exiting={FadeOut.duration(duration * 0.7)}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </Animated.View>
  );
}

// Modal-like transition (scale up from center)
export function ModalTransition({ 
  children, 
  onClose,
  style 
}: { 
  children: React.ReactNode;
  onClose?: () => void;
  style?: any;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ flex: 1 }, style]}>
      <Animated.View style={[animatedStyle, { flex: 1 }]}>
        {children}
      </Animated.View>
    </Animated.View>
  );
}

// Page curl transition (innovative effect)
export function PageCurlTransition({ 
  children, 
  style 
}: { 
  children: React.ReactNode; 
  style?: any;
}) {
  const rotateY = useSharedValue(-90);
  const translateX = useSharedValue(SCREEN_WIDTH);

  React.useEffect(() => {
    rotateY.value = withSpring(0, { damping: 20, stiffness: 100 });
    translateX.value = withSpring(0, { damping: 20, stiffness: 100 });
  }, [rotateY, translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value}deg` },
      { translateX: translateX.value },
    ],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, style]}>
      <Animated.View style={[animatedStyle, { flex: 1 }]}>
        {children}
      </Animated.View>
    </Animated.View>
  );
}

// Shared element transition helper
export function SharedElementTransition({
  children,
  sharedTransitionTag,
  style,
}: {
  children: React.ReactNode;
  sharedTransitionTag: string;
  style?: any;
}) {
  return (
    <Animated.View
      sharedTransitionTag={sharedTransitionTag}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </Animated.View>
  );
}

// Staggered children animation
export function StaggeredChildren({
  children,
  staggerDelay = 100,
  style,
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  style?: any;
}) {
  const childrenArray = React.Children.toArray(children);

  return (
    <View style={style}>
      {childrenArray.map((child, index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(index * staggerDelay).duration(300)}
          layout={Layout.springify()}
        >
          {child}
        </Animated.View>
      ))}
    </View>
  );
}
