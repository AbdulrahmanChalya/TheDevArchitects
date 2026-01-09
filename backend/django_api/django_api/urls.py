"""
URL configuration for django_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from ninja import NinjaAPI
from ninja.errors import HttpError
import json
from typing import Optional
from pathlib import Path
from .airports_service import get_nearby_airports
from .payments import router as payments_router   # <- keep this
from callScrapingApi.api import router as scraping_router
from callScrapingApi.api import call_scraping_service
<<<<<<< HEAD
import time #just have this import here in the meantime
=======
import asyncio
>>>>>>> d16c0e8 (Implementing Asyncio to scraping, change some of the test parameter and Fix the Ai query)
api = NinjaAPI()

# load json
DATA_ROOT = Path(__file__).resolve().parents[2]
def load_json(filename: str):
    p = DATA_ROOT / filename
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)


@api.get("/", url_name="root")
def root(request):
    return {"message": "Hello"}


@api.get("/search", url_name="search")
async def search(
    request,
    originAirport: str="", 
    destinationAirport: str="", 
    # departureDate: str="", 
    # returnDate: str="", 
    people: int = 1, 
    city: str= "",
    startDate: str= "",
    endDate: str= "",
    rooms: int=1,

):
    attractions_params = {
        "city": city,
        "startDate": startDate,
        "endDate": endDate,
        "people": people
    }

    hotels_param ={
        "city": city,
        "startDate": startDate,
        "endDate": endDate,
        "people": people,
        "rooms": rooms
    }

    flights_param ={
        "origin" : originAirport,
        "destination": destinationAirport,
        "startDate": startDate,
        "endDate": endDate,
        "people": people,
    }
<<<<<<< HEAD
    #Could add sleep if oxylab keep bitching, final solution.
    #asyncio or thread
    attractionsJson =  call_scraping_service("api/attractions", attractions_params)
    flightsJson = call_scraping_service("api/flights", flights_param)
    hotelsJson =  call_scraping_service("api/hotels", hotels_param)
=======
    
    attractionsJson, hotelsJson, flightsJson = await asyncio.gather( 
        call_scraping_service("api/attractions", attractions_params),
        call_scraping_service("api/hotels", hotels_param),
        call_scraping_service("api/flights", flights_param)
    )
>>>>>>> d16c0e8 (Implementing Asyncio to scraping, change some of the test parameter and Fix the Ai query)
    
    return {
        "attractions": attractionsJson,
        "flights": flightsJson,
        "hotels": hotelsJson
    }

@api.get("/destination/{destination_id}", url_name="destination_detail")
def destination_detail(request, destination_id: str):
    """
    Return a single destination by id or by exact name (case-insensitive).
    """
    destinations = load_json("destinations.json")
    for d in destinations:
        if str(d.get("id")) == str(destination_id):
            return d
    for d in destinations:
        if str(d.get("name", "")).lower() == str(destination_id).lower():
            return d
    raise HttpError(404, "Destination not found")


@api.get("/airports/nearby", url_name="nearby_airports")
def nearby_airports(request, lat: float, lng: float, limit: int = 5):
    """Return nearby airports based on latitude and longitude."""
    return get_nearby_airports(lat, lng, limit)


# keep this router registration
api.add_router("/payments", payments_router)
api.add_router("/", scraping_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", api.urls),
]
