"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTracker } from '@/context/TrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Zap, Save, User, Hash, Briefcase, Users } from 'lucide-react';

export default function SetupPage() {
    const { user, setUser } = useTracker();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        crm: '',
        org: 'Google',
        tl: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setUser(formData);
        router.push('/');
    };

    return (
        <div className="w-full max-w-md animate-slide-up">
            <div className="flex justify-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-600/30 animate-float">
                    <Zap className="w-10 h-10" />
                </div>
            </div>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Issue Tracker</h1>
                <p className="text-slate-500 mt-2">Set up your workspace profile to continue.</p>
            </div>

            <GlassCard>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. John Doe"
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">CRM Alias / ID</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                name="crm"
                                required
                                value={formData.crm}
                                onChange={handleChange}
                                placeholder="e.g. johndoe"
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Organization</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="org"
                                    required
                                    value={formData.org}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Team Lead</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="tl"
                                    required
                                    value={formData.tl}
                                    onChange={handleChange}
                                    placeholder="e.g. Jane Smith"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-600/20 hover:shadow-brand-600/40 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm uppercase tracking-wide mt-6"
                    >
                        {user ? 'Update Profile' : 'Get Started'} <Save className="w-4 h-4" />
                    </button>
                </form>
            </GlassCard>

            <p className="text-center text-[10px] text-slate-400 font-medium mt-6">
                Issue Tracker v2.0 • Designed for Performance
            </p>
        </div>
    );
}
