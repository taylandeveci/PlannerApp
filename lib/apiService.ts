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

// Mock data for development/testing
const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Sample Project 1',
    createdUserId: 1,
    createdDate: new Date().toISOString(),
    status: 'Active'
  },
  {
    id: 2,
    name: 'Sample Project 2',
    createdUserId: 1,
    createdDate: new Date().toISOString(),
    status: 'Completed'
  }
];

const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Sample Task 1',
    description: 'This is a sample task for testing',
    projectId: 1,
    priorityId: 2,
    authorId: 1,
    assignId: 1,
    estimatedTime: 5,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdUserId: 1,
    createdDate: new Date().toISOString(),
    status: 'pending'
  },
  {
    id: 2,
    name: 'Sample Task 2',
    description: 'Another sample task',
    projectId: 1,
    priorityId: 1,
    authorId: 1,
    assignId: 1,
    estimatedTime: 3,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdUserId: 1,
    createdDate: new Date().toISOString(),
    status: 'in_progress'
  }
];

// Track if we should use mock data (when API is not available)
let useMockData = false;

export const apiService = {
  // Projects API
  async getProjects(): Promise<Project[]> {
    if (useMockData) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockProjects), 500); // Simulate network delay
      });
    }

    try {
      const response = await apiClient.get('/project');
      return response.data as Project[];
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true; // Switch to mock data for subsequent calls
      return mockProjects;
    }
  },

  async createProject(projectData: Omit<Project, 'id' | 'createdDate'>): Promise<Project> {
    if (useMockData) {
      const newProject: Project = {
        ...projectData,
        id: Date.now(), // Use timestamp as ID
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

  // Tasks API
  async getTasks(): Promise<Task[]> {
    if (useMockData) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockTasks), 500);
      });
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/task`, {
        timeout: API_TIMEOUT,
      });
      return response.data as Task[];
    } catch {
      console.warn('API not available, using mock data');
      useMockData = true;
      return mockTasks;
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
  }
};
