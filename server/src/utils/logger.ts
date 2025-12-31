import { AsyncLocalStorage } from 'async_hooks';

type LogCallback = (type: string, message: string, agentName?: string) => void;

const logStorage = new AsyncLocalStorage<LogCallback>();

export const runWithLogCallback = (callback: LogCallback, fn: () => Promise<void> | void) => {
    return logStorage.run(callback, fn);
};

export const logger = {
    info: (message: string, ...args: any[]) => {
        console.log(`[INFO] ${message}`, ...args);
        const cb = logStorage.getStore();
        if (cb) cb('info', message);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, ...args);
        const cb = logStorage.getStore();
        if (cb) cb('error', message);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`[WARN] ${message}`, ...args);
        const cb = logStorage.getStore();
        if (cb) cb('warn', message);
    },
    search: (message: string) => {
        console.log(`[SEARCH] ${message}`);
        const cb = logStorage.getStore();
        if (cb) cb('search', message);
    },
    user: (message: string) => {
        console.log(`\n${"=".repeat(70)}`);
        console.log(`[👤 USER] ${message}`);
    },
    agent: (agentName: string, message: string) => {
        console.log(`\n${"=".repeat(70)}`);
        console.log(`[💬 ${agentName.toUpperCase()}]`);
        console.log(message);
        console.log("=".repeat(70));
    },
    activeAgent: (agentName: string) => {
        console.log(`[🤖 ACTIVE AGENT] ${agentName}`);
        console.log("=".repeat(70));
        const cb = logStorage.getStore();
        if (cb) cb('active_agent', agentName);
    }
};
