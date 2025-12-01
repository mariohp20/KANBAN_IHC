import React from 'react';
import { motion } from 'framer-motion';
import { Activity, MousePointer, Clock, FileText } from 'lucide-react';

const StatsPanel = ({ stats, tasks, totalActiveTime, idleTime }) => {
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 bg-white rounded-lg border-2 border-slate-200 p-6"
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5" />
        Session Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{tasksByStatus.todo}</div>
          <div className="text-sm text-blue-600">To Do</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-700">{tasksByStatus['in-progress']}</div>
          <div className="text-sm text-yellow-600">In Progress</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{tasksByStatus.review}</div>
          <div className="text-sm text-purple-600">Review</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-700">{tasksByStatus.done}</div>
          <div className="text-sm text-green-600">Done</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <MousePointer className="w-5 h-5 text-slate-600" />
          <div>
            <div className="text-sm text-slate-600">Total Events</div>
            <div className="text-lg font-semibold text-slate-800">{stats.totalEvents}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <Clock className="w-5 h-5 text-slate-600" />
          <div>
            <div className="text-sm text-slate-600">Active Time</div>
            <div className="text-lg font-semibold text-slate-800">{formatTime(totalActiveTime)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <FileText className="w-5 h-5 text-slate-600" />
          <div>
            <div className="text-sm text-slate-600">Idle Time</div>
            <div className="text-lg font-semibold text-slate-800">{formatTime(idleTime)}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          <strong>Event Breakdown:</strong> {stats.eventTypes && Object.entries(stats.eventTypes).map(([type, count]) => 
            `${type}: ${count}`
          ).join(' | ')}
        </div>
      </div>
    </motion.div>
  );
};

export default StatsPanel;