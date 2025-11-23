// --- STATE MANAGEMENT ---
let currentUser = JSON.parse(localStorage.getItem('tracker_user')) || null;
let historyLog = JSON.parse(localStorage.getItem('tracker_history')) || [];

// --- DOM ELEMENTS ---
const views = {
    setup: document.getElementById('view-setup'),
    dashboard: document.getElementById('view-dashboard'),
    tracker: document.getElementById('view-tracker'),
    history: document.getElementById('view-history')
};
const navItems = document.querySelectorAll('.nav-item');

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initTimeSelects();
    
    if (!currentUser) {
        showView('setup');
    } else {
        updateUI();
        showView('dashboard');
    }

    // Real-time Preview Listeners
    document.getElementById('issue-select').addEventListener('change', updatePreview);
    ['start-h', 'start-m', 'start-ampm', 'end-h', 'end-m', 'end-ampm'].forEach(id => {
        document.getElementById(id).addEventListener('change', updatePreview);
    });
});

// --- ROUTING ---
function showView(viewName) {
    // Hide all
    Object.values(views).forEach(el => el.classList.add('hidden'));
    // Show selected
    views[viewName].classList.remove('hidden');
    
    // Scroll to top
    document.getElementById('main-scroll').scrollTop = 0;

    // Nav Active State
    document.querySelectorAll('button[onclick^="router"]').forEach(btn => {
        btn.classList.remove('text-brand-600', 'bg-brand-50');
        if(btn.getAttribute('onclick').includes(viewName)) {
            btn.classList.add('text-brand-600');
            if(window.innerWidth >= 768) btn.classList.add('bg-brand-50');
        }
    });
}

function router(path) {
    showView(path);
    if(path === 'dashboard' || path === 'history') renderHistory();
}

// --- SETUP LOGIC ---
document.getElementById('setup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('setup-name').value;
    const crm = document.getElementById('setup-crm').value;
    const org = document.getElementById('setup-org').value;
    const tl = document.getElementById('setup-tl').value;

    currentUser = { name, crm, org, tl };
    localStorage.setItem('tracker_user', JSON.stringify(currentUser));
    
    updateUI();
    showView('dashboard');
});

function logout() {
    if(confirm('Are you sure you want to log out? Data will remain on device.')) {
        localStorage.removeItem('tracker_user');
        location.reload();
    }
}

// --- UI UPDATES ---
function updateUI() {
    if(!currentUser) return;
    
    // Sidebar & Profile
    document.getElementById('sidebar-name').innerText = currentUser.name;
    document.getElementById('sidebar-crm').innerText = currentUser.crm;
    document.getElementById('sidebar-avatar').innerText = currentUser.name.charAt(0).toUpperCase();
    
    // Preview Card
    document.getElementById('preview-name').innerText = currentUser.name;
    document.getElementById('preview-crm').innerText = currentUser.crm;
    document.getElementById('preview-avatar').innerText = currentUser.name.charAt(0).toUpperCase();

    // Greeting
    const hr = new Date().getHours();
    const greet = hr < 12 ? 'Good Morning' : hr < 18 ? 'Good Afternoon' : 'Good Evening';
    document.getElementById('dash-greeting').innerText = `${greet}, ${currentUser.name.split(' ')[0]} 👋`;

    // Form Pre-fill
    document.getElementById('form-crm').value = currentUser.crm;
    document.getElementById('form-name').value = currentUser.name;
    document.getElementById('form-tl').value = currentUser.tl;
    document.getElementById('form-org').value = currentUser.org;

    renderHistory();
}

