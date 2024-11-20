import { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import { addTodo, updateTodo, deleteTodo, subscribeTodos } from '@/lib/todoApi';
import { FaTrash, FaEdit, FaCheck, FaStar } from 'react-icons/fa';
import Image from "next/image";
import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3>(2);

  useEffect(() => {
    const unsubscribe = subscribeTodos(setTodos);
    return () => unsubscribe();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    await addTodo({
      title: newTodo,
      priority,
      completed: false,
    });
    setNewTodo('');
    setPriority(2);
  };

  const handleToggleComplete = async (todo: Todo) => {
    await updateTodo(todo.id!, { completed: !todo.completed });
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">할 일 목록</h1>
      
      <form onSubmit={handleAddTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="새로운 할 일을 입력하세요"
            className="flex-1 p-2 border rounded"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
            className="p-2 border rounded"
          >
            <option value={1}>높음</option>
            <option value={2}>중간</option>
            <option value={3}>낮음</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            추가
          </button>
        </div>
      </form>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`flex items-center gap-2 p-3 border rounded ${
              todo.completed ? 'bg-gray-100' : ''
            }`}
          >
            <button
              onClick={() => handleToggleComplete(todo)}
              className={`p-2 rounded ${
                todo.completed ? 'text-green-500' : 'text-gray-400'
              }`}
            >
              <FaCheck />
            </button>
            <span className={`flex-1 ${todo.completed ? 'line-through' : ''}`}>
              {todo.title}
            </span>
            <div className="flex items-center gap-2">
              {[...Array(todo.priority)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400" />
              ))}
              <button
                onClick={() => handleDelete(todo.id!)}
                className="p-2 text-red-500"
              >
                <FaTrash />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
