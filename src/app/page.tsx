'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { TaskBoard } from '@/components/TaskBoard';
import { ActivityFeed } from '@/components/ActivityFeed';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <StatsCards />
            <h2 className="text-lg font-semibold text-white mb-4">Task Board</h2>
            <TaskBoard />
          </main>

          {/* Activity Feed Sidebar */}
          <aside className="w-80 border-l border-gray-800 p-4">
            <ActivityFeed />
          </aside>
        </div>
      </div>
    </div>
  );
}
