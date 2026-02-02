'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { TaskBoard } from '@/components/TaskBoard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { supabase, DbAgent, DbTask, DbActivity } from '@/lib/supabase';
import { Menu, X, Activity, Sparkles } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState<DbAgent[]>([]);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [activities, setActivities] = useState<DbActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);

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
      <div className="flex h-screen items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-orange-500/30">
            <Sparkles size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Mission Control</h2>
          <p className="text-sm text-zinc-500">Initializing squad connection...</p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen text-white overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in-up"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-out
      `}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          agents={agents} 
          onClose={() => setSidebarOpen(false)} 
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Mobile Header */}
        <header className="h-16 bg-[#141414]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 lg:hidden">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
          >
            <Menu size={22} className="text-zinc-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">Mission Control</span>
          </div>
          <button 
            onClick={() => setFeedOpen(true)}
            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors relative"
          >
            <Activity size={22} className="text-zinc-400" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange-400 rounded-full" />
            )}
          </button>
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header agents={agents} tasks={tasks} />
        </div>
        
        {/* Content Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Dashboard */}
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {/* Section Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
              <p className="text-sm text-zinc-500">Monitor your squad&apos;s activity and task progress</p>
            </div>
            
            {/* Stats */}
            <StatsCards agents={agents} tasks={tasks} />
            
            {/* Task Board Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Task Board</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Tasks assigned to agents</p>
                </div>
              </div>
              <TaskBoard tasks={tasks} agents={agents} />
            </div>
          </main>

          {/* Activity Feed - Desktop */}
          <aside className="hidden lg:block w-96 border-l border-white/5 bg-[#141414]/50">
            <ActivityFeed activities={activities} agents={agents} />
          </aside>
        </div>
      </div>

      {/* Mobile Feed Drawer */}
      {feedOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setFeedOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-[#141414] border-l border-white/5 z-50 lg:hidden animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="font-semibold text-white">Live Feed</h2>
              <button 
                onClick={() => setFeedOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X size={20} className="text-zinc-400" />
              </button>
            </div>
            <div className="h-[calc(100%-65px)]">
              <ActivityFeed activities={activities} agents={agents} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
