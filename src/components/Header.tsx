'use client';

import { ConvexAgent, ConvexTask } from '@/lib/convex-types';
import { Users, ListTodo } from 'lucide-react';

interface HeaderProps {
  agents: ConvexAgent[];
  tasks: ConvexTask[];
  onMenuClick?: () => void;
  onActivityClick?: () => void;
}

export function Header({ agents, tasks }: HeaderProps) {
  const activeAgents = agents.filter(a => a.status === 'working').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="h-16 bg-[#141414]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">
      {/* Left section - Greeting */}
      <div>
        <h2 className="text-lg font-semibold text-white">{greeting}</h2>
        <p className="text-xs text-zinc-500">Here&apos;s what&apos;s happening with your squad</p>
      </div>

      {/* Center - Live Stats */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
          <Users size={16} className="text-purple-400" />
          <span className="text-sm font-semibold text-white">{activeAgents}</span>
          <span className="text-xs text-zinc-500">active</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
          <ListTodo size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-white">{tasks.length}</span>
          <span className="text-xs text-zinc-500">tasks</span>
        </div>

        {blockedTasks > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-sm font-semibold text-red-400">{blockedTasks}</span>
            <span className="text-xs text-red-400/70">blocked</span>
          </div>
        )}
      </div>

      {/* Right section - Live indicator */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
        </div>
        <span className="text-xs font-bold text-emerald-400 tracking-wider">LIVE</span>
      </div>
    </header>
  );
}
