
import { tool } from '@openai/agents';
import { z } from 'zod';
import { pharmacyService } from '../services/pharmacyService';
import { webSearchTool } from './generalTools';

const searchPharmaciesTool = tool({
    name: 'search_pharmacies',
    description: 'Search for pharmacies near a location that stock a specific medicine.',
    parameters: z.object({
        medicine_name: z.string().describe('The name of the medicine to search for'),
        location: z.string().describe('The location to search near')
    }),
    execute: async (input) => {
        return await pharmacyService.findPharmacies(input.location, input.medicine_name);
    }
});

const searchPharmacyContactTool = tool({
    name: 'search_pharmacy_contact',
    description: 'Search for contact information of a specific pharmacy.',
    parameters: z.object({
        pharmacy_name: z.string().describe('Name of the pharmacy'),
        location: z.string().describe('Location/city')
    }),
    execute: async (input) => {
        return await pharmacyService.getContactInfo(input.pharmacy_name, input.location);
    }
});

const simulatePharmacyCallTool = tool({
    name: 'simulate_pharmacy_call',
    description: 'Simulate a phone call to a pharmacy to check for stock availability or make a reservation. Returns a transcript of the call.',
    parameters: z.object({
        pharmacy_name: z.string().describe('Name of the pharmacy to call'),
        medicine_name: z.string().describe('Name of the medicine to check for')
    }),
    execute: async (input) => {
        return await pharmacyService.simulateCall(input.pharmacy_name, input.medicine_name);
    }
});

export const medicineTools = [
    searchPharmaciesTool,
    searchPharmacyContactTool,
    simulatePharmacyCallTool,
    webSearchTool
];
