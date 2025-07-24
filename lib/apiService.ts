import axios from 'axios';
import { Project, Task } from '../types/api';

const API_BASE_URL = 'http://localhost:5144/api';
const API_TIMEOUT = 5000;

// Configure axios for your API server
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Enhanced mock data for development/testing
const mockProjects: Project[] = [
  {
    id: 1,
    name: 'E-Commerce Platform',
    description: 'Building a modern e-commerce platform with React Native',
    createdUserId: 1,
    createdDate: new Date('2024-01-15').toISOString(),
    status: 'Active',
    dueDate: new Date('2024-06-30').toISOString(),
    priority: 'High'
  },
  {
    id: 2,
    name: 'Mobile Banking App',
    description: 'Secure mobile banking application with biometric authentication',
    createdUserId: 1,
    createdDate: new Date('2024-02-01').toISOString(),
    status: 'Active',
    dueDate: new Date('2024-08-15').toISOString(),
    priority: 'High'
  },
  {
    id: 3,
    name: 'Social Media Dashboard',
    description: 'Analytics dashboard for social media management',
    createdUserId: 1,
    createdDate: new Date('2024-01-10').toISOString(),
    status: 'Completed',
    dueDate: new Date('2024-03-30').toISOString(),
    priority: 'Medium'
  },
  {
    id: 4,
    name: 'Fitness Tracker',
    description: 'Personal fitness and health tracking application',
    createdUserId: 1,
    createdDate: new Date('2024-03-01').toISOString(),
    status: 'Planning',
    dueDate: new Date('2024-09-30').toISOString(),
    priority: 'Low'
  }
];

const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Design User Authentication Flow',
    description: 'Create wireframes and prototypes for user login and registration screens with social media integration',
    projectId: 1,
    priorityId: 3,
    authorId: 1,
    assignId: 1,
    estimatedTime: 8,
    dueDate: new Date('2024-07-30').toISOString(),
    createdUserId: 1,
    createdDate: new Date('2024-01-20').toISOString(),
    status: 'in_progress',
    tags: ['design', 'ux', 'authentication']
  },
  {
    id: 2,
    name: 'Implement Payment Gateway',
    description: 'Integrate Stripe payment system with proper error handling and security measures',
    projectId: 1,
    priorityId: 3,
    authorId: 1,
    assignId: 2,
    estimatedTime: 12,
    dueDate: new Date('2024-08-15').toISOString(),
    createdUserId: 1,
    createdDate: new Date('2024-01-25').toISOString(),
    status: 'pending',
    tags: ['backend', 'payment', 'security']
  },
  {
    id: 3,
    name: 'Setup Database Schema',
    description: 'Design and implement PostgreSQL database schema for user data and transactions',
    projectId: 1,
    priorityId: 3,
    authorId: 1,
    assignId: 1,
    estimatedTime: 6,
    dueDate: new Date('2024-07-20').toISOString(),
    createdUserId: 1,
    createdDate: new Date('2024-01-18').toISOString(),
    status: 'completed',
    tags: ['database', 'backend', 'postgresql']
  },
  {
    id: 4,
    name: 'Biometric Authentication',
    description: 'Implement fingerprint and face recognition for secure login',
    projectId: 2,
    priorityId: 3,
    authorId: 1,
    assignId: 3,
    estimatedTime: 16,
    dueDate: new Date('2024-08-30').toISOString(),
    createdUserId: 1,
    createdDate: new Date('2024-02-05').toISOString(),
    status: 'in_progress',
    tags: ['security', 'biometric', 'mobile']
  },
  {
    id: 5,
    name: 'Transaction History UI',
    description: 'Design and implement transaction history with filtering and search capabilities',
    projectId: 2,
    priorityId: 2,
    authorId: 1,
    assignId: 2,
    estimatedTime: 10,
    dueDate: new Date('2024-09-10').toISOString(),
    createdUserId: 1,
    createdDate: new Date('2024-02-10').toISOString(),
    status: 'pending',
    tags: ['ui', 'transactions', 'frontend']
  },
  {
    id: 6,
    name: 'Real-time Analytics',
    description: 'Implement real-time analytics dashboard with charts and metrics',
    projectId: 3,
    priorityId: 1,
    authorId: 1,
    assignId: 1,
    estimatedTime: 14,
    dueDate: new Date('2024-03-25').toISOString(),
    createdUserId: 1,
    createdDate: new Date('2024-01-12').toISOString(),
    status: 'completed',
    tags: ['analytics', 'dashboard', 'realtime']
  }
];

