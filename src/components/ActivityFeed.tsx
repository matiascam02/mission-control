'use client';

import { DbActivity, DbAgent } from '@/lib/supabase';

interface ActivityFeedProps {
  activities: DbActivity[];
  agents: DbAgent[];
}

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

function ActivityItem({ activity, agents }: { activity: DbActivity; agents: DbAgent[] }) {
  const agent = agents.find(a => a.id === activity.agent_id);
  const color = agent?.color || '#6366f1';

  return (
    <div className="flex gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
        style={{ backgroundColor: color + '20' }}
      >
        {agent?.emoji || '🤖'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium">{agent?.name || 'System'}</p>
        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{activity.message}</p>
        <p className="text-[10px] text-zinc-600 mt-1">{formatTime(activity.created_at)}</p>
      </div>
    </div>
  );
}

export function ActivityFeed({ activities, agents }: ActivityFeedProps) {
  return (
    <div className="card h-full flex flex-col">
      <div className="p-4 border-b border-white/5">
        <h2 className="font-semibold text-white">Live Feed</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-zinc-500 text-sm">
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
