import { BadGatewayException, HttpException, Injectable } from '@nestjs/common';
import { handleGenerate } from 'firebaseConfig';
import { saveVacationModelInput } from './input-data-writer';
import { normalizeForVacationModel } from './vacation-input-normalizer';

@Injectable()
/*
 * Forwards query params to the scraper service and combines 
 * attractions, hotels, and flights for /api/search.
 */
export class ScrapingService {
    private readonly scraperBaseUrl = process.env.SCRAPER_BASE_URL || 'http://localhost:5001';

    async callScrapingService(endpoint: string, params: Record<string, any>) {
        
        //this is insane to look at but basically this will remove any / before api/data
        const url = new URL(endpoint.replace(/^\/+/, ''), `${this.scraperBaseUrl}/`); 


        // Skip query params with null, undefined, or empty string values to avoid
        // sending garbage to the scraper (e.g. "?city=&people=2" becomes "?people=2")
        //
        // Example:
        //   params = { city: "Paris", startDate: "", people: 2, rooms: null }
        //   → only appends city=Paris and people=2
        for (const key in params) {
            const value = params[key];

            if (value != null && value !== '') {
                url.searchParams.set(key, String(value));
            }
        }

        const response = await fetch(url);

        if(!response.ok){
            throw new HttpException(await response.text(), response.status);
        }

        try {
            return await response.json();
        } catch {
            throw new BadGatewayException("Scraping return invalid JSON");
        }   
    }

    //The scraping will only return economy for now
    async search(query: Record<string, any>) {
      const city = query.city || '';
      const startDate = query.startDate || '';
      const endDate = query.endDate || '';
      const people = Number(query.people || 1);
      const rooms = Number(query.rooms || 1);
      const countryCode = query.countryCode || '';

      const attractionsParams = {
        city,
        startDate,
        endDate,
        people,
      };

      const hotelsParams = {
        city,
        countryCode,
        startDate,
        endDate,
        people,
        rooms,
      };

      const flightsParams = {
        origin: query.originAirport || '',
        destination: query.destinationAirport || '',
        startDate,
        endDate,
        people,
      };

      const [attractions, hotels, flights] = await Promise.all([
        this.callScrapingService('api/attractions', attractionsParams),
        this.callScrapingService('api/hotels', hotelsParams),
        this.callScrapingService('api/flights', flightsParams),
      ]);

      const scrapedResponse = {
        attractions,
        hotels,
        flights,
      };

      // Store clean model inputs so I can use it for finetuning. will remove after done.
      const vacationModelInput = normalizeForVacationModel(scrapedResponse, query);
      const savedInputPath = await saveVacationModelInput(vacationModelInput);
      console.log(`Saved normalized vacation model input: ${savedInputPath}`);

      // function call to generate vacation packages based on scraped data
      handleGenerate(scrapedResponse);

      return scrapedResponse;
    }
  }
