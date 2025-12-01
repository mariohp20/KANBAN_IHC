import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Calendar, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TaskCard = ({ task, index, onEdit, onDelete, logEvent }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id);
    setIsDragging(true);
    logEvent('drag_start', { taskId: task.id, taskTitle: task.title });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    logEvent('drag_end', { taskId: task.id });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white border-2 border-slate-200 rounded-lg p-4 cursor-move hover:shadow-lg transition-all ${
        isDragging ? 'rotate-2 scale-105' : ''
      }`}
      onClick={() => logEvent('task_card_clicked', { taskId: task.id })}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-slate-800 flex-1">{task.title}</h3>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-blue-100"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        {task.tags && task.tags.map((tag, idx) => (
          <span key={idx} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>{task.assignee}</span>
        </div>
        <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
          {isOverdue && <AlertCircle className="w-3 h-3" />}
          <Calendar className="w-3 h-3" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;