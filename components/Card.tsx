import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  elevated?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Card({
  children,
  style,
  gradient = false,
  elevated = false,
  padding = 'medium',
}: CardProps) {
  const { theme } = useTheme();

  const paddingStyle = {
    none: {},
    small: { padding: theme.spacing.sm },
    medium: { padding: theme.spacing.md },
    large: { padding: theme.spacing.lg },
  };

  const cardStyle = [
    styles.card,
    {
      borderRadius: theme.borderRadius.large,
      backgroundColor: theme.colors.surface,
    },
    elevated ? theme.shadows.elevated : theme.shadows.medium,
    paddingStyle[padding],
    style,
  ];

  if (gradient) {
    return (
      <View style={[cardStyle, { backgroundColor: 'transparent', padding: 0 }]}>
        <LinearGradient
          colors={theme.colors.primaryGradient as any}
          style={[
            styles.gradientCard,
            {
              borderRadius: theme.borderRadius.large,
              ...paddingStyle[padding],
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  gradientCard: {
    flex: 1,
  },
});
