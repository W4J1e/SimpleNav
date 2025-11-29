'use client';

import { useState, useEffect, useRef } from 'react';
import { TodoItem } from '../types';

interface TodoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  todos?: TodoItem[];
  onTodosChange?: (todos: TodoItem[]) => void;
}

export default function TodoDialog({ isOpen, onClose, todos = [], onTodosChange }: TodoDialogProps) {
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 当对话框打开时初始化数据
  useEffect(() => {
    if (isOpen) {
      // 对话框打开时，优先使用传入的todos数据
      if (todos.length > 0) {
        // 只有当内部状态与传入的todos不同时才更新，避免无限循环
        if (JSON.stringify(todoItems) !== JSON.stringify(todos)) {
          setTodoItems(todos);
        }
      } else {
        // 如果没有传入数据，从localStorage加载
        const storedTodos = localStorage.getItem('todoItems');
        if (storedTodos) {
          try {
            const parsedTodos = JSON.parse(storedTodos);
            if (Array.isArray(parsedTodos)) {
              setTodoItems(parsedTodos);
            }
          } catch (error) {
            console.error('Failed to parse todos from localStorage:', error);
          }
        }
      }
    } else {
        // 确保对话框关闭时清空相关状态
        setSearchQuery('');
        setTodoItems([]);
        setEditingId(null);
        setEditingText('');
      }
  }, [isOpen]); // 只在isOpen变化时执行，避免无限循环

  // 防止背景滚动，但禁用点击外部关闭的功能
  useEffect(() => {
    if (isOpen) {
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const saveTodos = (updatedTodos: TodoItem[]) => {
    try {
      // 保存到localStorage
      localStorage.setItem('todoItems', JSON.stringify(updatedTodos));
      
      // 更新内部状态
      setTodoItems(updatedTodos);
      
      // 通知父组件更新状态（如果有回调）
      if (onTodosChange) {
        onTodosChange(updatedTodos);
      }
    } catch (error) {
      console.error('Failed to save todos:', error);
    }
  };

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        content: newTodo.trim(),
        completed: false,
        createdAt: Date.now()
      };
      const updatedTodos = [...todoItems, todo];
      saveTodos(updatedTodos);
      setNewTodo('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  const handleToggleComplete = (id: string) => {
    const updatedTodos = todoItems.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    saveTodos(updatedTodos);
  };

  const handleDeleteTodo = (id: string) => {
    const updatedTodos = todoItems.filter(item => item.id !== id);
    saveTodos(updatedTodos);
  };

  const handleEditTodo = (id: string, newContent: string) => {
    if (newContent.trim()) {
      const updatedTodos = todoItems.map(item => 
        item.id === id ? { ...item, content: newContent.trim() } : item
      );
      saveTodos(updatedTodos);
      setEditingId(null);
      setEditingText('');
    } else {
      // 如果内容为空，取消编辑
      setEditingId(null);
      setEditingText('');
    }
  };

  const startEditing = (id: string, content: string) => {
    setEditingId(id);
    setEditingText(content);
    // 在下一个渲染周期后聚焦输入框
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 0);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handleEditTodo(id, editingText);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const handleClearCompleted = () => {
    const updatedTodos = todoItems.filter(item => !item.completed);
    saveTodos(updatedTodos);
  };

  const getFilteredTodos = () => {
    let filtered = todoItems;
    
    // 根据搜索词过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(query)
      );
    }
    
    // 按完成状态和创建时间排序 - 未完成的排在前面，已完成的排在最后
    return [...filtered].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return b.createdAt - a.createdAt;
    });
  };

  const completedCount = todoItems.filter(item => item.completed).length;
  const filteredTodos = getFilteredTodos();

  // 完全参照知乎热榜组件的HTML结构实现
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div ref={dialogRef} className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white/10 backdrop-blur-md rounded-xl text-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 pb-2 sticky top-0 bg-white/5 backdrop-blur-md z-10 border-b border-white/20">
          <h2 className="text-xl font-semibold">
            <i className="fas fa-list-check text-blue-400 mr-2"></i>待办事项
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>
        
        <div className="p-4 pb-2 flex flex-col gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索待办事项..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white border border-white/20"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70"></i>
          </div>
          
          <div className="flex justify-end">
            {completedCount > 0 && (
              <button
                onClick={handleClearCompleted}
                className="text-sm text-white/70 hover:text-blue-400 px-2 py-1 rounded transition-colors"
              >
                清理已完成 ({completedCount})
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-grow p-2 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent' }}>
          {filteredTodos.length > 0 ? (
            <div className="space-y-1">
              {filteredTodos.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-3 px-6 py-3 hover:bg-white/5 transition-colors rounded-lg`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleComplete(item.id)}
                    className="w-5 h-5 rounded-full text-blue-400 border-white/30 focus:ring-blue-400 bg-white/10"
                  />
                  
                  {editingId === item.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onBlur={() => handleEditTodo(item.id, editingText)}
                      onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                      className="flex-grow px-2 py-1 border border-blue-400 rounded bg-blue-400/10 text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                      style={{ minWidth: '100px' }}
                    />
                  ) : (
                    <span 
                      className={`flex-grow cursor-pointer ${item.completed ? 'line-through text-white/50' : 'text-white'}`}
                      onClick={() => startEditing(item.id, item.content)}
                    >
                      {item.content}
                    </span>
                  )}
                  
                  <button
                    onClick={() => handleDeleteTodo(item.id)}
                    className="p-1 text-white/50 hover:text-red-400 transition-colors"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-white/50">
              <p>暂无待办事项</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="添加待办..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-grow px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white border border-white/20"
              autoFocus
            />
            <button
              onClick={handleAddTodo}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <i className="fas fa-pen"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
