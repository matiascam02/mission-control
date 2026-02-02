'use client';

import { DbTask, DbAgent } from '@/lib/supabase';

interface TaskBoardProps {
  tasks: DbTask[];
  agents: DbAgent[];
}

const columns: { id: DbTask['status']; label: string; color: string }[] = [
  { id: 'blocked', label: 'Blocked', color: 'bg-red-500' },
  { id: 'inbox', label: 'Inbox', color: 'bg-gray-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', label: 'Review', color: 'bg-amber-500' },
  { id: 'done', label: 'Done', color: 'bg-green-500' },
];

interface TaskCardProps {
  task: DbTask;
}

function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
      <h4 className="text-sm font-medium text-white mb-2">{task.title}</h4>
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {task.description && (
        <p className="text-xs text-gray-500 truncate">{task.description}</p>
      )}
    </div>
  );
}

export function TaskBoard({ tasks, agents }: TaskBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        return (
          <div key={column.id} className="flex-shrink-0 w-72">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${column.color}`} />
              <h3 className="font-medium text-gray-300">{column.label}</h3>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {columnTasks.length === 0 && (
                <div className="text-center py-8 text-gray-600 text-sm border-2 border-dashed border-gray-800 rounded-lg">
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
