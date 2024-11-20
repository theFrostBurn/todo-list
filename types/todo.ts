export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 1 | 2 | 3;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
} 