function renderHistory() {
    // Stats
    document.getElementById('stat-total').innerText = historyLog.length;
    
    const todayStr = new Date().toLocaleDateString();
    const todayCount = historyLog.filter(x => new Date(x.timestamp).toLocaleDateString() === todayStr).length;
    document.getElementById('stat-today').innerText = todayCount;

    if(historyLog.length > 0) {
        const last = historyLog[0];
        document.getElementById('stat-last-issue').innerText = last.issue;
        document.getElementById('stat-last-time').innerText = new Date(last.timestamp).toLocaleString();
    }

    // Dashboard List (Top 5)
    const listContainer = document.getElementById('dash-history-list');
    listContainer.innerHTML = '';
    
    if (historyLog.length === 0) {
        listContainer.innerHTML = `<div class="p-8 text-center text-slate-400"><i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i><p class="text-sm">No issues tracked yet.</p></div>`;
    } else {
        historyLog.slice(0, 5).forEach(item => {
            const el = document.createElement('div');
            el.className = 'p-4 flex items-center justify-between hover:bg-slate-50 transition-colors';
            el.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <i data-lucide="file-text" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-slate-800">${item.issue}</p>
                        <p class="text-xs text-slate-400">${item.cause}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-xs font-bold text-slate-600">${item.timeRange}</p>
                    <p class="text-[10px] text-slate-400">${new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
            `;
            listContainer.appendChild(el);
        });
    }

    // Full History Table
    const tableBody = document.getElementById('full-history-list');
    tableBody.innerHTML = '';
    historyLog.forEach(item => {
        const row = document.createElement('tr');
        row.className = "hover:bg-slate-50 transition-colors";
        row.innerHTML = `
            <td class="px-6 py-4 font-mono text-xs text-slate-500">${new Date(item.timestamp).toLocaleDateString()}</td>
            <td class="px-6 py-4 font-bold text-slate-700 text-xs">${item.timeRange}</td>
            <td class="px-6 py-4 text-sm font-medium text-slate-800">${item.issue}</td>
            <td class="px-6 py-4 text-xs text-slate-500">${item.cause}</td>
            <td class="px-6 py-4"><span class="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Sent</span></td>
        `;
        tableBody.appendChild(row);
    });
    
    lucide.createIcons();
}

// --- FORM LOGIC ---
function initTimeSelects() {
    // Hours
    const hours = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
    const mins = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));
    
    ['start-h', 'end-h'].forEach(id => {
        const el = document.getElementById(id);
        hours.forEach(h => el.add(new Option(h, h)));
    });
    
    ['start-m', 'end-m'].forEach(id => {
        const el = document.getElementById(id);
        mins.forEach(m => el.add(new Option(m, m)));
    });
}

function updatePreview() {
    const issue = document.getElementById('issue-select').value;
    const sh = document.getElementById('start-h').value || '00';
    const sm = document.getElementById('start-m').value || '00';
    const sa = document.getElementById('start-ampm').value;
    const eh = document.getElementById('end-h').value || '00';
    const em = document.getElementById('end-m').value || '00';
    const ea = document.getElementById('end-ampm').value;

    document.getElementById('preview-issue').innerText = issue;
    document.getElementById('preview-time').innerText = `${sh}:${sm} ${sa} - ${eh}:${em} ${ea}`;
}

document.getElementById('tracker-form').addEventListener('submit', function(e) {
    // NOTE: We do NOT preventDefault because we want the form to submit to the iframe.
    // But we must populate hidden fields first.
    
    const now = new Date();
    const issue = document.getElementById('issue-select').value;
    const cause = document.querySelector('input[name="entry.1231067802"]:checked').value;
    const remarks = document.getElementById('remarks-input').value;
    
    // Time Values
    const sh = document.getElementById('start-h').value;
    const sm = document.getElementById('start-m').value;
    const eh = document.getElementById('end-h').value;
    const em = document.getElementById('end-m').value;
    
    if(!sh || !eh) {
        e.preventDefault();
        alert('Please select valid times');
        return;
    }

    // Populate Hidden Date/Time for Google
    document.getElementById('g-start-h').value = sh; // Google form usually expects 0-23 or just number, depending on config. Assuming 12h for now based on UI
    document.getElementById('g-start-m').value = sm;
    document.getElementById('g-start-y').value = now.getFullYear();
    document.getElementById('g-start-mo').value = now.getMonth() + 1;
    document.getElementById('g-start-d').value = now.getDate();

    document.getElementById('g-end-h').value = eh;
    document.getElementById('g-end-m').value = em;
    document.getElementById('g-end-y').value = now.getFullYear();
    document.getElementById('g-end-mo').value = now.getMonth() + 1;
    document.getElementById('g-end-d').value = now.getDate();

    // Append Remarks to Issue since we don't have ID
    if(remarks) {
        // Find issue select and temporarily change value? No, google form uses value.
        // We just rely on standard submission, maybe append to existing field if possible?
        // Actually, let's just let it be. Remarks are local for now.
    }

    // Save to Local History
    const entry = {
        issue: issue + (remarks ? ` (${remarks})` : ''),
        cause: cause,
        timeRange: document.getElementById('preview-time').innerText,
        timestamp: now.toISOString()
    };
    
    historyLog.unshift(entry);
    localStorage.setItem('tracker_history', JSON.stringify(historyLog));

    // UI Feedback
    const btn = document.getElementById('submit-btn');
    btn.innerHTML = `<i data-lucide="loader-2" class="animate-spin"></i> Sending...`;
    
    // Show success after short delay (assuming network speed)
    setTimeout(() => {
        const overlay = document.getElementById('success-overlay');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        document.getElementById('success-content').classList.remove('scale-90');
        document.getElementById('success-content').classList.add('scale-100');
        
        setTimeout(() => {
            // Reset
            overlay.classList.add('opacity-0');
            setTimeout(() => overlay.classList.add('hidden'), 300);
            btn.innerHTML = `<span>Submit Issue</span><i data-lucide="send" class="w-4 h-4"></i>`;
            document.getElementById('tracker-form').reset();
            router('dashboard');
        }, 2000);
    }, 1000);
});

function clearHistory() {
    if(confirm('Clear all history?')) {
        historyLog = [];
        localStorage.removeItem('tracker_history');
        renderHistory();
    }
}