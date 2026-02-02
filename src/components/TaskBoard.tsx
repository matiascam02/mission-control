'use client';

import { DbTask, DbAgent } from '@/lib/supabase';
import { Circle, Clock, CheckCircle2, AlertCircle, Eye } from 'lucide-react';

interface TaskBoardProps {
  tasks: DbTask[];
  agents: DbAgent[];
}

const columns: { id: DbTask['status']; label: string; icon: typeof Circle; color: string; bgColor: string }[] = [
  { id: 'blocked', label: 'Blocked', icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-400' },
  { id: 'inbox', label: 'Inbox', icon: Circle, color: 'text-zinc-400', bgColor: 'bg-zinc-400' },
  { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-400', bgColor: 'bg-blue-400' },
  { id: 'review', label: 'Review', icon: Eye, color: 'text-amber-400', bgColor: 'bg-amber-400' },
  { id: 'done', label: 'Done', icon: CheckCircle2, color: 'text-emerald-400', bgColor: 'bg-emerald-400' },
];

interface TaskCardProps {
  task: DbTask;
}

function TaskCard({ task }: TaskCardProps) {
  const priorityClass = task.tags?.includes('urgent') || task.tags?.includes('high') 
    ? 'priority-high' 
    : task.tags?.includes('medium') 
      ? 'priority-medium' 
      : 'priority-low';

  return (
    <div 
      className={`task-card ${priorityClass} premium-card rounded-xl p-4 cursor-pointer group border-gradient`}
    >
      {/* Task title */}
      <h4 className="text-sm font-medium text-white mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
        {task.title}
      </h4>
      
      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                tag === 'urgent' || tag === 'high'
                  ? 'bg-red-400/10 text-red-400 border border-red-400/20'
                  : tag === 'bug'
                    ? 'bg-orange-400/10 text-orange-400 border border-orange-400/20'
                    : tag === 'feature'
                      ? 'bg-purple-400/10 text-purple-400 border border-purple-400/20'
                      : 'bg-white/5 text-zinc-400 border border-white/5'
              }`}
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-500">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-zinc-500 line-clamp-2 group-hover:text-zinc-400 transition-colors">
          {task.description}
        </p>
      )}
      
      {/* Footer with metadata */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-end">
        <span className="text-[10px] text-zinc-600">
          {task.created_at && new Date(task.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

export function TaskBoard({ tasks, agents }: TaskBoardProps) {
  return (
    <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const Icon = column.icon;
        
        return (
          <div key={column.id} className="flex-shrink-0 w-72">
            {/* Column header */}
            <div className="flex items-center gap-2.5 mb-4 px-1">
              <div className={`p-1.5 rounded-lg bg-white/5 ${column.color}`}>
                <Icon size={14} />
              </div>
              <h3 className="font-medium text-zinc-300 text-sm">{column.label}</h3>
              <span className="ml-auto text-xs font-medium text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
            </div>
            
            {/* Task list */}
            <div className="space-y-3">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {/* Empty state */}
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-zinc-700 text-sm border border-dashed border-white/5 rounded-xl bg-white/[0.01] transition-colors hover:border-white/10 hover:bg-white/[0.02]">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-white/5 flex items-center justify-center ${column.color} opacity-50`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-zinc-600">No tasks</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
