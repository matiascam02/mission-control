'use client';

import { Task, TaskStatus } from '@/lib/types';
import { getAgentById } from '@/lib/agents';

// Sample tasks for demo
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Fix property-management tests',
    status: 'in_progress',
    assigneeIds: ['franky'],
    tags: ['bug', 'tests'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Update Obsidian documentation',
    status: 'done',
    assigneeIds: ['frieren'],
    tags: ['docs'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Verify WhatsApp integration',
    status: 'done',
    assigneeIds: ['robin'],
    tags: ['integration'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Build Mission Control UI',
    status: 'in_progress',
    assigneeIds: ['hoyuelo', 'rimuru'],
    tags: ['feature', 'ui'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Review property-mgmt code',
    status: 'review',
    assigneeIds: ['maomao'],
    tags: ['review'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'blocked', label: 'Blocked', color: 'bg-red-500' },
  { id: 'inbox', label: 'Inbox', color: 'bg-gray-500' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', label: 'Review', color: 'bg-amber-500' },
  { id: 'done', label: 'Done', color: 'bg-green-500' },
];

interface TaskCardProps {
  task: Task;
}

function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
      <h4 className="text-sm font-medium text-white mb-2">{task.title}</h4>
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
      <div className="flex items-center gap-1">
        {task.assigneeIds.map((id) => {
          const agent = getAgentById(id);
          return agent ? (
            <span
              key={id}
              className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: agent.color + '30' }}
              title={agent.name}
            >
              {agent.emoji}
            </span>
          ) : null;
        })}
      </div>
    </div>
  );
}

export function TaskBoard() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = sampleTasks.filter((t) => t.status === column.id);
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
