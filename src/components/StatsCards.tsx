'use client';

import { DbAgent, DbTask } from '@/lib/supabase';

interface StatsCardsProps {
  agents: DbAgent[];
  tasks: DbTask[];
}

export function StatsCards({ agents, tasks }: StatsCardsProps) {
  const activeAgents = agents.filter(a => a.status === 'working').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active Agents</p>
        <p className="text-3xl font-bold text-white">{activeAgents}</p>
        <p className="text-xs text-gray-500 mt-1">{agents.length} total</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Blocked</p>
        <p className="text-3xl font-bold text-white">{blockedTasks}</p>
        <p className={`text-xs mt-1 ${blockedTasks === 0 ? 'text-green-500' : 'text-red-500'}`}>
          {blockedTasks === 0 ? 'None' : `${blockedTasks} need attention`}
        </p>
      </div>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">In Progress</p>
        <p className="text-3xl font-bold text-white">{inProgressTasks}</p>
        <p className="text-xs text-gray-500 mt-1">{tasks.length} total tasks</p>
      </div>
    </div>
  );
}
