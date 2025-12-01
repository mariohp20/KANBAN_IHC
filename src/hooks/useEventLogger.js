import { useState, useCallback, useRef } from 'react';

export const useEventLogger = () => {
  const [events, setEvents] = useState([]);
  const sessionStartTime = useRef(new Date());

  // Función para registrar eventos
  const logEvent = useCallback((eventType, eventData = {}) => {
    const event = {
      timestamp: new Date(), // Guardamos como objeto fecha real
      eventType,
      data: eventData,
      sessionTime: Math.floor((new Date() - sessionStartTime.current) / 1000)
    };
    setEvents(prev => [...prev, event]);
  }, []);

  // Función para calcular estadísticas
  const getStats = useCallback(() => {
    // Filtramos para contar solo eventos significativos
    const significantEvents = events.filter(e => 
      !['form_field_changed', 'drag_start', 'drag_end'].includes(e.eventType)
    );

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

  // ESTA ES LA PARTE QUE GENERA EL TXT
  const downloadLog = useCallback(() => {
    const stats = getStats();
    const now = new Date();
    
    // 1. Cabecera
    let logContent = '================================================================\n';
    logContent += '                 REPORTE DE ACTIVIDAD - KANBAN              \n';
    logContent += '================================================================\n\n';
    
    // 2. Información de Sesión
    logContent += `FECHA: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n`;
    logContent += `DURACIÓN: ${Math.floor(stats.sessionDuration / 60)} min ${stats.sessionDuration % 60} seg\n`;
    logContent += `ACCIONES TOTALES: ${stats.totalEvents}\n\n`;

    // 3. Resumen de acciones
    logContent += 'RESUMEN DE ACCIONES:\n';
    logContent += '----------------------------------------------------------------\n';
    Object.entries(stats.eventTypes).forEach(([type, count]) => {
      // Traducimos los tipos de eventos para que se vean bonitos
      const readableType = type
        .replace('task_created', 'Tareas Creadas')
        .replace('task_dragged', 'Movimientos de Tareas')
        .replace('form_submitted', 'Formularios Enviados')
        .replace('button_click', 'Clics en Botones')
        .replace('session_start', 'Inicio de Sesión');
        
      logContent += `- ${readableType}: ${count}\n`;
    });
    logContent += '\n';

    // 4. Detalle (Aquí filtramos el ruido)
    logContent += 'DETALLE CRONOLÓGICO (Solo acciones relevantes):\n';
    logContent += '================================================================\n';

    events.forEach((event) => {
      // FILTRO: Ignoramos escribir letra por letra y los arrastres intermedios
      if (['form_field_changed', 'drag_start', 'drag_end'].includes(event.eventType)) {
        return; 
      }

      const timeStr = event.timestamp.toLocaleTimeString();
      
      // Formato personalizado según el tipo de evento
      let message = '';
      
      switch(event.eventType) {
        case 'task_created':
          message = ` [NUEVA TAREA] "${event.data.taskData?.title || 'Sin título'}" creada con prioridad ${event.data.taskData?.priority}`;
          break;
        case 'task_dragged':
          message = ` [MOVIMIENTO] "${event.data.taskTitle}" pasó de "${event.data.fromStatus}" a --> "${event.data.toStatus}"`;
          break;
        case 'form_submitted':
           // Ya tenemos task_created, así que form_submitted puede ser redundante, 
           // pero lo dejamos simple por si acaso.
           message = ` [FORMULARIO] Se envió el formulario para: ${event.data.action}`;
           break;
        case 'session_start':
           message = ` [SISTEMA] Inicio de sesión de usuario`;
           break;
        default:
           // Para otros eventos, mostramos un resumen simple
           message = ` [OTRO] ${event.eventType} - ${JSON.stringify(event.data)}`;
      }

      logContent += `${timeStr} | ${message}\n`;
      logContent += '----------------------------------------------------------------\n';
    });

    logContent += '\n=== FIN DEL REPORTE ===\n';

    // Código de descarga
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Registro_Eventos_${now.getHours()}-${now.getMinutes()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [events, getStats]);

  return { logEvent, downloadLog, getStats, events };
};