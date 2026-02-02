import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching our database schema
export interface DbAgent {
  id: string;
  name: string;
  role: string;
  anime: string | null;
  emoji: string | null;
  avatar_url: string | null;
  level: 'LEAD' | 'SPC' | 'INT';
  status: 'idle' | 'working' | 'done' | 'blocked';
  current_task: string | null;
  color: string | null;
  session_key: string | null;
  last_heartbeat: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbTask {
  id: string;
  title: string;
  description: string | null;
  status: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DbActivity {
  id: string;
  type: string;
  agent_id: string | null;
  task_id: string | null;
  title: string;
  description: string | null;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DbComment {
  id: string;
  task_id: string;
  agent_id: string | null;
  content: string;
  created_at: string;
}

// Helper functions
export async function getAgents() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('level', { ascending: true });
  
  if (error) throw error;
  return data as DbAgent[];
}

export async function getTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as DbTask[];
}

export async function getActivities(limit = 20) {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as DbActivity[];
}

export async function updateAgentStatus(
  agentId: string, 
  status: DbAgent['status'], 
  currentTask?: string
) {
  const { error } = await supabase
    .from('agents')
    .update({ 
      status, 
      current_task: currentTask || null,
      last_heartbeat: new Date().toISOString()
    })
    .eq('id', agentId);
  
  if (error) throw error;
}

export async function createActivity(
  type: string,
  agentId: string,
  message: string,
  taskId?: string
) {
  const { error } = await supabase
    .from('activities')
    .insert({
      type,
      agent_id: agentId,
      task_id: taskId || null,
      message,
    });
  
  if (error) throw error;
}

export async function createTask(
  title: string,
  assigneeIds: string[],
  description?: string,
  tags?: string[]
) {
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .insert({
      title,
      description: description || null,
      tags: tags || [],
      status: assigneeIds.length > 0 ? 'assigned' : 'inbox',
    })
    .select()
    .single();
  
  if (taskError) throw taskError;

  // Assign agents
  if (assigneeIds.length > 0) {
    const { error: assignError } = await supabase
      .from('task_assignees')
      .insert(
        assigneeIds.map(agentId => ({
          task_id: task.id,
          agent_id: agentId,
        }))
      );
    
    if (assignError) throw assignError;
  }

  return task;
}
