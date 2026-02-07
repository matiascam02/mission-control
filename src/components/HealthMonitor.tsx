'use client';

import { ConvexAgent } from '@/lib/convex-types';
import {
  Heart,
  HeartPulse,
  HeartOff,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface HealthMonitorProps {
  agents: ConvexAgent[];
  onAgentClick?: (agent: ConvexAgent) => void;
}

type HealthStatus = 'healthy' | 'stale' | 'dead' | 'blocked';

function getHealthStatus(agent: ConvexAgent): { status: HealthStatus; message: string; minutesAgo: number | null } {
  // Blocked takes priority
  if (agent.status === 'blocked') {
    return { status: 'blocked', message: 'Blocked - needs attention', minutesAgo: null };
  }

  // Convex uses last_heartbeat as a number (epoch ms) or _creationTime
  const lastActive = agent.last_heartbeat || agent._creationTime;
  if (!lastActive) {
    return { status: 'dead', message: 'Never seen', minutesAgo: null };
  }

  const now = Date.now();
  const minutesAgo = Math.floor((now - lastActive) / (1000 * 60));

  if (minutesAgo < 20) {
    return { status: 'healthy', message: `Active ${minutesAgo}m ago`, minutesAgo };
  } else if (minutesAgo < 60) {
    return { status: 'stale', message: `Last seen ${minutesAgo}m ago`, minutesAgo };
  } else {
    const hours = Math.floor(minutesAgo / 60);
    return { status: 'dead', message: `Inactive ${hours}h+`, minutesAgo };
  }
}

const healthConfig: Record<HealthStatus, {
  icon: typeof Heart;
  color: string;
  bgColor: string;
  borderColor: string;
  pulse: boolean;
}> = {
  healthy: {
    icon: HeartPulse,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    pulse: true,
  },
  stale: {
    icon: Heart,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    pulse: false,
  },
  dead: {
    icon: HeartOff,
    color: 'text-zinc-500',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/30',
    pulse: false,
  },
  blocked: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    pulse: true,
  },
};

export function HealthMonitor({ agents, onAgentClick }: HealthMonitorProps) {
  const healthStats = agents.map(agent => ({
    agent,
    health: getHealthStatus(agent),
  }));

  // Sort: blocked first, then by staleness
  healthStats.sort((a, b) => {
    const order: Record<HealthStatus, number> = { blocked: 0, dead: 1, stale: 2, healthy: 3 };
    return order[a.health.status] - order[b.health.status];
  });

  const counts = {
    healthy: healthStats.filter(h => h.health.status === 'healthy').length,
    stale: healthStats.filter(h => h.health.status === 'stale').length,
    dead: healthStats.filter(h => h.health.status === 'dead').length,
    blocked: healthStats.filter(h => h.health.status === 'blocked').length,
  };

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
            <HeartPulse size={20} className="text-rose-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Health Monitor</h3>
            <p className="text-xs text-zinc-500">Agent heartbeat status</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <CheckCircle size={12} className="text-emerald-400" />
            <span className="text-zinc-400">{counts.healthy}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Clock size={12} className="text-amber-400" />
            <span className="text-zinc-400">{counts.stale}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <XCircle size={12} className="text-zinc-500" />
            <span className="text-zinc-400">{counts.dead}</span>
          </div>
          {counts.blocked > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <AlertTriangle size={12} className="text-red-400" />
              <span className="text-red-400 font-bold">{counts.blocked}</span>
            </div>
          )}
        </div>
      </div>

      {/* Agent health list */}
      <div className="space-y-2">
        {healthStats.map(({ agent, health }) => {
          const config = healthConfig[health.status];
          const Icon = config.icon;

          return (
            <button
              key={agent._id}
              onClick={() => onAgentClick?.(agent)}
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl border transition-all
                hover:scale-[1.02] active:scale-[0.98]
                ${config.bgColor} ${config.borderColor}
              `}
            >
              {/* Health indicator */}
              <div className={`relative ${config.pulse ? 'animate-pulse' : ''}`}>
                <Icon size={18} className={config.color} />
              </div>

              {/* Agent info */}
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{agent.name}</span>
                  <span className="text-lg">{agent.emoji}</span>
                </div>
                <p className={`text-xs ${config.color}`}>{health.message}</p>
              </div>

              {/* Status badge */}
              <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${config.bgColor} ${config.color}`}>
                {health.status}
              </div>
            </button>
          );
        })}
      </div>

      {/* Alert for blocked agents */}
      {counts.blocked > 0 && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">
              {counts.blocked} agent{counts.blocked > 1 ? 's' : ''} blocked!
            </span>
          </div>
          <p className="text-xs text-red-400/70 mt-1">
            Check the blocked agents and resolve their issues
          </p>
        </div>
      )}
    </div>
  );
}
