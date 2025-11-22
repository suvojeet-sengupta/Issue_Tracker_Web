import { Storage } from '../utils/storage.js';
import { Helpers } from '../utils/helpers.js';

export const SetupScreen = {
    init: () => {
        const form = document.getElementById('setup-form');
        const crmInput = document.getElementById('setup-crm');
        const nameInput = document.getElementById('setup-name');
        const orgInput = document.getElementById('setup-org');
        const tlInput = document.getElementById('setup-tl');
        const otherTlContainer = document.getElementById('other-tl-container');
        const otherTlInput = document.getElementById('setup-tl-other');

        // Magic Fill
        crmInput.addEventListener('input', (e) => {
            if (e.target.value === '1210793') {
                nameInput.value = "Suvojeet Sengupta";
                tlInput.value = "Manish Kumar";
                orgInput.value = "DISH";
                otherTlContainer.classList.add('hidden');
                crmInput.classList.add('bg-green-50', 'border-green-500');
                // Small delay for UX
                setTimeout(() => form.requestSubmit(), 500);
            }
        });

        // TL Toggle
        tlInput.addEventListener('change', (e) => {
            if (e.target.value === 'Other') {
                otherTlContainer.classList.remove('hidden');
                otherTlInput.required = true;
            } else {
                otherTlContainer.classList.add('hidden');
                otherTlInput.required = false;
            }
        });

        // Validation
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

        // Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const regex = /^[a-zA-Z ]+$/;
            if (!regex.test(nameInput.value)) {
                alert("Advisor name must be alphabets only!");
                return;
            }

            const finalTL = tlInput.value === 'Other' ? otherTlInput.value : tlInput.value;
            const config = {
                crm: crmInput.value,
                name: nameInput.value,
                org: orgInput.value,
                tl: finalTL
            };

            Storage.saveConfig(config);
            
            // Trigger global load event or direct call? 
            // We'll dispatch a custom event to App.js
            window.dispatchEvent(new CustomEvent('app:configSaved'));
        });
    }
};