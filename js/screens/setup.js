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
        
        // Avatar Elements
        const avatarInput = document.getElementById('setup-avatar');
        const avatarPreview = document.getElementById('avatar-preview');
        const avatarImg = document.getElementById('avatar-img');
        const avatarIcon = document.getElementById('avatar-icon');
        let currentAvatarBase64 = null;

        // Avatar Click Trigger
        avatarPreview.addEventListener('click', () => avatarInput.click());

        // Handle File Selection
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validate Size (Max 2MB to save LocalStorage space)
                if (file.size > 2 * 1024 * 1024) {
                    alert("Image size must be less than 2MB");
                    return;
                }

                const reader = new FileReader();
                reader.onload = (evt) => {
                    currentAvatarBase64 = evt.target.result;
                    avatarImg.src = currentAvatarBase64;
                    avatarImg.classList.remove('hidden');
                    avatarIcon.classList.add('hidden');
                    avatarPreview.classList.remove('border-dashed');
                    avatarPreview.classList.add('border-solid', 'border-indigo-200');
                };
                reader.readAsDataURL(file);
            }
        });

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
                tl: finalTL,
                avatar: currentAvatarBase64 // Save Image Data
            };

            Storage.saveConfig(config);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('app:configSaved'));
        });
    }
};