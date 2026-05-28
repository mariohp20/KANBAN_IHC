import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MousePointer2, Lock, RotateCcw, Plus, GripVertical, CheckCircle2, HelpCircle } from 'lucide-react';

/**
 * Modal de ayuda con instrucciones visuales.
 * Heurística de Nielsen #10: Ayuda y documentación.
 */
const HelpModal = ({ isOpen, onClose }) => {
  const pasos = [
    {
      icon: <Plus className="w-5 h-5 text-violet-600" />,
      bg: 'bg-violet-50',
      titulo: 'Crear una tarea',
      desc: 'Haz clic en "Nueva Tarea" en la barra superior para abrir el formulario de creación.',
    },
    {
      icon: <GripVertical className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50',
      titulo: 'Mover entre columnas',
      desc: 'Arrastra y suelta cualquier tarjeta hacia la columna deseada. La tarjeta se inclinará al arrastrar.',
    },
    {
      icon: <Lock className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50',
      titulo: 'Bloquear una tarjeta',
      desc: 'Haz clic en el ícono de candado 🔒 en la tarjeta. Mientras esté bloqueada, no podrá ser movida, editada ni eliminada.',
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50',
      titulo: 'Deshacer una acción',
      desc: 'Al eliminar o mover una tarea, aparecerá un banner en la parte inferior con un botón "Deshacer" durante 5 segundos.',
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      bg: 'bg-green-50',
      titulo: 'Completar una tarea',
      desc: 'Arrastra una tarjeta a la columna "Completado". Escucharás un sonido de confirmación.',
    },
    {
      icon: <MousePointer2 className="w-5 h-5 text-pink-600" />,
      bg: 'bg-pink-50',
      titulo: 'Filtrar y buscar',
      desc: 'Usa la barra de búsqueda o el botón "Filtros" para encontrar tareas por prioridad, responsable o fecha.',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[88vh] overflow-y-auto"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.22)' }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-5 flex items-center gap-3 z-10 rounded-t-2xl">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-700 text-zinc-900 leading-tight" style={{ fontWeight: 700 }}>
                  ¿Cómo usar el tablero?
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Guía rápida de interacción</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps */}
            <div className="p-6 space-y-3">
              {pasos.map((paso, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                  className="flex items-start gap-4 p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50/60 transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl ${paso.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    {paso.icon}
                  </div>
                  <div>
                    <p className="text-sm font-600 text-zinc-800 mb-0.5" style={{ fontWeight: 600 }}>
                      {paso.titulo}
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">{paso.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5">
              <div className="rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-4">
                <p className="text-xs text-violet-700 text-center leading-relaxed">
                  💡 <strong>Tip:</strong> Descarga el <strong>Reporte de Usabilidad</strong> en cualquier momento para ver un análisis completo de tu actividad en la sesión.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default HelpModal;
