'use client';

import { DbTask, DbAgent } from '@/lib/supabase';
import { 
  AlertCircle, 
  Inbox, 
  Loader2, 
  Eye, 
  CheckCircle2, 
  MoreHorizontal,
  Tag,
  Clock
} from 'lucide-react';

interface TaskBoardProps {
  tasks: DbTask[];
  agents: DbAgent[];
}

const columns: { 
  id: DbTask['status']; 
  label: string; 
  icon: typeof AlertCircle;
  color: string;
  dotColor: string;
}[] = [
  { id: 'blocked', label: 'Blocked', icon: AlertCircle, color: 'text-red-400', dotColor: 'bg-red-400' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, color: 'text-zinc-400', dotColor: 'bg-zinc-400' },
  { id: 'in_progress', label: 'In Progress', icon: Loader2, color: 'text-blue-400', dotColor: 'bg-blue-400' },
  { id: 'review', label: 'Review', icon: Eye, color: 'text-amber-400', dotColor: 'bg-amber-400' },
  { id: 'done', label: 'Done', icon: CheckCircle2, color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
];

const tagColors: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  feature: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  bug: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  docs: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  default: 'bg-white/10 text-zinc-400 border-white/10',
};

function formatTaskDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TaskCard({ task, index }: { task: DbTask; index: number }) {
  return (
    <div 
      className="card p-4 hover:border-white/15 cursor-pointer group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="text-sm font-medium text-white leading-snug group-hover:text-orange-400 transition-colors line-clamp-2">
          {task.title}
        </h4>
        <button className="p-1 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
          <MoreHorizontal size={14} className="text-zinc-500" />
        </button>
      </div>
      
      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                tagColors[tag.toLowerCase()] || tagColors.default
              }`}
            >
              <Tag size={8} />
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] text-zinc-500 px-1.5 py-0.5">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}
      
      {/* Description */}
      {task.description && (
        <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      )}
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-zinc-600">
          <Clock size={12} />
          <span className="text-[10px] font-medium">{formatTaskDate(task.created_at)}</span>
        </div>
        {task.priority && (
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${
            task.priority === 'high' ? 'text-red-400' :
            task.priority === 'medium' ? 'text-amber-400' :
            'text-zinc-500'
          }`}>
            {task.priority}
          </span>
        )}
      </div>
    </div>
  );
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
      {columns.map((column, colIndex) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const Icon = column.icon;
        
        return (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-72 animate-fade-in-up"
            style={{ animationDelay: `${colIndex * 0.1}s` }}
          >
            {/* Column Header */}
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center`}>
                <Icon size={16} className={column.color} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">{column.label}</h3>
              </div>
              <span className="text-xs font-bold text-zinc-600 bg-white/5 px-2.5 py-1 rounded-lg">
                {columnTasks.length}
              </span>
            </div>
            
            {/* Column Content */}
            <div className="task-column p-2 min-h-[200px]">
              <div className="space-y-2">
                {columnTasks.map((task, index) => (
                  <TaskCard key={task.id} task={task} index={index} />
                ))}
                {columnTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3`}>
                      <Icon size={18} className="text-zinc-600" />
                    </div>
                    <p className="text-xs text-zinc-600 font-medium">No tasks</p>
                    <p className="text-[10px] text-zinc-700 mt-1">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
