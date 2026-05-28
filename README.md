# Planificador de Tareas — Tablero Kanban IHC

> Aplicación de gestión de tareas estilo Kanban, desarrollada como práctica de **Interacción Humano-Computador (IHC)**. Implementa las **10 Heurísticas de Usabilidad de Jakob Nielsen** con un diseño moderno inspirado en Linear.app y Shadcn UI.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-4.5-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-38BDF8?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-10-EF008F?style=flat&logo=framer)](https://www.framer.com/motion)

---

## Vista General

El tablero organiza tareas en cuatro columnas de flujo de trabajo:

| Columna | Estado |
|---|---|
| **Por Hacer** | Tareas pendientes de iniciar |
| **En Progreso** | Tareas actualmente en desarrollo |
| **En Revisión** | Tareas en proceso de revisión/QA |
| **Completado** | Tareas finalizadas |

---

## Funcionalidades

### Gestión de Tareas
- Crear, editar y eliminar tareas con formulario completo
- Prioridades: **Alta**, **Media** y **Baja** con indicadores visuales de color
- Asignación de responsable con avatar generado automáticamente
- Fecha límite con alerta visual de vencimiento
- Sistema de etiquetas (tags) personalizadas
- Persistencia automática en `localStorage`

### Drag & Drop
- Arrastra tarjetas entre columnas con animación de inclinación y escala
- Zona de drop resaltada con el color de la columna destino
- Sonido de confirmación al mover una tarea a **Completado**

### Búsqueda y Filtros
- Búsqueda en tiempo real por título o descripción
- Filtros por prioridad, responsable y fecha límite
- Contador de filtros activos en el botón

---

## Heurísticas de Nielsen Implementadas

### H1 — Visibilidad del Estado del Sistema
- Contador de tareas por columna actualizado en tiempo real
- Indicador de tiempo inactivo en la barra superior
- Barra de progreso animada en el toast de Deshacer

### H3 — Control y Libertad del Usuario
Cada vez que se **elimina** o **mueve** una tarea, aparece un banner flotante en la parte inferior con:
- Barra de progreso visual de 8 segundos
- Botón **"Deshacer"** que restaura el estado previo instantáneamente

### H5 — Prevención de Errores — Candado de Tarjetas
Cada tarjeta tiene un icono de candado interactivo:
- Desbloqueada: se puede arrastrar, editar y eliminar
- Bloqueada: baja opacidad, sin drag, botones deshabilitados

### H5 / H9 — Validación de Formularios
- Botón "Guardar" **deshabilitado** mientras haya campos obligatorios vacíos
- Mensajes de error rojos animados bajo cada campo inválido
- Sin alertas nativas del navegador

### H10 — Ayuda y Documentación
- Botón `?` en la barra superior abre un modal con 6 instrucciones visuales
- Tip destacado sobre el sistema de reportes

---

## Feedback Auditivo (Web Audio API)

Efectos de sonido nativos **sin dependencias externas** ni archivos de audio:

| Accion | Sonido |
|---|---|
| Abrir modal / presionar botones | Clic suave (sine wave 820 a 600 Hz) |
| Mover tarea a "Completado" | Acorde Do5 + Mi5 (ding de exito) |

---

## Reporte de Usabilidad HTML

Al hacer clic en **"Reporte"**, se descarga un archivo `reporte_usabilidad_YYYYMMDD_HHMM.html` autocontenido con:

- **KPIs ejecutivos:** Tiempo Activo, Tiempo Inactivo, Tareas Creadas, Movimientos
- **Tabla cronologica** de eventos categorizada por tipo con colores
- Filtrado automatico de ruido (escritura letra por letra, arrastres intermedios)
- Funciona en cualquier navegador sin servidor

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| **React 18** | Framework de componentes |
| **Vite 4** | Bundler y servidor de desarrollo |
| **Tailwind CSS 3** | Utilidades de estilos |
| **Framer Motion 10** | Animaciones y micro-interacciones |
| **Radix UI** | Componentes accesibles de base |
| **Lucide React** | Sistema de iconos |
| **Web Audio API** | Feedback auditivo nativo |

---

## Instalacion y Uso

### Requisitos previos
- Node.js 16 o superior
- npm 8 o superior

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/mariohp20/KANBAN_IHC.git
cd KANBAN_IHC

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre **http://localhost:3000** en tu navegador.

### Build de produccion

```bash
npm run build
npm run preview
```

---

## Estructura del Proyecto

```
src/
├── components/
│   ├── KanbanBoard.jsx      # Tablero principal — integra toda la logica
│   ├── TaskColumn.jsx       # Columna de tareas con zona de drop animada
│   ├── TaskCard.jsx         # Tarjeta individual con candado y drag
│   ├── TaskModal.jsx        # Modal de creacion/edicion con validacion
│   ├── FilterPanel.jsx      # Panel de filtros desplegable
│   ├── StatsPanel.jsx       # Panel de estadisticas de sesion
│   ├── UndoToast.jsx        # Toast de deshacer con cuenta regresiva
│   ├── HelpModal.jsx        # Modal de ayuda (H10)
│   └── ui/                  # Componentes base (Button, Input, etc.)
├── hooks/
│   ├── useTasks.js          # Estado de tareas + localStorage
│   ├── useEventLogger.js    # Logger + generador de reporte HTML
│   ├── useIdleTracker.js    # Deteccion de inactividad del usuario
│   ├── useUndoManager.js    # Historial de snapshots para Undo
│   └── useAudioFeedback.js  # Efectos de sonido con Web Audio API
├── lib/
│   └── utils.js             # Utilidades (cn, classnames)
├── index.css                # Sistema de diseno global (Inter, zinc/slate)
└── main.jsx                 # Entry point
```

---

## Autores

Desarrollado como proyecto academico para la asignatura de **Interaccion Humano-Computador (IHC)**.

---

## Licencia

MIT — libre para uso academico y personal.
