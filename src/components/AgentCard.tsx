'use client';

import { DbAgent } from '@/lib/supabase';

interface AgentCardProps {
  agent: DbAgent;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  idle: 'status-idle',
  working: 'status-working',
  done: 'status-done',
  blocked: 'status-blocked',
};

const levelClasses: Record<string, string> = {
  LEAD: 'badge-lead',
  SPC: 'badge-spc',
  INT: 'badge-int',
};

export function AgentCard({ agent, compact = false }: AgentCardProps) {
  const color = agent.color || '#6366f1';
  
  if (compact) {
    return (
      <div className="sidebar-item flex items-center gap-3 p-2 rounded-lg cursor-pointer">
        <div className="relative flex-shrink-0">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-base"
            style={{ backgroundColor: color + '20' }}
          >
            {agent.emoji || '🤖'}
          </div>
          <div 
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#12121a] ${statusColors[agent.status]} ${agent.status === 'working' ? 'animate-pulse-slow' : ''}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white truncate">{agent.name}</span>
            <span className={`badge ${levelClasses[agent.level]}`}>
              {agent.level}
            </span>
          </div>
          <p className="text-xs text-zinc-500 truncate">{agent.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: color + '20' }}
          >
            {agent.emoji || '🤖'}
          </div>
          <div 
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#16161f] ${statusColors[agent.status]} ${agent.status === 'working' ? 'animate-pulse-slow' : ''}`}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <span className={`badge ${levelClasses[agent.level]}`}>
              {agent.level}
            </span>
          </div>
          <p className="text-sm text-zinc-400">{agent.role}</p>
          <p className="text-xs text-zinc-600 mt-0.5">{agent.anime}</p>
        </div>
      </div>
      {agent.current_task && (
        <div className="mt-3 p-2.5 bg-white/5 rounded-lg">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Working on</p>
          <p className="text-sm text-zinc-300 truncate">{agent.current_task}</p>
        </div>
      )}
    </div>
  );
}
