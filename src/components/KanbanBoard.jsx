import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Search, Filter, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskColumn from '@/components/TaskColumn';
import TaskModal from '@/components/TaskModal';
import FilterPanel from '@/components/FilterPanel';
import StatsPanel from '@/components/StatsPanel';
import { useEventLogger } from '@/hooks/useEventLogger';
import { useIdleTracker } from '@/hooks/useIdleTracker';
import { useTasks } from '@/hooks/useTasks';
import { toast } from '@/components/ui/use-toast';
const KanbanBoard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [filters, setFilters] = useState({
    priority: 'all',
    assignee: 'all',
    dueDate: 'all'
  });
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask
  } = useTasks();
  const {
    logEvent,
    downloadLog,
    getStats
  } = useEventLogger();
  const {
    idleTime,
    totalActiveTime
  } = useIdleTracker(logEvent);
  useEffect(() => {
    logEvent('session_start', {
      timestamp: new Date().toISOString()
    });
  }, [logEvent]);
  const handleAddTask = useCallback(() => {
    logEvent('button_click', {
      action: 'open_add_task_modal'
    });
    setEditingTask(null);
    setIsModalOpen(true);
  }, [logEvent]);
  const handleEditTask = useCallback(task => {
    logEvent('task_edit_initiated', {
      taskId: task.id,
      taskTitle: task.title
    });
    setEditingTask(task);
    setIsModalOpen(true);
  }, [logEvent]);
  const handleSaveTask = useCallback(taskData => {
    if (editingTask) {
      logEvent('task_updated', {
        taskId: editingTask.id,
        changes: taskData,
        previousStatus: editingTask.status
      });
      updateTask(editingTask.id, taskData);
      toast({
        title: "Task Updated",
        description: "Your task has been successfully updated."
      });
    } else {
      const newTask = addTask(taskData);
      logEvent('task_created', {
        taskId: newTask.id,
        taskData: taskData
      });
      toast({
        title: "Task Created",
        description: "New task has been added to the board."
      });
    }
    setIsModalOpen(false);
    setEditingTask(null);
  }, [editingTask, addTask, updateTask, logEvent]);
  const handleDeleteTask = useCallback(taskId => {
    const task = tasks.find(t => t.id === taskId);
    logEvent('task_deleted', {
      taskId,
      taskTitle: task?.title,
      taskStatus: task?.status
    });
    deleteTask(taskId);
    toast({
      title: "Task Deleted",
      description: "Task has been removed from the board."
    });
  }, [tasks, deleteTask, logEvent]);
  const handleDragEnd = useCallback((taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    logEvent('task_dragged', {
      taskId,
      taskTitle: task?.title,
      fromStatus: task?.status,
      toStatus: newStatus
    });
    moveTask(taskId, newStatus);
  }, [tasks, moveTask, logEvent]);
  const handleSearchChange = useCallback(e => {
    const value = e.target.value;
    setSearchQuery(value);
    logEvent('search_query', {
      query: value
    });
  }, [logEvent]);
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    logEvent('filter_applied', {
      filterType,
      value
    });
  }, [logEvent]);
  const handleDownloadLog = useCallback(() => {
    logEvent('log_download_initiated', {
      totalTasks: tasks.length,
      activeTime: totalActiveTime,
      idleTime: idleTime
    });
    downloadLog();
    toast({
      title: "Log Downloaded",
      description: "Event log has been saved as LOG.txt"
    });
  }, [logEvent, downloadLog, tasks.length, totalActiveTime, idleTime]);
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesAssignee = filters.assignee === 'all' || task.assignee === filters.assignee;
    let matchesDueDate = true;
    if (filters.dueDate !== 'all') {
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      if (filters.dueDate === 'overdue') matchesDueDate = diffDays < 0;else if (filters.dueDate === 'today') matchesDueDate = diffDays === 0;else if (filters.dueDate === 'week') matchesDueDate = diffDays >= 0 && diffDays <= 7;
    }
    return matchesSearch && matchesPriority && matchesAssignee && matchesDueDate;
  });
  const columns = [{
    id: 'todo',
    title: 'To Do',
    color: 'bg-blue-500'
  }, {
    id: 'in-progress',
    title: 'In Progress',
    color: 'bg-yellow-500'
  }, {
    id: 'review',
    title: 'Review',
    color: 'bg-purple-500'
  }, {
    id: 'done',
    title: 'Done',
    color: 'bg-green-500'
  }];
  return <div className="min-h-screen p-6">
      <motion.div initial={{
      opacity: 0,
      y: -20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2">Planificador de Tareas</h1>
              <p className="text-slate-600">Demostración de heurísticas de usabilidad de la IHC</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => {
              setShowStats(!showStats);
              logEvent('button_click', {
                action: 'toggle_stats_panel'
              });
            }} variant="outline" className="gap-2">
                <Activity className="w-4 h-4" />
                Stats
              </Button>
              <Button onClick={handleDownloadLog} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download Log
              </Button>
              <Button onClick={handleAddTask} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <Button onClick={() => {
            setShowFilters(!showFilters);
            logEvent('button_click', {
              action: 'toggle_filter_panel'
            });
          }} variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-300">
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-600">
                Idle: {Math.floor(idleTime / 60)}m {idleTime % 60}s
              </span>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && <FilterPanel filters={filters} onFilterChange={handleFilterChange} tasks={tasks} />}
          </AnimatePresence>

          <AnimatePresence>
            {showStats && <StatsPanel stats={getStats()} tasks={tasks} totalActiveTime={totalActiveTime} idleTime={idleTime} />}
          </AnimatePresence>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => <TaskColumn key={column.id} column={column} tasks={filteredTasks.filter(task => task.status === column.id)} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onDragEnd={handleDragEnd} logEvent={logEvent} />)}
        </div>

        <TaskModal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setEditingTask(null);
        logEvent('modal_closed', {
          action: 'task_modal'
        });
      }} onSave={handleSaveTask} task={editingTask} logEvent={logEvent} />
      </motion.div>
    </div>;
};
export default KanbanBoard;