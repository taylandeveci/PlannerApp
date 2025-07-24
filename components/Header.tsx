import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HeaderProps {
  title: string;
  rightButton?: {
    icon: string;
    onPress: () => void;
  };
}

export default function Header({ title, rightButton }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      
      <Text style={styles.title}>{title}</Text>
      
      {rightButton && (
        <TouchableOpacity onPress={rightButton.onPress}>
          <Ionicons name={rightButton.icon as any} size={24} color="#000" />
        </TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
});
