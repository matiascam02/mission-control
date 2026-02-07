'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ConvexTask, ConvexAgent } from '@/lib/convex-types';
import {
  AlertCircle,
  Inbox,
  Loader2,
  Eye,
  CheckCircle2,
  MoreHorizontal,
  Tag,
  Clock,
  GripVertical
} from 'lucide-react';
import { showToast } from './Toast';

interface TaskBoardProps {
  tasks: ConvexTask[];
  agents: ConvexAgent[];
}

const columns: {
  id: ConvexTask['status'];
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

function formatTaskDate(creationTime: number): string {
  const date = new Date(creationTime);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface TaskCardProps {
  task: ConvexTask;
  index: number;
  onDragStart: (task: ConvexTask) => void;
  isDragging: boolean;
}

function TaskCard({ task, index, onDragStart, isDragging }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task._id);
        onDragStart(task);
      }}
      className={`card p-4 cursor-grab active:cursor-grabbing group animate-fade-in-up transition-all
        ${isDragging ? 'opacity-50 scale-95 ring-2 ring-orange-500/50' : 'hover:border-white/15'}
      `}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GripVertical size={14} className="text-zinc-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-sm font-medium text-white leading-snug group-hover:text-orange-400 transition-colors line-clamp-2">
            {task.title}
          </h4>
        </div>
        <button className="p-1 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
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
          <span className="text-[10px] font-medium">{formatTaskDate(task._creationTime)}</span>
        </div>
        {task.priority && (
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${
            task.priority === 'high' || task.priority === 'urgent' ? 'text-red-400' :
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
  const [draggingTask, setDraggingTask] = useState<ConvexTask | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const updateTaskStatus = useMutation(api.tasks.updateStatus);

  const handleDrop = async (columnId: ConvexTask['status']) => {
    if (!draggingTask || draggingTask.status === columnId) {
      setDraggingTask(null);
      setDragOverColumn(null);
      return;
    }

    try {
      await updateTaskStatus({
        id: draggingTask._id,
        status: columnId,
      });

      showToast({
        type: 'success',
        title: 'Task moved',
        message: `"${draggingTask.title.slice(0, 30)}${draggingTask.title.length > 30 ? '...' : ''}" → ${columns.find(c => c.id === columnId)?.label}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      showToast({
        type: 'error',
        title: 'Failed to move task',
        message: 'Please try again',
      });
    }

    setDraggingTask(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
      {columns.map((column, colIndex) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        const Icon = column.icon;
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-72 animate-fade-in-up"
            style={{ animationDelay: `${colIndex * 0.1}s` }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDragOverColumn(column.id);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(column.id);
            }}
          >
            {/* Column Header */}
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center transition-all ${
                isOver ? 'scale-110 bg-white/10' : ''
              }`}>
                <Icon size={16} className={column.color} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">{column.label}</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                isOver ? 'text-orange-400 bg-orange-500/20' : 'text-zinc-600 bg-white/5'
              }`}>
                {columnTasks.length}
              </span>
            </div>

            {/* Column Content */}
            <div className={`task-column p-2 min-h-[200px] transition-all rounded-xl ${
              isOver
                ? 'bg-orange-500/10 border-2 border-dashed border-orange-500/40'
                : 'border-2 border-transparent'
            }`}>
              <div className="space-y-2">
                {columnTasks.map((task, index) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    index={index}
                    onDragStart={setDraggingTask}
                    isDragging={draggingTask?._id === task._id}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center transition-all ${
                    isOver ? 'scale-105' : ''
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                      isOver ? 'bg-orange-500/20' : 'bg-white/5'
                    }`}>
                      <Icon size={18} className={isOver ? 'text-orange-400' : 'text-zinc-600'} />
                    </div>
                    <p className={`text-xs font-medium ${isOver ? 'text-orange-400' : 'text-zinc-600'}`}>
                      {isOver ? 'Drop here' : 'No tasks'}
                    </p>
                    <p className="text-[10px] text-zinc-700 mt-1">
                      {isOver ? 'Release to move' : 'Drag tasks here'}
                    </p>
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
