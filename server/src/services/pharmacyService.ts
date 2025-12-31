import { logger } from '../utils/logger';
import { searchService } from './searchService';
export class PharmacyService {

    async findPharmacies(location: string, medicine: string): Promise<string> {
        logger.search(`Finding pharmacies in ${location} for ${medicine}...`);

        const pharmacyResults = await searchService.search(`pharmacies near ${location}`);

        const availabilityResults = await searchService.search(`buy ${medicine} ${location} pharmacy in stock`);

        return JSON.stringify({
            action: "find_pharmacies",
            location,
            medicine,
            general_results: JSON.parse(pharmacyResults),
            availability_context: JSON.parse(availabilityResults)
        }, null, 2);
    }
    async getContactInfo(pharmacyName: string, location: string): Promise<string> {
        logger.search(`Getting contact info for ${pharmacyName} in ${location}...`);
        return await searchService.search(`${pharmacyName} ${location} phone number`);
    }

    async simulateCall(pharmacyName: string, medicine: string): Promise<string> {
        logger.info(` SIMULATING CALL to ${pharmacyName} checking for ${medicine}...`);

        const isAvailable = Math.random() > 0.3;

        const quantity = Math.floor(Math.random() * 5) + 1;

        const transcript = isAvailable
            ? `
[SYSTEM]: Dialing ${pharmacyName}...
[PHARMACIST]: "Thank you for calling ${pharmacyName}, this is Sarah. How can I help you?"
[AI AGENT]: "Hi, I'm calling to check if you have ${medicine} in stock right now?"
[PHARMACIST]: "Let me check the computer... Yes, we actually have ${quantity} packs left in stock."
[AI AGENT]: "Great, can you hold one for me? I'll be there in 30 minutes."
[PHARMACIST]: "Sure, I'll put your name on it. See you soon."
[SYSTEM]: Call ended. Result: CONFIRMED_AVAILABLE
      `
            : `
[SYSTEM]: Dialing ${pharmacyName}...
[PHARMACIST]: "${pharmacyName}, how can I help?"
[AI AGENT]: "Hi, do you have ${medicine} in stock?"
[PHARMACIST]: "Checking... Sorry, we are all out of ${medicine} at the moment. We expect a shipment on Tuesday."
[AI AGENT]: "Okay, thank you."
[SYSTEM]: Call ended. Result: OUT_OF_STOCK
      `;
        return JSON.stringify({
            action: "simulate_call",
            pharmacy: pharmacyName,
            medicine: medicine,
            status: isAvailable ? "AVAILABLE" : "OUT_OF_STOCK",
            transcript: transcript.trim()
        }, null, 2);
    }
}
export const pharmacyService = new PharmacyService();
