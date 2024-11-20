import { useState, useEffect } from 'react';
import { Todo } from '@/types/todo';
import { FaTrash, FaStar, FaPlus } from 'react-icons/fa';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoMode, setNewTodoMode] = useState(false);

  const createTodo = (position: { x: number; y: number }) => {
    const newTodo: Todo = {
      id: uuidv4(),
      title: '',
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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">메모 보드</h1>
          <button
            onClick={() => {
              const id = createTodo({ x: 0, y: 0 });
              setTimeout(() => {
                const element = document.getElementById(`todo-${id}`);
                if (element) element.focus();
              }, 100);
            }}
            className="bg-yellow-400 hover:bg-yellow-500 text-white p-3 rounded-full shadow-lg"
          >
            <FaPlus />
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="todos">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {todos.map((todo, index) => (
                  <Draggable key={todo.id} draggableId={todo.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`
                          transform transition-all duration-200
                          ${todo.completed ? 'opacity-75' : 'opacity-100'}
                        `}
                      >
                        <div className="bg-yellow-100 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-1">
                              {[...Array(3)].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => updateTodo(todo.id, { priority: i + 1 })}
                                  className={`text-sm ${
                                    i < todo.priority ? 'text-yellow-500' : 'text-gray-300'
                                  }`}
                                >
                                  <FaStar />
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash />
                            </button>
                          </div>
                          
                          <div className="relative">
                            <textarea
                              id={`todo-${todo.id}`}
                              value={todo.title}
                              onChange={(e) => updateTodo(todo.id, { title: e.target.value })}
                              className="w-full bg-transparent resize-none focus:outline-none min-h-[100px]"
                              placeholder="메모를 입력하세요..."
                            />
                            <div
                              className="absolute bottom-0 right-0 left-0 h-6 bg-gradient-to-t from-yellow-100 to-transparent"
                              aria-hidden="true"
                            />
                          </div>
                          
                          <div className="flex items-center mt-2">
                            <input
                              type="checkbox"
                              checked={todo.completed}
                              onChange={(e) => updateTodo(todo.id, { completed: e.target.checked })}
                              className="form-checkbox h-4 w-4 text-yellow-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">완료</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
