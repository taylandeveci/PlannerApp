import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { apiService } from '../../../lib/apiService';
import { Task } from '../../../types/api';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTask = useCallback(async () => {
    try {
      const taskData = await apiService.getTask(parseInt(id as string));
      setTask(taskData);
    } catch (error) {
      console.error('Error fetching task:', error);
      Alert.alert('Error', 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const updateTaskStatus = async (newStatus: string) => {
    if (!task) return;

    try {
      const updatedTask = { ...task, status: newStatus };
      await apiService.updateTask(task.id, updatedTask);
      setTask(updatedTask);
      
      // Show status-specific success messages
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
      'Are you sure you want to delete this task?',
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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#757575';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Task Details" />
        <View style={styles.centered}>
          <Text>Loading task details...</Text>
        </View>
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Header title="Task Details" />
        <View style={styles.centered}>
          <Text>Task not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Task Details" 
        rightButton={{
          icon: 'refresh-outline',
          onPress: () => {
            setLoading(true);
            fetchTask();
          }
        }}
      />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>{task.name}</Text>
        
        <View style={styles.metaInfo}>
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { color: getStatusColor(task.status) }]}>
              {task.status}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getPriorityColor(`Priority ${task.priorityId}`) + '20' }]}>
            <Text style={[styles.badgeText, { color: getPriorityColor(`Priority ${task.priorityId}`) }]}>
              Priority {task.priorityId}
            </Text>
          </View>
        </View>

        {task.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        )}

        <View style={styles.detailsGrid}>
          {task.dueDate && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(task.dueDate).toLocaleDateString()}
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

          <View style={styles.detailItem}>
            <Ionicons name="folder-outline" size={20} color="#666" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>Project</Text>
              <Text style={styles.detailValue}>Project {task.projectId}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            {task.status !== 'pending' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                onPress={() => updateTaskStatus('pending')}
              >
                <Ionicons name="pause-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Mark Pending</Text>
              </TouchableOpacity>
            )}
            
            {task.status !== 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                onPress={() => updateTaskStatus('in_progress')}
              >
                <Ionicons name="play-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Start Task</Text>
              </TouchableOpacity>
            )}
            
            {task.status !== 'completed' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => updateTaskStatus('completed')}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Complete</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#6c757d' }]}
              onPress={() => router.push(`/tasks/edit/${task.id}` as any)}
            >
              <Ionicons name="pencil-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailsGrid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailText: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});
