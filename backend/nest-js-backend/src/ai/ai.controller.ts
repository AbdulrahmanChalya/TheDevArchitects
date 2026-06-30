import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import OpenAI from 'openai';
import { normalizeForVacationModel } from '../scraping/vacation-input-normalizer';

/**
 * DeepSeek endpoints.
 */
@Controller('ai')
export class AiController {
  /**
   * Builds vacationPackages from scraped travel data.
   */
  @Post('vacation-packages')
  async generateVacationPackages(@Body() body: GenerateVacationPackagesBody) {
    const { scrapedResponse, query = {} } = body;

    if (!scrapedResponse) {
      throw new BadRequestException('scrapedResponse is required.');
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      throw new BadRequestException('DEEPSEEK_API_KEY is missing.');
    }

    // give deepseek clean data instead of junks they don't need
    const aiInput = normalizeForVacationModel(scrapedResponse, query);

    const deepseek = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });

    //debugging: time how long the ai will took to response
    const startedAt = Date.now();

    const completion = await deepseek.chat.completions.create({
      model: 'deepseek-v4-flash',
      messages: [
        {
          role: 'system',
          content: VACATION_PACKAGE_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Create vacation package json from this normalized scraped travel data:\n${JSON.stringify(aiInput)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 5000,
      stream: false,
    });

    const durationMs = (Date.now() - startedAt) / 1000;
    console.log(`DeepSeek response time: ${durationMs.toFixed(2)}s`);

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new InternalServerErrorException('DeepSeek returned an empty response.');
    }

    try {
      const parsed = JSON.parse(content) as VacationPackagesResponse;

      // deepseek should response with valid json, but check just in case.
      if (!Array.isArray(parsed.vacationPackages)) {
        throw new Error('Missing vacationPackages array.');
      }

      return parsed;
    } catch (error) {
      console.error('DeepSeek JSON parse error:', error, content);
      throw new InternalServerErrorException(
        'DeepSeek did not return valid vacation package JSON.',
      );
    }
  }
}

type GenerateVacationPackagesBody = {
  scrapedResponse?: any;
  query?: Record<string, any>;
};

type VacationPackagesResponse = {
  vacationPackages?: unknown[];
};

const VACATION_PACKAGE_SYSTEM_PROMPT = `
You are a vacation package planner.

Return only valid json. Do not include markdown, comments, explanations, or extra text.

Use only the provided hotels, flights, attractions, dates, travelers, and budget.
Choose exactly 3 package options.
Each package must choose exactly one hotel and one flight.
Attractions may be repeated across packages, but packages should feel meaningfully different.
Do not invent hotel ids, flight ids, attraction ids, names, or prices.
If attraction prices are unavailable, use 0 for pricePerPerson.
All costs must be numbers in CAD.
Must keep keep the totalCost under the budget
totalCost must equal totalHotelCost + totalFlightCost + totalAttractionCost.
perPersonCost must equal totalCost divided by the number of travelers.


The response json must exactly follow this shape:
{
  "vacationPackages": [
    {
      "destinationCity": "Paris",
      "totalCost": 3694.53,
      "perPersonCost": 1847.27,
      "comments": "A concise package summary.",
      "hotel": {
        "id": "hotel-1",
        "name": "Hotel Name",
        "nights": 5,
        "pricePerNight": 250.39,
        "totalHotelCost": 1251.95
      },
      "flight": {
        "id": "flight-1",
        "airline": "Airline",
        "from": "JFK",
        "to": "CDG",
        "totalFlightCost": 1827.92,
        "pricePerPerson": 913.96
      },
      "attractionsPlan": {
        "totalAttractionCost": 0,
        "attractions": [
          {
            "id": "attraction-1",
            "name": "Attraction Name",
            "pricePerPerson": 0
          }
        ]
      }
    }
  ]
}
`;
