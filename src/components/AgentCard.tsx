'use client';

import { DbAgent } from '@/lib/supabase';
import { Activity, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AgentCardProps {
  agent: DbAgent;
  compact?: boolean;
  onClick?: () => void;
}

const statusConfig: Record<string, { 
  class: string; 
  label: string; 
  icon: typeof Activity;
  bg: string;
}> = {
  idle: { 
    class: 'status-idle', 
    label: 'Idle', 
    icon: Activity,
    bg: 'bg-zinc-500/10'
  },
  working: { 
    class: 'status-working', 
    label: 'Working', 
    icon: Zap,
    bg: 'bg-emerald-500/10'
  },
  done: { 
    class: 'status-done', 
    label: 'Done', 
    icon: CheckCircle2,
    bg: 'bg-blue-500/10'
  },
  blocked: { 
    class: 'status-blocked', 
    label: 'Blocked', 
    icon: AlertCircle,
    bg: 'bg-red-500/10'
  },
};

const levelConfig: Record<string, { class: string; gradient: string }> = {
  LEAD: { class: 'badge-lead', gradient: 'from-amber-500 to-orange-500' },
  SPC: { class: 'badge-spc', gradient: 'from-purple-500 to-violet-500' },
  INT: { class: 'badge-int', gradient: 'from-zinc-500 to-zinc-600' },
};

export function AgentCard({ agent, compact = false, onClick }: AgentCardProps) {
  const color = agent.color || '#f97316';
  const status = statusConfig[agent.status] || statusConfig.idle;
  const level = levelConfig[agent.level] || levelConfig.INT;
  const StatusIcon = status.icon;
  
  if (compact) {
    return (
      <div 
        className="sidebar-item group flex items-center gap-3 p-2.5 cursor-pointer"
        onClick={onClick}
      >
        {/* Avatar with status */}
        <div className="relative flex-shrink-0">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-105"
            style={{ 
              backgroundColor: color + '15',
              boxShadow: agent.status === 'working' ? `0 0 20px ${color}30` : 'none'
            }}
          >
            {agent.emoji || '🤖'}
          </div>
          <div 
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#141414] ${status.class}`}
          />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white/90 truncate group-hover:text-white transition-colors">
              {agent.name}
            </span>
            <span className={`badge text-[9px] ${level.class}`}>
              {agent.level}
            </span>
          </div>
          <p className="text-xs text-zinc-500 truncate">{agent.role}</p>
        </div>
        
        {/* Status indicator on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <StatusIcon size={14} className="text-zinc-500" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="card p-5 animate-fade-in-up group cursor-pointer"
      style={{ 
        animationDelay: `${Math.random() * 0.2}s`,
        borderColor: agent.status === 'working' ? color + '30' : undefined
      }}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-105"
            style={{ 
              backgroundColor: color + '15',
              boxShadow: agent.status === 'working' ? `0 4px 24px ${color}40` : 'none'
            }}
          >
            {agent.emoji || '🤖'}
          </div>
          <div 
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-[#1a1a1a] ${status.class}`}
          />
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white text-lg">{agent.name}</h3>
            <span className={`badge ${level.class}`}>
              {agent.level}
            </span>
          </div>
          <p className="text-sm text-zinc-400">{agent.role}</p>
          <p className="text-xs text-zinc-600 mt-0.5 italic">{agent.anime}</p>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className={`mt-4 px-3 py-2 rounded-xl flex items-center gap-2 ${status.bg} transition-colors`}>
        <StatusIcon size={14} className="text-zinc-400" />
        <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
          {status.label}
        </span>
        {agent.status === 'working' && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-mono">ACTIVE</span>
          </div>
        )}
      </div>
      
      {/* Current Task */}
      {agent.current_task && (
        <div className="mt-3 p-4 bg-gradient-to-br from-white/[0.04] to-transparent rounded-xl border border-white/5">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
            <Zap size={10} className="text-orange-400" />
            Working on
          </p>
          <p className="text-sm text-zinc-200 leading-relaxed">{agent.current_task}</p>
        </div>
      )}
    </div>
  );
}
