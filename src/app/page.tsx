'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { SquadStatus } from '@/components/SquadStatus';
import { HealthMonitor } from '@/components/HealthMonitor';
import { TaskBoard } from '@/components/TaskBoard';
import { AgentDialogView } from '@/components/AgentDialogView';
import { ConvexAgent } from '@/lib/convex-types';
import { Menu, Sparkles } from 'lucide-react';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<ConvexAgent | null>(null);

  // Convex reactive queries - automatically update when data changes
  const agents = useQuery(api.agents.list);
  const tasks = useQuery(api.tasks.list);
  const activities = useQuery(api.activities.recent, { limit: 20 });

  // Loading state: useQuery returns undefined while loading
  const loading = agents === undefined || tasks === undefined || activities === undefined;

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
          agents={agents}
          onClose={() => setSidebarOpen(false)}
          onAgentClick={(agent) => setSelectedAgent(agent)}
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
          <div className="w-10" />
        </header>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <Header agents={agents} tasks={tasks} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
              <div className="p-4 lg:p-8">
                {/* Section Header */}
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
                  <p className="text-sm text-zinc-500">Monitor your squad&apos;s activity and task progress</p>
                </div>

                {/* Stats */}
                <StatsCards agents={agents} tasks={tasks} />

                {/* Squad Status with Animated Sprites */}
                <SquadStatus agents={agents} onAgentClick={setSelectedAgent} />

                {/* Health Monitor - Full Width */}
                <div className="mb-6">
                  <HealthMonitor agents={agents} onAgentClick={setSelectedAgent} />
                </div>

                {/* Task Board Section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white">Task Board</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">Drag tasks between columns</p>
                    </div>
                  </div>
                  <TaskBoard tasks={tasks} agents={agents} />
                </div>
              </div>
        </main>
      </div>

      {/* Agent Dialog (Danganronpa Style) */}
      {selectedAgent && (
        <AgentDialogView
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}
