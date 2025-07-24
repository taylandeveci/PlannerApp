import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { apiService } from '../../../lib/apiService';

export default function ProjectFormScreen() {
  const [projectData, setProjectData] = useState({
    name: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) {
      Alert.alert('Error', 'Project name cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const newProject = {
        name: projectData.name,
        createdUserId: 1, // Current user ID (should come from auth context)
        status: projectData.status,
      };

      await apiService.createProject(newProject);
      
      Alert.alert(
        'Success', 
        apiService.isUsingMockData() 
          ? 'Project created successfully (using mock data - API server not available)' 
          : 'Project created successfully'
      );
      router.back(); // Go back to projects list
    } catch (error: any) {
      console.error('Project creation error:', error);
      Alert.alert('Error', 'An unexpected error occurred while creating the project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Create Project" 
        rightButton={{
          icon: loading ? 'hourglass-outline' : 'checkmark',
          onPress: handleCreateProject,
        }}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter project name"
            value={projectData.name}
            onChangeText={(text) => setProjectData(prev => ({ ...prev, name: text }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.statusButtons}>
            {['Active', 'Inactive', 'Completed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  projectData.status === status && styles.selectedStatus
                ]}
                onPress={() => setProjectData(prev => ({ ...prev, status }))}
              >
                <Text style={[
                  styles.statusButtonText,
                  projectData.status === status && styles.selectedStatusText
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.createButton, loading && styles.disabledButton]}
          onPress={handleCreateProject}
          disabled={loading}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.createButtonText}>
            {loading ? 'Creating Project...' : 'Create Project'}
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
    fontSize: 14,
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
