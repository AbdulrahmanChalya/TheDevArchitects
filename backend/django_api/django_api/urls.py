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

api = NinjaAPI()

def load_json(filename: str):
    with open(f"data/{filename}", "r") as f:
        return json.load(f)

@api.get("/", url_name="root")
def root(request):
    return {"message": "Hello"}

@api.get("/search", url_name="search")
def search(
    request,
    destination: Optional[str] = None,
    people: Optional[int] = None,
    budget: Optional[float] = None,
    startDate: Optional[str] = None,
    endDate: Optional[str] = None,
    rooms: Optional[int] = None,
):
    # TODO: Implement search logic here
    return {
        "destination": destination,
        "people": people,
        "budget": budget,
        "startDate": startDate,
        "endDate": endDate,
        "rooms": rooms,
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

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/", api.urls)
]
