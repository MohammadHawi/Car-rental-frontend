export enum TaskStatus {
  Active = 'Active',
  Overdue = 'Overdue',
  Completed = 'Completed'
}

export interface Task {
  id: number;
  description: string;
  dueDate: string;
  status: TaskStatus;
  isImportant: boolean;
  createdAt: string;
  createdBy: string;
  completedAt?: string;
  completedBy?: string;
}

export interface CreateTaskRequest {
  description: string;
  dueDate: string;
  isImportant: boolean;
  createdBy?: string;
}

export interface UpdateTaskRequest {
  description: string;
  dueDate: string;
  isImportant: boolean;
}