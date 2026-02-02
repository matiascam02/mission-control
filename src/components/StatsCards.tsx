'use client';

import { agents } from '@/lib/agents';

export function StatsCards() {
  const activeAgents = agents.filter(a => a.status === 'working').length;
  const blockedTasks = 0;
  const tasksInQueue = 5;

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
        <p className="text-xs text-green-500 mt-1">None</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tasks in Queue</p>
        <p className="text-3xl font-bold text-white">{tasksInQueue}</p>
        <p className="text-xs text-gray-500 mt-1">Active tasks</p>
      </div>
    </div>
  );
}
