'use client';

import { DbActivity, DbAgent } from '@/lib/supabase';
import { CheckCircle2, MessageSquare, Play, ArrowRight, Zap, X } from 'lucide-react';

interface ActivityFeedProps {
  activities: DbActivity[];
  agents: DbAgent[];
  onClose?: () => void;
  isMobile?: boolean;
}

const iconMap: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  task_completed: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-400/10' },
  task_moved: { icon: ArrowRight, color: 'text-blue-400 bg-blue-400/10' },
  comment_added: { icon: MessageSquare, color: 'text-purple-400 bg-purple-400/10' },
  agent_started: { icon: Play, color: 'text-amber-400 bg-amber-400/10' },
  agent_finished: { icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-400/10' },
  task_created: { icon: Zap, color: 'text-indigo-400 bg-indigo-400/10' },
  status_changed: { icon: ArrowRight, color: 'text-blue-400 bg-blue-400/10' },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleDateString();
}

interface ActivityItemProps {
  activity: DbActivity;
  agents: DbAgent[];
  isLast: boolean;
}

function ActivityItem({ activity, agents, isLast }: ActivityItemProps) {
  const agent = agents.find(a => a.id === activity.agent_id);
  const iconConfig = iconMap[activity.type] || iconMap.task_completed;
  const Icon = iconConfig.icon;
  const color = agent?.color || '#6366f1';

  return (
    <div className={`timeline-item flex gap-3 p-3 md:p-4 hover:bg-white/[0.02] rounded-xl transition-all duration-200 group ${isLast ? 'last-item' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 relative">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform duration-200 group-hover:scale-105"
          style={{ 
            backgroundColor: color + '15',
            boxShadow: `0 2px 8px ${color}20`
          }}
        >
          {agent?.emoji || '🤖'}
        </div>
        
        {/* Timeline connector - hide on mobile for cleaner look */}
        {!isLast && (
          <div className="hidden md:block absolute left-1/2 top-12 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-white/10 to-transparent h-8" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className={`p-1 rounded-md ${iconConfig.color}`}>
            <Icon size={12} />
          </div>
          <span className="text-sm font-medium text-white">{agent?.name || 'System'}</span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{activity.message}</p>
        <p className="text-xs text-zinc-600 mt-1.5 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          {formatTime(activity.created_at)}
        </p>
      </div>
    </div>
  );
}

export function ActivityFeed({ activities, agents, onClose, isMobile }: ActivityFeedProps) {
  return (
    <div className="h-full flex flex-col bg-black/20">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" />
            </div>
            <h2 className="font-semibold text-white">Live Feed</h2>
          </div>
          
          {/* Close button for mobile */}
          {isMobile && onClose && (
            <button 
              onClick={onClose}
              className="p-2 -mr-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={20} className="text-zinc-400" />
            </button>
          )}
        </div>
        
        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
          {['All', 'Tasks', 'Status'].map((tab, i) => (
            <button
              key={tab}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                i === 0 
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Activity list */}
      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
              <Zap className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm">No activity yet</p>
            <p className="text-zinc-600 text-xs mt-1">Events will appear here in real-time</p>
          </div>
        ) : (
          <div className="py-2">
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
