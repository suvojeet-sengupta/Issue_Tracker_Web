import { Storage } from '../utils/storage.js';

export const DashboardScreen = {
    render: () => {
        const config = Storage.getConfig();
        const history = Storage.getHistory();

        if (!config) return;

        // Populate Profile Card
        document.getElementById('disp-name-card').innerText = config.name;
        document.getElementById('disp-crm-card').innerText = config.crm;
        document.getElementById('disp-org-card').innerText = config.org;
        document.getElementById('disp-tl-card').innerText = config.tl;
        
        // Avatar Logic
        const avatarContainer = document.getElementById('avatar-initials').parentElement; // The .w-full.h-full container
        if (config.avatar) {
            avatarContainer.innerHTML = `<img src="${config.avatar}" class="w-full h-full object-cover rounded-full">`;
            avatarContainer.classList.remove('bg-indigo-100', 'text-indigo-600'); // Remove fallback styles
        } else {
            avatarContainer.innerHTML = `<span id="avatar-initials">${config.name.charAt(0).toUpperCase()}</span>`;
            avatarContainer.classList.add('bg-indigo-100', 'text-indigo-600'); // Restore fallback styles
        }

        // Stats
        const total = history.length;
        const todayStr = new Date().toDateString();
        const todayCount = history.filter(h => new Date(h.timestamp).toDateString() === todayStr).length;

        document.getElementById('stat-total').innerText = total;
        document.getElementById('stat-today').innerText = todayCount;

        // Last Activity
        const lastStat = document.getElementById('stat-last');
        if (total > 0) {
            const lastItem = history[history.length - 1]; // Last item pushed is the latest
            const lastDate = new Date(lastItem.timestamp);
            
            // Format: "Today, 10:30 AM" or "Oct 24, 10:30 AM"
            const isToday = lastDate.toDateString() === new Date().toDateString();
            const timeStr = lastDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            
            if (isToday) {
                lastStat.innerText = `Today, ${timeStr}`;
            } else {
                const dateStr = lastDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
                lastStat.innerText = `${dateStr}, ${timeStr}`;
            }
        } else {
            lastStat.innerText = "No activity yet";
        }

        // Recent History List
        const list = document.getElementById('history-list');
        list.innerHTML = '';

        if (total === 0) {
            list.innerHTML = '<div class="text-center text-slate-400 text-sm py-8 italic">No history yet. Start tracking!</div>';
        } else {
            // Last 5 items
            const recent = [...history].reverse().slice(0, 5);
            recent.forEach(item => {
                const el = document.createElement('div');
                el.className = 'bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow';
                
                const dateObj = new Date(item.timestamp);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateStr = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short' });

                el.innerHTML = `
                    <div class="flex items-start gap-4">
                        <div class="bg-indigo-50 p-3 rounded-full hidden md:block">
                            <i data-lucide="check-circle-2" class="w-5 h-5 text-indigo-600"></i>
                        </div>
                        <div>
                            <div class="font-bold text-slate-800 text-base">${item.issue}</div>
                            <div class="text-xs text-slate-500 font-mono mt-1">${item.timeRange}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs font-bold text-slate-400 uppercase tracking-wide">${dateStr}</div>
                        <div class="text-xs text-slate-400">${timeStr}</div>
                    </div>
                `;
                list.appendChild(el);
            });
        }
        
        if(window.lucide) lucide.createIcons();
    }
};