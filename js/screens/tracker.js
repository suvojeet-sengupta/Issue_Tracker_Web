import { Storage } from '../utils/storage.js';
import { Helpers, Modals } from '../utils/helpers.js';

export const TrackerScreen = {
    submissionStage: 'idle',
    autoSubmitTimer: null,

    init: () => {
        const form = document.getElementById('google-form');
        const iframe = document.getElementById('hidden_iframe');
        const iframeModal = document.getElementById('iframe-modal');

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

            // Prepare Data
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

            // Metadata
            const issue = document.getElementById('explain-issue').value;
            const timeRange = `${sH}:${sM} ${sAP} - ${eH}:${eM} ${eAP}`;
            const reason = document.querySelector('input[name="entry.1231067802"]:checked').value;

            // Construct URL
            const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdeWylhfFaHmM3osSGRbxh9S_XvnAEPCIhTemuh-I7-LNds_w/viewform";
            const params = new URLSearchParams();
            const config = Storage.getConfig();

            params.append('entry.1005447471', config.crm);
            params.append('entry.44222229', config.name);
            params.append('entry.115861300', config.tl);
            params.append('entry.313975949', config.org);
            
            // ... (Add all other params as before) ...
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

            // Start Preview
            TrackerScreen.submissionStage = 'previewing';
            const finalUrl = `${baseUrl}?${params.toString()}&usp=pp_url`;
            iframe.src = finalUrl;
            iframeModal.classList.remove('hidden');

            // Store for later
            form.dataset.pendingIssue = issue;
            form.dataset.pendingTime = timeRange;
            form.dataset.prefilledUrl = finalUrl;

            // 5s Delay
            TrackerScreen.autoSubmitTimer = setTimeout(() => {
                TrackerScreen.submissionStage = 'submitting';
                form.submit();
            }, 5000);
        });

        // Iframe Load
        iframe.onload = function() {
            if (TrackerScreen.submissionStage === 'previewing') {
                console.log("Preview Loaded");
            } else if (TrackerScreen.submissionStage === 'submitting') {
                console.log("Submission Complete");
                
                const issue = form.dataset.pendingIssue;
                const time = form.dataset.pendingTime;
                const url = form.dataset.prefilledUrl;

                if (issue && time) {
                    Storage.addHistoryItem(issue, time, url);
                    window.dispatchEvent(new CustomEvent('app:historyUpdated'));
                }

                setTimeout(() => {
                    TrackerScreen.closeIframeModal();
                    Modals.showSuccess(url, () => {
                        // After success modal closes, go to dashboard
                        Helpers.showScreen('dashboard-screen');
                    });
                }, 1000);
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
            document.getElementById('bar-avatar').innerText = config.name.charAt(0).toUpperCase();
            
            // Populate hidden inputs required for the actual POST
            document.getElementById('hidden-crm').value = config.crm;
            document.getElementById('hidden-name').value = config.name;
            document.getElementById('hidden-tl').value = config.tl;
            document.getElementById('hidden-org').value = config.org;
        }
    }
};