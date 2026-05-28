import { useState, useCallback, useRef } from 'react';

const EVENT_LABELS = {
  session_start:         { categoria: 'Sistema',     descripcion: () => 'Inicio de sesión' },
  task_created:          { categoria: 'Creación',    descripcion: (d) => `Tarea creada: "${d?.taskData?.title || 'Sin título'}" (prioridad: ${translatePriority(d?.taskData?.priority)})` },
  task_updated:          { categoria: 'Edición',     descripcion: (d) => `Tarea actualizada: "${d?.taskId}"` },
  task_deleted:          { categoria: 'Eliminación', descripcion: (d) => `Tarea eliminada: "${d?.taskTitle || d?.taskId}"` },
  task_dragged:          { categoria: 'Movimiento',  descripcion: (d) => `"${d?.taskTitle}" movida de "${translateStatus(d?.fromStatus)}" a "${translateStatus(d?.toStatus)}"` },
  task_edit_initiated:   { categoria: 'Edición',     descripcion: (d) => `Edición iniciada: "${d?.taskTitle}"` },
  task_locked:           { categoria: 'Seguridad',   descripcion: (d) => `Tarea bloqueada: "${d?.taskTitle}"` },
  task_unlocked:         { categoria: 'Seguridad',   descripcion: (d) => `Tarea desbloqueada: "${d?.taskTitle}"` },
  task_undo:             { categoria: 'Control',     descripcion: () => 'Acción deshecha (estado anterior restaurado)' },
  button_click:          { categoria: 'Interacción', descripcion: (d) => `Clic en botón: ${translateAction(d?.action)}` },
  modal_closed:          { categoria: 'Navegación',  descripcion: () => 'Modal cerrado' },
  modal_opened:          { categoria: 'Navegación',  descripcion: () => 'Modal abierto' },
  help_opened:           { categoria: 'Ayuda',       descripcion: () => 'Modal de ayuda abierto' },
  filter_applied:        { categoria: 'Filtro',      descripcion: (d) => `Filtro aplicado: ${d?.filterType} = "${d?.value}"` },
  search_query:          { categoria: 'Búsqueda',    descripcion: (d) => `Búsqueda: "${d?.query}"` },
  form_submitted:        { categoria: 'Formulario',  descripcion: (d) => `Formulario enviado: ${translateAction(d?.action)}` },
  log_download_initiated:{ categoria: 'Sistema',     descripcion: (d) => `Reporte descargado (${d?.totalTasks} tareas)` },
  user_idle:             { categoria: 'Actividad',   descripcion: () => 'Usuario inactivo' },
  user_active:           { categoria: 'Actividad',   descripcion: () => 'Usuario activo de nuevo' },
};

function translatePriority(p) {
  return { high: 'Alta', medium: 'Media', low: 'Baja' }[p] || p || '—';
}

function translateStatus(s) {
  return { todo: 'Por Hacer', 'in-progress': 'En Progreso', review: 'En Revisión', done: 'Completado' }[s] || s || '—';
}

function translateAction(a) {
  return {
    open_add_task_modal:  'Abrir modal nueva tarea',
    toggle_stats_panel:   'Mostrar/ocultar estadísticas',
    toggle_filter_panel:  'Mostrar/ocultar filtros',
    update_task:          'Actualizar tarea',
    create_task:          'Crear tarea',
  }[a] || a || '—';
}

function formatSessionTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export const useEventLogger = () => {
  const [events, setEvents] = useState([]);
  const sessionStartTime = useRef(new Date());

  const logEvent = useCallback((eventType, eventData = {}) => {
    const event = {
      timestamp: new Date(),
      eventType,
      data: eventData,
      sessionTime: Math.floor((new Date() - sessionStartTime.current) / 1000)
    };
    setEvents(prev => [...prev, event]);
  }, []);

  const getStats = useCallback(() => {
    const NOISE = ['form_field_changed', 'drag_start', 'drag_end'];
    const significantEvents = events.filter(e => !NOISE.includes(e.eventType));
    const eventTypes = significantEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {});
    return {
      totalEvents: significantEvents.length,
      eventTypes,
      sessionDuration: Math.floor((new Date() - sessionStartTime.current) / 1000)
    };
  }, [events]);

  const downloadLog = useCallback(() => {
    const now = new Date();
    const stats = getStats();
    const NOISE = ['form_field_changed', 'drag_start', 'drag_end'];
    const cleanEvents = events.filter(e => !NOISE.includes(e.eventType));

    const downloadMeta = events.find(e => e.eventType === 'log_download_initiated');
    const activeTime = formatSessionTime(downloadMeta?.data?.activeTime || stats.sessionDuration);
    const idleTime   = formatSessionTime(downloadMeta?.data?.idleTime || 0);
    const tareasCreadas = stats.eventTypes['task_created'] || 0;
    const movimientos   = stats.eventTypes['task_dragged'] || 0;

    const tableRows = cleanEvents.map((ev, i) => {
      const meta = EVENT_LABELS[ev.eventType] || { categoria: 'Otro', descripcion: () => ev.eventType };
      const hora   = ev.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const sesion = formatSessionTime(ev.sessionTime);
      const desc   = meta.descripcion(ev.data);
      const rowBg  = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      const cat    = getCategoryColor(meta.categoria);
      return `
        <tr style="background:${rowBg};">
          <td style="padding:10px 14px;font-size:13px;color:#64748b;white-space:nowrap;">${hora}</td>
          <td style="padding:10px 14px;">
            <span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600;background:${cat.bg};color:${cat.text};">${meta.categoria}</span>
          </td>
          <td style="padding:10px 14px;font-size:13px;color:#1e293b;">${escapeHtml(desc)}</td>
          <td style="padding:10px 14px;font-size:13px;color:#94a3b8;text-align:center;">${sesion}</td>
        </tr>`;
    }).join('');

    function getCategoryColor(cat) {
      const map = {
        'Sistema':     { bg: '#f0f9ff', text: '#0369a1' },
        'Creación':    { bg: '#f0fdf4', text: '#15803d' },
        'Edición':     { bg: '#fffbeb', text: '#b45309' },
        'Eliminación': { bg: '#fef2f2', text: '#dc2626' },
        'Movimiento':  { bg: '#faf5ff', text: '#7e22ce' },
        'Seguridad':   { bg: '#fefce8', text: '#ca8a04' },
        'Control':     { bg: '#eff6ff', text: '#1d4ed8' },
        'Interacción': { bg: '#f0fdfa', text: '#0f766e' },
        'Navegación':  { bg: '#fdf4ff', text: '#a21caf' },
        'Filtro':      { bg: '#fff7ed', text: '#c2410c' },
        'Búsqueda':    { bg: '#f0f9ff', text: '#0284c7' },
        'Formulario':  { bg: '#f8fafc', text: '#475569' },
        'Actividad':   { bg: '#f0fdf4', text: '#16a34a' },
        'Ayuda':       { bg: '#fdf4ff', text: '#9333ea' },
      };
      return map[cat] || { bg: '#f8fafc', text: '#64748b' };
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reporte de Usabilidad — Planificador de Tareas</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #0f172a; }
    .kpi-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    table { border-collapse: collapse; width: 100%; }
    th { background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 10px 14px; text-align: left; border-bottom: 2px solid #e2e8f0; }
    tr:hover td { background: #eff6ff !important; transition: background 0.15s; }
  </style>
</head>
<body>
  <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%); padding: 48px 0 32px; margin-bottom: 0;">
    <div style="max-width: 960px; margin: 0 auto; padding: 0 32px;">
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:12px;">
        <div style="width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:22px;">K</div>
        <div>
          <p style="color:rgba(255,255,255,0.6);font-size:13px;margin:0;letter-spacing:0.05em;text-transform:uppercase;">Reporte Ejecutivo de Usabilidad</p>
          <h1 style="color:white;font-size:26px;font-weight:700;margin:2px 0 0;">Planificador de Tareas — Sesion Kanban</h1>
        </div>
      </div>
      <p style="color:rgba(255,255,255,0.55);font-size:13px;margin:0;">
        Generado el <strong style="color:rgba(255,255,255,0.8);">${now.toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</strong>
        a las <strong style="color:rgba(255,255,255,0.8);">${now.toLocaleTimeString('es-ES')}</strong>
      </p>
    </div>
  </div>

  <div style="max-width:960px;margin:0 auto;padding:32px;">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;margin-top:-20px;">
      <div class="kpi-card" style="border-top:3px solid #6366f1;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6366f1;margin:0 0 8px;">Tiempo Activo</p>
        <p style="font-size:28px;font-weight:800;color:#1e1b4b;margin:0;">${activeTime}</p>
        <p style="font-size:12px;color:#94a3b8;margin:4px 0 0;">Interaccion total</p>
      </div>
      <div class="kpi-card" style="border-top:3px solid #f59e0b;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#d97706;margin:0 0 8px;">Tiempo Inactivo</p>
        <p style="font-size:28px;font-weight:800;color:#1e1b4b;margin:0;">${idleTime}</p>
        <p style="font-size:12px;color:#94a3b8;margin:4px 0 0;">Sin actividad detectada</p>
      </div>
      <div class="kpi-card" style="border-top:3px solid #10b981;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#059669;margin:0 0 8px;">Tareas Creadas</p>
        <p style="font-size:28px;font-weight:800;color:#1e1b4b;margin:0;">${tareasCreadas}</p>
        <p style="font-size:12px;color:#94a3b8;margin:4px 0 0;">Durante la sesion</p>
      </div>
      <div class="kpi-card" style="border-top:3px solid #8b5cf6;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#7c3aed;margin:0 0 8px;">Movimientos</p>
        <p style="font-size:28px;font-weight:800;color:#1e1b4b;margin:0;">${movimientos}</p>
        <p style="font-size:12px;color:#94a3b8;margin:4px 0 0;">Arrastres entre columnas</p>
      </div>
    </div>

    <div style="background:white;border-radius:12px;border:1px solid #e2e8f0;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:12px;">
      <strong style="color:#1e293b;">${cleanEvents.length} eventos relevantes</strong>
      <span style="color:#64748b;font-size:14px;margin-left:4px;">registrados en la sesion (escritura de teclado filtrada)</span>
    </div>

    <div style="background:white;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <div style="padding:20px 24px;border-bottom:1px solid #f1f5f9;">
        <h2 style="font-size:16px;font-weight:700;color:#0f172a;margin:0;">Registro Cronologico de Acciones</h2>
      </div>
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Hora</th>
              <th>Categoria</th>
              <th>Descripcion del Evento</th>
              <th style="text-align:center;">T. Sesion</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="4" style="text-align:center;padding:32px;color:#94a3b8;">No hay eventos registrados</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <p style="text-align:center;color:#cbd5e1;font-size:12px;margin-top:32px;">
      Reporte generado automaticamente por el Planificador de Tareas · IHC 2026
    </p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_usabilidad_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [events, getStats]);

  return { logEvent, downloadLog, getStats, events };
};