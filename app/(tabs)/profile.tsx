import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Header from '../../components/Header';
import { useTheme } from '../../contexts/ThemeContext';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') }
      ]
    );
  };

  const profileOptions = [
    { title: 'Edit Profile', icon: 'person-outline', onPress: () => console.log('Edit profile') },
    { title: 'Notifications', icon: 'notifications-outline', onPress: () => console.log('Notifications') },
    { title: 'Settings', icon: 'settings-outline', onPress: () => console.log('Settings') },
    { title: 'Help & Support', icon: 'help-circle-outline', onPress: () => console.log('Help') },
    { title: 'About', icon: 'information-circle-outline', onPress: () => console.log('About') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Profile" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={{ ...styles.header, backgroundColor: theme.colors.surface }} elevated padding="none">
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={theme.colors.primaryGradient as any}
              style={styles.avatarGradient}
            >
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color={theme.isDark ? theme.colors.text : '#fff'} />
              </View>
            </LinearGradient>
            <Text style={[styles.userName, { color: theme.colors.text }]}>John Doe</Text>
            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>john.doe@example.com</Text>
          </View>
        </Card>

        <Card style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.md }} elevated padding="none">
          <Text style={[styles.sectionTitle, { color: theme.colors.text, padding: theme.spacing.md, paddingBottom: 0 }]}>Account</Text>
          {profileOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.optionItem, 
                { borderBottomColor: theme.colors.border },
                index === profileOptions.length - 1 && { borderBottomWidth: 0 }
              ]} 
              onPress={option.onPress}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                <Ionicons name={option.icon as any} size={16} color={theme.colors.primary} />
              </View>
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{option.title}</Text>
              <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
        ))}
        </Card>

        <View style={{ marginHorizontal: theme.spacing.md, marginBottom: theme.spacing.xxl }}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            style={{ borderColor: theme.colors.error }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>PlannerApp v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    margin: 20,
    marginBottom: 16,
    borderRadius: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  avatarGradient: {
    borderRadius: 50,
    padding: 4,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    padding: 20,
    paddingBottom: 0,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  optionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  arrow: {
    fontSize: 18,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
