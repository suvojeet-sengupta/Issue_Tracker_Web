"use client";

import React from 'react';
import { useTracker } from '@/context/TrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Inbox, Trash2 } from 'lucide-react';

export default function HistoryTable() {
    const { history, clearHistory } = useTracker();

    if (history.length === 0) {
        return (
            <GlassCard className="text-center py-16">
                <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No History Found</h3>
                <p className="text-slate-500 text-sm">Your submitted issues will appear here.</p>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Time Range</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Issue</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cause</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {history.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                                    {new Date(item.timestamp).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600 whitespace-nowrap">
                                    {item.timeRange}
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                    {item.issue}
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500">
                                    {item.cause}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Sent</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/30">
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to clear all history?')) clearHistory();
                    }}
                    className="text-xs font-bold text-red-400 hover:text-red-600 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <Trash2 className="w-3 h-3" /> Clear History
                </button>
            </div>
        </GlassCard>
    );
}
