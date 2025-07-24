// API Response Types based on your PlannerApp API

export interface User {
  id: number;
  name: string;
  email: string;
  createdDate: string;
  roleId: number;
  status: string;
  createdUserId: number;
  passwordHash: string;
}

export interface Project {
  id: number;
  name: string;
  createdUserId: number;
  createdDate: string;
  status: string;
}

export interface Task {
  id: number;
  name: string;
  description: string;
  projectId: number;
  priorityId: number;
  authorId: number;
  assignId: number;
  estimatedTime: number;
  dueDate: string;
  createdUserId: number;
  createdDate: string;
  status: string;
}

export interface TaskBacklog {
  id: number;
  taskId: number;
  time: string;
  workTime: string;
  assignId: number;
  createdUserId: number;
  createdDate: string;
  status: string;
}

// API Response wrapper (if your API wraps responses)
export interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}
