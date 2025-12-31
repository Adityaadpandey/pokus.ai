
export const logger = {
    info: (message: string, ...args: any[]) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    error: (message: string, ...args: any[]) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    warn: (message: string, ...args: any[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    search: (message: string) => {
        console.log(`[SEARCH] ${message}`);
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
    }
};
