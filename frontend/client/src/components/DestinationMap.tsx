import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type Attraction = {
  name: string;
  description?: string;
};

type DestinationMapProps = {
  destinationName: string;
  country?: string;
  hotelName?: string;
  attractions?: Attraction[];
};

type Coordinates = {
  longitude: number;
  latitude: number;
};

type GeocodedLocation = {
  name: string;
  longitude: number;
  latitude: number;
  description?: string;
  type: "attraction";
};

type MapboxFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
};

type MapboxGeocodeResponse = {
  features?: MapboxFeature[];
};

function createLabeledMarker(label: string, color: string) {
  const el = document.createElement("div");

  el.style.width = "30px";
  el.style.height = "30px";
  el.style.borderRadius = "50%";
  el.style.backgroundColor = color;
  el.style.color = "white";
  el.style.display = "flex";
  el.style.alignItems = "center";
  el.style.justifyContent = "center";
  el.style.fontSize = "14px";
  el.style.fontWeight = "700";
  el.style.border = "2px solid white";
  el.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.3)";
  el.textContent = label;

  return el;
}

function cleanAttractionName(name: string) {
  return name
    .replace(/^Visit the\s+/i, "")
    .replace(/\s+Walking Tour$/i, "")
    .replace(/\s+Cruise$/i, "")
    .trim();
}

function getDistanceKm(first: Coordinates, second: Coordinates) {
  const earthRadiusKm = 6371;

  const lat1 = (first.latitude * Math.PI) / 180;
  const lat2 = (second.latitude * Math.PI) / 180;
  const latDifference = ((second.latitude - first.latitude) * Math.PI) / 180;
  const lonDifference = ((second.longitude - first.longitude) * Math.PI) / 180;

  const a =
    Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(lonDifference / 2) *
      Math.sin(lonDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

async function geocodeDestination(
  query: string,
  accessToken: string,
): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
        query,
      )}&limit=1&access_token=${accessToken}`,
    );

    if (!response.ok) {
      console.warn(`Destination geocoding failed for: ${query}`);
      return null;
    }

    const data = (await response.json()) as MapboxGeocodeResponse;
    const coordinates = data.features?.[0]?.geometry?.coordinates;

    if (!coordinates) {
      console.warn(`No destination location found for: ${query}`);
      return null;
    }

    return {
      longitude: coordinates[0],
      latitude: coordinates[1],
    };
  } catch (error) {
    console.warn(`Could not geocode destination: ${query}`, error);
    return null;
  }
}

function formatLocationQuery(...parts: Array<string | undefined>) {
  return parts.map((part) => part?.trim()).filter(Boolean).join(", ");
}

async function searchPointOfInterest(
  name: string,
  destinationName: string,
  country: string | undefined,
  destinationCoordinates: Coordinates,
  accessToken: string,
  category: "hotel" | "attraction",
  maxDistanceKm: number,
): Promise<Coordinates | null> {
  const query = formatLocationQuery(name, destinationName, country);

  try {
    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/forward?q=${encodeURIComponent(
        query,
      )}&limit=1&types=poi&proximity=${destinationCoordinates.longitude},${destinationCoordinates.latitude}&access_token=${accessToken}`,
    );

    if (!response.ok) {
      console.warn(`${category} search failed for: ${query}`);
      return null;
    }

    const data = (await response.json()) as MapboxGeocodeResponse;
    const coordinates = data.features?.[0]?.geometry?.coordinates;

    if (!coordinates) {
      console.warn(`No ${category} location found for: ${query}`);
      return null;
    }

    const foundCoordinates = {
      longitude: coordinates[0],
      latitude: coordinates[1],
    };

    const distanceFromDestination = getDistanceKm(
      destinationCoordinates,
      foundCoordinates,
    );

    if (distanceFromDestination > maxDistanceKm) {
      console.warn(
        `Skipped ${category} because it is too far from ${destinationName}: ${query} (${distanceFromDestination.toFixed(
          1,
        )} km away)`,
      );
      return null;
    }

    return foundCoordinates;
  } catch (error) {
    console.warn(`Could not find ${category}: ${query}`, error);
    return null;
  }
}

