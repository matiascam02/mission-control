'use client';

import { DbTask, DbAgent } from '@/lib/supabase';

interface TaskBoardProps {
  tasks: DbTask[];
  agents: DbAgent[];
}

const columns: { id: DbTask['status']; label: string; color: string }[] = [
  { id: 'blocked', label: 'Blocked', color: 'bg-red-500' },
  { id: 'inbox', label: 'Inbox', color: 'bg-zinc-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', label: 'Review', color: 'bg-amber-500' },
  { id: 'done', label: 'Done', color: 'bg-emerald-500' },
];

function TaskCard({ task }: { task: DbTask }) {
  return (
    <div className="card p-3 hover:border-zinc-600 transition-colors cursor-pointer">
      <h4 className="text-sm font-medium text-white mb-2 line-clamp-2">{task.title}</h4>
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 bg-white/10 text-zinc-400 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {task.description && (
        <p className="text-xs text-zinc-500 line-clamp-2">{task.description}</p>
      )}
    </div>
  );
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        return (
          <div key={column.id} className="flex-shrink-0 w-64">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${column.color}`} />
              <h3 className="font-medium text-zinc-300 text-sm">{column.label}</h3>
              <span className="text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full ml-auto">
                {columnTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {columnTasks.length === 0 && (
                <div className="text-center py-6 text-zinc-600 text-xs border border-dashed border-zinc-800 rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
