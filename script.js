// Initialize Lucide Icons
lucide.createIcons();

// --- ELEMENTS ---
const setupScreen = document.getElementById('setup-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const trackerScreen = document.getElementById('tracker-screen');

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

// Modal Elements
const iframe = document.getElementById('hidden_iframe');
const iframeModal = document.getElementById('iframe-modal');

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
    [setupScreen, dashboardScreen, trackerScreen].forEach(s => s.classList.add('hidden'));
    
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

document.getElementById('settings-btn')?.addEventListener('click', () => {
    if(confirm("Reset your setup details? History will remain saved.")) {
        localStorage.removeItem('trackerConfig');
        location.reload();
    }
});

// --- SETUP LOGIC ---
// Magic Fill for '1210793'
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

// TL 'Other' Logic
tlInput.addEventListener('change', (e) => {
    if (e.target.value === 'Other') {
        otherTlContainer.classList.remove('hidden');
        otherTlInput.required = true;
    } else {
        otherTlContainer.classList.add('hidden');
        otherTlInput.required = false;
    }
});

// Name Validation
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

// Setup Submit
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
    // Update Read-Only Display (in Tracker Screen)
    document.getElementById('disp-crm').innerText = config.crm;
    document.getElementById('disp-name').innerText = config.name;
    document.getElementById('disp-tl').innerText = config.tl;
    
    // Fill Hidden Inputs for Form
    document.getElementById('hidden-crm').value = config.crm;
    document.getElementById('hidden-name').value = config.name;
    document.getElementById('hidden-tl').value = config.tl;
    document.getElementById('hidden-org').value = config.org;

    // DIRECTLY OPEN DASHBOARD
    showScreen('dashboard-screen');
    renderDashboard();
}

// --- DASHBOARD LOGIC ---
function renderDashboard() {
    const history = JSON.parse(localStorage.getItem('trackerHistory') || '[]');
    
    // Update Stats
    statTotal.innerText = history.length;
    
    const todayStr = new Date().toDateString();
    const todayCount = history.filter(h => new Date(h.timestamp).toDateString() === todayStr).length;
    statToday.innerText = todayCount;

    // Update History List
    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<div class="text-center text-slate-400 text-sm py-4">No history yet. Start tracking!</div>';
        return;
    }

    const sortedHistory = [...history].reverse();
    
    sortedHistory.forEach(item => {
        const el = document.createElement('div');
        el.className = 'bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between';
        
        const dateObj = new Date(item.timestamp);
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = dateObj.toLocaleDateString([], { day: 'numeric', month: 'short' });

        el.innerHTML = `
            <div>
                <div class="text-xs text-slate-400 font-bold uppercase mb-1">${dateStr} • ${timeStr}</div>
                <div class="font-bold text-slate-700 text-sm">${item.issue}</div>
                <div class="text-xs text-slate-500 truncate max-w-[200px]">${item.timeRange}</div>
            </div>
            <div class="bg-green-100 text-green-600 p-2 rounded-full">
                <i data-lucide="check" class="w-4 h-4"></i>
            </div>
        `;
        historyList.appendChild(el);
    });
    
    lucide.createIcons();
}

function saveToHistory(issue, timeRange) {
    const history = JSON.parse(localStorage.getItem('trackerHistory') || '[]');
    history.push({
        timestamp: new Date().toISOString(),
        issue: issue,
        timeRange: timeRange
    });
    localStorage.setItem('trackerHistory', JSON.stringify(history));
}

// --- TIME PICKER LOGIC ---
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
    
    const setVal = (id, val) => { 
        const el = document.getElementById(id);
        if(el) el.value = val; 
    };
    
    const endAmPm = h >= 12 ? 'PM' : 'AM';
    let endH = h % 12; endH = endH ? endH : 12;
    setVal('end-hour', endH); setVal('end-min', m.toString().padStart(2, '0')); setVal('end-ampm', endAmPm);

    const prev = new Date(now.getTime() - 60*60*1000);
    let ph = prev.getHours(); let pm = prev.getMinutes();
    const startAmPm = ph >= 12 ? 'PM' : 'AM';
    let startH = ph % 12; startH = startH ? startH : 12;
    setVal('start-hour', startH); setVal('start-min', pm.toString().padStart(2, '0')); setVal('start-ampm', startAmPm);
}

// --- FORM SUBMISSION LOGIC ---
function closeIframeModal() {
    iframeModal.classList.add('hidden');
    iframe.src = 'about:blank'; 
    submissionStage = 'idle';
    
    // Clear pending timer if user closes modal
    if (autoSubmitTimer) {
        clearTimeout(autoSubmitTimer);
        autoSubmitTimer = null;
    }
}

// Close button event
document.querySelector('#iframe-modal button')?.addEventListener('click', closeIframeModal);

googleForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (submissionStage !== 'idle') return; 

    // 1. Validate Time
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

    // 2. Prepare Hidden Data
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

    // 3. Capture History Metadata
    const issue = document.getElementById('explain-issue').value;
    const timeRange = `${sH}:${sM} ${sAP} - ${eH}:${eM} ${eAP}`;
    
    // 4. Construct Preview URL
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

    // 5. Open Preview
    submissionStage = 'previewing';
    const finalUrl = `${baseUrl}?${params.toString()}&usp=pp_url`;
    iframe.src = finalUrl;
    iframeModal.classList.remove('hidden');

    // Store metadata for post-submit logic
    googleForm.dataset.pendingIssue = issue;
    googleForm.dataset.pendingTime = timeRange;
    googleForm.dataset.prefilledUrl = finalUrl;

    // 6. Schedule Auto-Submit (15 Seconds)
    autoSubmitTimer = setTimeout(() => {
        submissionStage = 'submitting';
        googleForm.submit(); 
    }, 15000);
});

// Iframe Load Handler
iframe.onload = function() {
    if (submissionStage === 'previewing') {
        console.log("Preview Loaded");
    } 
    else if (submissionStage === 'submitting') {
        console.log("Submission Complete");
        
        // Save to History
        const issue = googleForm.dataset.pendingIssue;
        const time = googleForm.dataset.pendingTime;
        const url = googleForm.dataset.prefilledUrl;
        
        if(issue && time) {
            saveToHistory(issue, time);
            renderDashboard(); 
        }

        // Show Success Modal after short delay
        setTimeout(() => {
            closeIframeModal(); // This also clears the timer/state
            showSuccessModal(url);
        }, 1000);
    }
};

// Success Modal Logic
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
        // Return to Dashboard
        showScreen('dashboard-screen');
    }, 300);
}