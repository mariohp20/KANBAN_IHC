import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal } from 'lucide-react';

const FilterPanel = ({ filters, onFilterChange, tasks }) => {
  const uniqueAssignees = [...new Set(tasks.map(task => task.assignee).filter(Boolean))];

  const selectClass = `
    w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white
    focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400
    transition-all text-zinc-700 cursor-pointer
  `;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -8 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="mt-3 bg-white rounded-xl border border-zinc-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Filtros activos</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Prioridad */}
          <div className="space-y-1.5">
            <Label htmlFor="filtro-prioridad" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
              Prioridad
            </Label>
            <select
              id="filtro-prioridad"
              value={filters.priority}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              className={selectClass}
            >
              <option value="all">Todas las prioridades</option>
              <option value="low">🟢 Baja</option>
              <option value="medium">🟡 Media</option>
              <option value="high">🔴 Alta</option>
            </select>
          </div>

          {/* Responsable */}
          <div className="space-y-1.5">
            <Label htmlFor="filtro-responsable" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
              Responsable
            </Label>
            <select
              id="filtro-responsable"
              value={filters.assignee}
              onChange={(e) => onFilterChange('assignee', e.target.value)}
              className={selectClass}
            >
              <option value="all">Todos los responsables</option>
              {uniqueAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>

          {/* Fecha límite */}
          <div className="space-y-1.5">
            <Label htmlFor="filtro-fecha" className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
              Fecha Límite
            </Label>
            <select
              id="filtro-fecha"
              value={filters.dueDate}
              onChange={(e) => onFilterChange('dueDate', e.target.value)}
              className={selectClass}
            >
              <option value="all">Todas las fechas</option>
              <option value="overdue">⚠️ Vencidas</option>
              <option value="today">📅 Para hoy</option>
              <option value="week">📆 Esta semana</option>
            </select>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default FilterPanel;