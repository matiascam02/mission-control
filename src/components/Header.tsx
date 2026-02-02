'use client';

import { DbAgent, DbTask } from '@/lib/supabase';
import { Users, ListTodo, Radio, Bell, Search, Command } from 'lucide-react';

interface HeaderProps {
  agents: DbAgent[];
  tasks: DbTask[];
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
      {/* Left section - Greeting & Search */}
      <div className="flex items-center gap-6">
        <div>
          <h2 className="text-lg font-semibold text-white">{greeting}</h2>
          <p className="text-xs text-zinc-500">Here&apos;s what&apos;s happening with your squad</p>
        </div>
        
        {/* Search - hidden on smaller screens */}
        <div className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
          <Search size={16} className="text-zinc-500" />
          <input 
            type="text"
            placeholder="Search agents, tasks..."
            className="bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none w-48"
          />
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
            <Command size={10} className="text-zinc-500" />
            <span className="text-[10px] text-zinc-500 font-mono">K</span>
          </div>
        </div>
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

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Broadcast button */}
        <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/10 border border-red-500/20 hover:border-red-500/30 transition-all duration-200 group">
          <Radio size={14} className="text-red-400 group-hover:animate-pulse" />
          <span className="text-sm font-medium text-red-400">Broadcast</span>
        </button>
        
        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-white/5 transition-colors group">
          <Bell size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-400" />
        </button>
        
        {/* Live indicator */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
          </div>
          <span className="text-xs font-bold text-emerald-400 tracking-wider">LIVE</span>
        </div>
      </div>
    </header>
  );
}
