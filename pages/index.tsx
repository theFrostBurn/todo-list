import { useState } from 'react';
import { Todo } from '@/types/todo';
import { FaTrash, FaStar, FaPlus, FaGripVertical } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const priorityColors = {
  3: 'bg-red-50 border-red-200 hover:bg-red-100',
  2: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
  1: 'bg-green-50 border-green-200 hover:bg-green-100',
};

// SortableTodoItem 컴포넌트의 props 타입 정의
interface SortableTodoItemProps {
  todo: Todo;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
}

function SortableTodoItem({ todo, updateTodo, deleteTodo }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 bg-white rounded-lg border
        ${todo.completed ? 'opacity-75 bg-gray-50' : ''}
        ${isDragging ? 'shadow-lg z-50' : 'shadow-sm'}
      `}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <FaGripVertical />
      </div>
      
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => updateTodo(todo.id, { completed: e.target.checked })}
        className="w-5 h-5 rounded-lg border-2 border-gray-300 text-blue-500 focus:ring-blue-500"
      />
      
      <input
        value={todo.title}
        onChange={(e) => updateTodo(todo.id, { title: e.target.value })}
        className={`flex-1 bg-transparent focus:outline-none ${
          todo.completed ? 'line-through text-gray-400' : ''
        }`}
      />
      
      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              onClick={() => updateTodo(todo.id, { priority: p as 1 | 2 | 3 })}
              className={`text-sm transition-colors ${
                p <= todo.priority ? 'text-yellow-400' : 'text-gray-200'
              }`}
            >
              <FaStar />
            </button>
          ))}
        </div>
        <button
          onClick={() => deleteTodo(todo.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 드래그 시작을 위한 최소 이동 거리를 줄임
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const createTodo = (title: string) => {
    const newTodo: Todo = {
      id: uuidv4(),
      title,
      priority: 2,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTodos([...todos, newTodo]);
    return newTodo.id;
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, ...updates }
        : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const onChange = (id: string, completed: boolean) => {
    updateTodo(id, { completed });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">할 일 목록</h1>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newTodoTitle.trim()) {
                  createTodo(newTodoTitle);
                  setNewTodoTitle('');
                }
              }}
              placeholder="새로운 할 일을 입력하세요 (Enter를 눌러 추가)"
              className="flex-1 px-4 py-3 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button
              onClick={() => {
                if (newTodoTitle.trim()) {
                  createTodo(newTodoTitle);
                  setNewTodoTitle('');
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus />
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={todos}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {todos.map((todo) => (
                <SortableTodoItem 
                  key={todo.id} 
                  todo={todo} 
                  updateTodo={updateTodo}
                  deleteTodo={deleteTodo}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
