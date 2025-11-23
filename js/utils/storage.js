// --- STORAGE MANAGER ---

const CONFIG_KEY = 'trackerConfig';
const HISTORY_KEY = 'trackerHistory';

export const Storage = {
    // Configuration
    getConfig: () => {
        const data = localStorage.getItem(CONFIG_KEY);
        return data ? JSON.parse(data) : null;
    },
    saveConfig: (config) => {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    },
    clearConfig: () => {
        localStorage.removeItem(CONFIG_KEY);
    },

    // History
    getHistory: () => {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    },
    addHistoryItem: (issue, timeRange, url, remarks) => {
        const history = Storage.getHistory();
        const newItem = {
            timestamp: new Date().toISOString(),
            issue,
            timeRange,
            url,
            remarks
        };
        history.push(newItem);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        return newItem;
    },
    clearHistory: () => {
        localStorage.removeItem(HISTORY_KEY);
    }
};