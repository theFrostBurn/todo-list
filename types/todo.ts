export type TodoCategory = 'work' | 'personal' | 'shopping' | 'study' | 'health';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 1 | 2 | 3;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  order: number;
  category: TodoCategory;
} 