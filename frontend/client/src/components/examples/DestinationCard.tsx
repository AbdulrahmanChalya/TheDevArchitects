// Example wrapper — single DestinationCard with hardcoded Paris props.
import DestinationCard from '../DestinationCard';

export default function DestinationCardExample() {
  return (
    <div className="p-6 bg-background max-w-sm">
      <DestinationCard
        id="paris-france"
        name="Paris"
        country="France"
        description="Fall in love with the City of Light, home to world-class art, cuisine, and romance."
        rating={4.9}
        reviewCount={3500}
        pricePerNight={220}
        activities={["Museums", "Dining", "Architecture"]}
        flightTime="7h 15m"
      />
    </div>
  );
}
