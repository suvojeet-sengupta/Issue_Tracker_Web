import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTracker } from '@/context/TrackerContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Zap, Save, User, Hash, Briefcase, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SetupPage() {
    const { user, setUser } = useTracker();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        crm: '',
        org: '',
        tl: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(user);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate a brief delay for effect
        await new Promise(resolve => setTimeout(resolve, 800));
        setUser(formData);
        router.push('/');
    };

    const InputField = ({
        label,
        name,
        icon: Icon,
        placeholder
    }: {
        label: string,
        name: keyof typeof formData,
        icon: any,
        placeholder: string
    }) => (
        <div className="space-y-1.5 group">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 group-focus-within:text-indigo-600 transition-colors">
                {label}
            </label>
            <div className="relative transform transition-all duration-200 group-focus-within:-translate-y-0.5">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center z-10 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Icon className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    name={name}
                    required
                    value={formData[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
                             transition-all font-semibold text-slate-700 placeholder:text-slate-400
                             shadow-sm group-focus-within:shadow-md group-focus-within:bg-white"
                />
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-lg mx-auto animate-in slide-in-from-bottom-8 duration-700 fade-in">
            <div className="text-center mb-10 relative">
                <div className="inline-flex relative mb-4 group cursor-default">
                    <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-full" />
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 relative z-10 transform transition-transform duration-500 hover:scale-105 hover:rotate-3">
                        <Zap className="w-10 h-10 drop-shadow-md" />
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                    Welcome to Issue Tracker
                </h1>
                <p className="text-slate-500 text-base max-w-xs mx-auto leading-relaxed">
                    Set up your workspace profile to start logging and tracking issues efficiently.
                </p>
            </div>

            <GlassCard className="p-1 sm:p-2 border-slate-200/60 shadow-2xl shadow-indigo-900/5 backdrop-blur-xl">
                <div className="bg-white/50 p-6 sm:p-8 rounded-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-5">
                            <InputField
                                label="Full Name"
                                name="name"
                                icon={User}
                                placeholder="e.g. Suvojeet Sengupta"
                            />

                            <InputField
                                label="CRM Alias / ID"
                                name="crm"
                                icon={Hash}
                                placeholder="e.g. suvojeet.s"
                            />

                            <div className="grid grid-cols-2 gap-5">
                                <InputField
                                    label="Organization"
                                    name="org"
                                    icon={Briefcase}
                                    placeholder="e.g. Google"
                                />
                                <InputField
                                    label="Team Lead"
                                    name="tl"
                                    icon={Users}
                                    placeholder="e.g. Jane Doe"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800",
                                    "text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40",
                                    "transition-all duration-300 transform active:scale-[0.98]",
                                    "flex items-center justify-center gap-3 text-sm uppercase tracking-wide",
                                    isSubmitting && "opacity-80 cursor-wait"
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Setting up...</span>
                                    </>
                                ) : (
                                    <>
                                        {user ? 'Update Profile' : 'Get Started'}
                                        {user ? <Save className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </GlassCard>

            <p className="text-center text-xs text-slate-400 font-medium mt-8 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                Secure Workspace • v2.0.0
            </p>
        </div>
    );
}
