import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';
import { ScrapingService } from './scraping.service';


/* Get all API endpoints from the Next.js scraping service. */
@Controller()
export class ScrapingController {
    constructor(private readonly scrapingService: ScrapingService) {}

    @Get('attractions')
    @Public()
    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    getAttractions(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/attractions', query);
    }

    @Get('flights')
    @Throttle({ default: { limit: 20, ttl: 60_000 } })
    getFlights(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/flights', query);
    }

    @Get('hotels')
    @Throttle({ default: { limit: 20, ttl: 60_000 } })
    getHotels(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/hotels', query);
    }

    @Get('search')
    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    search(@Query() query: Record<string, any>) {
      return this.scrapingService.search(query);
    }

    @Get('images/place')
    @Public()
    @Throttle({ default: { limit: 30, ttl: 60_000 } })
    getPlaceImage(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/places/image', query);
    }

    // Proxy Google Places through the scraper service so the browser never receives the API key.
    @Get('places/autocomplete')
    @Public()
    @Throttle({ default: { limit: 30, ttl: 60_000 } })
    getPlaceAutocomplete(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/places/autocomplete', query);
    }

    @Get('places/details')
    @Public()
    @Throttle({ default: { limit: 30, ttl: 60_000 } })
    getPlaceDetails(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/places/details', query);
    }

    @Get('airports/suggestions')
    @Public()
    @Throttle({ default: { limit: 30, ttl: 60_000 } })
    getAirportSuggestions(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/airports/suggestions', query);
    }
}
