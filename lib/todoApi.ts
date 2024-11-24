import { db } from './firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { Todo } from '@/types/todo';

export const addTodo = async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
  try {
    const q = query(collection(db, 'todos'), orderBy('order', 'desc'));
    const snapshot = await getDocs(q);
    const maxOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;

    const newTodoData = {
      title: todo.title,
      priority: todo.priority,
      completed: todo.completed,
      category: todo.category,
      description: todo.description || '',
      order: maxOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'todos'), newTodoData);

    return {
      id: docRef.id,
      ...newTodoData
    };
  } catch (error) {
    console.error('Error adding todo:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to add todo: ${error.message}`);
    }
    throw error;
  }
};

export const updateTodo = async (id: string, data: Partial<Todo>) => {
  try {
    const todoRef = doc(db, 'todos', id);
    await updateDoc(todoRef, {
      ...data,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error;
  }
};

export const updateTodoOrder = async (todos: Todo[]) => {
  try {
    const batch = writeBatch(db);
    todos.forEach((todo, index) => {
      const todoRef = doc(db, 'todos', todo.id);
      batch.update(todoRef, { order: index, updatedAt: new Date() });
    });
    await batch.commit();
  } catch (error) {
    console.error('Error updating todo order:', error);
    throw error;
  }
};

export const deleteTodo = async (id: string) => {
  try {
    const todoRef = doc(db, 'todos', id);
    await deleteDoc(todoRef);
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error;
  }
};

export const subscribeTodos = (callback: (todos: Todo[]) => void) => {
  const q = query(collection(db, 'todos'), orderBy('order', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const todos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Todo[];
    
    callback(todos);
  });
}; 