import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Header from '../../../components/Header';
import { apiService } from '../../../lib/apiService';
import { Project } from '../../../types/api';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // For now, get all projects and find the specific one
        const projects = await apiService.getProjects();
        const foundProject = projects.find(p => p.id === parseInt(id as string));
        setProject(foundProject || null);
      } catch (error) {
        console.error('API Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Project Details" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading project...</Text>
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <Header title="Project Details" />
        <View style={styles.center}>
          <Text style={styles.errorText}>Project not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Project Details" />
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{project.name}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, { color: project.status === 'Active' ? '#4CAF50' : '#999' }]}>
              {project.status}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Created:</Text>
            <Text style={styles.value}>
              {new Date(project.createdDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Created by:</Text>
            <Text style={styles.value}>User ID: {project.createdUserId}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
});
