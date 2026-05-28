import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Download, Search, Filter, Clock, Activity, HelpCircle, X } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import TaskColumn from '@/components/TaskColumn';
import TaskModal from '@/components/TaskModal';
import FilterPanel from '@/components/FilterPanel';
import StatsPanel from '@/components/StatsPanel';
import UndoToast from '@/components/UndoToast';
import HelpModal from '@/components/HelpModal';
import { useEventLogger } from '@/hooks/useEventLogger';
import { useIdleTracker } from '@/hooks/useIdleTracker';
import { useTasks } from '@/hooks/useTasks';
import { useUndoManager } from '@/hooks/useUndoManager';
import { useAudioFeedback } from '@/hooks/useAudioFeedback';

const COLUMNS = [
  { id: 'todo',        title: 'Por Hacer',   color: 'bg-indigo-500'  },
  { id: 'in-progress', title: 'En Progreso', color: 'bg-amber-400'   },
  { id: 'review',      title: 'En Revisión', color: 'bg-purple-500'  },
  { id: 'done',        title: 'Completado',  color: 'bg-emerald-500' },
];

const KanbanBoard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask]  = useState(null);
  const [searchQuery, setSearchQuery]  = useState('');
  const [showFilters, setShowFilters]  = useState(false);
  const [showStats, setShowStats]      = useState(false);
  const [showHelp, setShowHelp]        = useState(false);
  const [filters, setFilters] = useState({ priority: 'all', assignee: 'all', dueDate: 'all' });
  const [undoToast, setUndoToast] = useState(null);

  const { tasks, addTask, updateTask, deleteTask, moveTask, toggleLock, restoreTasks } = useTasks();
  const { logEvent, downloadLog, getStats } = useEventLogger();
  const { idleTime, totalActiveTime } = useIdleTracker(logEvent);
  const { pushSnapshot, popSnapshot } = useUndoManager();
  const { playClick, playSuccess } = useAudioFeedback();

  useEffect(() => {
    logEvent('session_start', { timestamp: new Date().toISOString() });
  }, [logEvent]);

  const handleAddTask = useCallback(() => {
    playClick();
    logEvent('button_click', { action: 'open_add_task_modal' });
    setEditingTask(null);
    setIsModalOpen(true);
  }, [logEvent, playClick]);

  const handleEditTask = useCallback((task) => {
    if (task.locked) return;
    playClick();
    logEvent('task_edit_initiated', { taskId: task.id, taskTitle: task.title });
    setEditingTask(task);
    setIsModalOpen(true);
  }, [logEvent, playClick]);

  const handleSaveTask = useCallback((taskData) => {
    if (editingTask) {
      logEvent('task_updated', { taskId: editingTask.id, changes: taskData, previousStatus: editingTask.status });
      updateTask(editingTask.id, taskData);
    } else {
      const newTask = addTask(taskData);
      logEvent('task_created', { taskId: newTask.id, taskData });
    }
    setIsModalOpen(false);
    setEditingTask(null);
  }, [editingTask, addTask, updateTask, logEvent]);

  const handleDeleteTask = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.locked) return;
    pushSnapshot(tasks);
    logEvent('task_deleted', { taskId, taskTitle: task.title, taskStatus: task.status });
    deleteTask(taskId);
    setUndoToast({ message: `Tarea eliminada: "${task.title}"` });
  }, [tasks, deleteTask, logEvent, pushSnapshot]);

  const handleDragEnd = useCallback((taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.locked || task.status === newStatus) return;
    pushSnapshot(tasks);
    logEvent('task_dragged', { taskId, taskTitle: task.title, fromStatus: task.status, toStatus: newStatus });
    moveTask(taskId, newStatus);
    if (newStatus === 'done') playSuccess();
    setUndoToast({ message: `"${task.title}" movida a ${COLUMNS.find(c => c.id === newStatus)?.title || newStatus}` });
  }, [tasks, moveTask, logEvent, pushSnapshot, playSuccess]);

  const handleUndo = useCallback(() => {
    const snapshot = popSnapshot();
    if (snapshot) {
      restoreTasks(snapshot);
      logEvent('task_undo', {});
    }
    setUndoToast(null);
  }, [popSnapshot, restoreTasks, logEvent]);

  const handleToggleLock = useCallback((taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    playClick();
    toggleLock(taskId);
    logEvent(task.locked ? 'task_unlocked' : 'task_locked', { taskId, taskTitle: task.title });
  }, [tasks, toggleLock, logEvent, playClick]);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    logEvent('search_query', { query: value });
  }, [logEvent]);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    logEvent('filter_applied', { filterType, value });
  }, [logEvent]);

  const handleDownloadLog = useCallback(() => {
    logEvent('log_download_initiated', { totalTasks: tasks.length, activeTime: totalActiveTime, idleTime });
    downloadLog();
  }, [logEvent, downloadLog, tasks.length, totalActiveTime, idleTime]);

  const handleOpenHelp = useCallback(() => {
    playClick();
    logEvent('help_opened', {});
    setShowHelp(true);
  }, [logEvent, playClick]);

  const filteredTasks = tasks.filter(task => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || task.title.toLowerCase().includes(q) || task.description?.toLowerCase().includes(q);
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesAssignee = filters.assignee === 'all' || task.assignee === filters.assignee;

    let matchesDueDate = true;
    if (filters.dueDate !== 'all' && task.dueDate) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const due   = new Date(task.dueDate); due.setHours(0, 0, 0, 0);
      const diff  = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      if (filters.dueDate === 'overdue') matchesDueDate = diff < 0;
      else if (filters.dueDate === 'today') matchesDueDate = diff === 0;
      else if (filters.dueDate === 'week')  matchesDueDate = diff >= 0 && diff <= 7;
    }

    return matchesSearch && matchesPriority && matchesAssignee && matchesDueDate;
  });

  const activeFiltersCount = [
    filters.priority !== 'all',
    filters.assignee !== 'all',
    filters.dueDate  !== 'all',
  ].filter(Boolean).length;

  return (
    <>
      <Helmet>
        <title>Planificador de Tareas</title>
        <meta name="description" content="Tablero Kanban — Planificador de Tareas IHC" />
      </Helmet>

      <div className="min-h-screen p-5 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-screen-xl mx-auto"
        >
          <header className="mb-7">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-base font-bold">K</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-zinc-900 leading-tight">Planificador de Tareas</h1>
                  <p className="text-xs text-zinc-400">Heurísticas de Usabilidad — IHC</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-zinc-200 text-xs text-zinc-500 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  Inactivo: {Math.floor(idleTime / 60)}m {idleTime % 60}s
                </div>

                <Button
                  onClick={() => { playClick(); setShowStats(v => !v); logEvent('button_click', { action: 'toggle_stats_panel' }); }}
                  variant="outline"
                  className={`gap-2 text-sm border-zinc-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all ${showStats ? 'border-violet-300 bg-violet-50 text-violet-700' : ''}`}
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden md:inline">Estadísticas</span>
                </Button>

                <Button
                  onClick={handleDownloadLog}
                  variant="outline"
                  className="gap-2 text-sm border-zinc-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">Reporte</span>
                </Button>

                <button
                  onClick={handleOpenHelp}
                  title="Ayuda — Como usar el tablero"
                  className="w-9 h-9 rounded-lg flex items-center justify-center border border-zinc-200 bg-white hover:border-violet-300 hover:bg-violet-50 text-zinc-400 hover:text-violet-600 transition-all shadow-sm"
                >
                  <HelpCircle style={{ width: 18, height: 18 }} />
                </button>

                <Button
                  onClick={handleAddTask}
                  className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md transition-all text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Tarea
                </Button>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar tareas por título o descripción..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all text-zinc-700 placeholder-zinc-400 shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Button
                onClick={() => { playClick(); setShowFilters(v => !v); logEvent('button_click', { action: 'toggle_filter_panel' }); }}
                variant="outline"
                className={`gap-2 text-sm border-zinc-200 hover:border-violet-300 hover:bg-violet-50 transition-all ${showFilters ? 'border-violet-300 bg-violet-50 text-violet-700' : ''}`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-violet-600 text-white rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {showFilters && <FilterPanel filters={filters} onFilterChange={handleFilterChange} tasks={tasks} />}
            </AnimatePresence>
            <AnimatePresence>
              {showStats && <StatsPanel stats={getStats()} tasks={tasks} totalActiveTime={totalActiveTime} idleTime={idleTime} />}
            </AnimatePresence>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {COLUMNS.map(column => (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={filteredTasks.filter(task => task.status === column.id)}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onDragEnd={handleDragEnd}
                onToggleLock={handleToggleLock}
                logEvent={logEvent}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingTask(null); logEvent('modal_closed', { action: 'task_modal' }); }}
          onSave={handleSaveTask}
          task={editingTask}
          logEvent={logEvent}
        />
      )}

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

      <AnimatePresence>
        {undoToast && (
          <UndoToast
            key="undo-toast"
            message={undoToast.message}
            onUndo={handleUndo}
            onDismiss={() => setUndoToast(null)}
            duration={8000}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default KanbanBoard;