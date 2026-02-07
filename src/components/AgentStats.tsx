'use client';

import { useState } from 'react';

interface AgentStat {
  agent_name: string;
  xp: number;
  level: number;
  tasks_completed: number;
  current_streak: number;
  best_streak: number;
  mood: 'happy' | 'working' | 'idle' | 'sleeping' | 'frustrated';
  achievements: string[];
}

const MOOD_EMOJI: Record<string, string> = {
  happy: '\u{1F60A}',
  working: '\u{1F4AA}',
  idle: '\u{1F610}',
  sleeping: '\u{1F634}',
  frustrated: '\u{1F624}',
};

const MOOD_COLORS: Record<string, string> = {
  happy: 'bg-green-500',
  working: 'bg-blue-500',
  idle: 'bg-gray-500',
  sleeping: 'bg-purple-500',
  frustrated: 'bg-red-500',
};

function xpForNextLevel(level: number): number {
  return 10 * Math.pow(level, 2);
}

function xpProgress(xp: number, level: number): number {
  const currentLevelXp = 10 * Math.pow(level - 1, 2);
  const nextLevelXp = xpForNextLevel(level);
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return Math.min(100, Math.max(0, progress));
}

// Placeholder stats until agent_stats table is added to Convex
function getDefaultStats(agentName: string): AgentStat {
  return {
    agent_name: agentName,
    xp: 0,
    level: 1,
    tasks_completed: 0,
    current_streak: 0,
    best_streak: 0,
    mood: 'idle',
    achievements: [],
  };
}

export function AgentStatsCard({ agentId }: { agentId: string }) {
  const [stats] = useState<AgentStat>(() => getDefaultStats(agentId));

  const progress = xpProgress(stats.xp, stats.level);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{MOOD_EMOJI[stats.mood]}</span>
          <span className="font-bold capitalize">{agentId}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${MOOD_COLORS[stats.mood]}`}></span>
          <span className="text-sm text-gray-400 capitalize">{stats.mood}</span>
        </div>
      </div>

      {/* Level & XP */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-yellow-400 font-bold">Lv. {stats.level}</span>
          <span className="text-gray-400">{stats.xp} XP</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Math.round(progress)}% to Lv. {stats.level + 1}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-gray-700/50 rounded p-2">
          <div className="text-lg font-bold text-green-400">{stats.tasks_completed}</div>
          <div className="text-xs text-gray-400">Tasks</div>
        </div>
        <div className="bg-gray-700/50 rounded p-2">
          <div className="text-lg font-bold text-orange-400">{stats.current_streak}</div>
          <div className="text-xs text-gray-400">Streak</div>
        </div>
        <div className="bg-gray-700/50 rounded p-2">
          <div className="text-lg font-bold text-purple-400">{stats.achievements?.length || 0}</div>
          <div className="text-xs text-gray-400">Badges</div>
        </div>
      </div>
    </div>
  );
}

export function AgentStatsGrid() {
  const agents = ['hoyuelo', 'franky', 'frieren', 'maomao', 'nanami', 'reigen', 'rimuru', 'robin'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {agents.map((agent) => (
        <AgentStatsCard key={agent} agentId={agent} />
      ))}
    </div>
  );
}
