// --- HELPER FUNCTIONS ---

export const Helpers = {
    // Navigation
    showScreen: (screenId) => {
        // Hide all screens
        const screens = ['setup-screen', 'dashboard-screen', 'tracker-screen', 'history-screen'];
        screens.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });

        // Show target
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.remove('hidden');
            // Reset animation
            target.classList.remove('slide-in');
            void target.offsetWidth; // Force Reflow
            target.classList.add('slide-in');
        }
    },

    // Time Pickers
    initTimePickers: () => {
        const populate = (id, start, end, pad = false) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = '';
            for (let i = start; i <= end; i++) {
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
            if (el) el.value = val;
        };

        // Set End Time (Now)
        const endAmPm = h >= 12 ? 'PM' : 'AM';
        let endH = h % 12; endH = endH ? endH : 12;
        setVal('end-hour', endH);
        setVal('end-min', m.toString().padStart(2, '0'));
        setVal('end-ampm', endAmPm);

        // Set Start Time (1 hour ago)
        const prev = new Date(now.getTime() - 60 * 60 * 1000);
        let ph = prev.getHours();
        let pm = prev.getMinutes();
        const startAmPm = ph >= 12 ? 'PM' : 'AM';
        let startH = ph % 12; startH = startH ? startH : 12;
        setVal('start-hour', startH);
        setVal('start-min', pm.toString().padStart(2, '0'));
        setVal('start-ampm', startAmPm);
    }
};

// Modal Logic
export const Modals = {
    showSuccess: (prefilledUrl, onClose) => {
        const modal = document.getElementById('success-modal');
        const content = document.getElementById('modal-content');
        
        // Reset Link
        const linkContainer = document.getElementById('prefilled-link-container');
        const linkElement = document.getElementById('prefilled-link');
        linkContainer.classList.add('hidden');

        if (prefilledUrl && linkElement) {
            linkElement.href = prefilledUrl;
            linkElement.textContent = "View Submitted Form Link";
            linkContainer.classList.remove('hidden');
        }

        modal.classList.remove('hidden');
        setTimeout(() => {
            content.classList.remove('opacity-0', 'scale-95');
            content.classList.add('opacity-100', 'scale-100');
        }, 10);

        // Handle Close Button
        const closeBtn = modal.querySelector('button');
        const newBtn = closeBtn.cloneNode(true); // Remove old listeners
        closeBtn.parentNode.replaceChild(newBtn, closeBtn);
        
        newBtn.addEventListener('click', () => {
            content.classList.add('opacity-0', 'scale-95');
            content.classList.remove('opacity-100', 'scale-100');
            setTimeout(() => {
                modal.classList.add('hidden');
                if(onClose) onClose();
            }, 300);
        });
    }
};