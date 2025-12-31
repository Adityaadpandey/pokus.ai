import { tool } from '@openai/agents';
import { z } from 'zod';
import { travelService } from '../services/travelService';
import { webSearchTool } from './generalTools';

const searchDestinationTool = tool({
    name: 'search_destination',
    description: 'Search for general information about a travel destination (attractions, culture).',
    parameters: z.object({
        destination: z.string().describe('The destination to research'),
        interests: z.array(z.string()).describe('Specific interests').default([])
    }),
    execute: async (input) => {
        return await travelService.researchDestination(input.destination, input.interests || []);
    }
});

const searchTransportTool = tool({
    name: 'search_transport',
    description: 'Search for flights, trains, or bus options between two locations. Returns schedules and prices.',
    parameters: z.object({
        origin: z.string().describe('Origin city/airport'),
        destination: z.string().describe('Destination city/airport'),
        date: z.string().describe('Travel date')
    }),
    execute: async (input) => {
        return await travelService.searchTransport(input.origin, input.destination, input.date);
    }
});

const searchAccommodationTool = tool({
    name: 'search_accommodation',
    description: 'Search for specific hotel or lodging options with pricing and booking info.',
    parameters: z.object({
        destination: z.string().describe('Destination'),
        check_in: z.string().describe('Check-in date'),
        check_out: z.string().describe('Check-out date'),
        budget: z.string().describe('Budget level (e.g. $100/night, Luxury, Cheap)')
    }),
    execute: async (input) => {
        return await travelService.searchAccommodation(input.destination, input.check_in, input.check_out, input.budget);
    }
});

const searchDiningTool = tool({
    name: 'search_dining',
    description: 'Search for specific restaurants with menu prices and ratings.',
    parameters: z.object({
        destination: z.string().describe('Destination'),
        cuisine: z.string().describe('Cuisine or food preference')
    }),
    execute: async (input) => {
        return await travelService.searchDining(input.destination, input.cuisine);
    }
});

const checkWeatherTool = tool({
    name: 'check_weather',
    description: 'Get weather forecast.',
    parameters: z.object({
        location: z.string().describe('The location')
    }),
    execute: async (input) => {
        return await travelService.checkWeather(input.location);
    }
});

const generateItineraryTool = tool({
    name: 'generate_itinerary',
    description: 'Generate a FINAL structured itinerary. You MUST collect specific details (Transport, Hotel Names, Costs) BEFORE calling this.',
    parameters: z.object({
        destination: z.string().describe('The destination'),
        days: z.number().describe('Number of days'),
        preferences: z.string().describe('User preferences'),
        details: z.object({
            transport: z.string().describe('Specific flight/train details found'),
            accommodation: z.string().describe('Specific hotel details found'),
            schedule: z.string().describe('Day-by-day plan with specific places and times'),
            total_cost: z.string().describe('Estimated total cost')
        }).describe('The gathered detailed research data')
    }),
    execute: async (input) => {
        return await travelService.generateItinerary(input.destination, input.days, input.preferences, input.details);
    }
});

export const travelTools = [
    searchDestinationTool,
    searchTransportTool,
    searchAccommodationTool,
    searchDiningTool,
    checkWeatherTool,
    generateItineraryTool,
    webSearchTool
];
