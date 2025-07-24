import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';
import { apiService } from '../../lib/apiService';

export default function CreateTaskScreen() {
  const router = useRouter();
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    projectId: 1, // Default project
    priorityId: 2, // Default priority (medium)
    authorId: 1, // Current user
    assignId: 1, // Assigned to current user
    estimatedTime: 0,
    dueDate: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);

  const createTask = async () => {
    if (!taskData.name.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    setLoading(true);
    try {
      await apiService.createTask({
        ...taskData,
        createdUserId: 1 // Current user
      });
      Alert.alert('Success', 'Task created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskData = (field: string, value: string | number) => {
    setTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Create Task" 
        rightButton={{
          icon: loading ? 'hourglass-outline' : 'checkmark',
          onPress: createTask,
        }}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter task name"
            value={taskData.name}
            onChangeText={(text) => updateTaskData('name', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter task description"
            value={taskData.description}
            onChangeText={(text) => updateTaskData('description', text)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Project ID</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={taskData.projectId.toString()}
              onChangeText={(text) => updateTaskData('projectId', parseInt(text) || 1)}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityButtons}>
              {[1, 2, 3].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    taskData.priorityId === priority && styles.selectedPriority
                  ]}
                  onPress={() => updateTaskData('priorityId', priority)}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    taskData.priorityId === priority && styles.selectedPriorityText
                  ]}>
                    {priority === 1 ? 'Low' : priority === 2 ? 'Med' : 'High'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Estimated Hours</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={taskData.estimatedTime.toString()}
              onChangeText={(text) => updateTaskData('estimatedTime', parseFloat(text) || 0)}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Assign To (User ID)</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={taskData.assignId.toString()}
              onChangeText={(text) => updateTaskData('assignId', parseInt(text) || 1)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD (optional)"
            value={taskData.dueDate}
            onChangeText={(text) => updateTaskData('dueDate', text)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusButtons}>
            {['pending', 'in_progress', 'completed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  taskData.status === status && styles.selectedStatus
                ]}
                onPress={() => updateTaskData('status', status)}
              >
                <Text style={[
                  styles.statusButtonText,
                  taskData.status === status && styles.selectedStatusText
                ]}>
                  {status.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={createTask}
          disabled={loading}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.createButtonText}>
            {loading ? 'Creating Task...' : 'Create Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 2,
    alignItems: 'center',
  },
  selectedPriority: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedPriorityText: {
    color: '#fff',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 2,
    alignItems: 'center',
  },
  selectedStatus: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  selectedStatusText: {
    color: '#fff',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
