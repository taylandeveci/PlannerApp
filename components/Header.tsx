import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  title: string;
  leftButton?: {
    icon: string;
    onPress: () => void;
  };
  rightButton?: {
    icon: string;
    onPress: () => void;
  };
  showBackButton?: boolean;
}

export default function Header({ title, leftButton, rightButton, showBackButton = true }: HeaderProps) {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      {leftButton ? (
        <TouchableOpacity onPress={leftButton.onPress}>
          <Ionicons name={leftButton.icon as any} size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : showBackButton ? (
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
      
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      
      {rightButton ? (
        <TouchableOpacity onPress={rightButton.onPress}>
          <Ionicons name={rightButton.icon as any} size={24} color={theme.colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});
