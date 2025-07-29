import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiService } from '../../../lib/apiService';
import { Project, User } from '../../../types/api';

export default function CreateTaskScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    projectId: '', // Empty initially to show placeholder
    priorityId: 2, // Default priority (medium)
    authorId: 1, // Current user
    assignId: '', // Empty initially to show placeholder
    estimatedTime: 0,
    dueDate: '',
    status: 'pending'
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    projectId: '',
    assignId: '',
    dueDate: ''
  });

  // Fetch projects and users on component mount
  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const fetchedProjects = await apiService.getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to fetch projects');
    } finally {
      setProjectsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const fetchedUsers = await apiService.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    updateTaskData('projectId', project.id.toString());
    setShowProjectPicker(false);
    if (errors.projectId) clearError('projectId');
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    updateTaskData('assignId', user.id.toString());
    setShowUserPicker(false);
    if (errors.assignId) clearError('assignId');
  };

  const validateDueDate = (date: string) => {
    if (!date) return true; // Optional field
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  };

  const clearError = (field: string) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const createTask = async () => {
    // Clear previous errors
    setErrors({
      name: '',
      projectId: '',
      assignId: '',
      dueDate: ''
    });

    let hasError = false;

    if (!taskData.name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Task name is required' }));
      hasError = true;
    }

    if (!taskData.projectId || parseInt(taskData.projectId.toString()) < 1) {
      setErrors(prev => ({ ...prev, projectId: 'Please select a project' }));
      hasError = true;
    }

    if (!taskData.assignId || parseInt(taskData.assignId.toString()) < 1) {
      setErrors(prev => ({ ...prev, assignId: 'Please select a user to assign the task' }));
      hasError = true;
    }

    if (taskData.dueDate && !validateDueDate(taskData.dueDate)) {
      setErrors(prev => ({ ...prev, dueDate: 'Please enter date in YYYY-MM-DD format' }));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      await apiService.createTask({
        ...taskData,
        projectId: parseInt(taskData.projectId.toString()) || 1,
        assignId: parseInt(taskData.assignId.toString()) || 1,
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title="Create Task" 
        rightButton={{
          icon: loading ? 'hourglass-outline' : 'checkmark',
          onPress: createTask,
        }}
      />
      
      <ScrollView style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Task Name *</Text>
          <TextInput
            style={[
              styles.input, 
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
              errors.name && { borderColor: theme.colors.error, borderWidth: 2 }
            ]}
            placeholder="Enter task name"
            placeholderTextColor={theme.colors.textSecondary}
            value={taskData.name}
            onChangeText={(text) => {
              updateTaskData('name', text);
              if (errors.name) clearError('name');
            }}
          />
          {errors.name ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.name}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.input, 
              styles.textArea,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }
            ]}
            placeholder="Enter task description"
            placeholderTextColor={theme.colors.textSecondary}
            value={taskData.description}
            onChangeText={(text) => updateTaskData('description', text)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Project *</Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dropdown,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                errors.projectId && { borderColor: theme.colors.error, borderWidth: 2 }
              ]}
              onPress={() => setShowProjectPicker(true)}
              disabled={projectsLoading}
            >
              <Text style={[
                styles.dropdownText,
                { color: selectedProject ? theme.colors.text : theme.colors.textSecondary }
              ]}>
                {projectsLoading 
                  ? 'Loading projects...' 
                  : selectedProject 
                    ? selectedProject.name 
                    : 'Select a project'
                }
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
            {errors.projectId ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.projectId}</Text> : null}
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Priority</Text>
            <View style={styles.priorityButtons}>
              {[1, 2, 3].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    taskData.priorityId === priority && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                  ]}
                  onPress={() => updateTaskData('priorityId', priority)}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    { color: theme.colors.text },
                    taskData.priorityId === priority && { color: theme.isDark ? theme.colors.text : '#ffffff' }
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
            <Text style={[styles.label, { color: theme.colors.text }]}>Estimated Hours</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }
              ]}
              placeholder="0"
              placeholderTextColor={theme.colors.textSecondary}
              value={taskData.estimatedTime.toString()}
              onChangeText={(text) => {
                // Only allow numbers and decimal point
                const filteredText = text.replace(/[^0-9.]/g, '');
                // Prevent multiple decimal points
                const parts = filteredText.split('.');
                if (parts.length > 2) {
                  return; // Don't update if more than one decimal point
                }
                updateTaskData('estimatedTime', parseFloat(filteredText) || 0);
              }}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Assign To *</Text>
            <TouchableOpacity
              style={[
                styles.input,
                styles.dropdown,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                errors.assignId && { borderColor: theme.colors.error, borderWidth: 2 }
              ]}
              onPress={() => setShowUserPicker(true)}
              disabled={usersLoading}
            >
              <Text style={[
                styles.dropdownText,
                { color: selectedUser ? theme.colors.text : theme.colors.textSecondary }
              ]}>
                {usersLoading 
                  ? 'Loading users...' 
                  : selectedUser 
                    ? selectedUser.name 
                    : 'Select a user'
                }
              </Text>
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
            {errors.assignId ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.assignId}</Text> : null}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Due Date</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text },
              errors.dueDate && { borderColor: theme.colors.error, borderWidth: 2 }
            ]}
            placeholder="YYYY-MM-DD (optional)"
            placeholderTextColor={theme.colors.textSecondary}
            value={taskData.dueDate}
            onChangeText={(text) => {
              // Only allow numbers and hyphens
              const filteredText = text.replace(/[^0-9-]/g, '');
              updateTaskData('dueDate', filteredText);
              if (errors.dueDate) clearError('dueDate');
            }}
            keyboardType="numeric"
          />
          {errors.dueDate ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.dueDate}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Status</Text>
          <View style={styles.statusButtons}>
            {['pending', 'in_progress', 'completed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  taskData.status === status && { backgroundColor: theme.colors.success, borderColor: theme.colors.success }
                ]}
                onPress={() => updateTaskData('status', status)}
              >
                <Text style={[
                  styles.statusButtonText,
                  { color: theme.colors.text },
                  taskData.status === status && { color: theme.isDark ? theme.colors.text : '#ffffff' }
                ]}>
                  {status.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.createButton,
            { backgroundColor: theme.colors.primary },
            loading && { backgroundColor: theme.colors.textSecondary }
          ]}
          onPress={createTask}
          disabled={loading}
        >
          <Ionicons name="add-circle-outline" size={20} color={theme.isDark ? theme.colors.text : '#ffffff'} />
          <Text style={[styles.createButtonText, { color: theme.isDark ? theme.colors.text : '#ffffff' }]}>
            {loading ? 'Creating Task...' : 'Create Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Project Picker Modal */}
      <Modal
        visible={showProjectPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProjectPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Project</Text>
              <TouchableOpacity
                onPress={() => setShowProjectPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={projects}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.projectItem,
                    { borderBottomColor: theme.colors.border },
                    selectedProject?.id === item.id && { backgroundColor: theme.colors.primary + '20' }
                  ]}
                  onPress={() => selectProject(item)}
                >
                  <View style={styles.projectInfo}>
                    <Text style={[styles.projectName, { color: theme.colors.text }]}>
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text style={[styles.projectDescription, { color: theme.colors.textSecondary }]}>
                        {item.description}
                      </Text>
                    )}
                    <Text style={[styles.projectStatus, { color: theme.colors.textSecondary }]}>
                      Status: {item.status}
                    </Text>
                  </View>
                  {selectedProject?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                    No projects available
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* User Picker Modal */}
      <Modal
        visible={showUserPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUserPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select User</Text>
              <TouchableOpacity
                onPress={() => setShowUserPicker(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={users}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.projectItem,
                    { borderBottomColor: theme.colors.border },
                    selectedUser?.id === item.id && { backgroundColor: theme.colors.primary + '20' }
                  ]}
                  onPress={() => selectUser(item)}
                >
                  <View style={styles.projectInfo}>
                    <Text style={[styles.projectName, { color: theme.colors.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.projectDescription, { color: theme.colors.textSecondary }]}>
                      {item.email}
                    </Text>
                    {item.role && (
                      <Text style={[styles.projectStatus, { color: theme.colors.textSecondary }]}>
                        Role: {item.role}
                      </Text>
                    )}
                  </View>
                  {selectedUser?.id === item.id && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                    No users available
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
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
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 5,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  projectStatus: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
