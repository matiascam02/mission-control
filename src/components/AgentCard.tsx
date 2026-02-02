'use client';

import { DbAgent } from '@/lib/supabase';

interface AgentCardProps {
  agent: DbAgent;
  compact?: boolean;
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string; glow?: boolean }> = {
  idle: { color: 'bg-zinc-400', bgColor: 'bg-zinc-400/10', label: 'Idle' },
  working: { color: 'bg-emerald-400', bgColor: 'bg-emerald-400/10', label: 'Working', glow: true },
  done: { color: 'bg-blue-400', bgColor: 'bg-blue-400/10', label: 'Done' },
  blocked: { color: 'bg-red-400', bgColor: 'bg-red-400/10', label: 'Blocked' },
};

const levelConfig: Record<string, { className: string; label: string }> = {
  LEAD: { className: 'badge-lead', label: 'LEAD' },
  SPC: { className: 'badge-spc', label: 'SPC' },
  INT: { className: 'badge-int', label: 'INT' },
};

export function AgentCard({ agent, compact = false }: AgentCardProps) {
  const color = agent.color || '#6366f1';
  const status = statusConfig[agent.status] || statusConfig.idle;
  const level = levelConfig[agent.level] || levelConfig.INT;
  
  if (compact) {
    return (
      <div className="sidebar-card flex items-center gap-3 p-2.5 rounded-xl cursor-pointer group">
        <div className="relative flex-shrink-0">
          {/* Avatar with glow effect on working */}
          <div 
            className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-105 ${
              agent.status === 'working' ? 'ring-2 ring-emerald-400/30 ring-offset-2 ring-offset-zinc-950' : ''
            }`}
            style={{ 
              backgroundColor: color + '15',
              boxShadow: agent.status === 'working' ? `0 0 20px ${color}40` : 'none'
            }}
          >
            {agent.emoji || '🤖'}
          </div>
          
          {/* Status indicator */}
          <div className="absolute -bottom-0.5 -right-0.5">
            <div className="relative">
              {status.glow && (
                <div className={`absolute inset-0 ${status.color} rounded-full animate-ping opacity-40`} />
              )}
              <div 
                className={`relative w-3 h-3 rounded-full border-2 border-zinc-900 ${status.color}`}
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white truncate group-hover:text-indigo-300 transition-colors">
              {agent.name}
            </span>
            <span className={`badge ${level.className}`}>
              {level.label}
            </span>
          </div>
          <p className="text-xs text-zinc-500 truncate">{agent.role}</p>
        </div>

        {/* Activity indicator */}
        {agent.status === 'working' && (
          <div className="flex-shrink-0">
            <div className="flex gap-0.5">
              <div className="w-1 h-3 bg-emerald-400/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-3 bg-emerald-400/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-3 bg-emerald-400/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="premium-card rounded-2xl p-5 group">
      <div className="flex items-start gap-4">
        <div className="relative">
          {/* Avatar with enhanced styling */}
          <div 
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-105 ${
              agent.status === 'working' ? 'ring-2 ring-emerald-400/30 ring-offset-2 ring-offset-zinc-900' : ''
            }`}
            style={{ 
              backgroundColor: color + '15',
              boxShadow: `0 4px 12px ${color}30`
            }}
          >
            {agent.emoji || '🤖'}
          </div>
          
          {/* Status indicator with glow */}
          <div className="absolute -bottom-1 -right-1">
            <div className="relative">
              {status.glow && (
                <div className={`absolute inset-0 ${status.color} rounded-full animate-ping opacity-40`} />
              )}
              <div 
                className={`relative w-4 h-4 rounded-full border-2 border-zinc-800 ${status.color}`}
              />
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
              {agent.name}
            </h3>
            <span className={`badge ${level.className}`}>
              {level.label}
            </span>
          </div>
          <p className="text-sm text-zinc-400">{agent.role}</p>
          <p className="text-xs text-zinc-600 mt-1">{agent.anime}</p>
        </div>
      </div>
      
      {/* Current task section */}
      {agent.current_task && (
        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Current Task
            </p>
          </div>
          <p className="text-sm text-zinc-300 line-clamp-2">{agent.current_task}</p>
        </div>
      )}
      
      {/* Status note if present */}
      {agent.note && (
        <div className="mt-3 text-xs text-zinc-500 italic truncate">
          "{agent.note}"
        </div>
      )}
    </div>
  );
}
