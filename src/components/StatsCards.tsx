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
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="card p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Active</p>
        <p className="text-2xl font-bold text-white">{activeAgents}</p>
        <p className="text-xs text-zinc-600">{agents.length} agents</p>
      </div>
      <div className="card p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Blocked</p>
        <p className="text-2xl font-bold text-white">{blockedTasks}</p>
        <p className={`text-xs ${blockedTasks === 0 ? 'text-emerald-500' : 'text-red-400'}`}>
          {blockedTasks === 0 ? 'All clear' : 'Need attention'}
        </p>
      </div>
      <div className="card p-4">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">In Progress</p>
        <p className="text-2xl font-bold text-white">{inProgressTasks}</p>
        <p className="text-xs text-zinc-600">{tasks.length} total</p>
      </div>
    </div>
  );
}
