import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Header from '../../../components/Header';
import { useTheme } from '../../../contexts/ThemeContext';
import { apiService } from '../../../lib/apiService';
import { Project } from '../../../types/api';

export default function ProjectDetailScreen() {
  const { theme } = useTheme();
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Project Details" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading project...</Text>
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Project Details" />
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>Project not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Project Details" />
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{project.name}</Text>
          <View style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Status:</Text>
            <Text style={[styles.value, { color: project.status === 'Active' ? theme.colors.success : theme.colors.textSecondary }]}>
              {project.status}
            </Text>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Created:</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>
              {new Date(project.createdDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Created by:</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>User ID: {project.createdUserId}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
  },
});
