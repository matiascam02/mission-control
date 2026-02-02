'use client';

import { DbActivity, DbAgent } from '@/lib/supabase';
import { CheckCircle, MessageSquare, Play, ArrowRight } from 'lucide-react';

interface ActivityFeedProps {
  activities: DbActivity[];
  agents: DbAgent[];
}

const iconMap: Record<string, typeof CheckCircle> = {
  task_completed: CheckCircle,
  task_moved: ArrowRight,
  comment_added: MessageSquare,
  agent_started: Play,
  agent_finished: CheckCircle,
  task_created: Play,
  status_changed: ArrowRight,
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
}

function ActivityItem({ activity, agents }: ActivityItemProps) {
  const agent = agents.find(a => a.id === activity.agent_id);
  const Icon = iconMap[activity.type] || CheckCircle;
  const color = agent?.color || '#6366f1';

  return (
    <div className="flex gap-3 p-3 hover:bg-gray-800/50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: color + '20' }}
        >
          {agent?.emoji || '🤖'}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <Icon size={14} className="text-green-500" />
          <span className="text-white font-medium">{agent?.name || 'System'}</span>
        </div>
        <p className="text-sm text-gray-400 mt-0.5">{activity.message}</p>
        <p className="text-xs text-gray-600 mt-1">{formatTime(activity.created_at)}</p>
      </div>
    </div>
  );
}

export function ActivityFeed({ activities, agents }: ActivityFeedProps) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold text-white">Live Feed</h2>
        <div className="flex gap-2 mt-2">
          {['All', 'Tasks', 'Comments', 'Status'].map((tab, i) => (
            <button
              key={tab}
              className={`text-xs px-2 py-1 rounded ${
                i === 0 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No activity yet
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} agents={agents} />
          ))
        )}
      </div>
    </div>
  );
}
