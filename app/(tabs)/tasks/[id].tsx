import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiService } from '../../../lib/apiService';
import { Project, Task } from '../../../types/api';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTaskData = useCallback(async () => {
    try {
      const taskData = await apiService.getTask(parseInt(id as string));
      setTask(taskData);
      
      // Fetch project details if task is found
      if (taskData?.projectId) {
        const projectData = await apiService.getProject(taskData.projectId);
        setProject(projectData);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTaskData();
  }, [fetchTaskData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTaskData();
  }, [fetchTaskData]);

  const updateTaskStatus = async (newStatus: string) => {
    if (!task) return;

    try {
      const updatedTask = { 
        ...task, 
        status: newStatus,
        completedDate: newStatus === 'completed' ? new Date().toISOString() : undefined
      };
      await apiService.updateTask(task.id, updatedTask);
      setTask(updatedTask);
      
      // Show status-specific success messages with emojis
      let message = 'Task status updated';
      switch (newStatus) {
        case 'pending':
          message = 'Task marked as pending';
          break;
        case 'in_progress':
          message = 'Task started successfully';
          break;
        case 'completed':
          message = 'Congratulations! Task completed';
          break;
      }
      
      Alert.alert('Success', message);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task status. Please try again.');
    }
  };

  const deleteTask = async () => {
    console.log('=== TASK DETAILS DELETE START ===');
    console.log('Delete task button clicked for task ID:', id);
    console.log('Task ID type:', typeof id);
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('User confirmed delete');
              console.log('Attempting to delete task with ID:', id);
              console.log('Converting ID to number:', parseInt(id as string));
              const success = await apiService.deleteTask(parseInt(id as string));
              console.log('Delete result from apiService:', success);
              if (success) {
                console.log('Delete successful, showing success alert');
                Alert.alert('Success', 'Task deleted successfully', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              } else {
                console.log('Delete failed, showing error alert');
                Alert.alert('Error', 'Failed to delete task');
              }
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return theme.colors.success;
      case 'in_progress': return theme.colors.primary;
      case 'pending': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'checkmark-circle';
      case 'in_progress': return 'play-circle';
      case 'pending': return 'pause-circle';
      default: return 'help-circle';
    }
  };

  const getPriorityColor = (priorityId: number) => {
    switch (priorityId) {
      case 3: return theme.colors.error; // High
      case 2: return theme.colors.warning; // Medium
      case 1: return theme.colors.success; // Low
      default: return theme.colors.textSecondary;
    }
  };

  const getPriorityLabel = (priorityId: number) => {
    switch (priorityId) {
      case 3: return 'High Priority';
      case 2: return 'Medium Priority';
      case 1: return 'Low Priority';
      default: return 'Unknown Priority';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && task?.status !== 'completed';
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar backgroundColor={theme.colors.primary} barStyle={theme.colors.statusBar} />
        <Header title="Task Details" />
        <View style={styles.centered}>
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading task details...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar backgroundColor={theme.colors.primary} barStyle={theme.colors.statusBar} />
        <Header title="Task Details" />
        <View style={styles.centered}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.errorText, { color: theme.colors.text }]}>Task not found</Text>
            <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.colors.primary }]} onPress={() => router.back()}>
              <Text style={[styles.backButtonText, { color: theme.isDark ? theme.colors.text : '#ffffff' }]}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={theme.colors.statusBar} />
      <Header 
        title="Task Details" 
        rightButton={{
          icon: 'refresh-outline',
          onPress: onRefresh
        }}
      />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Task Header */}
        <View style={[styles.headerCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{task.name}</Text>
          
          <View style={styles.metaInfo}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
              <Ionicons 
                name={getStatusIcon(task.status)} 
                size={16} 
                color={getStatusColor(task.status)} 
                style={styles.badgeIcon}
              />
              <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>
                {task.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priorityId) + '20' }]}>
              <Ionicons 
                name="flag" 
                size={14} 
                color={getPriorityColor(task.priorityId)} 
                style={styles.badgeIcon}
              />
              <Text style={[styles.priorityText, { color: getPriorityColor(task.priorityId) }]}>
                {getPriorityLabel(task.priorityId)}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {task.description && (
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{task.description}</Text>
          </View>
        )}

        {/* Task Details */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Task Information</Text>
          
          {task.dueDate && (
            <View style={[styles.detailItem, { borderBottomColor: theme.colors.border }]}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Due Date</Text>
                <Text style={[
                  styles.detailValue,
                  { color: theme.colors.text },
                  isOverdue(task.dueDate) && { color: theme.colors.error, fontWeight: 'bold' }
                ]}>
                  {formatDate(task.dueDate)}
                  {isOverdue(task.dueDate) && ' OVERDUE'}
                </Text>
              </View>
            </View>
          )}

          {task.estimatedTime && (
            <View style={[styles.detailItem, { borderBottomColor: theme.colors.border }]}>
              <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Estimated Time</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{task.estimatedTime} hours</Text>
              </View>
            </View>
          )}

          <View style={[styles.detailItem, { borderBottomColor: theme.colors.border }]}>
            <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
            <View style={styles.detailText}>
              <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Assigned To</Text>
              <Text style={[styles.detailValue, { color: theme.colors.text }]}>User {task.assignId}</Text>
            </View>
          </View>

          {project && (
            <View style={[styles.detailItem, { borderBottomColor: theme.colors.border }]}>
              <Ionicons name="folder-outline" size={20} color={theme.colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Project</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{project.name}</Text>
              </View>
            </View>
          )}

          {task.completedDate && (
            <View style={[styles.detailItem, { borderBottomColor: theme.colors.border }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.success} />
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Completed Date</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{formatDate(task.completedDate)}</Text>
              </View>
            </View>
          )}

          {task.tags && task.tags.length > 0 && (
            <View style={[styles.detailItem, { borderBottomColor: theme.colors.border }]}>
              <Ionicons name="pricetag-outline" size={20} color={theme.colors.textSecondary} />
              <View style={styles.detailText}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {task.tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            {task.status !== 'pending' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
                onPress={() => updateTaskStatus('pending')}
              >
                <Ionicons name="pause-circle-outline" size={20} color={theme.isDark ? theme.colors.text : '#ffffff'} />
                <Text style={[styles.actionButtonText, { color: theme.isDark ? theme.colors.text : '#ffffff' }]}>Mark Pending</Text>
              </TouchableOpacity>
            )}
            
            {task.status !== 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => updateTaskStatus('in_progress')}
              >
                <Ionicons name="play-circle-outline" size={20} color={theme.isDark ? theme.colors.text : '#ffffff'} />
                <Text style={[styles.actionButtonText, { color: theme.isDark ? theme.colors.text : '#ffffff' }]}>Start Task</Text>
              </TouchableOpacity>
            )}
            
            {task.status !== 'completed' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
                onPress={() => updateTaskStatus('completed')}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.isDark ? theme.colors.text : '#ffffff'} />
                <Text style={[styles.actionButtonText, { color: theme.isDark ? theme.colors.text : '#ffffff' }]}>Complete</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.textSecondary }]}
              onPress={() => router.push(`/tasks/edit/${task.id}` as any)}
            >
              <Ionicons name="pencil-outline" size={20} color={theme.isDark ? theme.colors.text : '#ffffff'} />
              <Text style={[styles.actionButtonText, { color: theme.isDark ? theme.colors.text : '#ffffff' }]}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
              onPress={deleteTask}
            >
              <Ionicons name="trash-outline" size={20} color={theme.isDark ? theme.colors.text : '#ffffff'} />
              <Text style={[styles.actionButtonText, { color: theme.isDark ? theme.colors.text : '#ffffff' }]}>Delete</Text>
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
    marginTop: 10,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 30,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  detailText: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
    flex: 1,
    maxWidth: '48%',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
