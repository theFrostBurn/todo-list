import { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import { FaTrash, FaStar, FaPlus } from 'react-icons/fa';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const priorityColors = {
  1: 'bg-green-50 hover:bg-green-100',
  2: 'bg-amber-50 hover:bg-amber-100',
  3: 'bg-rose-50 hover:bg-rose-100',
};

const priorityBorderColors = {
  1: 'border-green-200',
  2: 'border-amber-200',
  3: 'border-rose-200',
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  const createTodo = (title: string, position: { x: number; y: number }) => {
    const newTodo: Todo = {
      id: uuidv4(),
      title,
      priority: 2,
      completed: false,
      position,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTodos([...todos, newTodo]);
    return newTodo.id;
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTodos(items);
  };

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodoTitle.trim()) {
      createTodo(newTodoTitle, { x: 0, y: 0 });
      setNewTodoTitle('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800">메모 보드</h1>
          
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              onKeyPress={handleQuickAdd}
              placeholder="새로운 메모를 입력하세요 (Enter를 눌러 추가)"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const id = createTodo('', { x: 0, y: 0 });
                setTimeout(() => {
                  const element = document.getElementById(`todo-${id}`);
                  if (element) element.focus();
                }, 100);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl shadow-lg transition-colors"
            >
              <FaPlus />
            </motion.button>
          </div>
        </motion.div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <AnimatePresence>
                  {todos.map((todo, index) => (
                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                      {(provided) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <div className={`
                            p-4 rounded-xl shadow-sm border transition-all duration-200
                            ${priorityColors[todo.priority as keyof typeof priorityColors]}
                            ${priorityBorderColors[todo.priority as keyof typeof priorityBorderColors]}
                            ${todo.completed ? 'opacity-75' : 'opacity-100'}
                          `}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-2">
                                {[1, 2, 3].map((p) => (
                                  <button
                                    key={p}
                                    onClick={() => updateTodo(todo.id, { priority: p as 1 | 2 | 3 })}
                                    className={`text-sm transition-colors ${
                                      p <= todo.priority ? 'text-yellow-500' : 'text-gray-300'
                                    }`}
                                  >
                                    <FaStar />
                                  </button>
                                ))}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => deleteTodo(todo.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <FaTrash />
                              </motion.button>
                            </div>
                            
                            <div className="relative">
                              <textarea
                                id={`todo-${todo.id}`}
                                value={todo.title}
                                onChange={(e) => updateTodo(todo.id, { title: e.target.value })}
                                className={`w-full bg-transparent resize-none focus:outline-none min-h-[100px] ${
                                  todo.completed ? 'line-through text-gray-500' : ''
                                }`}
                                placeholder="메모를 입력하세요..."
                              />
                            </div>
                            
                            <div className="flex items-center justify-end mt-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => updateTodo(todo.id, { completed: !todo.completed })}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                  ${todo.completed 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'border-gray-300 hover:border-blue-500'
                                  }`}
                              >
                                {todo.completed && (
                                  <motion.svg 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-4 h-4 text-white" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path 
                                      fill="currentColor" 
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    />
                                  </motion.svg>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
