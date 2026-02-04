"use client";

import React from 'react';
import { useTracker } from '@/context/TrackerContext';
import StatsGrid from '@/components/dashboard/StatsGrid';
import RecentActivity from '@/components/dashboard/RecentActivity';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import LiveClock from '@/components/dashboard/LiveClock';
import { Search, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useTracker();
  const router = useRouter();

  if (!user) return null; // Or generic loading state, AppShell handles redirect/check usually

  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good Morning' : hr < 18 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user.name.split(' ')[0];

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8 animate-slide-up">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{greet}, {firstName} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time monitoring across active nodes.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              className="pl-9 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-64 transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => router.push('/tracker')}
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-600/20 hover:shadow-brand-600/40 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Log Issue</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <StatsGrid />

      {/* Analytics */}
      <AnalyticsDashboard />

      {/* Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Live Feed */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <RecentActivity />
        </div>

        {/* Right Widgets */}
        <div className="space-y-6">
          {/* Clock Widget */}
          <LiveClock />
        </div>
      </div>
    </div>
  );
}