// Track if we should use mock data (when API is not available)
let useMockData = false;

export const apiService = {
  // Dashboard API
  async getDashboardStats(): Promise<any> {
    const projects = await this.getProjects();
    const tasks = await this.getTasks();
    
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'Active').length,
      completedProjects: projects.filter(p => p.status === 'Completed').length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      overdueTasks: tasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date() && t.status !== 'completed';
      }).length
    };

    return new Promise((resolve) => {
      setTimeout(() => resolve(stats), 300);
    });
  },

  // Projects API
  async getProjects(): Promise<Project[]> {
    if (useMockData) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockProjects), 500);
      });
    }

    try {
      const response = await apiClient.get('/project');
      return response.data as Project[];
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true;
      return mockProjects;
    }
  },

  async getProject(id: number): Promise<Project | null> {
    if (useMockData) {
      const project = mockProjects.find(p => p.id === id);
      return new Promise((resolve) => {
        setTimeout(() => resolve(project || null), 500);
      });
    }

    try {
      const response = await apiClient.get(`/project/${id}`);
      return response.data as Project;
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true;
      return mockProjects.find(p => p.id === id) || null;
    }
  },

  async createProject(projectData: Omit<Project, 'id' | 'createdDate'>): Promise<Project> {
    if (useMockData) {
      const newProject: Project = {
        ...projectData,
        id: Date.now(),
        createdDate: new Date().toISOString(),
      };
      mockProjects.push(newProject);
      return new Promise((resolve) => {
        setTimeout(() => resolve(newProject), 500);
      });
    }

    try {
      const response = await apiClient.post('/project', projectData);
      return response.data as Project;
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true;
      const newProject: Project = {
        ...projectData,
        id: Date.now(),
        createdDate: new Date().toISOString(),
      };
      mockProjects.push(newProject);
      return newProject;
    }
  },

  async updateProject(id: number, projectData: Partial<Project>): Promise<Project | null> {
    if (useMockData) {
      const projectIndex = mockProjects.findIndex(p => p.id === id);
      if (projectIndex !== -1) {
        mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...projectData };
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockProjects[projectIndex]), 500);
        });
      }
      return null;
    }

    try {
      const response = await apiClient.put(`/project/${id}`, projectData);
      return response.data as Project;
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true;
      const projectIndex = mockProjects.findIndex(p => p.id === id);
      if (projectIndex !== -1) {
        mockProjects[projectIndex] = { ...mockProjects[projectIndex], ...projectData };
        return mockProjects[projectIndex];
      }
      return null;
    }
  },

  async deleteProject(id: number): Promise<boolean> {
    if (useMockData) {
      const projectIndex = mockProjects.findIndex(p => p.id === id);
      if (projectIndex !== -1) {
        mockProjects.splice(projectIndex, 1);
        // Also delete related tasks
        const relatedTaskIndices = mockTasks.map((task, index) => 
          task.projectId === id ? index : -1
        ).filter(index => index !== -1).reverse();
        
        relatedTaskIndices.forEach(index => mockTasks.splice(index, 1));
        return true;
      }
      return false;
    }

    try {
      await apiClient.delete(`/project/${id}`);
      return true;
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true;
      const projectIndex = mockProjects.findIndex(p => p.id === id);
      if (projectIndex !== -1) {
        mockProjects.splice(projectIndex, 1);
        return true;
      }
      return false;
    }
  },

  // Tasks API
  async getTasks(projectId?: number): Promise<Task[]> {
    if (useMockData) {
      const filteredTasks = projectId 
        ? mockTasks.filter(t => t.projectId === projectId)
        : mockTasks;
      return new Promise((resolve) => {
        setTimeout(() => resolve(filteredTasks), 500);
      });
    }

    try {
      const url = projectId ? `/task?projectId=${projectId}` : '/task';
      const response = await axios.get(`${API_BASE_URL}${url}`, {
        timeout: API_TIMEOUT,
      });
      return response.data as Task[];
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true;
      return projectId 
        ? mockTasks.filter(t => t.projectId === projectId)
        : mockTasks;
    }
  },

  async getTask(id: number): Promise<Task | null> {
    if (useMockData) {
      const task = mockTasks.find(t => t.id === id);
      return new Promise((resolve) => {
        setTimeout(() => resolve(task || null), 500);
      });
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/task/${id}`, {
        timeout: API_TIMEOUT,
      });
      return response.data as Task;
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true;
      return mockTasks.find(t => t.id === id) || null;
    }
  },

  async createTask(taskData: Omit<Task, 'id' | 'createdDate'>): Promise<Task> {
    if (useMockData) {
      const newTask: Task = {
        ...taskData,
        id: Date.now(),
        createdDate: new Date().toISOString(),
      };
      mockTasks.push(newTask);
      return new Promise((resolve) => {
        setTimeout(() => resolve(newTask), 500);
      });
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/task`, taskData, {
        timeout: API_TIMEOUT,
      });
      return response.data as Task;
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true;
      const newTask: Task = {
        ...taskData,
        id: Date.now(),
        createdDate: new Date().toISOString(),
      };
      mockTasks.push(newTask);
      return newTask;
    }
  },

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | null> {
    if (useMockData) {
      const taskIndex = mockTasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...taskData };
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockTasks[taskIndex]), 500);
        });
      }
      return null;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/task/${id}`, taskData, {
        timeout: API_TIMEOUT,
      });
      return response.data as Task;
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true;
      const taskIndex = mockTasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...taskData };
        return mockTasks[taskIndex];
      }
      return null;
    }
  },

  // Delete a task
  async deleteTask(id: number): Promise<boolean> {
    console.log('deleteTask called with ID:', id);
    if (useMockData) {
      console.log('Using mock data for delete');
      const taskIndex = mockTasks.findIndex(t => t.id === id);
      console.log('Task index found:', taskIndex);
      if (taskIndex !== -1) {
        mockTasks.splice(taskIndex, 1);
        console.log('Task deleted from mock data. Remaining tasks:', mockTasks.length);
        return true;
      }
      console.log('Task not found in mock data');
      return false;
    }

    try {
      console.log('Attempting API delete for task ID:', id);
      await apiClient.delete(`/task/${id}`);
      console.log('API delete successful');
      return true;
    } catch (error) {
      console.warn('API not available, using mock data', error);
      useMockData = true;
      const taskIndex = mockTasks.findIndex(t => t.id === id);
      if (taskIndex !== -1) {
        mockTasks.splice(taskIndex, 1);
        console.log('Task deleted from mock data after API failure');
        return true;
      }
      console.log('Task not found in mock data after API failure');
      return false;
    }
  },

  // Search and Filter API
  async searchTasks(query: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(task => 
      task.name.toLowerCase().includes(query.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(query.toLowerCase())) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
    );
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(filteredTasks), 300);
    });
  },

  async getTasksByStatus(status: string): Promise<Task[]> {
    const tasks = await this.getTasks();
    return tasks.filter(task => task.status === status);
  },

  async getOverdueTasks(): Promise<Task[]> {
    const tasks = await this.getTasks();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== 'completed';
    });
  },

  // Utility function to check API status
  async checkApiStatus(): Promise<boolean> {
    try {
      await axios.get(`${API_BASE_URL}/health`, { timeout: 2000 });
      useMockData = false;
      return true;
    } catch {
      useMockData = true;
      return false;
    }
  },

  // Get current mode
  isUsingMockData(): boolean {
    return useMockData;
  },

  // Initialize mock data mode
  setMockDataMode(enabled: boolean): void {
    useMockData = enabled;
  }
};
