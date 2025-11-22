// Initialize Lucide Icons
lucide.createIcons();

// --- ELEMENTS ---
const setupScreen = document.getElementById('setup-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const trackerScreen = document.getElementById('tracker-screen');
const historyScreen = document.getElementById('history-screen');

const setupForm = document.getElementById('setup-form');
const googleForm = document.getElementById('google-form');

// Setup Inputs
const crmInput = document.getElementById('setup-crm');
const nameInput = document.getElementById('setup-name');
const orgInput = document.getElementById('setup-org');
const tlInput = document.getElementById('setup-tl');
const otherTlContainer = document.getElementById('other-tl-container');
const otherTlInput = document.getElementById('setup-tl-other');

// Dashboard Elements
const statTotal = document.getElementById('stat-total');
const statToday = document.getElementById('stat-today');
const historyList = document.getElementById('history-list');

// History Screen Elements
const fullHistoryList = document.getElementById('full-history-list');
const historySearch = document.getElementById('history-search');

// Modal Elements
const iframe = document.getElementById('hidden_iframe');
const iframeModal = document.getElementById('iframe-modal');
const historyModal = document.getElementById('history-details-modal');

// Global State
let submissionStage = 'idle'; // idle, previewing, submitting
let autoSubmitTimer = null;

// --- INITIAL LOAD ---
const savedConfig = localStorage.getItem('trackerConfig');
if (savedConfig) {
    loadApp(JSON.parse(savedConfig));
} else {
    showScreen('setup-screen');
}

// --- NAVIGATION ---
function showScreen(screenId) {
    // Hide all
    [setupScreen, dashboardScreen, trackerScreen, historyScreen].forEach(s => s && s.classList.add('hidden'));
    
    // Show Target
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.remove('slide-in');
        void target.offsetWidth; // Force Reflow for animation
        target.classList.add('slide-in');
    }
}

// Event Listeners for Navigation
document.getElementById('new-issue-btn')?.addEventListener('click', () => {
    showScreen('tracker-screen');
    initTimePickers();
});

document.getElementById('back-btn')?.addEventListener('click', () => {
    showScreen('dashboard-screen');
    renderDashboard();
});

document.getElementById('view-all-history-btn')?.addEventListener('click', () => {
    showScreen('history-screen');
    renderFullHistory();
});

document.getElementById('history-back-btn')?.addEventListener('click', () => {
    showScreen('dashboard-screen');
    renderDashboard();
});

document.getElementById('settings-btn')?.addEventListener('click', () => {
    if(confirm("Reset your setup details? History will remain saved.")) {
        localStorage.removeItem('trackerConfig');
        location.reload();
    }
});

document.getElementById('clear-history-btn')?.addEventListener('click', () => {
    if(confirm("Are you sure you want to delete ALL history? This cannot be undone.")) {
        localStorage.removeItem('trackerHistory');
        renderFullHistory();
    }
});

document.getElementById('history-search')?.addEventListener('input', (e) => {
    renderFullHistory(e.target.value);
});

// --- SETUP LOGIC ---
crmInput.addEventListener('input', (e) => {
    if (e.target.value === '1210793') {
        nameInput.value = "Suvojeet Sengupta";
        tlInput.value = "Manish Kumar";
        orgInput.value = "DISH";
        otherTlContainer.classList.add('hidden');
        crmInput.classList.add('bg-green-50', 'border-green-500');
        setTimeout(() => { setupForm.requestSubmit(); }, 500);
    }
});

tlInput.addEventListener('change', (e) => {
    if (e.target.value === 'Other') {
        otherTlContainer.classList.remove('hidden');
        otherTlInput.required = true;
    } else {
        otherTlContainer.classList.add('hidden');
        otherTlInput.required = false;
    }
});

nameInput.addEventListener('input', (e) => {
    const regex = /^[a-zA-Z ]+$/;
    const err = document.getElementById('name-error');
    if (!regex.test(e.target.value) && e.target.value !== '') {
        err.classList.remove('hidden');
        e.target.classList.add('border-red-500');
    } else {
        err.classList.add('hidden');
        e.target.classList.remove('border-red-500');
    }
});

setupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const regex = /^[a-zA-Z ]+$/;
    if (!regex.test(nameInput.value)) { alert("Advisor name must be alphabets only!"); return; }
    
    const finalTL = tlInput.value === 'Other' ? otherTlInput.value : tlInput.value;
    const config = { crm: crmInput.value, name: nameInput.value, org: orgInput.value, tl: finalTL };
    
    localStorage.setItem('trackerConfig', JSON.stringify(config));
    loadApp(config);
});

