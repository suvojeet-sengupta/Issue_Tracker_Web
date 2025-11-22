// Initialize Lucide Icons
lucide.createIcons();

// --- CONFIGURATION ---
const setupScreen = document.getElementById('setup-screen');
const trackerScreen = document.getElementById('tracker-screen');
const setupForm = document.getElementById('setup-form');

// Setup Inputs
const crmInput = document.getElementById('setup-crm');
const nameInput = document.getElementById('setup-name');
const orgInput = document.getElementById('setup-org');
const tlInput = document.getElementById('setup-tl');
const otherTlContainer = document.getElementById('other-tl-container');
const otherTlInput = document.getElementById('setup-tl-other');

// --- INITIAL LOAD LOGIC ---
const savedConfig = localStorage.getItem('trackerConfig');

if (savedConfig) {
    loadTracker(JSON.parse(savedConfig));
} else {
    setupScreen.classList.remove('hidden');
}

// --- SETUP MAGIC LOGIC ---
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
    loadTracker(config);
});

function loadTracker(config) {
    setupScreen.classList.add('hidden');
    trackerScreen.classList.remove('hidden');
    document.getElementById('disp-crm').innerText = config.crm;
    document.getElementById('disp-name').innerText = config.name;
    document.getElementById('disp-tl').innerText = config.tl;
    
    // Pre-fill Hidden fields
    document.getElementById('hidden-crm').value = config.crm;
    document.getElementById('hidden-name').value = config.name;
    document.getElementById('hidden-tl').value = config.tl;
    document.getElementById('hidden-org').value = config.org;

    initTimePickers();
}

document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm("Reset your setup details?")) {
        localStorage.removeItem('trackerConfig');
        location.reload();
    }
});

function initTimePickers() {
    const populate = (id, start, end, pad = false) => {
        const el = document.getElementById(id);
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
    
    const setVal = (id, val) => document.getElementById(id).value = val;
    
    const endAmPm = h >= 12 ? 'PM' : 'AM';
    let endH = h % 12; endH = endH ? endH : 12;
    setVal('end-hour', endH); setVal('end-min', m.toString().padStart(2, '0')); setVal('end-ampm', endAmPm);

    const prev = new Date(now.getTime() - 60*60*1000);
    let ph = prev.getHours(); let pm = prev.getMinutes();
    const startAmPm = ph >= 12 ? 'PM' : 'AM';
    let startH = ph % 12; startH = startH ? startH : 12;
    setVal('start-hour', startH); setVal('start-min', pm.toString().padStart(2, '0')); setVal('start-ampm', startAmPm);
}

// --- SILENT SUBMISSION LOGIC ---
const googleForm = document.getElementById('google-form');
const iframe = document.getElementById('hidden_iframe');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const btnIcon = document.getElementById('btn-icon');
let submitted = false;

googleForm.addEventListener('submit', (e) => {
    
    // 1. Time Validation
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
        e.preventDefault();
        document.getElementById('time-error').classList.remove('hidden');
        return; 
    }
    document.getElementById('time-error').classList.add('hidden');

    // 2. Prepare Hidden Data for Google
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    // Fill Time Hidden Inputs
    document.getElementById('hidden-start-h').value = startTime.h; // 24h format safer for numeric input
    document.getElementById('hidden-start-m').value = sM;
    document.getElementById('hidden-end-h').value = endTime.h;
    document.getElementById('hidden-end-m').value = eM;

    // Fill Date Hidden Inputs
    document.getElementById('hidden-start-y').value = yyyy;
    document.getElementById('hidden-start-mo').value = mm;
    document.getElementById('hidden-start-d').value = dd;
    document.getElementById('hidden-end-y').value = yyyy;
    document.getElementById('hidden-end-mo').value = mm;
    document.getElementById('hidden-end-d').value = dd;

    // 3. UI Feedback (Submitting...)
    submitted = true;
    submitBtn.disabled = true;
    btnText.innerText = "Saving...";
    btnIcon.style.display = 'none';
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

    // Form continues to submit to iframe...
});

// 4. Detect Iframe Load (Success)
iframe.onload = function() {
    if (submitted) {
        // Reset UI
        submitted = false;
        submitBtn.disabled = false;
        btnText.innerText = "Submit Issue";
        btnIcon.style.display = 'block';
        submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        
        // Show Success Modal
        showSuccessModal();
    }
};

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    const content = document.getElementById('modal-content');
    modal.classList.remove('hidden');
    // Trigger animation
    setTimeout(() => {
        content.classList.remove('opacity-0', 'scale-95');
        content.classList.add('opacity-100', 'scale-100');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    const content = document.getElementById('modal-content');
    
    content.classList.add('opacity-0', 'scale-95');
    content.classList.remove('opacity-100', 'scale-100');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        // Reset form fields if you want?
        // document.getElementById('explain-issue').selectedIndex = 0;
    }, 300);
}