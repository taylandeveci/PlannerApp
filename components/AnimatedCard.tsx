import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Card from './Card';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  pressAnimationType?: 'scale' | 'opacity';
}

export default function AnimatedCard({
  children,
  onPress,
  style,
  pressAnimationType = 'opacity',
}: AnimatedCardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          pressAnimationType === 'scale' && pressed && { transform: [{ scale: 0.98 }] },
          pressAnimationType === 'opacity' && pressed && { opacity: 0.8 },
          style,
        ]}
      >
        <Card>{children}</Card>
      </Pressable>
    );
  }

  return (
    <Card style={style}>
      {children}
    </Card>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function StatCard({ title, value, icon, onPress, style }: StatCardProps) {
  const { theme } = useTheme();

  const content = (
    <View style={styles.statContent}>
      <View style={styles.statIcon}>
        {icon}
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statNumber, { color: theme.colors.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.8 }, style]}>
        <Card style={styles.statCard}>
          {content}
        </Card>
      </Pressable>
    );
  }

  return (
    <View style={style}>
      <Card style={styles.statCard}>
        {content}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    height: 80,
    justifyContent: 'center',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statIcon: {
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});
