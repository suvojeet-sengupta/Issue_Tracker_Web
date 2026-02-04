"use client";

import React, { useState } from 'react';
import { useTracker } from '@/context/TrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Clock, AlertCircle, ArrowRight, Zap, PlayCircle, StopCircle, CornerDownRight } from 'lucide-react';
import SubmissionModal from '@/components/tracker/SubmissionModal';
import { useRouter } from 'next/navigation';
import { HistoryItem } from '@/types';

export default function TrackerPage() {
    const { user, addHistoryItem } = useTracker();
    const router = useRouter();

    // Form State
    const [issue, setIssue] = useState('System Sloweness');
    const [cause, setCause] = useState('System Issue');
    const [remarks, setRemarks] = useState('');

    // Time State
    // Defaulting to "now" logic for better UX? Or just empty? 
    // The original had empty selects. I'll stick to a slightly better UX with defaults.
    const now = new Date();
    const currentHour = now.getHours();
    const isPM = currentHour >= 12;
    const initialHour12 = currentHour % 12 || 12;

    const [startTime, setStartTime] = useState({
        h: initialHour12.toString().padStart(2, '0'),
        m: '00',
        ampm: isPM ? 'PM' : 'AM'
    });

    const [endTime, setEndTime] = useState({
        h: initialHour12.toString().padStart(2, '0'),
        m: '00',
        ampm: isPM ? 'PM' : 'AM'
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formUrl, setFormUrl] = useState('');

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const generateUrl = () => {
        if (!user) return;

        const get24Hour = (h: string, ampm: string) => {
            let hour = parseInt(h);
            if (ampm === 'PM' && hour < 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            return hour;
        };

        const startH24 = get24Hour(startTime.h, startTime.ampm);
        const endH24 = get24Hour(endTime.h, endTime.ampm);
        const now = new Date();

        const params = new URLSearchParams();
        params.append('entry.1005447471', user.crm);
        params.append('entry.44222229', user.name);
        params.append('entry.115861300', user.tl);
        params.append('entry.313975949', user.org);

        params.append('entry.1521239602_hour', startH24.toString());
        params.append('entry.1521239602_minute', startTime.m);
        params.append('entry.702818104_year', now.getFullYear().toString());
        params.append('entry.702818104_month', (now.getMonth() + 1).toString());
        params.append('entry.702818104_day', now.getDate().toString());

        params.append('entry.701130970_hour', endH24.toString());
        params.append('entry.701130970_minute', endTime.m);
        params.append('entry.514450388_year', now.getFullYear().toString());
        params.append('entry.514450388_month', (now.getMonth() + 1).toString());
        params.append('entry.514450388_day', now.getDate().toString());

        params.append('entry.1211413190', issue);
        params.append('entry.1231067802', cause);
        // Note: Remarks weren't in the params in original app js, they were just appended to issue string for local preview? 
        // Checking original JS: iframe.dataset.pendingIssue = issue + (remarks ? ` (${remarks})` : '');
        // But parameters passed to URL: params.append('entry.1211413190', issue);
        // So remarks are NOT sent to Google Form by default unless I append them to issue.
        // I will append remarks to the issue field if provided.
        if (remarks) {
            params.set('entry.1211413190', `${issue} - ${remarks}`);
        }

        const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdeWylhfFaHmM3osSGRbxh9S_XvnAEPCIhTemuh-I7-LNds_w/viewform";
        return `${baseUrl}?${params.toString()}&usp=pp_url`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = generateUrl();
        if (url) {
            setFormUrl(url);
            setIsModalOpen(true);
        }
    };

    const handleSuccess = () => {
        const timeRange = `${startTime.h}:${startTime.m} ${startTime.ampm} - ${endTime.h}:${endTime.m} ${endTime.ampm}`;
        const newItem: HistoryItem = {
            issue: issue + (remarks ? ` (${remarks})` : ''),
            cause,
            timeRange,
            timestamp: new Date().toISOString()
        };
        addHistoryItem(newItem);
        setIsModalOpen(false);
        router.push('/');
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-slide-up pb-24 md:pb-8">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-600/20">
                    <Zap className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Incident</h1>
                    <p className="text-slate-500 text-sm font-medium">Log a new issue to the tracker.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard className="space-y-6">
                            {/* ISSUE SECTION */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-brand-600" />
                                    Select Issue
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {['System Sloweness', 'Citrix Issue', 'VPN Down', 'Audio Issue', 'VDI Lag', 'Other'].map((opt) => (
                                        <label key={opt} className="cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="issue"
                                                value={opt}
                                                checked={issue === opt}
                                                onChange={(e) => setIssue(e.target.value)}
                                                className="peer sr-only"
                                            />
                                            <div className="border border-slate-200 rounded-xl p-4 peer-checked:bg-brand-50 peer-checked:border-brand-500 peer-checked:text-brand-700 hover:border-brand-300 transition-all">
                                                <div className="font-bold text-sm">{opt}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* CAUSE SECTION */}
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                    <CornerDownRight className="w-4 h-4 text-brand-600" />
                                    Root Cause
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {['System Issue', 'Power Outage', 'Internet Issue'].map((opt) => (
                                        <label key={opt} className="cursor-pointer">
                                            <input
                                                type="radio"
                                                name="cause"
                                                value={opt}
                                                checked={cause === opt}
                                                onChange={(e) => setCause(e.target.value)}
                                                className="peer sr-only"
                                            />
                                            <div className="border border-slate-200 rounded-xl p-3 text-center peer-checked:bg-amber-50 peer-checked:border-amber-500 peer-checked:text-amber-700 hover:border-gray-300 transition-all">
                                                <span className="text-xs font-bold uppercase">{opt}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* REMARKS */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Remarks (Optional)</label>
                                <textarea
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                                    rows={2}
                                    placeholder="Any additional details..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </GlassCard>

                        <GlassCard className="space-y-4">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                                <Clock className="w-4 h-4 text-brand-600" />
                                Impact Duration
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative">
                                {/* Connector Line (Desktop) */}
                                <div className="hidden sm:block absolute top-[22px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-slate-200">
                                    <div className="absolute right-0 -top-1 border-[4px] border-transparent border-l-slate-200"></div>
                                </div>

                                {/* Start Time */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <PlayCircle className="w-4 h-4 text-green-500" /> Start Time
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-mono font-bold outline-none focus:border-brand-500"
                                            value={startTime.h}
                                            onChange={(e) => setStartTime({ ...startTime, h: e.target.value })}
                                        >
                                            {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        <span className="py-2">:</span>
                                        <select
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-mono font-bold outline-none focus:border-brand-500"
                                            value={startTime.m}
                                            onChange={(e) => setStartTime({ ...startTime, m: e.target.value })}
                                        >
                                            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-brand-500"
                                            value={startTime.ampm}
                                            onChange={(e) => setStartTime({ ...startTime, ampm: e.target.value })}
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>

                                {/* End Time */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <StopCircle className="w-4 h-4 text-red-500" /> End Time
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-mono font-bold outline-none focus:border-brand-500"
                                            value={endTime.h}
                                            onChange={(e) => setEndTime({ ...endTime, h: e.target.value })}
                                        >
                                            {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        <span className="py-2">:</span>
                                        <select
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-mono font-bold outline-none focus:border-brand-500"
                                            value={endTime.m}
                                            onChange={(e) => setEndTime({ ...endTime, m: e.target.value })}
                                        >
                                            {minutes.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold outline-none focus:border-brand-500"
                                            value={endTime.ampm}
                                            onChange={(e) => setEndTime({ ...endTime, ampm: e.target.value })}
                                        >
                                            <option value="AM">AM</option>
                                            <option value="PM">PM</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Preview / Submit */}
                    <div className="space-y-6">
                        <GlassCard className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white border-none shadow-xl shadow-indigo-900/20">
                            <h3 className="text-sm font-bold opacity-70 uppercase tracking-widest mb-4">Ticket Preview</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-semibold text-indigo-300 uppercase">Issue Type</label>
                                    <div className="text-xl font-bold">{issue}</div>
                                </div>
                                <div className="w-full h-px bg-white/10"></div>
                                <div>
                                    <label className="text-[10px] font-semibold text-indigo-300 uppercase">User</label>
                                    <div className="font-semibold">{user?.name}</div>
                                    <div className="text-xs opacity-70 font-mono">{user?.crm}</div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-semibold text-indigo-300 uppercase">Duration</label>
                                    <div className="text-sm font-mono bg-black/20 rounded px-2 py-1 inline-block border border-white/5">
                                        {startTime.h}:{startTime.m} {startTime.ampm} <span className="opacity-50 mx-1">→</span> {endTime.h}:{endTime.m} {endTime.ampm}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-8 bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
                            >
                                Proceed <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </GlassCard>
                    </div>
                </div>
            </form>

            <SubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                url={formUrl}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
