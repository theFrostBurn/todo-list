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
  horizontalListSortingStrategy,
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
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`
        rounded-lg border p-4 cursor-grab active:cursor-grabbing
        ${priorityColors[todo.priority]}
        ${todo.completed ? 'opacity-60' : ''}
        ${isDragging ? 'shadow-lg scale-105 z-50' : 'shadow-sm'}
        transform transition-all duration-200
      `}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateTodo(todo.id, { completed: !todo.completed });
          }}
          className={`
            w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-1
            transition-all duration-200
            ${todo.completed 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'border-gray-300 hover:border-blue-500'
            }
          `}
        >
          {todo.completed && (
            <svg 
              className="w-3 h-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          )}
        </button>
        
        <div className="flex-1">
          <div 
            className={`text-lg ${todo.completed ? 'line-through text-gray-400' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              const newTitle = prompt('할 일 수정:', todo.title);
              if (newTitle !== null) {
                updateTodo(todo.id, { title: newTitle });
              }
            }}
          >
            {todo.title}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateTodo(todo.id, { priority: p as 1 | 2 | 3 });
                  }}
                  className={`text-sm transition-colors ${
                    p <= todo.priority ? 'text-yellow-400' : 'text-gray-200'
                  }`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTodo(todo.id);
              }}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <FaTrash />
            </button>
          </div>
        </div>
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
        distance: 5,
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
      <div className="max-w-5xl mx-auto">
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
          modifiers={[]}
        >
          <SortableContext
            items={todos}
            strategy={horizontalListSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
