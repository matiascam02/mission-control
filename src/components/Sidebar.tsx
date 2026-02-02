'use client';

import { DbAgent } from '@/lib/supabase';
import { AgentCard } from './AgentCard';
import { LayoutDashboard, Users, ListTodo, Settings, X } from 'lucide-react';

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

  return (
    <aside className="w-64 bg-[#12121a] border-r border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MC</span>
          </div>
          <div>
            <h1 className="font-semibold text-white text-sm">Mission Control</h1>
            <p className="text-[10px] text-zinc-500">OpenClaw Squad</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-white/10 rounded">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeTab === item.id
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Agents */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
            Agents
          </span>
          <span className="text-[10px] text-zinc-600">
            {activeAgents}/{agents.length} active
          </span>
        </div>
        <div className="space-y-0.5">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} compact />
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-2 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white text-sm transition-colors">
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
