'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { TaskBoard } from '@/components/TaskBoard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { supabase, DbAgent, DbTask, DbActivity } from '@/lib/supabase';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState<DbAgent[]>([]);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [activities, setActivities] = useState<DbActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [agentsRes, tasksRes, activitiesRes] = await Promise.all([
          supabase.from('agents').select('*').order('level'),
          supabase.from('tasks').select('*').order('created_at', { ascending: false }),
          supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(20),
        ]);

        if (agentsRes.data) setAgents(agentsRes.data);
        if (tasksRes.data) setTasks(tasksRes.data);
        if (activitiesRes.data) setActivities(activitiesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const agentsChannel = supabase
      .channel('agents-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setAgents(prev => prev.map(a => a.id === payload.new.id ? payload.new as DbAgent : a));
        }
      })
      .subscribe();

    const activitiesChannel = supabase
      .channel('activities-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activities' }, (payload) => {
        setActivities(prev => [payload.new as DbActivity, ...prev.slice(0, 19)]);
      })
      .subscribe();

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [payload.new as DbTask, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as DbTask : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(agentsChannel);
      supabase.removeChannel(activitiesChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-950 text-white items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Mission Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} agents={agents} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header agents={agents} tasks={tasks} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <StatsCards agents={agents} tasks={tasks} />
            <h2 className="text-lg font-semibold text-white mb-4">Task Board</h2>
            <TaskBoard tasks={tasks} agents={agents} />
          </main>

          {/* Activity Feed Sidebar */}
          <aside className="w-80 border-l border-gray-800 p-4">
            <ActivityFeed activities={activities} agents={agents} />
          </aside>
        </div>
      </div>
    </div>
  );
}
