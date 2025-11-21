import math
import requests
from pathlib import Path
import json

API_KEY = "qANw6xtv4W9NJj5etNsyaQ==YalDpMqdceAjYs3e"
API_URL = "https://api.api-ninjas.com/v1/airports"

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance between two coordinates using Haversine formula."""
    R = 6371  # Earth's radius in kilometers
    dLat = math.radians(lat2 - lat1)
    dLng = math.radians(lng2 - lng1)
    a = (math.sin(dLat/2) * math.sin(dLat/2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dLng/2) * math.sin(dLng/2))
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def load_fallback_airports():
    """Load airports from local JSON file."""
    data_root = Path(__file__).resolve().parents[3]
    airports_path = data_root / "airports.json"
    with airports_path.open("r", encoding="utf-8") as f:
        return json.load(f)

def get_nearby_airports(lat: float, lng: float, limit: int = 5):
    """Fetch nearby airports from external API or fallback to local data."""
    try:
        headers = {"X-Api-Key": API_KEY}
        response = requests.get(API_URL, headers=headers, params={"limit": 30})
        response.raise_for_status()
        
        airports = response.json()
        
        airports_with_distance = []
        for airport in airports:
            if airport.get("latitude") and airport.get("longitude"):
                distance = calculate_distance(lat, lng, airport["latitude"], airport["longitude"])
                airports_with_distance.append({
                    "code": airport.get("iata", airport.get("icao", "N/A")),
                    "name": airport.get("name", "Unknown"),
                    "city": airport.get("city", "Unknown"),
                    "country": airport.get("country", "Unknown"),
                    "lat": airport["latitude"],
                    "lng": airport["longitude"],
                    "distance": round(distance, 2)
                })
        
        airports_with_distance.sort(key=lambda x: x["distance"])
        return airports_with_distance[:limit]
        
    except Exception:
        # Fallback to local data
        airports = load_fallback_airports()
        airports_with_distance = []
        for airport in airports:
            distance = calculate_distance(lat, lng, airport["lat"], airport["lng"])
            airports_with_distance.append({
                **airport,
                "distance": round(distance, 2)
            })
        airports_with_distance.sort(key=lambda x: x["distance"])
        return airports_with_distance[:limit]
