'use client';

import { DbAgent } from '@/lib/supabase';
import { AgentSprite, hasSprite } from './AgentSprite';
import { Zap, Coffee, AlertTriangle, CheckCircle } from 'lucide-react';

interface SquadStatusProps {
  agents: DbAgent[];
  onAgentClick?: (agent: DbAgent) => void;
}

const statusConfig: Record<string, { 
  label: string; 
  color: string;
  bgColor: string;
  icon: typeof Zap;
  pulse: boolean;
}> = {
  working: { 
    label: 'Working', 
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20 border-emerald-500/30',
    icon: Zap,
    pulse: true,
  },
  idle: { 
    label: 'Idle', 
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10 border-zinc-500/20',
    icon: Coffee,
    pulse: false,
  },
  blocked: { 
    label: 'Blocked', 
    color: 'text-red-400',
    bgColor: 'bg-red-500/20 border-red-500/30',
    icon: AlertTriangle,
    pulse: true,
  },
  done: { 
    label: 'Done', 
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    icon: CheckCircle,
    pulse: false,
  },
};

export function SquadStatus({ agents, onAgentClick }: SquadStatusProps) {
  // Sort: working first, then blocked, then idle, then done
  const sortedAgents = [...agents].sort((a, b) => {
    const order = { working: 0, blocked: 1, idle: 2, done: 3 };
    return (order[a.status as keyof typeof order] ?? 4) - (order[b.status as keyof typeof order] ?? 4);
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Squad Status</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Click any agent to chat</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400">{agents.filter(a => a.status === 'working').length} active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-zinc-400">{agents.filter(a => a.status === 'blocked').length} blocked</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {sortedAgents.map((agent) => {
          const config = statusConfig[agent.status] || statusConfig.idle;
          const Icon = config.icon;
          
          return (
            <button
              key={agent.id}
              onClick={() => onAgentClick?.(agent)}
              className={`
                relative p-3 rounded-xl border transition-all
                hover:scale-105 hover:shadow-lg hover:z-10
                active:scale-95
                ${config.bgColor}
              `}
              style={{
                boxShadow: agent.status === 'working' 
                  ? `0 4px 20px ${agent.color || '#10b981'}30`
                  : undefined
              }}
            >
              {/* Sprite or Emoji */}
              <div className="flex justify-center mb-2">
                {hasSprite(agent.id) ? (
                  <div className={`relative ${config.pulse ? 'animate-pulse-subtle' : ''}`}>
                    <AgentSprite 
                      agentId={agent.id} 
                      status={agent.status as any}
                      size={56}
                    />
                    {/* Glow effect for working agents */}
                    {agent.status === 'working' && (
                      <div 
                        className="absolute inset-0 rounded-full blur-lg opacity-30 -z-10"
                        style={{ backgroundColor: agent.color || '#10b981' }}
                      />
                    )}
                  </div>
                ) : (
                  <span className="text-3xl">{agent.emoji || '🤖'}</span>
                )}
              </div>

              {/* Name */}
              <p className="text-xs font-medium text-white text-center truncate mb-1">
                {agent.name}
              </p>

              {/* Status */}
              <div className="flex items-center justify-center gap-1">
                <Icon size={10} className={config.color} />
                <span className={`text-[10px] font-medium ${config.color}`}>
                  {config.label}
                </span>
              </div>

              {/* Working indicator ring */}
              {agent.status === 'working' && (
                <div 
                  className="absolute inset-0 rounded-xl border-2 animate-ping opacity-30 pointer-events-none"
                  style={{ borderColor: agent.color || '#10b981' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Current tasks summary */}
      {agents.some(a => a.current_task) && (
        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Currently Working On</p>
          <div className="space-y-2">
            {agents.filter(a => a.current_task && a.status === 'working').map(agent => (
              <div key={agent.id} className="flex items-center gap-2 text-sm">
                <span>{agent.emoji || '🤖'}</span>
                <span className="text-zinc-400 font-medium">{agent.name}:</span>
                <span className="text-zinc-300 truncate">{agent.current_task}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
