import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/* ── Campos obligatorios ── */
const REQUIRED_FIELDS = ['title', 'assignee', 'dueDate'];

const INITIAL_FORM = {
  title: '',
  description: '',
  priority: 'medium',
  assignee: '',
  dueDate: '',
  status: 'todo',
  tags: '',
};

const INITIAL_ERRORS = {
  title: '',
  assignee: '',
  dueDate: '',
};

const TaskModal = ({ isOpen, onClose, onSave, task, logEvent }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [touched, setTouched] = useState({});

  /* Rellenar formulario al editar o limpiar al crear */
  useEffect(() => {
    if (task) {
      setFormData({
        title:       task.title || '',
        description: task.description || '',
        priority:    task.priority || 'medium',
        assignee:    task.assignee || '',
        dueDate:     task.dueDate || '',
        status:      task.status || 'todo',
        tags:        task.tags ? task.tags.join(', ') : '',
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setErrors(INITIAL_ERRORS);
    setTouched({});
  }, [task, isOpen]);

  /* Validación por campo */
  const validateField = (field, value) => {
    if (REQUIRED_FIELDS.includes(field) && !value.trim()) {
      const names = { title: 'El título', assignee: 'El responsable', dueDate: 'La fecha límite' };
      return `${names[field]} es obligatorio.`;
    }
    return '';
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
    logEvent('form_field_changed', { field, value: value.substring(0, 50) });
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const isFormValid = REQUIRED_FIELDS.every(f => formData[f].trim() !== '');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Marcar todos los campos como tocados y validar
    const allTouched = REQUIRED_FIELDS.reduce((acc, f) => ({ ...acc, [f]: true }), {});
    setTouched(allTouched);
    const newErrors = REQUIRED_FIELDS.reduce(
      (acc, f) => ({ ...acc, [f]: validateField(f, formData[f]) }), {}
    );
    setErrors(newErrors);
    if (!isFormValid) return;

    const taskData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    logEvent('form_submitted', {
      action: task ? 'update_task' : 'create_task',
      taskData: { ...taskData, description: taskData.description.substring(0, 50) },
    });

    onSave(taskData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">
                {task ? 'Editar Tarea' : 'Nueva Tarea'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {task ? 'Modifica los campos y guarda los cambios' : 'Completa los campos para crear la tarea'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
            {/* Título */}
            <div className="space-y-1.5">
              <Label htmlFor="task-title" className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="task-title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                placeholder="Ej. Revisar diseño de pantalla de inicio"
                className={`w-full transition-all ${errors.title ? 'border-red-400 focus:ring-red-300 bg-red-50/40' : 'focus:border-violet-400 focus:ring-violet-200'}`}
              />
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-1.5 text-xs text-red-600 font-medium"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.title}
                </motion.p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <Label htmlFor="task-desc" className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Descripción
              </Label>
              <Textarea
                id="task-desc"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe el objetivo o contexto de la tarea..."
                rows={3}
                className="w-full resize-none focus:border-violet-400 focus:ring-violet-200"
              />
            </div>

            {/* Prioridad + Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="task-priority" className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                  Prioridad <span className="text-red-500">*</span>
                </Label>
                <select
                  id="task-priority"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all text-zinc-700"
                >
                  <option value="low">🟢 Baja</option>
                  <option value="medium">🟡 Media</option>
                  <option value="high">🔴 Alta</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-status" className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                  Columna <span className="text-red-500">*</span>
                </Label>
                <select
                  id="task-status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 transition-all text-zinc-700"
                >
                  <option value="todo">Por Hacer</option>
                  <option value="in-progress">En Progreso</option>
                  <option value="review">En Revisión</option>
                  <option value="done">Completado</option>
                </select>
              </div>
            </div>

            {/* Responsable + Fecha */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="task-assignee" className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                  Responsable <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="task-assignee"
                  value={formData.assignee}
                  onChange={(e) => handleChange('assignee', e.target.value)}
                  onBlur={() => handleBlur('assignee')}
                  placeholder="Nombre del responsable"
                  className={`transition-all ${errors.assignee ? 'border-red-400 focus:ring-red-300 bg-red-50/40' : 'focus:border-violet-400 focus:ring-violet-200'}`}
                />
                {errors.assignee && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs text-red-600 font-medium"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.assignee}
                  </motion.p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="task-duedate" className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                  Fecha Límite <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="task-duedate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  onBlur={() => handleBlur('dueDate')}
                  className={`transition-all ${errors.dueDate ? 'border-red-400 focus:ring-red-300 bg-red-50/40' : 'focus:border-violet-400 focus:ring-violet-200'}`}
                />
                {errors.dueDate && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 text-xs text-red-600 font-medium"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.dueDate}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Etiquetas */}
            <div className="space-y-1.5">
              <Label htmlFor="task-tags" className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
                Etiquetas <span className="text-zinc-400 font-normal normal-case">(separadas por comas)</span>
              </Label>
              <Input
                id="task-tags"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="Ej. frontend, urgente, bug"
                className="focus:border-violet-400 focus:ring-violet-200"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!isFormValid}
                className={`flex-1 font-semibold transition-all ${
                  isFormValid
                    ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
              >
                {task ? 'Guardar Cambios' : 'Crear Tarea'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              >
                Cancelar
              </Button>
            </div>

            {/* Hint de validación */}
            {!isFormValid && (
              <p className="text-center text-xs text-zinc-400">
                Completa los campos obligatorios (<span className="text-red-500">*</span>) para continuar
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskModal;