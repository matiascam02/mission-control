'use client';

import { DbAgent } from '@/lib/supabase';
import { AgentCard } from './AgentCard';
import { 
  LayoutDashboard, 
  Users, 
  ListTodo,
  Settings,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  agents: DbAgent[];
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
];

export function Sidebar({ activeTab, onTabChange, agents }: SidebarProps) {
  const activeAgents = agents.filter(a => a.status === 'working').length;

  return (
    <aside className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-white text-lg tracking-tight">Mission Control</h1>
            <p className="text-xs text-zinc-500 font-medium">OpenClaw Squad</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon 
              size={18} 
              className={`transition-transform duration-200 group-hover:scale-110 ${
                activeTab === item.id ? 'text-indigo-400' : ''
              }`}
            />
            <span className="text-sm font-medium">{item.label}</span>
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>
        ))}
      </nav>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-sm py-3 px-1 -mx-1 z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Agents
            </span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {activeAgents > 0 && (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </>
                )}
                {activeAgents === 0 && (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600" />
                )}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                {activeAgents}/{agents.length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} compact />
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all duration-200 group">
          <Settings size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
