import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type DestinationMapProps = {
  destinationId: string;
  destinationName: string;
  country: string;
};

type DestinationLocation = {
  longitude: number;
  latitude: number;
  zoom: number;
};

const destinationLocations: Record<string, DestinationLocation> = {
  "santorini-greece": { longitude: 25.4615, latitude: 36.3932, zoom: 11 },
  "bali-indonesia": { longitude: 115.2167, latitude: -8.65, zoom: 9 },
  "paris-france": { longitude: 2.3522, latitude: 48.8566, zoom: 11 },
  "tokyo-japan": { longitude: 139.6917, latitude: 35.6895, zoom: 10 },
  "swiss-alps": { longitude: 7.8632, latitude: 46.6863, zoom: 10 },
  "new-york-usa": { longitude: -74.006, latitude: 40.7128, zoom: 10 },
  "machu-picchu-peru": { longitude: -72.545, latitude: -13.1631, zoom: 12 },
  "amalfi-coast-italy": { longitude: 14.6027, latitude: 40.634, zoom: 10 },
};

export default function DestinationMap({
  destinationId,
  destinationName,
  country,
}: DestinationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const location = destinationLocations[destinationId];
  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as
    | string
    | undefined;

  useEffect(() => {
    if (!accessToken || !location || !mapContainerRef.current) {
      return;
    }

    mapboxgl.accessToken = accessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [location.longitude, location.latitude],
      zoom: location.zoom,
    });

    mapRef.current = map;

    new mapboxgl.Marker({ color: "#2563eb" })
      .setLngLat([location.longitude, location.latitude])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setText(
          `${destinationName}, ${country}`,
        ),
      )
      .addTo(map);

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [
    accessToken,
    country,
    destinationName,
    location?.latitude,
    location?.longitude,
    location?.zoom,
  ]);

  if (!accessToken) {
    return (
      <div className="rounded-xl border bg-muted p-6 text-sm text-muted-foreground">
        Map configuration is unavailable.
      </div>
    );
  }

  if (!location) {
    return (
      <div className="rounded-xl border bg-muted p-6 text-sm text-muted-foreground">
        A map is not available for this destination yet.
      </div>
    );
  }

  return (
    <section className="rounded-xl overflow-hidden border bg-card">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Destination Map</h2>
        <p className="text-sm text-muted-foreground">
          Explore the area around {destinationName}.
        </p>
      </div>

      <div
        ref={mapContainerRef}
        className="h-[360px] w-full"
        aria-label={`Map of ${destinationName}`}
      />
    </section>
  );
}