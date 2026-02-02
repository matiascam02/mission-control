'use client';

import { DbAgent, DbTask } from '@/lib/supabase';
import { Users, ListTodo, Radio, FileText } from 'lucide-react';

interface HeaderProps {
  agents: DbAgent[];
  tasks: DbTask[];
}

export function Header({ agents, tasks }: HeaderProps) {
  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-500" />
          <span className="text-white font-semibold">Agents</span>
          <span className="text-blue-400 font-bold">{agents.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <ListTodo size={18} className="text-gray-500" />
          <span className="text-white font-semibold">Tasks</span>
          <span className="text-blue-400 font-bold">{tasks.length}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
          <Radio size={16} className="text-red-400" />
          <span className="text-sm text-gray-300">Broadcast</span>
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
          <FileText size={16} className="text-gray-400" />
          <span className="text-sm text-gray-300">Docs</span>
        </button>
        <div className="flex items-center gap-2 text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">ONLINE</span>
        </div>
      </div>
    </header>
  );
}
