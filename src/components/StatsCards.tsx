'use client';

import { DbAgent, DbTask } from '@/lib/supabase';
import { Users, AlertCircle, Zap, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardsProps {
  agents: DbAgent[];
  tasks: DbTask[];
}

interface StatCardProps {
  label: string;
  value: number | string;
  subtext: string;
  icon: typeof Users;
  iconColor: string;
  iconBg: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  highlight?: boolean;
}

function StatCard({ label, value, subtext, icon: Icon, iconColor, iconBg, trend, trendValue, highlight }: StatCardProps) {
  return (
    <div 
      className={`card p-5 animate-fade-in-up ${
        highlight ? 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center`}>
          <Icon size={22} className={iconColor} />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 
            trend === 'down' ? 'bg-red-500/10 text-red-400' : 
            'bg-zinc-500/10 text-zinc-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span className="text-[10px] font-semibold">{trendValue}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        <p className={`text-xs font-medium ${
          highlight && subtext !== 'All clear' ? 'text-red-400' : 'text-zinc-500'
        }`}>
          {subtext}
        </p>
      </div>
    </div>
  );
}

export function StatsCards({ agents, tasks }: StatsCardsProps) {
  const activeAgents = agents.filter(a => a.status === 'working').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const completedToday = tasks.filter(t => {
    if (t.status !== 'done') return false;
    const updated = new Date(t.updated_at);
    const today = new Date();
    return updated.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        label="Active Agents"
        value={activeAgents}
        subtext={`${agents.length} in squad`}
        icon={Users}
        iconColor="text-purple-400"
        iconBg="bg-purple-500/15"
        trend="up"
        trendValue={`${Math.round((activeAgents / agents.length) * 100)}%`}
      />
      
      <StatCard
        label="Blocked"
        value={blockedTasks}
        subtext={blockedTasks === 0 ? 'All clear' : 'Need attention'}
        icon={AlertCircle}
        iconColor="text-red-400"
        iconBg="bg-red-500/15"
        highlight={blockedTasks > 0}
      />
      
      <StatCard
        label="In Progress"
        value={inProgressTasks}
        subtext={`${tasks.length} total tasks`}
        icon={Zap}
        iconColor="text-orange-400"
        iconBg="bg-orange-500/15"
      />
      
      <StatCard
        label="Completed Today"
        value={completedToday}
        subtext="Tasks finished"
        icon={TrendingUp}
        iconColor="text-emerald-400"
        iconBg="bg-emerald-500/15"
        trend={completedToday > 0 ? 'up' : 'neutral'}
        trendValue={completedToday > 0 ? '+' + completedToday : '—'}
      />
    </div>
  );
}
