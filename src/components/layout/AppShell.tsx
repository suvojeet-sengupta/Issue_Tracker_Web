"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTracker } from "@/context/TrackerContext";
import { cn } from "@/lib/utils";
import {
    LayoutGrid,
    PlusCircle,
    History,
    Zap,
    LogOut,
    UserCog,
    ChevronUp,
    Menu,
    X,
    Plus,
} from "lucide-react";
import Link from "next/link";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading } = useTracker();
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Redirect logic for first-time users
    useEffect(() => {
        if (!isLoading && !user && pathname !== "/setup") {
            router.push("/setup");
        }
    }, [user, isLoading, pathname, router]);

    // Show loading state while checking user persistence
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white animate-pulse">
                        <Zap className="w-6 h-6" />
                    </div>
                    <p className="text-slate-400 text-sm font-semibold animate-pulse">Loading Workspace...</p>
                </div>
            </div>
        );
    }

    // If on setup page, show simple layout with premium background
    if (pathname === "/setup") {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />

                <div className="relative z-10 w-full">
                    {children}
                </div>
            </div>
        );
    }

    // If no user and not on setup (and not loading), we are redirecting, so return null/loading
    if (!user) return null;

    const navItems = [
        { name: "Dashboard", icon: LayoutGrid, path: "/" },
        { name: "New Issue", icon: PlusCircle, path: "/tracker" },
        { name: "History", icon: History, path: "/history" },
    ];

    return (
        <div className="flex h-screen w-full bg-[#f1f5f9] text-slate-900 overflow-hidden relative">
            {/* Background Blob */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 h-full z-20 transition-all duration-300">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                        <Zap className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight">Issue Tracker</h1>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Workspace</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all group",
                                pathname === item.path
                                    ? "bg-indigo-50 text-indigo-700 font-bold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-transform", pathname === item.path ? "" : "group-hover:scale-110")} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 relative">
                    <div
                        className="p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/50 transition-colors relative z-30"
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-400 truncate font-bold font-mono">{user?.crm}</p>
                        </div>
                        <ChevronUp className={cn("w-4 h-4 text-slate-400 transition-transform", isProfileMenuOpen && "rotate-180")} />
                    </div>

                    {/* Profile Dropdown */}
                    {isProfileMenuOpen && (
                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 fade-in zoom-in-95 z-40">
                            <button
                                onClick={() => router.push("/setup")}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                                <UserCog className="w-4 h-4 text-indigo-700" /> Edit Profile
                            </button>
                            <div className="h-px bg-slate-50"></div>
                            <button
                                onClick={logout}
                                className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-hidden relative flex flex-col z-10">
                {/* Mobile Header */}
                <header className="md:hidden h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-4 z-20 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800">Issue Tracker</span>
                    </div>
                    <button onClick={() => router.push("/setup")} className="p-2 text-slate-400 hover:text-indigo-700">
                        <UserCog className="w-5 h-5" />
                    </button>
                </header>

                {/* Content Scrollable */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    {children}
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden h-16 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 flex items-center justify-around px-2 z-30 shrink-0 pb-safe">
                    <Link
                        href="/"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full transition-colors",
                            pathname === "/" ? "text-indigo-700" : "text-slate-400"
                        )}
                    >
                        <LayoutGrid className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">Dash</span>
                    </Link>
                    <Link
                        href="/tracker"
                        className="flex flex-col items-center justify-center w-full h-full text-slate-400 group"
                    >
                        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white -mt-8 shadow-lg shadow-slate-900/30 border-4 border-slate-100 transition-transform active:scale-95">
                            <Plus className="w-6 h-6" />
                        </div>
                    </Link>
                    <Link
                        href="/history"
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full transition-colors",
                            pathname === "/history" ? "text-indigo-700" : "text-slate-400"
                        )}
                    >
                        <History className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">History</span>
                    </Link>
                </nav>
            </main>
        </div>
    );
}
