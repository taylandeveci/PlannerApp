import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { apiService } from '../../../lib/apiService';
import { Project, Task } from '../../../types/api';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
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
    console.log('Delete task button clicked for task ID:', id);
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
              console.log('Attempting to delete task with ID:', id);
              const success = await apiService.deleteTask(parseInt(id as string));
              console.log('Delete result:', success);
              if (success) {
                Alert.alert('Success', 'Task deleted successfully', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              } else {
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
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'pending': return '#FF9800';
      default: return '#757575';
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
      case 3: return '#F44336'; // High
      case 2: return '#FF9800'; // Medium
      case 1: return '#4CAF50'; // Low
      default: return '#757575';
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
      <View style={styles.container}>
        <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
        <Header title="Task Details" />
        <View style={styles.centered}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading task details...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
        <Header title="Task Details" />
        <View style={styles.centered}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#666" />
            <Text style={styles.errorText}>Task not found</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
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
        <View style={styles.headerCard}>
          <Text style={styles.title}>{task.name}</Text>
          
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
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        )}

        {/* Task Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Task Information</Text>
          
          {task.dueDate && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={[
                  styles.detailValue,
                  isOverdue(task.dueDate) && { color: '#F44336', fontWeight: 'bold' }
                ]}>
                  {formatDate(task.dueDate)}
                  {isOverdue(task.dueDate) && ' OVERDUE'}
                </Text>
              </View>
            </View>
          )}

          {task.estimatedTime && (
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Estimated Time</Text>
                <Text style={styles.detailValue}>{task.estimatedTime} hours</Text>
              </View>
            </View>
          )}

          <View style={styles.detailItem}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Assigned To</Text>
              <Text style={styles.detailValue}>User {task.assignId}</Text>
            </View>
          </View>

          {project && (
            <View style={styles.detailItem}>
              <Ionicons name="folder-outline" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Project</Text>
                <Text style={styles.detailValue}>{project.name}</Text>
              </View>
            </View>
          )}

          {task.completedDate && (
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Completed Date</Text>
                <Text style={styles.detailValue}>{formatDate(task.completedDate)}</Text>
              </View>
            </View>
          )}

          {task.tags && task.tags.length > 0 && (
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {task.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            {task.status !== 'pending' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.pendingButton]}
                onPress={() => updateTaskStatus('pending')}
              >
                <Ionicons name="pause-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Mark Pending</Text>
              </TouchableOpacity>
            )}
            
            {task.status !== 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.progressButton]}
                onPress={() => updateTaskStatus('in_progress')}
              >
                <Ionicons name="play-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Start Task</Text>
              </TouchableOpacity>
            )}
            
            {task.status !== 'completed' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => updateTaskStatus('completed')}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Complete</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => router.push(`/tasks/edit/${task.id}` as any)}
            >
              <Ionicons name="pencil-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={deleteTask}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Delete</Text>
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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  headerCard: {
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailText: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
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
  pendingButton: {
    backgroundColor: '#FF9800',
  },
  progressButton: {
    backgroundColor: '#2196F3',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#6c757d',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
