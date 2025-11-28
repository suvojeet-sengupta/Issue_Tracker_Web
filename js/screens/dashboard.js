import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Search, 
  Bell, 
  Zap, 
  ArrowRight,
  LayoutGrid,
  List,
  Server,
  Wifi,
  BatteryCharging,
  TrendingUp,
  TrendingDown,
  Clock,
  Menu
} from 'lucide-react';

// --- Sub-Components ---

// 1. Sidebar Item Component
const NavItem = ({ icon: Icon, label, active, collapsed }) => (
  <button
    className={`
      flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 group relative mb-1
      ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
      ${collapsed ? 'justify-center' : ''}
    `}
  >
    <Icon size={20} className={active ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
    {!collapsed && <span className="font-medium text-sm tracking-wide">{label}</span>}
    {collapsed && (
      <div className="absolute left-14 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
        {label}
      </div>
    )}
  </button>
);

// 2. Metric Card (Top Stats)
const MetricCard = ({ label, value, trend, trendUp, icon: Icon }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all duration-300 shadow-sm hover:shadow-md group">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2">
         <div className="p-1.5 rounded bg-slate-50 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors">
            <Icon size={16} />
         </div>
         <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</h3>
      </div>
      <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {trend}
      </span>
    </div>
    <div className="text-2xl font-bold text-slate-800 font-mono mt-2">{value}</div>
  </div>
);

// 3. Timeline Feed Item
const TimelineItem = ({ time, title, tag, status }) => (
  <div className="flex gap-4 group relative pl-6 border-l-2 border-slate-100 last:border-0 pb-8 last:pb-0 hover:border-indigo-200 transition-colors">
    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm box-content
      ${status === 'sent' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-400' : 'bg-indigo-500'}
    `}></div>
    
    <div className="flex-1 -mt-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{time}</span>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border
           ${tag === 'Network' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
           ${tag === 'Power' ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
           ${tag === 'Voice' ? 'bg-purple-50 text-purple-600 border-purple-100' : ''}
        `}>{tag}</span>
      </div>
      <h4 className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors cursor-pointer">{title}</h4>
      <p className="text-xs text-slate-500 mt-1 line-clamp-1">Automated alert: Latency exceeded threshold in Zone B...</p>
    </div>
  </div>
);

// --- Main Dashboard Application ---

export default function Dashboard3_0() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-800 overflow-hidden selection:bg-indigo-100 selection:text-indigo-700">
      
      {/* 1. SIDEBAR (The Dark Command Rail) */}
      <aside className={`bg-[#0F172A] text-slate-400 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] z-20 ${collapsed ? 'w-20' : 'w-64'}`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3 text-white overflow-hidden whitespace-nowrap">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
              <Zap size={18} fill="white" className="text-white" />
            </div>
            {!collapsed && <span className="font-bold tracking-tight text-lg">Issue<span className="text-indigo-400">Tracker</span></span>}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-3">
          <p className={`px-3 text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 ${collapsed ? 'text-center' : ''}`}>
            {collapsed ? 'Main' : 'Menu'}
          </p>
          <NavItem icon={LayoutGrid} label="Dashboard" active={true} collapsed={collapsed} />
          <NavItem icon={Plus} label="New Entry" collapsed={collapsed} />
          <NavItem icon={List} label="All Logs" collapsed={collapsed} />
          <NavItem icon={Activity} label="Analytics" collapsed={collapsed} />
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="flex items-center justify-center w-full p-2 rounded-lg text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
          >
             {collapsed ? <ArrowRight size={18} /> : <div className="flex items-center gap-2"><Menu size={16} /><span className="text-xs font-medium">Collapse</span></div>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/60 sticky top-0 z-10 px-6 flex items-center justify-between shadow-sm">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-500">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">Dashboard</span>
          </div>

          {/* Right: Server Time & Profile */}
          <div className="flex items-center gap-6">
             {/* Server Time Widget */}
             <div className="hidden md:flex flex-col items-end border-r border-slate-200 pr-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Time</span>
                <div className="flex items-center gap-2 text-indigo-600">
                  <Clock size={14} className="animate-pulse" />
                  <span className="font-mono font-bold text-sm">{currentTime}</span>
                </div>
             </div>

             <div className="flex items-center gap-4">
               <button className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
               </button>
               
               <div className="flex items-center gap-3 pl-2">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold text-slate-700">Suvojeet S.</p>
                    <p className="text-xs text-slate-400 font-medium">L2 Support</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform">
                    SS
                  </div>
               </div>
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
               <div>
                 <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
                 <p className="text-slate-500 text-sm mt-1">Real-time monitoring across 4 active nodes.</p>
               </div>
               <div className="flex gap-3">
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search logs..." className="pl-9 pr-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-64 transition-all shadow-sm" />
                 </div>
                 <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center gap-2 active:scale-95">
                   <Plus size={18} /> <span className="hidden sm:inline">Log Issue</span>
                 </button>
               </div>
            </div>

            {/* 2. Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <MetricCard icon={Activity} label="Active Issues" value="03" trend="12%" trendUp={false} />
              <MetricCard icon={Clock} label="Avg. Resolution" value="14m" trend="5%" trendUp={true} />
              <MetricCard icon={Server} label="System Uptime" value="99.9%" trend="Stable" trendUp={true} />
              <MetricCard icon={List} label="Total Logs" value="1,240" trend="+24" trendUp={true} />
            </div>

            {/* 3. Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Live Feed (Takes up 2/3 space) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                 {/* Feed Card */}
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex-1">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                         Live Incident Feed
                       </h3>
                       <button className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors border border-transparent hover:border-indigo-100">
                         View Full Log
                       </button>
                    </div>
                    
                    <div className="space-y-1">
                       <TimelineItem time="08:24 PM" title="Voice Connectivity Loss - Region North" tag="Voice" status="sent" />
                       <TimelineItem time="04:15 PM" title="Main Server Timeout (504 Gateway)" tag="Network" status="pending" />
                       <TimelineItem time="02:30 PM" title="UPS Failure / Power Drop detected" tag="Power" status="sent" />
                       <TimelineItem time="11:00 AM" title="User Authentication Service Lag" tag="Network" status="sent" />
                       <TimelineItem time="09:15 AM" title="Scheduled Maintenance Complete" tag="System" status="sent" />
                    </div>
                 </div>
              </div>

              {/* Right Column: Widgets (Takes up 1/3 space) */}
              <div className="space-y-6">
                 
                 {/* System Health Widget */}
                 <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Infrastructure Health</h3>
                       <Activity size={16} className="text-slate-400" />
                    </div>
                    <div className="space-y-3">
                       {/* Network Status */}
                       <div className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 group hover:border-emerald-200 transition-colors cursor-default">
                         <div className="flex items-center gap-3">
                           <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                              <Wifi size={18} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">Network</span>
                              <span className="text-[10px] text-slate-500 font-mono">12ms Latency</span>
                           </div>
                         </div>
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                       </div>

                       {/* Database Status */}
                       <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-slate-200 transition-colors cursor-default">
                         <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-200 rounded-lg text-slate-600">
                              <Server size={18} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">Database</span>
                              <span className="text-[10px] text-slate-500 font-mono">Running</span>
                           </div>
                         </div>
                         <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                       </div>

                       {/* Power Status (Warning) */}
                       <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 group hover:border-amber-200 transition-colors cursor-default">
                         <div className="flex items-center gap-3">
                           <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                              <BatteryCharging size={18} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700">Power Grid</span>
                              <span className="text-[10px] text-amber-600 font-mono font-bold">Fluctuation</span>
                           </div>
                         </div>
                         <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)] animate-pulse"></div>
                       </div>
                    </div>
                 </div>

                 {/* Quick Tip Widget */}
                 <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden">
                    {/* Decorative Background Circles */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                    
                    <div className="relative z-10">
                       <h4 className="font-bold text-lg mb-2">Shift Handover?</h4>
                       <p className="text-indigo-100 text-xs mb-4 leading-relaxed">
                          Don't forget to clear all pending tickets before 09:00 PM. High efficiency scores = better shift ratings!
                       </p>
                       <button className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold transition-colors">
                          View Pending (2)
                       </button>
                    </div>
                 </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}