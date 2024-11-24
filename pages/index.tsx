import React, { useState, useEffect, useCallback, memo } from 'react';
import { Todo, TodoCategory } from '@/types/todo';
import { FaTrash, FaStar, FaPlus, FaBriefcase, FaUser, FaShoppingCart, FaBook, FaHeartbeat } from 'react-icons/fa';
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
import { addTodo as addTodoToDb, updateTodo as updateTodoInDb, deleteTodo as deleteTodoFromDb, subscribeTodos, updateTodoOrder } from '@/lib/todoApi';

const priorityColors = {
  3: 'bg-red-100 hover:bg-red-200',
  2: 'bg-amber-100 hover:bg-amber-200',
  1: 'bg-green-100 hover:bg-green-200',
};

const categoryIcons = {
  work: { icon: FaBriefcase, color: 'text-blue-600' },
  personal: { icon: FaUser, color: 'text-purple-600' },
  shopping: { icon: FaShoppingCart, color: 'text-green-600' },
  study: { icon: FaBook, color: 'text-yellow-600' },
  health: { icon: FaHeartbeat, color: 'text-red-600' },
};

// SortableTodoItem 컴포넌트의 props 타입 정의
interface SortableTodoItemProps {
  todo: Todo;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
}

// 1. 메모이제이션 추가
const SortableTodoItem = React.memo(({ todo, updateTodo, deleteTodo }: SortableTodoItemProps) => {
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
        rounded-lg p-4 cursor-grab active:cursor-grabbing
        ${priorityColors[todo.priority]}
        ${todo.completed ? 'opacity-60' : ''}
        ${isDragging 
          ? 'shadow-lg scale-105 z-50' 
          : 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
        }
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
          <div className="flex items-center gap-2 mb-2">
            {todo.category && (
              <div className={`${categoryIcons[todo.category].color}`}>
                {React.createElement(categoryIcons[todo.category].icon)}
              </div>
            )}
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
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
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
              
              <select
                value={todo.category}
                onChange={(e) => {
                  e.stopPropagation();
                  updateTodo(todo.id, { category: e.target.value as TodoCategory });
                }}
                className="text-sm bg-white/50 border border-gray-200 rounded-md px-2 py-1 
                  appearance-none cursor-pointer hover:bg-white/80 transition-colors
                  pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23666%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] 
                  bg-[length:1.25rem] bg-[right_0.25rem_center] bg-no-repeat"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="work">업무</option>
                <option value="personal">개인</option>
                <option value="shopping">쇼핑</option>
                <option value="study">공부</option>
                <option value="health">건강</option>
              </select>
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
});

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeTodos((updatedTodos) => {
      setTodos(updatedTodos);
    });

    return () => unsubscribe();
  }, []);

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

  const createTodo = async (title: string) => {
    const newTodo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      priority: 2,
      completed: false,
      order: 0,
      category: 'personal'
    };
    await addTodoToDb(newTodo);
  };

  // 2. 불필요한 리렌더링 방지
  const updateTodo = useCallback(async (id: string, updates: Partial<Todo>) => {
    await updateTodoInDb(id, updates);
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    await deleteTodoFromDb(id);
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // DB에 새로운 순서 저장
        updateTodoOrder(newItems).catch(console.error);
        
        return newItems;
      });
    }
  };

  const onChange = (id: string, completed: boolean) => {
    updateTodo(id, { completed });
  };

  // 3. 큰 리스트 최적화
  const TodoList = memo(({ todos }: { todos: Todo[] }) => (
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
  ));

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
            <TodoList todos={todos} />
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
