"use client";

import React, { useEffect, useState } from 'react';
import { useTracker } from '@/context/TrackerContext';
import { Clock } from 'lucide-react';

export default function LiveClock() {
    const { is24HourFormat, toggleTimeFormat } = useTracker();
    const [time, setTime] = useState<Date | null>(null);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        // Fetch server time for accuracy
        const fetchServerTime = async () => {
            try {
                const res = await fetch('https://worldtimeapi.org/api/ip');
                const data = await res.json();
                const serverTime = new Date(data.datetime).getTime();
                const localTime = new Date().getTime();
                setOffset(serverTime - localTime);
            } catch (e) {
                console.error("Failed to fetch server time, using local time", e);
            }
        };
        fetchServerTime();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date(Date.now() + offset));
        }, 1000);
        return () => clearInterval(timer);
    }, [offset]);

    if (!time) return <div className="text-3xl font-mono font-bold text-slate-800 animate-pulse">--:--:--</div>;

    const formatTime = (date: Date) => {
        let h = date.getHours();
        const m = date.getMinutes().toString().padStart(2, '0');
        const s = date.getSeconds().toString().padStart(2, '0');
        let ampm = '';

        if (!is24HourFormat) {
            ampm = h >= 12 ? ' PM' : ' AM';
            h = h % 12;
            h = h ? h : 12;
        }
        const hStr = h.toString().padStart(2, '0');
        return `${hStr}:${m}:${s}${ampm}`;
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">System Time</h3>
                <Clock className="w-4 h-4 text-brand-600" />
            </div>
            <div className="text-3xl font-mono font-bold text-slate-800">
                {formatTime(time)}
            </div>
            <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">Real-time Server Sync</div>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-100 w-full">
                <span className={`text-[10px] font-bold ${!is24HourFormat ? 'text-brand-600' : 'text-slate-400'}`}>12H</span>
                <button
                    onClick={toggleTimeFormat}
                    className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none ${is24HourFormat ? 'bg-brand-600' : 'bg-slate-200'}`}
                >
                    <span
                        className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-4 w-4 transition-transform duration-200 ${is24HourFormat ? 'translate-x-4 border-transparent' : 'translate-x-0'}`}
                    />
                </button>
                <span className={`text-[10px] font-bold ${is24HourFormat ? 'text-brand-600' : 'text-slate-400'}`}>24H</span>
            </div>
        </div>
    );
}
