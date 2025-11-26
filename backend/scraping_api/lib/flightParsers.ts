export const parseRouteFull = (route: string) => {
  const match = route.match(/^(.*?)\s*-\s*(.*)$/);

  return {
    departureAirport: match?.[1]?.trim() || null, // "New York (JFK)"
    arrivalAirport: match?.[2]?.trim() || null, // "Paris (CDG)"
  };
};
