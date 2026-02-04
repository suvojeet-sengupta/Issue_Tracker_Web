"use client";

import React from 'react';
import { useTracker } from '@/context/TrackerContext';
import { Inbox } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RecentActivity() {
    const { history } = useTracker();
    const router = useRouter();

    const recentItems = history.slice(0, 5);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1 h-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                    Live Incident Feed
                </h3>
                <button
                    onClick={() => router.push('/history')}
                    className="text-xs font-bold text-brand-600 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors border border-transparent hover:border-brand-200"
                >
                    View Full Log
                </button>
            </div>

            <div className="space-y-1">
                {recentItems.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent activity.</p>
                    </div>
                ) : (
                    recentItems.map((item, index) => {
                        const dateObj = new Date(item.timestamp);
                        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        let statusColor = 'bg-brand-500';
                        let tagClass = 'bg-blue-50 text-blue-600 border-blue-100';
                        let tagLabel = 'System';

                        if (item.cause?.includes('Voice')) {
                            statusColor = 'bg-purple-500';
                            tagClass = 'bg-purple-50 text-purple-600 border-purple-100';
                            tagLabel = 'Voice';
                        } else if (item.cause?.includes('Power')) {
                            statusColor = 'bg-amber-400';
                            tagClass = 'bg-amber-50 text-amber-600 border-amber-100';
                            tagLabel = 'Power';
                        }

                        return (
                            <div key={index} className="flex gap-4 group relative pl-6 border-l-2 border-slate-100 last:border-0 pb-8 last:pb-0 hover:border-brand-200 transition-colors animate-slide-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm box-content ${statusColor}`}></div>

                                <div className="flex-1 -mt-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{timeStr}</span>
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${tagClass}`}>{tagLabel}</span>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-700 group-hover:text-brand-600 transition-colors cursor-pointer">{item.issue}</h4>
                                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{item.cause || 'No details provided'}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