function loadApp(config) {
    document.getElementById('disp-crm').innerText = config.crm;
    document.getElementById('disp-name').innerText = config.name;
    document.getElementById('disp-tl').innerText = config.tl;
    document.getElementById('bar-avatar').innerText = config.name.charAt(0).toUpperCase();
    
    document.getElementById('disp-name-card').innerText = config.name;
    document.getElementById('disp-crm-card').innerText = config.crm;
    document.getElementById('disp-org-card').innerText = config.org;
    document.getElementById('disp-tl-card').innerText = config.tl;
    document.getElementById('avatar-initials').innerText = config.name.charAt(0).toUpperCase();

    document.getElementById('hidden-crm').value = config.crm;
    document.getElementById('hidden-name').value = config.name;
    document.getElementById('hidden-tl').value = config.tl;
    document.getElementById('hidden-org').value = config.org;

    showScreen('dashboard-screen');
    renderDashboard();
}

// --- DASHBOARD & HISTORY LOGIC ---
function getHistory() {
    return JSON.parse(localStorage.getItem('trackerHistory') || '[]');
}

function renderDashboard() {
    const history = getHistory();
    
    statTotal.innerText = history.length;
    const todayStr = new Date().toDateString();
    const todayCount = history.filter(h => new Date(h.timestamp).toDateString() === todayStr).length;
    statToday.innerText = todayCount;

    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<div class="text-center text-slate-400 text-sm py-8 italic">No history yet. Start tracking!</div>';
        return;
    }

    // Show last 5 items on dashboard
    const sortedHistory = [...history].reverse().slice(0, 5);
    
    sortedHistory.forEach(item => {
        const el = createHistoryItem(item);
        historyList.appendChild(el);
    });
    lucide.createIcons();
}

function renderFullHistory(query = '') {
    const history = getHistory();
    fullHistoryList.innerHTML = '';

    if (history.length === 0) {
        fullHistoryList.innerHTML = '<div class="text-center text-slate-400 py-12">No history found.</div>';
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
        fullHistoryList.innerHTML = '<div class="text-center text-slate-400 py-12">No matches found.</div>';
        return;
    }

    filtered.forEach(item => {
        const el = createHistoryItem(item, true); // true = isClickable
        fullHistoryList.appendChild(el);
    });
    lucide.createIcons();
}

function createHistoryItem(item, isClickable = false) {
    const el = document.createElement('div');
    const dateObj = new Date(item.timestamp);
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });

    el.className = `bg-white p-4 ${isClickable ? 'border-b last:border-0 hover:bg-slate-50 cursor-pointer transition-colors' : 'rounded-xl shadow-sm border border-slate-100 mb-3'} flex items-center justify-between gap-4`;
    
    if (isClickable) {
        el.onclick = () => openHistoryModal(item);
    }

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
    return el;
}

function saveToHistory(issue, timeRange, url) {
    const history = getHistory();
    history.push({
        timestamp: new Date().toISOString(),
        issue: issue,
        timeRange: timeRange,
        url: url
    });
    localStorage.setItem('trackerHistory', JSON.stringify(history));
}

// --- HISTORY DETAILS MODAL ---
function openHistoryModal(item) {
    document.getElementById('detail-issue').innerText = item.issue;
    document.getElementById('detail-range').innerText = item.timeRange;
    document.getElementById('detail-link').href = item.url || '#';
    
    const dateObj = new Date(item.timestamp);
    document.getElementById('detail-date').innerText = dateObj.toLocaleString();

    historyModal.classList.remove('hidden');
}

// Attach to global scope so HTML onclick works
window.closeHistoryModal = function() {
    historyModal.classList.add('hidden');
};

// --- FORM SUBMISSION LOGIC ---
// ... (Keep existing time picker and submit logic) ...

function initTimePickers() {
    const populate = (id, start, end, pad = false) => {
        const el = document.getElementById(id);
        if(!el) return;
        el.innerHTML = '';
        for(let i=start; i<=end; i++) {
            let val = pad ? i.toString().padStart(2, '0') : i;
            let opt = document.createElement('option');
            opt.value = val;
            opt.text = val;
            el.appendChild(opt);
        }
    };
    populate('start-hour', 1, 12);
    populate('start-min', 0, 59, true);
    populate('end-hour', 1, 12);
    populate('end-min', 0, 59, true);
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    const endAmPm = h >= 12 ? 'PM' : 'AM';
    let endH = h % 12; endH = endH ? endH : 12;
    setVal('end-hour', endH); setVal('end-min', m.toString().padStart(2, '0')); setVal('end-ampm', endAmPm);
    const prev = new Date(now.getTime() - 60*60*1000);
    let ph = prev.getHours(); let pm = prev.getMinutes();
    const startAmPm = ph >= 12 ? 'PM' : 'AM';
    let startH = ph % 12; startH = startH ? startH : 12;
    setVal('start-hour', startH); setVal('start-min', pm.toString().padStart(2, '0')); setVal('start-ampm', startAmPm);
}

function closeIframeModal() {
    iframeModal.classList.add('hidden');
    iframe.src = 'about:blank'; 
    submissionStage = 'idle';
    if (autoSubmitTimer) { clearTimeout(autoSubmitTimer); autoSubmitTimer = null; }
}
document.querySelector('#iframe-modal button')?.addEventListener('click', closeIframeModal);

googleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (submissionStage !== 'idle') return; 

    const get24Hour = (h, m, ap) => {
        h = parseInt(h);
        if (ap === 'PM' && h < 12) h += 12;
        if (ap === 'AM' && h === 12) h = 0;
        return { h, m };
    };
    const sH = document.getElementById('start-hour').value;
    const sM = document.getElementById('start-min').value;
    const sAP = document.getElementById('start-ampm').value;
    const eH = document.getElementById('end-hour').value;
    const eM = document.getElementById('end-min').value;
    const eAP = document.getElementById('end-ampm').value;
    const startTime = get24Hour(sH, sM, sAP);
    const endTime = get24Hour(eH, eM, eAP);
    const startMinutes = (startTime.h * 60) + parseInt(startTime.m);
    const endMinutes = (endTime.h * 60) + parseInt(endTime.m);
    
    if (endMinutes <= startMinutes) {
        document.getElementById('time-error').classList.remove('hidden');
        return; 
    }
    document.getElementById('time-error').classList.add('hidden');

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    document.getElementById('hidden-start-h').value = startTime.h;
    document.getElementById('hidden-start-m').value = sM;
    document.getElementById('hidden-end-h').value = endTime.h;
    document.getElementById('hidden-end-m').value = eM;
    document.getElementById('hidden-start-y').value = yyyy;
    document.getElementById('hidden-start-mo').value = mm;
    document.getElementById('hidden-start-d').value = dd;
    document.getElementById('hidden-end-y').value = yyyy;
    document.getElementById('hidden-end-mo').value = mm;
    document.getElementById('hidden-end-d').value = dd;

    const issue = document.getElementById('explain-issue').value;
    const timeRange = `${sH}:${sM} ${sAP} - ${eH}:${eM} ${eAP}`;
    
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdeWylhfFaHmM3osSGRbxh9S_XvnAEPCIhTemuh-I7-LNds_w/viewform";
    const params = new URLSearchParams();
    params.append('entry.1005447471', document.getElementById('hidden-crm').value);
    params.append('entry.44222229', document.getElementById('hidden-name').value);
    params.append('entry.115861300', document.getElementById('hidden-tl').value);
    params.append('entry.313975949', document.getElementById('hidden-org').value);
    params.append('entry.1521239602_hour', startTime.h);
    params.append('entry.1521239602_minute', sM);
    params.append('entry.701130970_hour', endTime.h);
    params.append('entry.701130970_minute', eM);
    params.append('entry.702818104_year', yyyy);
    params.append('entry.702818104_month', mm);
    params.append('entry.702818104_day', dd);
    params.append('entry.514450388_year', yyyy);
    params.append('entry.514450388_month', mm);
    params.append('entry.514450388_day', dd);
    params.append('entry.1211413190', issue);
    const reason = document.querySelector('input[name="entry.1231067802"]:checked').value;
    params.append('entry.1231067802', reason);

    submissionStage = 'previewing';
    const finalUrl = `${baseUrl}?${params.toString()}&usp=pp_url`;
    iframe.src = finalUrl;
    iframeModal.classList.remove('hidden');

    googleForm.dataset.pendingIssue = issue;
    googleForm.dataset.pendingTime = timeRange;
    googleForm.dataset.prefilledUrl = finalUrl;

    autoSubmitTimer = setTimeout(() => {
        submissionStage = 'submitting';
        googleForm.submit(); 
    }, 15000);
});

iframe.onload = function() {
    if (submissionStage === 'previewing') {
        console.log("Preview Loaded");
    } 
    else if (submissionStage === 'submitting') {
        console.log("Submission Complete");
        
        const issue = googleForm.dataset.pendingIssue;
        const time = googleForm.dataset.pendingTime;
        const url = googleForm.dataset.prefilledUrl;
        
        if(issue && time) {
            saveToHistory(issue, time, url); // SAVE URL NOW
            renderDashboard(); 
        }

        setTimeout(() => {
            closeIframeModal();
            showSuccessModal(url);
        }, 1000);
    }
};

function showSuccessModal(prefilledUrl) {
    const modal = document.getElementById('success-modal');
    const content = document.getElementById('modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        content.classList.remove('opacity-0', 'scale-95');
        content.classList.add('opacity-100', 'scale-100');
        const linkContainer = document.getElementById('prefilled-link-container');
        const linkElement = document.getElementById('prefilled-link');
        if (prefilledUrl && linkContainer && linkElement) {
            linkElement.href = prefilledUrl;
            linkElement.textContent = "View Submitted Form Link";
            linkContainer.classList.remove('hidden');
        }
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    const content = document.getElementById('modal-content');
    content.classList.add('opacity-0', 'scale-95');
    content.classList.remove('opacity-100', 'scale-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        showScreen('dashboard-screen');
    }, 300);
}