import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';
import { apiService } from '../../lib/apiService';
import { DashboardStats, Project, Task } from '../../types/api';

export default function HomeScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [dashboardStats, tasks, projects] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getTasks(),
        apiService.getProjects()
      ]);
      
      setStats(dashboardStats);
      // Get 5 most recent tasks
      setRecentTasks(tasks.slice(0, 5));
      // Get 3 most recent projects
      setRecentProjects(projects.slice(0, 3));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'active': return '#4CAF50';
      case 'on_hold': return '#FF9800';
      case 'planning': return '#9C27B0';
      default: return '#757575';
    }
  };
  const getPriorityColor = (priorityId: number) => {
    switch (priorityId) {
      case 3: return '#F44336'; // High
      case 2: return '#FF9800'; // Medium
      case 1: return '#4CAF50'; // Low
      default: return '#757575';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderTaskItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => router.push(`/tasks/${item.id}` as any)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle} numberOfLines={1}>{item.name}</Text>
          <View style={styles.taskMeta}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priorityId) }]} />
          </View>
        </View>
        <View style={styles.taskActions}>
          {item.dueDate && (
            <Text style={styles.dueDate}>{formatDate(item.dueDate)}</Text>
          )}
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderProjectItem = ({ item }: { item: Project }) => (
    <TouchableOpacity
      style={styles.projectItem}
      onPress={() => router.push(`/projects/${item.id}` as any)}
    >
      <View style={styles.projectHeader}>
        <View style={styles.projectIcon}>
          <Ionicons name="folder" size={24} color={getStatusColor(item.status)} />
        </View>
        <View style={styles.projectInfo}>
          <Text style={styles.projectTitle} numberOfLines={1}>{item.name}</Text>
          <View style={styles.projectMeta}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.projectStatus}>{item.status.replace('_', ' ')}</Text>
          </View>
          {item.dueDate && (
            <Text style={styles.projectDate}>Due: {formatDate(item.dueDate)}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
        <Header title="Dashboard" />
        <View style={styles.centered}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <Header 
        title="Dashboard" 
        rightButton={{
          icon: 'add-circle-outline',
          onPress: () => router.push('/tasks/create' as any)
        }}
      />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={[styles.statCard, styles.projectCard]}
              onPress={() => router.push('/projects' as any)}
            >
              <View style={styles.statIcon}>
                <Ionicons name="folder-outline" size={28} color="#2196F3" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>{stats?.totalProjects || 0}</Text>
                <Text style={styles.statLabel}>Projects</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.statCard, styles.taskCard]}
              onPress={() => router.push('/tasks' as any)}
            >
              <View style={styles.statIcon}>
                <Ionicons name="list-outline" size={28} color="#4CAF50" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>{stats?.totalTasks || 0}</Text>
                <Text style={styles.statLabel}>Total Tasks</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.statCard, styles.completedCard]}
              onPress={() => router.push('/tasks' as any)}
            >
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle-outline" size={28} color="#4CAF50" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>{stats?.completedTasks || 0}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.statCard, styles.pendingCard]}
              onPress={() => router.push('/tasks' as any)}
            >
              <View style={styles.statIcon}>
                <Ionicons name="time-outline" size={28} color="#FF9800" />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statNumber}>{stats?.pendingTasks || 0}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Tasks</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/tasks' as any)}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color="#2196F3" />
            </TouchableOpacity>
          </View>
          
          {recentTasks.length > 0 ? (
            <FlatList
              data={recentTasks}
              renderItem={renderTaskItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No tasks yet</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => router.push('/tasks/create' as any)}
              >
                <Text style={styles.createButtonText}>Create Your First Task</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent Projects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Projects</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/projects' as any)}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color="#2196F3" />
            </TouchableOpacity>
          </View>
          
          {recentProjects.length > 0 ? (
            <FlatList
              data={recentProjects}
              renderItem={renderProjectItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No projects yet</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => router.push('/projects/create' as any)}
              >
                <Text style={styles.createButtonText}>Create Your First Project</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => router.push('/tasks/create' as any)}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.quickActionText}>New Task</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.projectActionButton]}
              onPress={() => router.push('/projects/create' as any)}
            >
              <Ionicons name="folder-open" size={24} color="#fff" />
              <Text style={styles.quickActionText}>New Project</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.searchActionButton]}
              onPress={() => router.push('/search' as any)}
            >
              <Ionicons name="search" size={24} color="#fff" />
              <Text style={styles.quickActionText}>Search</Text>
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
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    minHeight: 80,
  },
  projectCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  taskCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  statIcon: {
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginRight: 4,
  },
  taskItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  taskActions: {
    alignItems: 'flex-end',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  projectItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIcon: {
    marginRight: 12,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectStatus: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  projectDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#2196F3',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 10,
  },
  projectActionButton: {
    backgroundColor: '#4CAF50',
  },
  searchActionButton: {
    backgroundColor: '#FF9800',
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
