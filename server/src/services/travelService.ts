
import { logger } from '../utils/logger';
import { searchService } from './searchService';

export class TravelService {

    async researchDestination(destination: string, interests: string[]): Promise<string> {
        logger.search(`Researching ${destination} with interests: ${interests.join(', ')}...`);

        // general res for the loc
        const query = `${destination} top attractions things to do travel guide`;
        const generalInfo = await searchService.search(query);

        return JSON.stringify({
            destination,
            general_research: JSON.parse(generalInfo)
        }, null, 2);
    }

    async searchTransport(origin: string, destination: string, date: string): Promise<string> {
        logger.search(`Finding transport from ${origin} to ${destination}...`);

        // Strategy: Search for general train/flight routes (dates rarely work in Google Search)
        // Query 1: Train specific
        const trainQuery = `train ${origin} to ${destination} schedule timing fare`;
        const trainResults = await searchService.search(trainQuery);

        // Query 2: Flight specific (if applicable)
        const flightQuery = `flights ${origin} to ${destination} airlines price`;
        const flightResults = await searchService.search(flightQuery);

        return JSON.stringify({
            search_type: "transport",
            origin,
            destination,
            requested_date: date,
            train_options: JSON.parse(trainResults),
            flight_options: JSON.parse(flightResults),
            note: "Search real booking sites (IRCTC, MakeMyTrip) for exact availability on your date."
        }, null, 2);
    }

    // ACCOMMODATION
    async searchAccommodation(destination: string, checkIn: string, checkOut: string, budget: string): Promise<string> {
        logger.search(`Finding hotels in ${destination} (${budget})...`);

        const query = `best ${budget} hotels in ${destination} price contact phone`;
        const results = await searchService.search(query);

        return JSON.stringify({
            search_type: "accommodation",
            destination,
            budget,
            check_in: checkIn,
            check_out: checkOut,
            results: JSON.parse(results),
            note: "Check Booking.com or Goibibo for live availability on your dates."
        }, null, 2);
    }

    // DINING
    async searchDining(destination: string, cuisine: string): Promise<string> {
        logger.search(`Finding ${cuisine} food in ${destination}...`);

        const query = `famous ${cuisine} food restaurants in ${destination} price menu`;
        const results = await searchService.search(query);

        return JSON.stringify({
            search_type: "dining",
            destination,
            cuisine,
            results: JSON.parse(results)
        }, null, 2);
    }

    // WEATHER
    async checkWeather(location: string): Promise<string> {
        const query = `${location} weather climate best time to visit`;
        return await searchService.search(query);
    }

    // ATTRACTIONS
    async searchAttractions(destination: string, type: string = "tourist"): Promise<string> {
        logger.search(`Finding ${type} attractions in ${destination}...`);

        const query = `${destination} ${type} places to visit entry fee timing`;
        const results = await searchService.search(query);

        return results;
    }

    async generateItinerary(destination: string, days: number, preferences: string, details: any): Promise<string> {
        logger.info(`GENERATING DETAILED ITINERARY for ${destination}...`);

        return JSON.stringify({
            title: `Detailed ${days}-Day Trip to ${destination}`,
            duration: `${days} days`,
            preferences,
            status: "READY",
            transport_details: details.transport || "Not specified",
            accommodation_details: details.accommodation || "Not specified",
            daily_schedule: details.schedule || "Not specified",
            total_estimated_cost: details.total_cost || "To be calculated",
            booking_links: {
                trains: "https://www.irctc.co.in",
                flights: "https://www.makemytrip.com",
                hotels: "https://www.booking.com"
            },
            note: "Prices and availability should be verified on the respective booking platforms."
        }, null, 2);
    }
}

export const travelService = new TravelService();
