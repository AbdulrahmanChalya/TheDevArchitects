import { Schema } from "firebase/ai";

export const vacationResponseSchema = Schema.object({
  properties: {
    vacationPackages: Schema.array({
      items: Schema.object({
        properties: {
          destinationCity: Schema.string(),
          totalCost: Schema.number(),
          perPersonCost: Schema.number(),
          comments: Schema.string(),
          hotel: Schema.object({
            properties: {
              id: Schema.string(),
              name: Schema.string(),
              nights: Schema.number(),
              pricePerNight: Schema.number(),
              totalHotelCost: Schema.number(),
            },
          }),
          flight: Schema.object({
            properties: {
              id: Schema.string(),
              airline: Schema.string(),
              from: Schema.string(),
              to: Schema.string(),
              totalFlightCost: Schema.number(),
              pricePerPerson: Schema.number(),
            },
          }),
          attractionsPlan: Schema.object({
            properties: {
              totalAttractionCost: Schema.number(),
              attractions: Schema.array({
                items: Schema.object({
                  properties: {
                    id: Schema.string(),
                    name: Schema.string(),
                    pricePerPerson: Schema.number(),
                  },
                }),
              }),
            },
          }),
        },
      }),
    }),
  },
});