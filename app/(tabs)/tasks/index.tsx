import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiService } from '../../../lib/apiService';
import { Task } from '../../../types/api';

export default function TasksScreen() {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filterTasks = useCallback(() => {
    let filtered = tasks;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredTasks(filtered);
  }, [tasks, filterStatus, searchQuery]);

  const fetchTasks = useCallback(async () => {
    try {
      const tasksData = await apiService.getTasks();
      setTasks(tasksData);
      setFilteredTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const deleteTask = async (taskId: number, taskName: string) => {
    console.log('deleteTask called with:', { taskId, taskName });
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('Delete confirmed for task:', taskId);
            try {
              console.log('Calling apiService.deleteTask...');
              const success = await apiService.deleteTask(taskId);
              console.log('Delete result:', success);
              
              if (success) {
                console.log('Task deleted successfully, refreshing list...');
                // Refresh tasks list
                await fetchTasks();
                Alert.alert('Success', 'Task deleted successfully');
              } else {
                console.log('Delete failed, showing error');
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

  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [fetchTasks]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return theme.colors.success;
      case 'in_progress': return theme.colors.primary;
      case 'pending': return theme.colors.warning;
      default: return theme.colors.textSecondary;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    
    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    return isOverdue ? `${formatted} OVERDUE` : formatted;
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={[styles.taskCard, { backgroundColor: theme.colors.card }, theme.shadows.medium]}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => router.push(`/tasks/${item.id}` as any)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, { color: theme.colors.text }]} numberOfLines={2}>{item.name}</Text>
            {item.description && (
              <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                {item.description}
              </Text>
            )}
            <View style={styles.taskMeta}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priorityId) + '20' }]}>
                <Ionicons name="flag" size={12} color={getPriorityColor(item.priorityId)} />
              </View>
            </View>
          </View>
          <View style={styles.taskActions}>
            {item.dueDate && (
              <Text style={[styles.dueDate, { color: theme.colors.textSecondary }]}>{formatDate(item.dueDate)}</Text>
            )}
            <View style={styles.taskStats}>
              <Text style={[styles.projectId, { color: theme.colors.textSecondary }]}>Project {item.projectId}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.deleteButton, { borderLeftColor: theme.colors.border }]}
        onPress={() => deleteTask(item.id, item.name)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' }
  ];

  const getDynamicStyles = () => StyleSheet.create({
    taskCountText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginVertical: 10,
    },
    createButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  const dynamicStyles = getDynamicStyles();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle={theme.colors.statusBar} />
      <Header 
        title="Tasks" 
        rightButton={{
          icon: 'add-circle-outline',
          onPress: () => router.push('/tasks/create' as any)
        }}
      />
      
      {/* Search and Filters */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textSecondary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filtersContainer}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                filterStatus === filter.key && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
              ]}
              onPress={() => setFilterStatus(filter.key)}
            >
              <Text style={[
                styles.filterText,
                { color: theme.colors.text },
                filterStatus === filter.key && { color: theme.isDark ? theme.colors.text : '#ffffff' }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              {searchQuery || filterStatus !== 'all' ? 'No tasks found' : 'No tasks yet'}
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'
              }
            </Text>
            {!searchQuery && filterStatus === 'all' && (
              <TouchableOpacity 
                style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/tasks/create' as any)}
              >
                <Ionicons name="add" size={20} color="#ffffff" style={styles.createButtonIcon} />
                <Text style={dynamicStyles.createButtonText}>Create Task</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Task Count */}
      <View style={[styles.taskCount, { backgroundColor: theme.colors.surface, shadowColor: theme.isDark ? '#FFFFFF' : '#000000' }]}>
        <Text style={dynamicStyles.taskCountText}>
          {filteredTasks.length} of {tasks.length} tasks
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 20,
    paddingBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
    borderRadius: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingBottom: 80,
  },
  taskCard: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  taskContent: {
    flex: 1,
    padding: 20,
  },
  deleteButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityBadge: {
    padding: 6,
    borderRadius: 12,
  },
  taskActions: {
    alignItems: 'flex-end',
  },
  dueDate: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '500',
  },
  taskStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectId: {
    fontSize: 12,
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 8,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  taskCount: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
