import "dotenv/config";

import { OpenAIConversationsSession, run } from '@openai/agents';
import * as readline from 'readline';
import { coordinatorAgent } from './agents/coordinator';
import { logger } from './utils/logger';

class AgentRunner {
    private session: OpenAIConversationsSession;
    constructor() {
        this.session = new OpenAIConversationsSession();
    }
    async chat(userMessage: string): Promise<string> {
        logger.user(userMessage);
        logger.activeAgent(coordinatorAgent.name);
        try {
            const result = await run(coordinatorAgent, userMessage, {
                session: this.session,
                maxTurns: 15 // Check for loops
            });
            const assistantMessage = result.finalOutput || "I'm not sure how to respond to that.";
            logger.agent("SYSTEM", assistantMessage);
            return assistantMessage;
        } catch (error: any) {
            logger.error("Agent execution failed:", error.message);
            return "I encountered an error while processing your request. Please try again.";
        }
    }
    reset(): void {
        this.session = new OpenAIConversationsSession();
        console.log("\n[🔄 SYSTEM] Conversation reset. Starting fresh.");
    }
}
async function main() {
    console.log("\n" + "=".repeat(70));
    console.log("🌐 MODULAR AGENT SYSTEM (Refactored)");
    console.log("=".repeat(70));
    // Configuration check
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    if (!hasOpenAI) {
        logger.error("OPENAI_API_KEY is required in .env");
        process.exit(1);
    }
    // Google keys are MANDATORY now
    const hasGoogle = !!(process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_CX);
    if (!hasGoogle) {
        logger.error("❌ CRITICAL: Google Search API keys (GOOGLE_SEARCH_API_KEY, GOOGLE_SEARCH_CX) not found in .env");
        logger.error("The system is in STRICT REAL DATA mode. Mock data is disabled.");
        logger.error("Please add valid keys to continue.");
        process.exit(1);
    } else {
        logger.info("✅ Google Search keys found. Running in REAL SEARCH MODE.");
    }
    const runner = new AgentRunner();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    console.log("\n💡 COMMANDS: 'reset' to clear history, 'exit' to quit.\n");
    const askQuestion = () => {
        rl.question("\n💬 You: ", async (input) => {
            const trimmed = input.trim();
            if (['exit', 'quit'].includes(trimmed.toLowerCase())) {
                console.log("\n👋 Goodbye!\n");
                rl.close();
                return;
            }
            if (trimmed.toLowerCase() === 'reset') {
                runner.reset();
                askQuestion();
                return;
            }
            if (!trimmed) {
                askQuestion();
                return;
            }
            await runner.chat(trimmed);
            askQuestion();
        });
    };
    askQuestion();
}
if (require.main === module) {
    main().catch(console.error);
}
export { AgentRunner, main };
