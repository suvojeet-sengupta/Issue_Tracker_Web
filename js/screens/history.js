import { Storage } from '../utils/storage.js';

export const HistoryScreen = {
    init: () => {
        document.getElementById('history-search').addEventListener('input', (e) => {
            HistoryScreen.render(e.target.value);
        });

        document.getElementById('clear-history-btn').addEventListener('click', () => {
            if(confirm("Are you sure you want to delete ALL history? This cannot be undone.")) {
                Storage.clearHistory();
                HistoryScreen.render();
            }
        });
    },

    render: (query = '') => {
        const list = document.getElementById('full-history-list');
        const history = Storage.getHistory();
        list.innerHTML = '';

        if (history.length === 0) {
            list.innerHTML = '<div class="text-center text-slate-400 py-12">No history found.</div>';
            return;
        }

        let filtered = [...history].reverse();
        if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(h => 
                h.issue.toLowerCase().includes(q) || 
                h.timeRange.toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            list.innerHTML = '<div class="text-center text-slate-400 py-12">No matches found.</div>';
            return;
        }

        filtered.forEach(item => {
            const el = document.createElement('div');
            const dateObj = new Date(item.timestamp);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

            el.className = `bg-white p-4 border-b last:border-0 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-4`;
            el.onclick = () => HistoryScreen.openModal(item);

            el.innerHTML = `
                <div class="flex items-start gap-4">
                    <div class="bg-indigo-50 p-3 rounded-full hidden md:block">
                        <i data-lucide="check-circle-2" class="w-5 h-5 text-indigo-600"></i>
                    </div>
                    <div>
                        <div class="font-bold text-slate-800 text-base">${item.issue}</div>
                        <div class="text-xs text-slate-500 font-mono mt-1">${item.timeRange}</div>
                        ${item.remarks ? `<div class="text-sm text-slate-600 mt-2 p-2 bg-slate-100 rounded-md">${item.remarks}</div>` : ''}
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-bold text-slate-400 uppercase tracking-wide">${dateStr}</div>
                    <div class="text-xs text-slate-400">${timeStr}</div>
                </div>
            `;
            list.appendChild(el);
        });
        
        if(window.lucide) lucide.createIcons();
    },

    openModal: (item) => {
        const modal = document.getElementById('history-details-modal');
        document.getElementById('detail-issue').innerText = item.issue;
        document.getElementById('detail-range').innerText = item.timeRange;
        document.getElementById('detail-link').href = item.url || '#';
        document.getElementById('detail-date').innerText = new Date(item.timestamp).toLocaleString();
        
        const remarksContainer = document.getElementById('detail-remarks-container');
        const remarksEl = document.getElementById('detail-remarks');
        if (item.remarks) {
            remarksEl.innerText = item.remarks;
        } else {
            remarksEl.innerText = 'N/A';
        }
        remarksContainer.classList.remove('hidden');

        modal.classList.remove('hidden');
        
        // Close logic
        window.closeHistoryModal = () => modal.classList.add('hidden');
    }
};