export default function DestinationMap({
  destinationName,
  country,
  hotelName,
  attractions = [],
}: DestinationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as
    | string
    | undefined;

  useEffect(() => {
    if (!accessToken || !mapContainerRef.current) {
      return;
    }

    let cancelled = false;
    let map: mapboxgl.Map | null = null;

    const buildMap = async () => {
      setStatusMessage("Loading destination map...");

      const destinationCoordinates = await geocodeDestination(
        formatLocationQuery(destinationName, country),
        accessToken,
      );

      if (!destinationCoordinates || cancelled || !mapContainerRef.current) {
        if (!cancelled) {
          setStatusMessage("Map location is not available for this destination.");
        }
        return;
      }

      mapboxgl.accessToken = accessToken;

      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [
          destinationCoordinates.longitude,
          destinationCoordinates.latitude,
        ],
        zoom: 11,
      });

      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.addControl(new mapboxgl.FullscreenControl(), "top-right");

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([
        destinationCoordinates.longitude,
        destinationCoordinates.latitude,
      ]);

      new mapboxgl.Marker({
        element: createLabeledMarker("D", "#2563eb"),
      })
        .setLngLat([
          destinationCoordinates.longitude,
          destinationCoordinates.latitude,
        ])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<strong>${destinationName}</strong>${country ? `<br />${country}` : ""}`,
          ),
        )
        .addTo(map);

      let hotelWasFound = false;

      if (hotelName) {
        const hotelCoordinates = await searchPointOfInterest(
          hotelName,
          destinationName,
          country,
          destinationCoordinates,
          accessToken,
          "hotel",
          80,
        );

        if (hotelCoordinates && map) {
          hotelWasFound = true;

          bounds.extend([hotelCoordinates.longitude, hotelCoordinates.latitude]);

          new mapboxgl.Marker({
            element: createLabeledMarker("H", "#4c1d95"),
          })
            .setLngLat([hotelCoordinates.longitude, hotelCoordinates.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<strong>Hotel</strong><br />${hotelName}`,
              ),
            )
            .addTo(map);
        }
      }

      const attractionResults: Array<GeocodedLocation | null> =
        await Promise.all(
          attractions.map(async (attraction): Promise<GeocodedLocation | null> => {
            const coordinates = await searchPointOfInterest(
              cleanAttractionName(attraction.name),
              destinationName,
              country,
              destinationCoordinates,
              accessToken,
              "attraction",
              120,
            );

            if (!coordinates) {
              return null;
            }

            return {
              name: attraction.name,
              description: attraction.description,
              longitude: coordinates.longitude,
              latitude: coordinates.latitude,
              type: "attraction",
            };
          }),
        );

      if (cancelled || !map) {
        return;
      }

      const validAttractions = attractionResults.filter(
        (attraction): attraction is GeocodedLocation => attraction !== null,
      );

      validAttractions.forEach((attraction) => {
        bounds.extend([attraction.longitude, attraction.latitude]);

        new mapboxgl.Marker({
          element: createLabeledMarker("A", "#15803d"),
        })
          .setLngLat([attraction.longitude, attraction.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<strong>${attraction.name}</strong>${
                attraction.description
                  ? `<br /><span>${attraction.description}</span>`
                  : ""
              }`,
            ),
          )
          .addTo(map as mapboxgl.Map);
      });

      if (validAttractions.length > 0 || hotelWasFound) {
        map.fitBounds(bounds, {
          padding: 70,
          maxZoom: 13,
          duration: 700,
        });
      }

      if (!cancelled) {
        const messages = [];

        if (hotelName && !hotelWasFound) {
          messages.push("Hotel location was not found");
        }

        if (validAttractions.length !== attractions.length) {
          messages.push(
            `${validAttractions.length} of ${attractions.length} attraction locations found`,
          );
        }

        setStatusMessage(messages.join(" • "));
      }
    };

    buildMap();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [accessToken, destinationName, country, hotelName, attractions]);

  if (!accessToken) {
    return (
      <div className="rounded-xl border bg-muted p-6 text-sm text-muted-foreground">
        Map configuration is unavailable.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">Destination Map</h2>
        <p className="text-sm text-muted-foreground">
          D: destination · H: hotel · A: attractions
        </p>
      </div>

      <div
        ref={mapContainerRef}
        className="h-[480px] w-full lg:h-[560px]"
        aria-label={`Map of ${destinationName}`}
      />

      {statusMessage && (
        <p className="border-t px-4 py-3 text-sm text-muted-foreground">
          {statusMessage}
        </p>
      )}
    </section>
  );
}
