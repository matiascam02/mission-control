'use client';

import { Activity } from '@/lib/types';
import { getAgentById } from '@/lib/agents';
import { CheckCircle, MessageSquare, Play, ArrowRight } from 'lucide-react';

// Sample activities for demo
const sampleActivities: Activity[] = [
  {
    id: '1',
    type: 'task_completed',
    agentId: 'rimuru',
    message: 'UI Phase 2 completed — 5 commits pushed',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: '2',
    type: 'task_completed',
    agentId: 'frieren',
    message: 'Updated 10+ Obsidian docs, created API Reference',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '3',
    type: 'task_completed',
    agentId: 'robin',
    message: 'Verified integrations — Telegram ✅, WhatsApp 90%',
    timestamp: new Date(Date.now() - 1000 * 60 * 50),
  },
  {
    id: '4',
    type: 'agent_started',
    agentId: 'hoyuelo',
    message: 'Started building Mission Control',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '5',
    type: 'task_moved',
    agentId: 'franky',
    message: 'Test fixes task moved to IN_PROGRESS',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
];

const iconMap: Record<string, typeof CheckCircle> = {
  task_completed: CheckCircle,
  task_moved: ArrowRight,
  comment_added: MessageSquare,
  agent_started: Play,
  agent_finished: CheckCircle,
  task_created: Play,
  status_changed: ArrowRight,
};

function formatTime(date: Date): string {
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
  activity: Activity;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const agent = getAgentById(activity.agentId);
  const Icon = iconMap[activity.type] || CheckCircle;

  return (
    <div className="flex gap-3 p-3 hover:bg-gray-800/50 rounded-lg transition-colors">
      <div className="flex-shrink-0">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
          style={{ backgroundColor: agent?.color + '20' }}
        >
          {agent?.emoji || '🤖'}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <Icon size={14} className="text-green-500" />
          <span className="text-white font-medium">{agent?.name}</span>
        </div>
        <p className="text-sm text-gray-400 mt-0.5">{activity.message}</p>
        <p className="text-xs text-gray-600 mt-1">{formatTime(activity.timestamp)}</p>
      </div>
    </div>
  );
}

export function ActivityFeed() {
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
        {sampleActivities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
