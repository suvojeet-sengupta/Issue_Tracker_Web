import { Storage } from './utils/storage.js';
import { Helpers } from './utils/helpers.js';
import { SetupScreen } from './screens/setup.js';
import { DashboardScreen } from './screens/dashboard.js';
import { TrackerScreen } from './screens/tracker.js';
import { HistoryScreen } from './screens/history.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Screens
    SetupScreen.init();
    HistoryScreen.init();
    TrackerScreen.init();
    
    // Initial Route
    const config = Storage.getConfig();
    if (config) {
        Helpers.showScreen('dashboard-screen');
        DashboardScreen.render();
        TrackerScreen.populateReadOnly();
    } else {
        Helpers.showScreen('setup-screen');
    }

    // --- Global Event Listeners (Routing) ---

    // Config Saved (from Setup)
    window.addEventListener('app:configSaved', () => {
        Helpers.showScreen('dashboard-screen');
        DashboardScreen.render();
        TrackerScreen.populateReadOnly();
    });

    // History Updated (from Tracker)
    window.addEventListener('app:historyUpdated', () => {
        DashboardScreen.render();
        HistoryScreen.render(); // Refresh history view too
    });

    // Navigation Buttons
    document.getElementById('new-issue-btn')?.addEventListener('click', () => {
        Helpers.showScreen('tracker-screen');
        Helpers.initTimePickers();
    });

    document.getElementById('back-btn')?.addEventListener('click', () => {
        Helpers.showScreen('dashboard-screen');
        DashboardScreen.render();
    });

    document.getElementById('view-all-history-btn')?.addEventListener('click', () => {
        Helpers.showScreen('history-screen');
        HistoryScreen.render();
    });

    document.getElementById('history-back-btn')?.addEventListener('click', () => {
        Helpers.showScreen('dashboard-screen');
        DashboardScreen.render();
    });
});