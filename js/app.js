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
    
    // Initial Update
    updatePreview();
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

    // Dashboard Advisor Card
    document.getElementById('dash-name').innerText = currentUser.name;
    document.getElementById('dash-crm').innerText = currentUser.crm;
    document.getElementById('dash-tl').innerText = currentUser.tl;
    document.getElementById('dash-org').innerText = currentUser.org;
    document.getElementById('dash-avatar').innerText = currentUser.name.charAt(0).toUpperCase();

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

// --- INTERACTIVE SUBMISSION LOGIC ---
let submissionStage = 'idle';

document.getElementById('tracker-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Stop default submission
    
    const now = new Date();
    const issue = document.getElementById('issue-select').value;
    const cause = document.querySelector('input[name="entry.1231067802"]:checked').value;
    const remarks = document.getElementById('remarks-input').value;
    
    // Time Values
    const sh = document.getElementById('start-h').value;
    const sm = document.getElementById('start-m').value;
    const sa = document.getElementById('start-ampm').value;
    const eh = document.getElementById('end-h').value;
    const em = document.getElementById('end-m').value;
    const ea = document.getElementById('end-ampm').value;
    
    if(!sh || !eh) {
        alert('Please select valid times');
        return;
    }

    // Convert 12h to 24h for Google Form (assuming form expects 24h, or just pass as is if text)
    // Based on previous code, it passed raw values. We will pass raw values but ensure they are clean.
    // The original code passed just the numbers.
    
    // Helper to get 24h (optional if form needs it, keeping simple for now as per previous logic)
    const get24Hour = (h, m, ap) => {
        h = parseInt(h);
        if (ap === 'PM' && h < 12) h += 12;
        if (ap === 'AM' && h === 12) h = 0;
        return h;
    };

    const startH24 = get24Hour(sh, sm, sa);
    const endH24 = get24Hour(eh, em, ea);

    // Construct URL Params
    const params = new URLSearchParams();
    
    // User Info
    params.append('entry.1005447471', currentUser.crm);
    params.append('entry.44222229', currentUser.name);
    params.append('entry.115861300', currentUser.tl);
    params.append('entry.313975949', currentUser.org);
    
    // Time & Date
    params.append('entry.1521239602_hour', startH24);
    params.append('entry.1521239602_minute', sm);
    params.append('entry.702818104_year', now.getFullYear());
    params.append('entry.702818104_month', now.getMonth() + 1);
    params.append('entry.702818104_day', now.getDate());
    
    params.append('entry.701130970_hour', endH24);
    params.append('entry.701130970_minute', em);
    params.append('entry.514450388_year', now.getFullYear());
    params.append('entry.514450388_month', now.getMonth() + 1);
    params.append('entry.514450388_day', now.getDate());

    // Issue
    params.append('entry.1211413190', issue);
    params.append('entry.1231067802', cause);

    // Base URL (VIEWFORM, not formResponse)
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdeWylhfFaHmM3osSGRbxh9S_XvnAEPCIhTemuh-I7-LNds_w/viewform";
    const finalUrl = `${baseUrl}?${params.toString()}&usp=pp_url`;

    // Open Modal
    const modal = document.getElementById('iframe-modal');
    const iframe = document.getElementById('interactive_iframe');
    const title = document.getElementById('modal-header-title');
    const desc = document.getElementById('modal-header-desc');
    const spinner = document.getElementById('modal-spinner-container');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    // Reset Modal UI
    title.innerText = "Complete Submission";
    desc.innerText = "Please review the Google Form & Click submit.";
    spinner.className = "w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center transition-colors duration-300";
    spinner.innerHTML = `<i data-lucide="pen-tool" class="w-5 h-5 text-indigo-600"></i>`;
    cancelBtn.innerText = "Cancel";
    cancelBtn.className = "text-xs font-bold text-red-400 hover:text-red-600 transition uppercase tracking-wide";
    cancelBtn.onclick = closeIframeModal;

    // Load Iframe
    submissionStage = 'loading_form';
    iframe.src = finalUrl;
    modal.classList.remove('hidden');
    lucide.createIcons();

    // Store Pending Data for History
    iframe.dataset.pendingIssue = issue + (remarks ? ` (${remarks})` : '');
    iframe.dataset.pendingCause = cause;
    iframe.dataset.pendingTime = document.getElementById('preview-time').innerText;
});

// Handle Iframe Load (Detection)
const iframe = document.getElementById('interactive_iframe');
iframe.onload = function() {
    if (submissionStage === 'loading_form') {
        // Form loaded for the first time
        submissionStage = 'waiting_for_user';
        console.log('Form Loaded, waiting for user...');
    } else if (submissionStage === 'waiting_for_user') {
        // Form reloaded -> Likely Submitted
        console.log('User Submitted!');
        submissionStage = 'submitted';
        
        // Update Modal UI to Success
        document.getElementById('modal-header-title').innerText = "Submission Successful!";
        document.getElementById('modal-header-desc').innerText = "Response recorded.";
        
        const spinner = document.getElementById('modal-spinner-container');
        spinner.className = "w-10 h-10 bg-green-100 rounded-full flex items-center justify-center transition-colors duration-300";
        spinner.innerHTML = `<i data-lucide="check" class="w-5 h-5 text-green-600"></i>`;
        
        const actionBtn = document.getElementById('modal-cancel-btn');
        actionBtn.innerText = "Continue";
        actionBtn.className = "px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-600/20";
        actionBtn.onclick = finalizeSubmission;
        
        lucide.createIcons();
    }
};

function finalizeSubmission() {
    const iframe = document.getElementById('interactive_iframe');
    
    // Add to History
    const entry = {
        issue: iframe.dataset.pendingIssue,
        cause: iframe.dataset.pendingCause,
        timeRange: iframe.dataset.pendingTime,
        timestamp: new Date().toISOString()
    };
    
    historyLog.unshift(entry);
    localStorage.setItem('tracker_history', JSON.stringify(historyLog));
    
    // Close and Reset
    closeIframeModal();
    document.getElementById('tracker-form').reset();
    router('dashboard');
}

window.closeIframeModal = function() {
    const modal = document.getElementById('iframe-modal');
    const iframe = document.getElementById('interactive_iframe');
    modal.classList.add('hidden');
    iframe.src = 'about:blank';
    submissionStage = 'idle';
};

function clearHistory() {
    if(confirm('Clear all history?')) {
        historyLog = [];
        localStorage.removeItem('tracker_history');
        renderHistory();
    }
}