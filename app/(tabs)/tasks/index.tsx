import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { apiService } from '../../../lib/apiService';
import { Task } from '../../../types/api';

export default function TasksScreen() {
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

  useEffect(() => {
    filterTasks();
  }, [filterTasks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, [fetchTasks]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#2196F3';
      case 'pending': return '#FF9800';
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
    const isOverdue = date < now;
    
    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    return isOverdue ? `${formatted} OVERDUE` : formatted;
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => router.push(`/tasks/${item.id}` as any)}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle} numberOfLines={2}>{item.name}</Text>
          {item.description && (
            <Text style={styles.taskDescription} numberOfLines={1}>
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
            <Text style={styles.dueDate}>{formatDate(item.dueDate)}</Text>
          )}
          <View style={styles.taskStats}>
            <Text style={styles.projectId}>Project {item.projectId}</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' }
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2196F3" barStyle="light-content" />
      <Header 
        title="Tasks" 
        rightButton={{
          icon: 'add-circle-outline',
          onPress: () => router.push('/tasks/create' as any)
        }}
      />
      
      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filtersContainer}>
          {statusFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                filterStatus === filter.key && styles.activeFilterButton
              ]}
              onPress={() => setFilterStatus(filter.key)}
            >
              <Text style={[
                styles.filterText,
                filterStatus === filter.key && styles.activeFilterText
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
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {searchQuery || filterStatus !== 'all' ? 'No tasks found' : 'No tasks yet'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first task to get started'
              }
            </Text>
            {!searchQuery && filterStatus === 'all' && (
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => router.push('/tasks/create' as any)}
              >
                <Ionicons name="add" size={20} color="#fff" style={styles.createButtonIcon} />
                <Text style={styles.createButtonText}>Create Task</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Task Count */}
      <View style={styles.taskCount}>
        <Text style={styles.taskCountText}>
          {filteredTasks.length} of {tasks.length} tasks
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: '#333',
    marginBottom: 4,
    lineHeight: 22,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
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
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  taskStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectId: {
    fontSize: 12,
    color: '#999',
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
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  taskCount: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskCountText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
