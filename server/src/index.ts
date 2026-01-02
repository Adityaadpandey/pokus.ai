import "dotenv/config";

import { OpenAIConversationsSession, run } from '@openai/agents';
import { WebSocket, WebSocketServer } from 'ws';
import { coordinatorAgent } from './agents/coordinator';
import { logger, runWithLogCallback } from './utils/logger';

class AgentRunner {
    private session: OpenAIConversationsSession;
    constructor() {
        this.session = new OpenAIConversationsSession();
    }
    async chat(userMessage: string, onToken?: (token: string) => void): Promise<string> {
        logger.user(userMessage);
        logger.activeAgent(coordinatorAgent.name);
        try {

            const result = await run(coordinatorAgent, userMessage, {
                session: this.session,
                maxTurns: 15,
                stream: true
            });

            let assistantMessage = "";


            for await (const chunk of result) {
                if (typeof chunk === 'string') {
                    assistantMessage += chunk;
                    if (onToken) onToken(chunk);
                }
                else if (chunk && typeof chunk === 'object' && 'delta' in chunk) {
                    const delta = (chunk as any).delta;
                    if (delta?.content) {
                        const token = delta.content;
                        assistantMessage += token;
                        if (onToken) onToken(token);
                    }
                }

            }

            if (!assistantMessage && (result as any).finalOutput) {
                assistantMessage = (result as any).finalOutput;

            }

            assistantMessage = assistantMessage || "I'm not sure how to respond to that.";
            logger.agent("SYSTEM", assistantMessage);
            return assistantMessage;
        } catch (error: any) {
            logger.error("Agent execution failed:", error.message);
            return "I encountered an error while processing your request. Please try again.";
        }
    }
    reset(): void {
        this.session = new OpenAIConversationsSession();
        console.log("\n[SYSTEM] Conversation reset. Starting fresh.");
    }
}
async function main() {
    console.log("\n" + "=".repeat(70));
    console.log("🌐 MODULAR AGENT SYSTEM (WebSocket Server)");
    console.log("=".repeat(70));
    if (!process.env.OPENAI_API_KEY) {
        process.exit(1);
    }
    if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_CX) {
        process.exit(1);
    }


    const wss = new WebSocketServer({ port: 8080 });

    console.log("🚀 WebSocket server started on port 8080");

    wss.on('connection', (ws: WebSocket) => {
        console.log('Client connected');

        const runner = new AgentRunner();

        const sendLog = (type: string, message: string, agentName?: string) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'log',
                    logType: type,
                    content: message,
                    agentName
                }));
            }
        };

        ws.send(JSON.stringify({
            type: 'system',
            content: 'Connected to Agent Server'
        }));

        ws.on('message', async (message: string) => {
            runWithLogCallback(sendLog, async () => {
                try {
                    const data = JSON.parse(message.toString());

                    if (data.type === 'chat') {
                        const sendToken = (token: string) => {
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({
                                    type: 'chat_delta',
                                    content: token
                                }));
                            }
                        };

                        const response = await runner.chat(data.content, sendToken);

                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'chat',
                                content: response
                            }));
                        }
                    } else if (data.type === 'reset') {
                        runner.reset();
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({
                                type: 'system',
                                content: 'Conversation history reset.'
                            }));
                        }
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            content: 'Failed to process message'
                        }));
                    }
                }
            });
        });

        ws.on('close', () => {
            console.log('Client disconnected');
        });
    });
}

if (require.main === module) {
    main().catch(console.error);
}

export { AgentRunner, main };
