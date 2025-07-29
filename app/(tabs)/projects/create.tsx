import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiService } from '../../../lib/apiService';

export default function ProjectFormScreen() {
  const [projectData, setProjectData] = useState({
    name: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title="Create Project" 
        rightButton={{
          icon: loading ? 'hourglass-outline' : 'checkmark',
          onPress: handleCreateProject,
        }}
      />
      
      <ScrollView style={[styles.content, { backgroundColor: theme.colors.background }]}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Project Name *</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border
            }]}
            placeholder="Enter project name"
            placeholderTextColor={theme.colors.textSecondary}
            value={projectData.name}
            onChangeText={(text) => setProjectData(prev => ({ ...prev, name: text }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Status</Text>
          <View style={styles.statusButtons}>
            {['Active', 'Inactive', 'Completed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  { 
                    backgroundColor: projectData.status === status ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border 
                  }
                ]}
                onPress={() => setProjectData(prev => ({ ...prev, status }))}
              >
                <Text style={[
                  styles.statusButtonText,
                  { 
                    color: projectData.status === status ? '#fff' : theme.colors.text 
                  }
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.createButton, 
            { backgroundColor: loading ? theme.colors.textSecondary : theme.colors.primary },
            loading && styles.disabledButton
          ]}
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
    fontSize: 14,
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
  disabledButton: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
