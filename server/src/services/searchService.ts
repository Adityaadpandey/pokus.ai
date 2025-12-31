
import axios from 'axios';
import { logger } from '../utils/logger';

export class SearchService {
    private apiKey?: string;
    private cx?: string;

    constructor() {
        this.apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        this.cx = process.env.GOOGLE_SEARCH_CX;
    }

    async search(query: string, attempt = 1): Promise<string> {
        if (!this.apiKey || !this.cx) {
            const errorMsg = "CRITICAL: Google Search API keys missing.";
            logger.error(errorMsg);
            throw new Error(errorMsg);
        }

        try {
            // search on google
            const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
                params: {
                    key: this.apiKey,
                    cx: this.cx,
                    q: query,
                    num: 5
                }
            });

            const items = response.data.items || [];

            if (items.length === 0) {
                if (attempt === 1) {
                    const simplifiedQuery = this.simplifyQuery(query);
                    if (simplifiedQuery !== query) {
                        logger.warn(`No results for "${query}". Retrying with simplified: "${simplifiedQuery}"`);
                        return this.search(simplifiedQuery, 2);
                    }
                }

                logger.warn(`No results found for query: "${query}"`);
                return JSON.stringify({ query, results: [], message: "No real-world data found. Try broader keywords." }, null, 2);
            }

            const results = items.slice(0, 5).map((item: any) => ({
                title: item.title,
                link: item.link,
                snippet: item.snippet
            }));

            return JSON.stringify({ query, results, source: 'real_google_search', timestamp: new Date().toISOString() }, null, 2);
        } catch (error: any) {
            const errorDetail = error.response?.data?.error?.message || error.message;
            logger.error(`Web search failed (Attempt ${attempt}):`, errorDetail);
            throw new Error(`Real-world search failed: ${errorDetail}`);
        }
    }


    // Heuristic: Remove date-like patterns (YYYY-MM-DD), "price", "schedule", "booking"
    private simplifyQuery(query: string): string {
        return query
            .replace(/\d{4}-\d{2}-\d{2}/g, '') // Dates
            .replace(/\b(price|cost|schedule|booking|availability)\b/gi, '') // Keywords
            .replace(/\s+/g, ' ') // Cleanup spaces
            .trim();
    }
}

export const searchService = new SearchService();
