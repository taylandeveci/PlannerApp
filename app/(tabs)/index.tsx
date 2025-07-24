import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiService } from '../../lib/apiService';

export default function DashboardScreen() {
  const router = useRouter();
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [tasksCount, setTasksCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch projects and tasks count
      const [projects, tasks] = await Promise.all([
        apiService.getProjects(),
        apiService.getTasks()
      ]);
      
      setProjectsCount(projects.length);
      setTasksCount(tasks.length);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load data');
      // Keep counts at 0 if there's an error
    } finally {
      setLoading(false);
    }
  };
  
  const quickActions = [
    { 
      title: 'Create Project', 
      icon: 'add-circle', 
      color: '#4CAF50',
      action: () => router.push('/projects/create' as any) 
    },
    { 
      title: 'View Projects', 
      icon: 'folder', 
      color: '#2196F3',
      action: () => router.push('/(tabs)/projects' as any) 
    },
    { 
      title: 'My Tasks', 
      icon: 'checkmark-circle', 
      color: '#FF9800',
      action: () => router.push('/(tabs)/tasks' as any) 
    },
    { 
      title: 'Create Task', 
      icon: 'add', 
      color: '#9C27B0',
      action: () => router.push('/tasks/create' as any) 
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>Your productivity overview</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchDashboardData}
            disabled={loading}
          >
            <Ionicons 
              name="refresh" 
              size={20} 
              color={loading ? "#ccc" : "#666"} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.actionsContainer}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.actionCard, { backgroundColor: action.color }]} 
              onPress={action.action}
              activeOpacity={0.8}
            >
              <Ionicons name={action.icon as any} size={28} color="#fff" />
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchDashboardData} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push('/(tabs)/projects')}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#2196F3" />
              ) : (
                <Text style={styles.statNumber}>{projectsCount}</Text>
              )}
              <Text style={styles.statLabel}>Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push('/(tabs)/tasks')}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#FF9800" />
              ) : (
                <Text style={styles.statNumber}>{tasksCount}</Text>
              )}
              <Text style={styles.statLabel}>Tasks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  actionText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#d63384',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#d63384',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
