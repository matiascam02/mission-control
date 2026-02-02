'use client';

import { DbAgent, DbTask } from '@/lib/supabase';
import { Users, ListTodo, Radio, Menu, Bell, Activity } from 'lucide-react';

interface HeaderProps {
  agents: DbAgent[];
  tasks: DbTask[];
  onMenuClick?: () => void;
  onActivityClick?: () => void;
}

export function Header({ agents, tasks, onMenuClick, onActivityClick }: HeaderProps) {
  const activeAgents = agents.filter(a => a.status === 'working').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;

  return (
    <header className="h-14 md:h-16 bg-black/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-6">
      {/* Left section */}
      <div className="flex items-center gap-4 md:gap-8">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <Menu size={20} className="text-zinc-400" />
        </button>
        
        {/* Stats - hide some on mobile */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
          <Users size={16} className="text-indigo-400" />
          <span className="text-sm text-zinc-300 font-medium">{activeAgents}</span>
          <span className="text-xs text-zinc-600">active</span>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
          <ListTodo size={16} className="text-blue-400" />
          <span className="text-sm text-zinc-300 font-medium">{tasks.length}</span>
          <span className="text-xs text-zinc-600 hidden sm:inline">tasks</span>
        </div>
        
        {blockedTasks > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-sm text-red-400 font-medium">{blockedTasks}</span>
            <span className="text-xs text-red-400/70 hidden sm:inline">blocked</span>
          </div>
        )}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Broadcast button - hidden on mobile */}
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200 group">
          <Radio size={14} className="text-red-400 group-hover:animate-pulse" />
          <span className="text-sm text-zinc-300">Broadcast</span>
        </button>
        
        {/* Activity button - mobile only */}
        <button 
          onClick={onActivityClick}
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors relative"
        >
          <Activity size={20} className="text-zinc-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
        </button>
        
        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors relative">
          <Bell size={18} className="text-zinc-400" />
        </button>
        
        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" />
          </div>
          <span className="text-xs font-semibold text-emerald-400 tracking-wide">LIVE</span>
        </div>
      </div>
    </header>
  );
}
