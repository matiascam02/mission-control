// Task and Activity types for Mission Control

export type TaskStatus = 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done' | 'blocked';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeIds: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ActivityType = 
  | 'task_created'
  | 'task_moved'
  | 'task_completed'
  | 'comment_added'
  | 'agent_started'
  | 'agent_finished'
  | 'status_changed';

export interface Activity {
  id: string;
  type: ActivityType;
  agentId: string;
  message: string;
  taskId?: string;
  timestamp: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  agentId: string;
  content: string;
  timestamp: Date;
}
