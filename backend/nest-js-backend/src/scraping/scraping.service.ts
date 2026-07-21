import { BadGatewayException, HttpException, Injectable } from '@nestjs/common';
import { GoogleAuth, type IdTokenClient } from 'google-auth-library';
@Injectable()
/*
 * Forwards query params to the scraper service and combines 
 * attractions, hotels, and flights for /api/search.
 */
export class ScrapingService {
    private readonly scraperBaseUrl = process.env.SCRAPER_BASE_URL || 'http://localhost:5001';
    private readonly scraperAuthAudience = process.env.SCRAPER_AUTH_AUDIENCE?.trim();
    private readonly googleAuth = new GoogleAuth();
    private scraperClientPromise?: Promise<IdTokenClient>;

    /**
     * Adds a Google-signed identity token when the scraper is private on Cloud
     * Run. Local development leaves the audience unset and sends no IAM token.
     */
    private async getScraperHeaders(): Promise<Record<string, string>> {
      if (!this.scraperAuthAudience) return {};

      this.scraperClientPromise ??= this.googleAuth.getIdTokenClient(
        this.scraperAuthAudience,
      );
      const client = await this.scraperClientPromise;
      const headers = await client.getRequestHeaders();
      return Object.fromEntries(headers.entries());
    }

    async callScrapingService(endpoint: string, params: Record<string, any>) {
        
        // Normalize the endpoint so it resolves beneath the configured base URL.
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

        const response = await fetch(url, {
          headers: await this.getScraperHeaders(),
        });

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

      return scrapedResponse;
    }
  }
