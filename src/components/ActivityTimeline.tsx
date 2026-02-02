'use client';

import { DbActivity, DbAgent } from '@/lib/supabase';
import { 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  ArrowRight,
  Clock,
  Activity
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: DbActivity[];
  agents: DbAgent[];
  limit?: number;
}

const activityConfig: Record<string, {
  icon: typeof Zap;
  color: string;
  bgColor: string;
}> = {
  task_started: {
    icon: Zap,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  task_completed: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
  },
  task_blocked: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
  },
  task_moved: {
    icon: ArrowRight,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
  },
  message: {
    icon: MessageSquare,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  default: {
    icon: Activity,
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500/20',
  },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getHourLabel(hour: number): string {
  if (hour === 0) return '12a';
  if (hour < 12) return `${hour}a`;
  if (hour === 12) return '12p';
  return `${hour - 12}p`;
}

export function ActivityTimeline({ activities, agents, limit = 10 }: ActivityTimelineProps) {
  const recentActivities = activities.slice(0, limit);
  
  // Build hourly activity heatmap for today
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hourlyActivity: number[] = new Array(24).fill(0);
  
  activities.forEach(activity => {
    const actDate = new Date(activity.created_at);
    if (actDate >= todayStart) {
      const hour = actDate.getHours();
      hourlyActivity[hour]++;
    }
  });
  
  const maxActivity = Math.max(...hourlyActivity, 1);
  const currentHour = now.getHours();

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
            <Activity size={20} className="text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Activity Timeline</h3>
            <p className="text-xs text-zinc-500">Today&apos;s activity heatmap</p>
          </div>
        </div>
        <div className="text-xs text-zinc-500">
          {activities.length} total events
        </div>
      </div>

      {/* Hourly heatmap */}
      <div className="mb-6">
        <div className="flex items-end gap-0.5 h-16">
          {hourlyActivity.map((count, hour) => {
            const height = count > 0 ? Math.max(20, (count / maxActivity) * 100) : 8;
            const isPast = hour < currentHour;
            const isCurrent = hour === currentHour;
            
            return (
              <div
                key={hour}
                className="flex-1 flex flex-col items-center gap-1"
                title={`${getHourLabel(hour)}: ${count} activities`}
              >
                <div
                  className={`w-full rounded-t transition-all ${
                    isCurrent 
                      ? 'bg-orange-500' 
                      : count > 0 
                        ? isPast ? 'bg-violet-500/60' : 'bg-violet-500/30'
                        : 'bg-white/5'
                  }`}
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-zinc-600">
          <span>12a</span>
          <span>6a</span>
          <span>12p</span>
          <span>6p</span>
          <span>Now</span>
        </div>
      </div>

      {/* Recent activities list */}
      <div className="space-y-1">
        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock size={24} className="mx-auto text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-500">No recent activity</p>
          </div>
        ) : (
          recentActivities.map((activity) => {
            const config = activityConfig[activity.type] || activityConfig.default;
            const Icon = config.icon;
            const agent = agents.find(a => a.id === activity.agent_id);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className={`w-7 h-7 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} className={config.color} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {agent && (
                      <span className="text-sm">{agent.emoji}</span>
                    )}
                    <p className="text-sm text-white truncate">{activity.title}</p>
                  </div>
                  {activity.description && (
                    <p className="text-xs text-zinc-500 truncate">{activity.description}</p>
                  )}
                </div>

                <span className="text-[10px] text-zinc-600 flex-shrink-0">
                  {formatTime(activity.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
