'use client';

import { DbAgent } from '@/lib/supabase';
import { AgentCard } from './AgentCard';
import { X, Sparkles, Zap } from 'lucide-react';

interface SidebarProps {
  agents: DbAgent[];
  onClose?: () => void;
  onAgentClick?: (agent: DbAgent) => void;
}

export function Sidebar({ agents, onClose, onAgentClick }: SidebarProps) {
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
              <AgentCard agent={agent} compact onClick={() => onAgentClick?.(agent)} />
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
}
