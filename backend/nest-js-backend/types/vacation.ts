export type VacationPackage ={
  vacationId: string;
  destinationCity: string;
  totalCost: number;
  hotel: {
    id: string;
    name: string;
    nights: number;
    pricePerNight: number;
    totalHotelCost: number;
  };
  flight: {
    id: string;
    airline: string;
    from: string;
    to: string;
    totalFlightCost: number;
    pricePerPerson: number;
  };
  attractionsPlan: {
    attractions: {
      id: string;
      name: string;
      pricePerPerson: number;
    }[];
    totalAttractionCost: number;
  };
  perPersonCost: number;
  comments: string;
}