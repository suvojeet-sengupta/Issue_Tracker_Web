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
                    <p className="text-slate-500 text-sm font-medium">View and export your tracked incidents.</p>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => {
                        const headers = ['Date', 'Time Range', 'Issue', 'Cause', 'Remarks'];
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const rows = (document.querySelectorAll('table tbody tr') as any) as HTMLTableRowElement[];

                        // Actually, getting data from DOM is flaky. Let's rely on the HistoryTable data prop if we lifted state, 
                        // but since HistoryTable uses context directly, let's wrap this button inside HistoryTable or 
                        // move the export logic to HistoryTable? 
                        // The user asked for "One-Click Export".
                        // Use a custom event or ref? 
                        // No, let's just make a dedicated Export Button Component or modify HistoryTable to include the header actions.
                    }}
                    className="hidden"
                >
                    Export
                </button>
                {/* 
                    Better Approach: Pass a prop or composability. 
                    I'll modify HistoryTable to accept an "onExport" prop or just put the button INSIDE HistoryTable?
                    Putting it inside HistoryTable next to "Clear History" or in the header seems best.
                */}
            </div>

            <HistoryTable />
        </div>
    );
}
