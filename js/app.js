// --- STATE MANAGEMENT ---
let currentUser = JSON.parse(localStorage.getItem('tracker_user')) || null;
let historyLog = JSON.parse(localStorage.getItem('tracker_history')) || [];

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // Auth Check
    const isSetupPage = window.location.pathname.endsWith('setup.html');
    if (!currentUser && !isSetupPage) {
        window.location.href = 'setup.html';
        return;
    } else if (currentUser && isSetupPage) {
        // Optional: If already logged in and on setup, maybe redirect to dashboard?
        // But we might be in "Edit Profile" mode. 
        // Let's check if we are explicitly editing or just visiting.
        // For simplicity, we'll let it stay, but fill data.
        populateSetupForm();
    }

    initTimeSelects(); // Safe to call, checks existence internally
    updateUI();        // Safe to call, checks existence internally
    
    // Real-time Preview Listeners (Tracker Page)
    const issueSelect = document.getElementById('issue-select');
    if(issueSelect) {
        issueSelect.addEventListener('change', updatePreview);
        ['start-h', 'start-m', 'start-ampm', 'end-h', 'end-m', 'end-ampm'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', updatePreview);
        });
        updatePreview();
    }
});

// --- NAVIGATION ---
function router(page) {
    // Convert 'dashboard' to 'index' if you prefer index.html as dashboard
    if (page === 'dashboard') page = 'index';
    window.location.href = `${page}.html`;
}

// --- SETUP LOGIC ---
const setupForm = document.getElementById('setup-form');
if (setupForm) {
    setupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('setup-name').value;
        const crm = document.getElementById('setup-crm').value;
        const org = document.getElementById('setup-org').value;
        const tl = document.getElementById('setup-tl').value;

        currentUser = { name, crm, org, tl };
        localStorage.setItem('tracker_user', JSON.stringify(currentUser));
        
        // If we were in a modal (on other pages), reload/update. 
        // But now Setup is a page.
        window.location.href = 'index.html';
    });
}

function populateSetupForm() {
    if (!currentUser) return;
    const nameInput = document.getElementById('setup-name');
    if (nameInput) {
        nameInput.value = currentUser.name;
        document.getElementById('setup-crm').value = currentUser.crm;
        document.getElementById('setup-org').value = currentUser.org;
        document.getElementById('setup-tl').value = currentUser.tl;
        
        // Change button text to "Update"
        document.getElementById('setup-btn').innerHTML = `Update Profile <i data-lucide="save" class="w-4 h-4"></i>`;
        document.getElementById('setup-title').innerText = "Edit Profile";
        document.getElementById('setup-desc').innerText = "Update your advisor details.";
    }
}

function logout() {
    if(confirm('Are you sure you want to log out? Data will remain on device.')) {
        localStorage.removeItem('tracker_user');
        window.location.href = 'setup.html';
    }
}

// --- PROFILE MENU (Shared) ---
function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    const chevron = document.getElementById('profile-chevron');
    if(!menu) return;
    
    menu.classList.toggle('hidden');
    chevron.style.transform = menu.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('profile-menu');
    const trigger = document.getElementById('profile-trigger');
    if (menu && !menu.classList.contains('hidden') && !menu.contains(e.target) && !trigger.contains(e.target)) {
        toggleProfileMenu();
    }
});

function openProfileEditor() {
    // In MPA, we redirect to setup.html
    window.location.href = 'setup.html';
}

// --- UI UPDATES ---
function updateUI() {
    if(!currentUser) return;
    
    // Sidebar & Profile
    setText('sidebar-name', currentUser.name);
    setText('sidebar-crm', currentUser.crm);
    setText('sidebar-avatar', currentUser.name.charAt(0).toUpperCase());
    
    // Preview Card (Tracker)
    setText('preview-name', currentUser.name);
    setText('preview-crm', currentUser.crm);
    setText('preview-avatar', currentUser.name.charAt(0).toUpperCase());

    // Dashboard Advisor Card
    setText('dash-name', currentUser.name);
    setText('dash-crm', currentUser.crm);
    setText('dash-tl', currentUser.tl);
    setText('dash-org', currentUser.org);
    setText('dash-avatar', currentUser.name.charAt(0).toUpperCase());

    // Greeting
    const greetingEl = document.getElementById('dash-greeting');
    if (greetingEl) {
        const hr = new Date().getHours();
        const greet = hr < 12 ? 'Good Morning' : hr < 18 ? 'Good Afternoon' : 'Good Evening';
        greetingEl.innerText = `${greet}, ${currentUser.name.split(' ')[0]} 👋`;
    }

    // Form Pre-fill (Tracker)
    setValue('form-crm', currentUser.crm);
    setValue('form-name', currentUser.name);
    setValue('form-tl', currentUser.tl);
    setValue('form-org', currentUser.org);

    renderHistory();
}

function setText(id, val) {
    const el = document.getElementById(id);
    if(el) el.innerText = val;
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if(el) el.value = val;
}

