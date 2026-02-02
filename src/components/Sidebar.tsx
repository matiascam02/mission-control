'use client';

import { DbAgent } from '@/lib/supabase';
import { AgentCard } from './AgentCard';
import { 
  LayoutDashboard, 
  Users, 
  ListTodo,
  Settings 
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
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">MC</span>
          </div>
          <div>
            <h1 className="font-bold text-white">Mission Control</h1>
            <p className="text-xs text-gray-500">OpenClaw Squad</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Agents List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Agents
          </span>
          <span className="text-xs text-gray-500">
            {activeAgents}/{agents.length} active
          </span>
        </div>
        <div className="space-y-1">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} compact />
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-2 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
