import React from 'react';
import { motion } from 'framer-motion';
import { Activity, MousePointer, Clock, CheckCircle2, ListTodo, Loader, Eye } from 'lucide-react';

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const KPI_COLUMNS = [
  { id: 'todo',        label: 'Por Hacer',    icon: <ListTodo className="w-4 h-4" />, color: 'indigo' },
  { id: 'in-progress', label: 'En Progreso',  icon: <Loader className="w-4 h-4" />,  color: 'amber'  },
  { id: 'review',      label: 'En Revisión',  icon: <Eye className="w-4 h-4" />,     color: 'purple' },
  { id: 'done',        label: 'Completado',   icon: <CheckCircle2 className="w-4 h-4" />, color: 'emerald' },
];

const COLOR_MAP = {
  indigo:  { bg: 'bg-indigo-50',  border: 'border-indigo-200',  text: 'text-indigo-700',  num: 'text-indigo-800' },
  amber:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   num: 'text-amber-800'  },
  purple:  { bg: 'bg-purple-50',  border: 'border-purple-200',  text: 'text-purple-700',  num: 'text-purple-800' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', num: 'text-emerald-800'},
};

const StatsPanel = ({ stats, tasks, totalActiveTime, idleTime }) => {
  const tasksByStatus = KPI_COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id).length;
    return acc;
  }, {});

  // Traducciones de tipos de evento
  const translateEventType = (type) => ({
    task_created:    'Tareas creadas',
    task_dragged:    'Movimientos',
    task_updated:    'Ediciones',
    task_deleted:    'Eliminaciones',
    button_click:    'Clics en botones',
    filter_applied:  'Filtros aplicados',
    search_query:    'Búsquedas',
    session_start:   'Inicio de sesión',
    form_submitted:  'Formularios enviados',
    task_locked:     'Tareas bloqueadas',
    task_unlocked:   'Tareas desbloqueadas',
    task_undo:       'Acciones deshechas',
  }[type] || type);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, y: -8 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="mt-3 bg-white rounded-xl border border-zinc-200 p-5 shadow-sm space-y-5">
        {/* Título */}
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-500" />
          <h3 className="text-sm font-semibold text-zinc-700">Estadísticas de Sesión</h3>
        </div>

        {/* KPIs por columna */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KPI_COLUMNS.map(col => {
            const c = COLOR_MAP[col.color];
            return (
              <div key={col.id} className={`${c.bg} ${c.border} border rounded-xl p-3.5`}>
                <div className={`flex items-center gap-1.5 mb-2 ${c.text}`}>
                  {col.icon}
                  <span className="text-xs font-medium">{col.label}</span>
                </div>
                <div className={`text-2xl font-bold ${c.num}`}>{tasksByStatus[col.id]}</div>
              </div>
            );
          })}
        </div>

        {/* Tiempo y actividad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <MousePointer className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <div className="text-xs text-zinc-500">Eventos totales</div>
              <div className="text-base font-semibold text-zinc-800">{stats.totalEvents}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs text-zinc-500">Tiempo activo</div>
              <div className="text-base font-semibold text-zinc-800">{formatTime(totalActiveTime)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <div className="text-xs text-zinc-500">Tiempo inactivo</div>
              <div className="text-base font-semibold text-zinc-800">{formatTime(idleTime)}</div>
            </div>
          </div>
        </div>

        {/* Desglose de eventos */}
        {stats.eventTypes && Object.keys(stats.eventTypes).length > 0 && (
          <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-3">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Desglose de acciones</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.eventTypes).map(([type, count]) => (
                <span key={type} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white border border-zinc-200 text-zinc-600">
                  <span className="font-semibold text-zinc-800">{count}</span>
                  {translateEventType(type)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsPanel;