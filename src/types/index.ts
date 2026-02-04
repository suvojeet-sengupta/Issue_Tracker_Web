export interface User {
    name: string;
    crm: string;
    org: string;
    tl: string;
}

export interface HistoryItem {
    issue: string;
    cause: string;
    timeRange: string;
    timestamp: string;
}

export interface TrackerState {
    user: User | null;
    history: HistoryItem[];
    is24HourFormat: boolean;
}