function renderHistory() {
    // Stats (Dashboard)
    const totalEl = document.getElementById('stat-total');
    if (totalEl) {
        totalEl.innerText = historyLog.length;
        const todayStr = new Date().toLocaleDateString();
        const todayCount = historyLog.filter(x => new Date(x.timestamp).toLocaleDateString() === todayStr).length;
        setText('stat-today', todayCount);

        if(historyLog.length > 0) {
            const last = historyLog[0];
            setText('stat-last-issue', last.issue);
            setText('stat-last-time', new Date(last.timestamp).toLocaleString());
        }
    }

    // Dashboard List (Top 5)
    const listContainer = document.getElementById('dash-history-list');
    if (listContainer) {
        listContainer.innerHTML = '';
        if (historyLog.length === 0) {
            listContainer.innerHTML = `<div class="p-8 text-center text-slate-400"><i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2 opacity-50"></i><p class="text-sm">No issues tracked yet.</p></div>`;
        } else {
            historyLog.slice(0, 5).forEach(item => {
                const el = document.createElement('div');
                el.className = 'flex gap-4 group relative pl-6 border-l-2 border-slate-100 last:border-0 pb-8 last:pb-0 hover:border-indigo-200 transition-colors';
                
                const dateObj = new Date(item.timestamp);
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // Determine status color (simulated based on cause for variety)
                let statusColor = 'bg-indigo-500';
                let tagClass = 'bg-blue-50 text-blue-600 border-blue-100';
                let tagLabel = 'System';

                if (item.cause && item.cause.includes('Voice')) {
                    statusColor = 'bg-purple-500';
                    tagClass = 'bg-purple-50 text-purple-600 border-purple-100';
                    tagLabel = 'Voice';
                } else if (item.cause && item.cause.includes('Power')) {
                    statusColor = 'bg-amber-400';
                    tagClass = 'bg-amber-50 text-amber-600 border-amber-100';
                    tagLabel = 'Power';
                }

                el.innerHTML = `
                    <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm box-content ${statusColor}"></div>
                    
                    <div class="flex-1 -mt-1">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">${timeStr}</span>
                            <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${tagClass}">${tagLabel}</span>
                        </div>
                        <h4 class="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors cursor-pointer">${item.issue}</h4>
                        <p class="text-xs text-slate-500 mt-1 line-clamp-1">${item.cause || 'No details provided'}</p>
                    </div>
                `;
                listContainer.appendChild(el);
            });
        }
    }

    // Full History Table (History Page)
    const tableBody = document.getElementById('full-history-list');
    if (tableBody) {
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
    }
    
    lucide.createIcons();
}

// --- FORM LOGIC ---
function initTimeSelects() {
    const hours = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
    const mins = Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0'));
    
    ['start-h', 'end-h'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.add(new Option('', ''));
            hours.forEach(h => el.add(new Option(h, h)));
            el.value = '';
        }
    });
    
    ['start-m', 'end-m'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.add(new Option('', ''));
            mins.forEach(m => el.add(new Option(m, m)));
            el.value = '';
        }
    });

    // Default AM/PM
    const now = new Date();
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    ['start-ampm', 'end-ampm'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = ampm;
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

    setText('preview-issue', issue);
    setText('preview-time', `${sh}:${sm} ${sa} - ${eh}:${em} ${ea}`);
}

// --- INTERACTIVE SUBMISSION LOGIC (Tracker Page) ---
let submissionStage = 'idle';
const trackerForm = document.getElementById('tracker-form');

if (trackerForm) {
    trackerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
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

        const get24Hour = (h, m, ap) => {
            h = parseInt(h);
            if (ap === 'PM' && h < 12) h += 12;
            if (ap === 'AM' && h === 12) h = 0;
            return h;
        };

        const startH24 = get24Hour(sh, sm, sa);
        const endH24 = get24Hour(eh, em, ea);

        const params = new URLSearchParams();
        params.append('entry.1005447471', currentUser.crm);
        params.append('entry.44222229', currentUser.name);
        params.append('entry.115861300', currentUser.tl);
        params.append('entry.313975949', currentUser.org);
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
        params.append('entry.1211413190', issue);
        params.append('entry.1231067802', cause);

        const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdeWylhfFaHmM3osSGRbxh9S_XvnAEPCIhTemuh-I7-LNds_w/viewform";
        const finalUrl = `${baseUrl}?${params.toString()}&usp=pp_url`;

        const modal = document.getElementById('iframe-modal');
        const iframe = document.getElementById('interactive_iframe');
        
        // Reset Modal UI
        setText('modal-header-title', "Complete Submission");
        setText('modal-header-desc', "Please review the Google Form & Click submit.");
        
        const spinner = document.getElementById('modal-spinner-container');
        spinner.className = "w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center transition-colors duration-300";
        spinner.innerHTML = `<i data-lucide="pen-tool" class="w-5 h-5 text-indigo-600"></i>`;
        
        const cancelBtn = document.getElementById('modal-cancel-btn');
        cancelBtn.innerText = "Cancel";
        cancelBtn.className = "text-xs font-bold text-red-400 hover:text-red-600 transition uppercase tracking-wide";
        cancelBtn.onclick = closeIframeModal;

        submissionStage = 'loading_form';
        iframe.src = finalUrl;
        modal.classList.remove('hidden');
        lucide.createIcons();

        updatePreview();
        
        iframe.dataset.pendingIssue = issue + (remarks ? ` (${remarks})` : '');
        iframe.dataset.pendingCause = cause;
        iframe.dataset.pendingTime = document.getElementById('preview-time').innerText;
    });
}

const iframe = document.getElementById('interactive_iframe');
if (iframe) {
    iframe.onload = function() {
        if (submissionStage === 'loading_form') {
            submissionStage = 'waiting_for_user';
        } else if (submissionStage === 'waiting_for_user') {
            submissionStage = 'submitted';
            
            setText('modal-header-title', "Submission Successful!");
            setText('modal-header-desc', "Response recorded.");
            
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
}

function finalizeSubmission() {
    const iframe = document.getElementById('interactive_iframe');
    const entry = {
        issue: iframe.dataset.pendingIssue,
        cause: iframe.dataset.pendingCause,
        timeRange: iframe.dataset.pendingTime,
        timestamp: new Date().toISOString()
    };
    
    historyLog.unshift(entry);
    localStorage.setItem('tracker_history', JSON.stringify(historyLog));
    
    closeIframeModal();
    document.getElementById('tracker-form').reset();
    window.location.href = 'index.html';
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