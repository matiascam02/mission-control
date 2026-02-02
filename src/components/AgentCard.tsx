'use client';

import { DbAgent } from '@/lib/supabase';

interface AgentCardProps {
  agent: DbAgent;
  compact?: boolean;
}

const statusColors: Record<string, string> = {
  idle: 'bg-gray-400',
  working: 'bg-green-500',
  done: 'bg-blue-500',
  blocked: 'bg-red-500',
};

const levelColors: Record<string, string> = {
  LEAD: 'bg-amber-500 text-white',
  SPC: 'bg-blue-500 text-white',
  INT: 'bg-gray-500 text-white',
};

export function AgentCard({ agent, compact = false }: AgentCardProps) {
  const color = agent.color || '#6366f1';
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors">
        <div className="relative">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: color + '20' }}
          >
            {agent.emoji || '🤖'}
          </div>
          <div 
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${statusColors[agent.status]}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white truncate">{agent.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${levelColors[agent.level]}`}>
              {agent.level}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate">{agent.role}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: color + '20' }}
          >
            {agent.emoji || '🤖'}
          </div>
          <div 
            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-gray-800 ${statusColors[agent.status]}`}
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{agent.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${levelColors[agent.level]}`}>
              {agent.level}
            </span>
          </div>
          <p className="text-sm text-gray-400">{agent.role}</p>
          <p className="text-xs text-gray-500 mt-1">{agent.anime}</p>
        </div>
      </div>
      {agent.current_task && (
        <div className="mt-3 p-2 bg-gray-700/50 rounded-lg">
          <p className="text-xs text-gray-400">Current task:</p>
          <p className="text-sm text-white truncate">{agent.current_task}</p>
        </div>
      )}
    </div>
  );
}
