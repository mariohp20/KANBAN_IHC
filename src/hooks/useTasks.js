import { useState, useEffect, useCallback } from 'react';

export const useTasks = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('kanban_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback((taskData) => {
    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      locked: false,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
    ));
  }, []);

  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const moveTask = useCallback((taskId, newStatus) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task
    ));
  }, []);

  const toggleLock = useCallback((taskId) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, locked: !task.locked } : task
    ));
  }, []);

  const restoreTasks = useCallback((snapshot) => {
    setTasks(snapshot);
  }, []);

  return { tasks, addTask, updateTask, deleteTask, moveTask, toggleLock, restoreTasks };
};