'use client';

import { DbAgent } from '@/lib/supabase';
import { AgentCard } from './AgentCard';
import { LayoutDashboard, Users, ListTodo, Settings, X, Sparkles, Zap } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  agents: DbAgent[];
  onClose?: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
];

export function Sidebar({ activeTab, onTabChange, agents, onClose }: SidebarProps) {
  const activeAgents = agents.filter(a => a.status === 'working').length;
  const blockedAgents = agents.filter(a => a.status === 'blocked').length;

  return (
    <aside className="w-72 bg-[#141414]/95 backdrop-blur-xl border-r border-white/5 flex flex-col h-full">
      {/* Header with Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white">Mission Control</h1>
              <p className="text-[11px] text-zinc-500 font-medium">OpenClaw Squad</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X size={18} className="text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-emerald-400" />
              <span className="text-lg font-bold text-emerald-400">{activeAgents}</span>
            </div>
            <p className="text-[10px] text-emerald-400/70 font-medium">Active</p>
          </div>
          {blockedAgents > 0 && (
            <div className="flex-1 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
              <span className="text-lg font-bold text-red-400">{blockedAgents}</span>
              <p className="text-[10px] text-red-400/70 font-medium">Blocked</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3">
        <p className="px-3 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">
          Navigation
        </p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-orange-500/20 to-red-500/10 text-orange-400 border border-orange-500/20 shadow-lg shadow-orange-500/5'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="flex items-center justify-between px-3 py-2 mb-2">
          <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
            Squad ({agents.length})
          </p>
          <span className="text-[10px] text-zinc-600 font-mono">
            {activeAgents} online
          </span>
        </div>
        <div className="space-y-0.5">
          {agents.map((agent, index) => (
            <div 
              key={agent.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <AgentCard agent={agent} compact />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white text-sm font-medium transition-all duration-200 group">
          <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
