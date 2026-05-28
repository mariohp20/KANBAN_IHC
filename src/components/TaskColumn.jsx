import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from '@/components/TaskCard';

/* Colores por columna */
const COLUMN_STYLES = {
  'todo':        { accent: '#6366f1', bg: 'from-indigo-500/10 to-transparent', ring: 'ring-indigo-300', label: 'bg-indigo-50 text-indigo-600' },
  'in-progress': { accent: '#f59e0b', bg: 'from-amber-400/10 to-transparent',  ring: 'ring-amber-300',  label: 'bg-amber-50 text-amber-600'  },
  'review':      { accent: '#a855f7', bg: 'from-purple-500/10 to-transparent', ring: 'ring-purple-300', label: 'bg-purple-50 text-purple-600' },
  'done':        { accent: '#10b981', bg: 'from-emerald-500/10 to-transparent',ring: 'ring-emerald-300',label: 'bg-emerald-50 text-emerald-600'},
};

const TaskColumn = ({ column, tasks, onEditTask, onDeleteTask, onDragEnd, onToggleLock, logEvent }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const style = COLUMN_STYLES[column.id] || COLUMN_STYLES['todo'];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Solo marcar salida si realmente salimos del contenedor
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDragEnd(taskId, column.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col min-h-0"
    >
      {/* Cabecera de columna */}
      <div className="flex items-center gap-2.5 mb-3 px-1">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
          style={{ background: style.accent, boxShadow: `0 0 6px ${style.accent}60` }}
        />
        <h2 className="text-sm font-semibold text-zinc-700 flex-1">{column.title}</h2>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.label}`}>
          {tasks.length}
        </span>
      </div>

      {/* Zona de drop */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={isDragOver ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`
          flex-1 rounded-xl p-3 min-h-[520px] transition-all duration-200
          ${isDragOver
            ? `ring-2 ${style.ring} bg-gradient-to-b ${style.bg}`
            : 'bg-zinc-50/80 border border-zinc-200/80'
          }
        `}
      >
        <AnimatePresence mode="popLayout">
          {tasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-28 text-zinc-300 gap-2 select-none"
            >
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-zinc-200 flex items-center justify-center">
                <span className="text-xs">↓</span>
              </div>
              <p className="text-xs">Arrastra tareas aquí</p>
            </motion.div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onToggleLock={onToggleLock}
                  logEvent={logEvent}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default TaskColumn;