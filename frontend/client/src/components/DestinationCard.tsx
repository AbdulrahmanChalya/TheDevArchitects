import { Star, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface DestinationCardProps {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  activities: string[];
  flightTime?: string;
}

export default function DestinationCard({
  id,
  name,
  country,
  description,
  image,
  rating,
  reviewCount,
  pricePerNight,
  activities,
  flightTime
}: DestinationCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    console.log(`Destination ${id} clicked`);
    setLocation(`/destination/${id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover-elevate active-elevate-2 transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
      data-testid={`card-destination-${id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={`/frontend/assets/images/${image}`}
          alt={`${name}, ${country}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-background/90 backdrop-blur-sm text-foreground border-0 shadow-lg">
            ${pricePerNight}/night
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3 w-3" />
            <span>{country}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {activities.slice(0, 3).map((activity) => (
            <Badge key={activity} variant="secondary" className="text-xs">
              {activity}
            </Badge>
          ))}
        </div>

        {flightTime && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="h-3 w-3" />
            <span>{flightTime} flight time</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
