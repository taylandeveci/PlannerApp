import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AnimatedCard, { StatCard } from '../../components/AnimatedCard';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Header from '../../components/Header';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService, setDashboardRefreshCallback } from '../../lib/apiService';
import { DashboardStats, Project, Task } from '../../types/api';

export default function HomeScreen() {
  const { theme, toggleTheme, isDarkMode } = useTheme();
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
      setRecentTasks(tasks.slice(0, 5));
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
    setDashboardRefreshCallback(() => {
      fetchDashboardData();
    });
    
    return () => {
      setDashboardRefreshCallback(() => {});
    };
  }, [fetchDashboardData]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'in_progress': return theme.colors.warning;
      case 'pending': return theme.colors.info;
      default: return theme.colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.colors.statusBar} />
      <Header 
        title="Dashboard" 
        rightButton={{
          icon: isDarkMode ? 'sunny-outline' : 'moon-outline',
          onPress: toggleTheme,
        }}
      />
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={[styles.section, { marginBottom: theme.spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>
            Quick Stats
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Projects"
              value={stats?.totalProjects || 0}
              icon={<Ionicons name="folder-outline" size={24} color={theme.colors.primary} />}
              onPress={() => router.push('/(tabs)/projects')}
              style={styles.statCard}
            />

            <StatCard
              title="Tasks"
              value={stats?.totalTasks || 0}
              icon={<Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.success} />}
              onPress={() => router.push('/(tabs)/tasks')}
              style={styles.statCard}
            />
          </View>

          <View style={styles.statsGrid}>
            <StatCard
              title="Pending"
              value={stats?.pendingTasks || 0}
              icon={<Ionicons name="time-outline" size={24} color={theme.colors.warning} />}
              style={styles.statCard}
            />

            <StatCard
              title="Overdue"
              value={stats?.overdueTasks || 0}
              icon={<Ionicons name="alert-circle-outline" size={24} color={theme.colors.error} />}
              style={styles.statCard}
            />
          </View>
        </View>

        {/* Recent Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Tasks</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTasks.length > 0 ? (
            <View style={styles.tasksList}>
              {recentTasks.map((task) => (
                <AnimatedCard
                  key={task.id}
                  onPress={() => router.push(`/(tabs)/tasks/${task.id}`)}
                  style={{ marginBottom: theme.spacing.sm }}
                  pressAnimationType="scale"
                >
                  <View style={styles.taskItem}>
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {task.name}
                      </Text>
                      <View style={styles.taskMeta}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                          <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                            {task.status.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                        {task.dueDate && (
                          <Text style={[styles.taskDue, { color: theme.colors.textSecondary }]}>
                            {formatDate(task.dueDate)}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                  </View>
                </AnimatedCard>
              ))}
            </View>
          ) : (
            <Card padding="large">
              <View style={styles.emptyState}>
                <Ionicons name="clipboard-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No tasks yet
                </Text>
                <Button
                  title="Create Task"
                  onPress={() => router.push('/(tabs)/tasks/create')}
                  size="small"
                  style={{ marginTop: theme.spacing.md }}
                />
              </View>
            </Card>
          )}
        </View>

        {/* Recent Projects */}
        <View style={[styles.section, { marginTop: theme.spacing.lg }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Projects</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/projects')}>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentProjects.length > 0 ? (
            <View style={styles.projectsList}>
              {recentProjects.map((project) => (
                <AnimatedCard
                  key={project.id}
                  onPress={() => router.push(`/(tabs)/projects/${project.id}`)}
                  style={{ marginBottom: theme.spacing.sm }}
                  pressAnimationType="scale"
                >
                  <View style={styles.projectItem}>
                    <View style={styles.projectIcon}>
                      <Ionicons name="folder" size={24} color={getStatusColor(project.status)} />
                    </View>
                    <View style={styles.projectContent}>
                      <Text style={[styles.projectTitle, { color: theme.colors.text }]} numberOfLines={1}>
                        {project.name}
                      </Text>
                      <View style={styles.projectMeta}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(project.status) }]} />
                        <Text style={[styles.projectStatus, { color: theme.colors.textSecondary }]}>
                          {project.status.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                  </View>
                </AnimatedCard>
              ))}
            </View>
          ) : (
            <Card padding="large">
              <View style={styles.emptyState}>
                <Ionicons name="folder-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No projects yet
                </Text>
                <Button
                  title="Create Project"
                  onPress={() => router.push('/(tabs)/projects/create')}
                  size="small"
                  style={{ marginTop: theme.spacing.md }}
                />
              </View>
            </Card>
          )}
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { marginTop: theme.spacing.lg, marginBottom: theme.spacing.xxl }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: theme.spacing.md }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <Button
              title="New Task"
              onPress={() => router.push('/(tabs)/tasks/create')}
              style={styles.actionButton}
              size="large"
            />
            <Button
              title="New Project"
              onPress={() => router.push('/(tabs)/projects/create')}
              variant="outline"
              style={styles.actionButton}
              size="large"
            />
          </View>
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
  section: {
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
  tasksList: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  taskDue: {
    fontSize: 12,
  },
  projectsList: {
    marginTop: 8,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectIcon: {
    marginRight: 12,
  },
  projectContent: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  projectStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  quickActions: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
