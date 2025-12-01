import requests
from ninja import Router
from django.conf import settings
import os
from ninja.errors import HttpError

SCRAPER_BASE_URL = os.getenv("SCRAPER_BASE_URL", "http://localhost:5001")

router = Router()


def call_scraping_service(endpoint: str, params: dict):
    # prevent double slashes
    endpoint = endpoint.lstrip("/")
    url = f"{SCRAPER_BASE_URL}/{endpoint}"

    try:
        response = requests.get(url, params=params)
    except Exception as e:
        raise HttpError(502, f"Scraping service unreachable: {e}")

    if not response.ok:
        raise HttpError(response.status_code, response.text)

    try:
        return response.json()
    except Exception:
        raise HttpError(502, "Scraping backend returned invalid JSON")

@router.get("/attractions")
def get_attractions(request, 
                    city: str ="", 
                    startDate: str= "", 
                    endDate: str="", 
                    people: int =2):
    params = {
        "city": city,
        "startDate": startDate,
        "endDate": endDate,
        "people": people,
    }
    return call_scraping_service("api/attractions", params)

#for now, let's just scrape only economy first
# we can implement different option in the future
@router.get("/flights")
def get_fights(request, 
               origin: str="", 
               destination: str="", 
               startDate: str="", 
               endDate: str="", 
               people: int = 1, 
                 ):
    params = {
        "origin" : origin,
        "destination": destination,
        "startDate": startDate,
        "endDate": endDate,
        "people": people,
        # "cabinClass": cabinClass
    }
    return call_scraping_service("api/flights", params)

@router.get("/hotels")
def get_hotels(request,
               city: str= "",
               startDate: str= "",
               endDate: str= "",
               people: int=2,
               rooms: int=1):
    
    params = {
        "city": city,
        "startDate": startDate,
        "endDate": endDate,
        "people": people,
        "rooms": rooms
    }
    return call_scraping_service("api/hotels", params)


