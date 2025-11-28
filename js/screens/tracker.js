import { Storage } from '../utils/storage.js';
import { Helpers, Modals } from '../utils/helpers.js';

export const TrackerScreen = {
    submissionStage: 'idle',
    autoSubmitTimer: null,

    init: () => {
        const form = document.getElementById('google-form');
        const iframe = document.getElementById('hidden_iframe');
        const iframeModal = document.getElementById('iframe-modal');

        // Set default time values
        const now = new Date();
        const currentHour = now.getHours();
        const currentAmPm = currentHour >= 12 ? 'PM' : 'AM';

        document.getElementById('start-hour').value = '';
        document.getElementById('start-min').value = '';
        document.getElementById('start-ampm').value = currentAmPm;
        document.getElementById('end-hour').value = '';
        document.getElementById('end-min').value = '';
        document.getElementById('end-ampm').value = currentAmPm;

        // Form Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (TrackerScreen.submissionStage !== 'idle') return;

            // Time Validation
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

            // Prepare Data for POST
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

            // Metadata & Preview Data
            const config = Storage.getConfig();
            const issue = document.getElementById('explain-issue').value;
            const timeRange = `${sH}:${sM} ${sAP} - ${eH}:${eM} ${eAP}`;
            const reason = document.querySelector('input[name="entry.1231067802"]:checked').value;

            // --- POPULATE CUSTOM PREVIEW CARD ---
            document.getElementById('preview-crm').innerText = config.crm;
            document.getElementById('preview-name').innerText = config.name;
            document.getElementById('preview-time').innerText = timeRange;
            document.getElementById('preview-issue').innerText = issue;
            document.getElementById('preview-reason').innerText = reason;

            // Construct URL (Just for saving to history)
            const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdeWylhfFaHmM3osSGRbxh9S_XvnAEPCIhTemuh-I7-LNds_w/viewform";
            const params = new URLSearchParams();
            
            // ... (existing params logic is fine, this replace block targets insertion point) ...

            params.append('entry.1005447471', config.crm);
            params.append('entry.44222229', config.name);
            params.append('entry.115861300', config.tl);
            params.append('entry.313975949', config.org);
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
            params.append('entry.1231067802', reason);

            // --- MANUAL SUBMISSION FLOW ---
            
            // 1. Construct Pre-filled URL
            // Add cache busters
            const finalUrl = `${baseUrl}?${params.toString()}&usp=pp_url&entry.999999999=${Date.now()}`;
            
            // 2. Reset Modal UI
            document.getElementById('modal-header-title').innerText = "Complete Submission";
            document.getElementById('modal-header-desc').innerText = "Please review the Google Form & Click submit.";
            
            const spinnerContainer = document.getElementById('modal-spinner-container');
            spinnerContainer.className = "w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center transition-colors duration-300";
            spinnerContainer.innerHTML = `<i data-lucide="pen-tool" class="w-5 h-5 text-indigo-600"></i>`;
            
            const actionBtn = document.getElementById('modal-cancel-btn');
            actionBtn.innerText = "Cancel";
            actionBtn.className = "text-xs font-bold text-red-400 hover:text-red-600 transition uppercase tracking-wide";
            actionBtn.onclick = TrackerScreen.closeIframeModal;
            
            lucide.createIcons();

            // 3. Load Form in Iframe
            TrackerScreen.submissionStage = 'loading_form';
            iframe.src = finalUrl;
            iframeModal.classList.remove('hidden');

            // Store data for history saving later
            const remarks = document.getElementById('remarks').value;
            form.dataset.pendingIssue = issue;
            form.dataset.pendingTime = timeRange;
            form.dataset.prefilledUrl = finalUrl;
            form.dataset.pendingRemarks = remarks;
        });

        // Iframe Load Handler (Detects Navigation)
        iframe.onload = function() {
            console.log("Iframe Loaded. Stage:", TrackerScreen.submissionStage);

            if (TrackerScreen.submissionStage === 'loading_form') {
                // The Google Form just finished loading.
                // Now we wait for the user to click Submit inside the frame.
                TrackerScreen.submissionStage = 'waiting_for_user_submit';
                console.log("Form Ready. Waiting for user...");
            } 
            else if (TrackerScreen.submissionStage === 'waiting_for_user_submit') {
                // The iframe reloaded! This implies the user clicked Submit.
                // We assume it's the "Response Recorded" page.
                console.log("User Submitted!");
                TrackerScreen.submissionStage = 'submitted';

                // 1. Save History
                const issue = form.dataset.pendingIssue;
                const time = form.dataset.pendingTime;
                const url = form.dataset.prefilledUrl;
                const remarks = form.dataset.pendingRemarks;

                if (issue && time) {
                    Storage.addHistoryItem(issue, time, url, remarks);
                    window.dispatchEvent(new CustomEvent('app:historyUpdated'));
                }

                // 2. Update UI to Success
                document.getElementById('modal-header-title').innerText = "Submission Successful!";
                document.getElementById('modal-header-desc').innerText = "Response recorded.";
                
                const spinnerContainer = document.getElementById('modal-spinner-container');
                spinnerContainer.className = "w-10 h-10 bg-green-100 rounded-full flex items-center justify-center transition-colors duration-300";
                spinnerContainer.innerHTML = `<i data-lucide="check" class="w-5 h-5 text-green-600"></i>`;
                
                const actionBtn = document.getElementById('modal-cancel-btn');
                actionBtn.innerText = "Continue";
                actionBtn.className = "px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-600/20";
                
                actionBtn.onclick = () => {
                    TrackerScreen.closeIframeModal();
                    Modals.showSuccess(url, () => {
                        Helpers.showScreen('dashboard-screen');
                    });
                };
                
                lucide.createIcons();
            }
        };

        // Globalize close function for HTML buttons
        window.closeIframeModal = TrackerScreen.closeIframeModal;
    },

    closeIframeModal: () => {
        const iframeModal = document.getElementById('iframe-modal');
        const iframe = document.getElementById('hidden_iframe');
        
        iframeModal.classList.add('hidden');
        iframe.src = 'about:blank';
        TrackerScreen.submissionStage = 'idle';
        if (TrackerScreen.autoSubmitTimer) {
            clearTimeout(TrackerScreen.autoSubmitTimer);
            TrackerScreen.autoSubmitTimer = null;
        }
    },

    populateReadOnly: () => {
        const config = Storage.getConfig();
        if(config) {
            document.getElementById('disp-crm').innerText = config.crm;
            document.getElementById('disp-name').innerText = config.name;
            document.getElementById('disp-tl').innerText = config.tl;
            
            // Avatar in Bar
            const barAvatar = document.getElementById('bar-avatar');
            if (config.avatar) {
                barAvatar.innerHTML = `<img src="${config.avatar}" class="w-full h-full object-cover rounded-full">`;
                barAvatar.classList.remove('bg-slate-100', 'text-slate-500');
            } else {
                barAvatar.innerText = config.name.charAt(0).toUpperCase();
                barAvatar.classList.add('bg-slate-100', 'text-slate-500');
            }
            
            // Populate hidden inputs required for the actual POST
            document.getElementById('hidden-crm').value = config.crm;
            document.getElementById('hidden-name').value = config.name;
            document.getElementById('hidden-tl').value = config.tl;
            document.getElementById('hidden-org').value = config.org;
        }
    }
};