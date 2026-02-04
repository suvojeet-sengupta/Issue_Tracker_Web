"use client";

import React from 'react';
import { useTracker } from '@/context/TrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { HistoryItem } from '@/types';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#2a0e62'];

export default function AnalyticsDashboard() {
    const { history } = useTracker();

    if (history.length === 0) return null;

    // 1. Process Data for Issue Distribution (Pie Chart)
    const issueCounts: { [key: string]: number } = {};
    history.forEach((item) => {
        // Strip remarks for aggregation if needed, or keep full issue string
        const issueName = item.issue.split(' - ')[0].split(' (')[0];
        issueCounts[issueName] = (issueCounts[issueName] || 0) + 1;
    });

    const pieData = Object.keys(issueCounts).map((key) => ({
        name: key,
        value: issueCounts[key]
    })).sort((a, b) => b.value - a.value); // Sort by frequency

    // 2. Process Data for Weekly Activity (Bar Chart)
    // Get last 7 days keys
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString();
    });

    const activityCounts: { [key: string]: number } = {};
    history.forEach((item) => {
        const dateKey = new Date(item.timestamp).toLocaleDateString();
        activityCounts[dateKey] = (activityCounts[dateKey] || 0) + 1;
    });

    const barData = last7Days.map((date) => ({
        date: date.split('/').slice(0, 2).join('/'), // Short date MM/DD
        count: activityCounts[date] || 0
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up">
            {/* Issue Distribution */}
            <GlassCard className="min-h-[350px] flex flex-col">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Issue Breakdown</h3>
                <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Weekly Activity */}
            <GlassCard className="min-h-[350px] flex flex-col">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Weekly Activity</h3>
                <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <XAxis
                                dataKey="date"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748b' }}
                            />
                            <YAxis
                                allowDecimals={false}
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#64748b' }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#8b5cf6"
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>
        </div>
    );
}
