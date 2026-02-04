"use client";

import React from 'react';
import { useTracker } from '@/context/TrackerContext';
import { Activity, List, TrendingUp, Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';

export default function StatsGrid() {
    const { history } = useTracker();

    const todayStr = new Date().toLocaleDateString();
    const todayCount = history.filter(x => new Date(x.timestamp).toLocaleDateString() === todayStr).length;
    const lastIssue = history.length > 0 ? history[0] : null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Today's Issues */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md group">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-slate-50 text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-100 transition-colors">
                            <Activity className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Issue</h3>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                        <TrendingUp className="w-3 h-3" /> 12%
                    </span>
                </div>
                <div className="text-2xl font-bold text-slate-800 font-mono mt-2">{todayCount}</div>
            </div>

            {/* Total Logs */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-brand-400 transition-all duration-300 shadow-sm hover:shadow-md group">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-slate-50 text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-100 transition-colors">
                            <List className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Logs</h3>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                        <Plus className="w-3 h-3" /> {history.length}
                    </span>
                </div>
                <div className="text-2xl font-bold text-slate-800 font-mono mt-2">{history.length}</div>
            </div>

            {/* Last Activity (Wide) */}
            <div className="glass-card p-5 rounded-2xl col-span-2 bg-gradient-to-br from-slate-900 to-black text-white relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Submission</p>
                    <h3 className="text-lg font-bold mt-1 truncate">{lastIssue ? lastIssue.issue : 'No activity yet'}</h3>
                    <p className="text-sm text-slate-400 mt-1 font-mono">
                        {lastIssue ? new Date(lastIssue.timestamp).toLocaleString() : '--:--'}
                    </p>
                </div>
                <div className="absolute right-4 bottom-4 p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Activity className="w-5 h-5 text-white" />
                </div>
            </div>
        </div>
    );
}
