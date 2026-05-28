import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Calendar, User, AlertCircle, Lock, Unlock } from 'lucide-react';

const PRIORITY_MAP = {
  high:   { label: 'Alta',  classes: 'bg-red-50 text-red-600 border-red-200'       },
  medium: { label: 'Media', classes: 'bg-amber-50 text-amber-600 border-amber-200' },
  low:    { label: 'Baja',  classes: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
};

const PRIORITY_DOT = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-emerald-500',
};

const TaskCard = ({ task, onEdit, onDelete, onToggleLock, logEvent }) => {
  const [isDragging, setIsDragging] = useState(false);

  const isLocked = !!task.locked;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const priority = PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium;

  const handleDragStart = (e) => {
    if (isLocked) { e.preventDefault(); return; }
    e.dataTransfer.setData('taskId', task.id);
    setIsDragging(true);
    logEvent('drag_start', { taskId: task.id, taskTitle: task.title });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    logEvent('drag_end', { taskId: task.id });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (!isLocked) onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!isLocked) onDelete(task.id);
  };

  const handleToggleLock = (e) => {
    e.stopPropagation();
    onToggleLock(task.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{
        opacity: isLocked ? 0.62 : 1,
        y: 0,
        scale: isDragging ? 1.03 : 1,
        rotate: isDragging ? 2 : 0,
      }}
      exit={{ opacity: 0, scale: 0.9, y: -8 }}
      transition={{
        layout: { type: 'spring', stiffness: 340, damping: 28 },
        opacity: { duration: 0.18 },
        rotate: { type: 'spring', stiffness: 400, damping: 20 },
        scale:  { type: 'spring', stiffness: 400, damping: 22 },
      }}
      draggable={!isLocked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => logEvent('task_card_clicked', { taskId: task.id })}
      className={`
        group relative bg-white rounded-xl border transition-all select-none
        ${isLocked
          ? 'border-zinc-200 cursor-not-allowed'
          : 'border-zinc-200 hover:border-violet-200 cursor-grab active:cursor-grabbing hover:shadow-md'}
        ${isDragging ? 'shadow-xl border-violet-300 ring-2 ring-violet-200/50' : 'shadow-sm'}
      `}
      style={{
        boxShadow: isDragging
          ? '0 12px 40px rgba(109,40,217,0.18), 0 4px 12px rgba(0,0,0,0.08)'
          : undefined,
      }}
    >
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${PRIORITY_DOT[task.priority] || 'bg-zinc-300'}`} />

      {isLocked && (
        <div className="absolute inset-0 rounded-xl bg-zinc-50/40 backdrop-blur-[1px] z-10 pointer-events-none" />
      )}

      <div className="p-4 pl-5">
        <div className="flex items-start gap-2 mb-2.5">
          <h3 className="font-semibold text-zinc-800 text-sm leading-snug flex-1 min-w-0 pr-1">
            {task.title}
          </h3>

          <div className={`flex items-center gap-0.5 shrink-0 transition-opacity ${isLocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <button
              onClick={handleToggleLock}
              title={isLocked ? 'Desbloquear tarea' : 'Bloquear tarea'}
              className={`relative z-20 p-1.5 rounded-lg transition-colors ${
                isLocked
                  ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                  : 'text-zinc-400 hover:bg-zinc-100 hover:text-amber-500'
              }`}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleEdit}
              disabled={isLocked}
              title={isLocked ? 'Desbloquea para editar' : 'Editar tarea'}
              className="relative z-20 p-1.5 rounded-lg text-zinc-400 hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDelete}
              disabled={isLocked}
              title={isLocked ? 'Desbloquea para eliminar' : 'Eliminar tarea'}
              className="relative z-20 p-1.5 rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-zinc-500 mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${priority.classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
            {priority.label}
          </span>
          {task.tags && task.tags.map((tag, idx) => (
            <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-400 pt-2.5 border-t border-zinc-100">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
              {task.assignee?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="truncate max-w-[80px]">{task.assignee || 'Sin asignar'}</span>
          </div>

          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
            {isOverdue && <AlertCircle className="w-3 h-3" />}
            <Calendar className="w-3 h-3" />
            <span>
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                : 'Sin fecha'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;