import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';

const FilterPanel = ({ filters, onFilterChange, tasks }) => {
  const uniqueAssignees = [...new Set(tasks.map(task => task.assignee))];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 bg-white rounded-lg border-2 border-slate-200 p-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority-filter">Priority</Label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignee-filter">Assignee</Label>
          <select
            id="assignee-filter"
            value={filters.assignee}
            onChange={(e) => onFilterChange('assignee', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assignees</option>
            {uniqueAssignees.map(assignee => (
              <option key={assignee} value={assignee}>{assignee}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duedate-filter">Due Date</Label>
          <select
            id="duedate-filter"
            value={filters.dueDate}
            onChange={(e) => onFilterChange('dueDate', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Dates</option>
            <option value="overdue">Overdue</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterPanel;