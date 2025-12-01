import React from 'react';
import { Helmet } from 'react-helmet';
import KanbanBoard from '@/components/KanbanBoard';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <>
      <Helmet>
        <title>Planificador de Tareas</title>
        <meta name="description" content="Planificador de Tareas" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <KanbanBoard />
        <Toaster />
      </div>
    </>
  );
}

export default App;