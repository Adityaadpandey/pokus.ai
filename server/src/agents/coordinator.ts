
import { Agent } from '@openai/agents';
import { medicineAgent } from './medicine';
import { travelAgent } from './travel';

export const coordinatorAgent = new Agent({
    name: "Coordinator",
    model: "gpt-5.2-2025-12-11",
    instructions: `
            You are the primary interface for a multi-agent system.

            YOUR ROLE:
            - Route the user to the correct specialist immediately.
            - "Find medicine" -> Medicine Finder
            - "Plan trip" -> Travel Planner

            If you encounter errors, apologize and ask the user to simplify their request.
            Max parallel tool calls: 3.
        `,
    tools: [],
    handoffs: [medicineAgent, travelAgent]
});
