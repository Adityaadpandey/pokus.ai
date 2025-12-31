
import { tool } from '@openai/agents';
import { z } from 'zod';
import { searchService } from '../services/searchService';

export const webSearchTool = tool({
    name: 'web_search',
    description: 'Perform a general web search for any query. Use this for finding current information online.',
    parameters: z.object({
        query: z.string().describe('The search query')
    }),
    execute: async (input) => {
        return await searchService.search(input.query);
    }
});
