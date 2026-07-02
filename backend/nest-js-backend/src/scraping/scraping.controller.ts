import { Controller, Get, Query } from '@nestjs/common';
import { ScrapingService } from './scraping.service';


/* Get all API endpoints from the Next.js scraping service. */
@Controller()
export class ScrapingController {
    constructor(private readonly scrapingService: ScrapingService) {}

    @Get('attractions')
    getAttractions(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/attractions', query);
    }

    @Get('flights')
    getFlights(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/flights', query);
    }

    @Get('hotels')
    getHotels(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/hotels', query);
    }

    @Get('search')
    search(@Query() query: Record<string, any>) {
      return this.scrapingService.search(query);
    }

    @Get('images/place')
    getPlaceImage(@Query() query: Record<string, any>) {
      return this.scrapingService.callScrapingService('api/places/image', query);
    }
}
