export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 1 | 2 | 3;
  completed: boolean;
  position: {
    x: number;
    y: number;
  };
  createdAt: Date;
  updatedAt: Date;
} 