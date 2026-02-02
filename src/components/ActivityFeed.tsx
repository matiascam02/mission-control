'use client';

import { DbActivity, DbAgent } from '@/lib/supabase';
import { Activity, Zap, CheckCircle2, MessageSquare, ArrowRight, Play, Clock } from 'lucide-react';

interface ActivityFeedProps {
  activities: DbActivity[];
  agents: DbAgent[];
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'status_changed':
      return { icon: ArrowRight, color: 'text-blue-400', bg: 'bg-blue-500/20' };
    case 'task_started':
      return { icon: Play, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
    case 'task_completed':
      return { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' };
    case 'comment_added':
      return { icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/20' };
    case 'agent_started':
      return { icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/20' };
    default:
      return { icon: Activity, color: 'text-zinc-400', bg: 'bg-zinc-500/20' };
  }
}

function ActivityItem({ 
  activity, 
  agents,
  isLast 
}: { 
  activity: DbActivity; 
  agents: DbAgent[];
  isLast: boolean;
}) {
  const agent = agents.find(a => a.id === activity.agent_id);
  const color = agent?.color || '#f97316';
  const { icon: Icon, color: iconColor, bg: iconBg } = getActivityIcon(activity.type);

  return (
    <div className="relative flex gap-4 pb-6 group animate-fade-in-up">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-[2px] bg-gradient-to-b from-white/10 to-transparent" />
      )}
      
      {/* Avatar/Icon */}
      <div className="relative z-10 flex-shrink-0">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-base transition-transform group-hover:scale-110"
          style={{ 
            backgroundColor: color + '20',
          }}
        >
          {agent?.emoji || '🤖'}
        </div>
        {/* Mini status indicator */}
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon size={10} className={iconColor} />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-white text-sm">
            {agent?.name || 'System'}
          </span>
          <span className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
            <Clock size={10} />
            {formatTime(activity.created_at)}
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {activity.message}
        </p>
      </div>
    </div>
  );
}

export function ActivityFeed({ activities, agents }: ActivityFeedProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Activity size={16} className="text-orange-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Live Feed</h2>
              <p className="text-[10px] text-zinc-500">{activities.length} events</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 tracking-wider">LIVE</span>
          </div>
        </div>
      </div>
      
      {/* Activity List */}
      <div className="flex-1 overflow-y-auto p-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Activity size={24} className="text-zinc-600" />
            </div>
            <p className="text-zinc-500 font-medium">No activity yet</p>
            <p className="text-xs text-zinc-600 mt-1">Events will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((activity, index) => (
              <ActivityItem 
                key={activity.id} 
                activity={activity} 
                agents={agents}
                isLast={index === activities.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
