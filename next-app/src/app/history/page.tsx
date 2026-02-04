"use client";

import React from 'react';
import HistoryTable from '@/components/history/HistoryTable';
import { History } from 'lucide-react';

export default function HistoryPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 animate-slide-up pb-24 md:pb-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                    <History className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submission History</h1>
                    <p className="text-slate-500 text-sm font-medium">View all your tracked incidents.</p>
                </div>
            </div>

            <HistoryTable />
        </div>
    );
}
