'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { TaskBoard } from '@/components/TaskBoard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { supabase, DbAgent, DbTask, DbActivity } from '@/lib/supabase';
import { Menu, X } from 'lucide-react';

const POLL_INTERVAL = 10000; // 10 seconds

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agents, setAgents] = useState<DbAgent[]>([]);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [activities, setActivities] = useState<DbActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data function - reusable for initial load, polling, and manual refresh
  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    try {
      const [agentsRes, tasksRes, activitiesRes] = await Promise.all([
        supabase.from('agents').select('*').order('level'),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      if (agentsRes.data) setAgents(agentsRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (activitiesRes.data) setActivities(activitiesRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      if (showRefreshing) setIsRefreshing(false);
    }
  }, []);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling fallback - runs every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false); // Silent refresh for polling
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

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
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile, shown on desktop */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-200 ease-in-out
      `}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} agents={agents} onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Mobile Header */}
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 lg:hidden">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            <Menu size={24} />
          </button>
          <h1 className="font-bold">Mission Control</h1>
          <button 
            onClick={() => setFeedOpen(true)}
            className="p-2 hover:bg-gray-800 rounded-lg relative"
          >
            <span className="text-sm">Feed</span>
            {activities.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center">
                {activities.length}
              </span>
            )}
          </button>
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header 
            agents={agents} 
            tasks={tasks} 
            lastUpdated={lastUpdated}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            <StatsCards agents={agents} tasks={tasks} />
            <h2 className="text-lg font-semibold text-white mb-4">Task Board</h2>
            <TaskBoard tasks={tasks} agents={agents} />
          </main>

          {/* Activity Feed - Desktop */}
          <aside className="hidden lg:block w-80 border-l border-gray-800 p-4">
            <ActivityFeed activities={activities} agents={agents} />
          </aside>
        </div>
      </div>

      {/* Mobile Feed Drawer */}
      {feedOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setFeedOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-80 max-w-full bg-gray-900 z-50 lg:hidden p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Live Feed</h2>
              <button 
                onClick={() => setFeedOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <ActivityFeed activities={activities} agents={agents} />
          </div>
        </>
      )}
    </div>
  );
}
