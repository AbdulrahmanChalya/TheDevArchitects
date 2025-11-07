import { MapPin, DollarSign, Calendar, Compass, Sparkles, Mountain, Ship, Waves } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Activity {
  name: string;
  description: string;
  icon: string;
}

interface RecommendationCardProps {
  destination: string;
  tagline: string;
  image: string;
  activities: Activity[];
  bestTime: string;
  estimatedBudget: string;
}

const getActivityIcon = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    landmark: MapPin,
    museum: Compass,
    ship: Ship,
    walking: Compass,
    mountain: Mountain,
    waves: Waves,
    sparkles: Sparkles,
    default: Sparkles
  };
  const Icon = iconMap[iconName] || iconMap.default;
  return <Icon className="h-4 w-4" />;
};

export default function RecommendationCard({
  destination,
  tagline,
  image,
  activities,
  bestTime,
  estimatedBudget
}: RecommendationCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate transition-all duration-300" data-testid={`card-recommendation-${destination.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
      <div 
        className="h-48 bg-cover bg-center relative"
        style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url(${image})` }}
      >
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1" data-testid="text-destination">{destination}</h3>
          <p className="text-sm text-white/90" data-testid="text-tagline">{tagline}</p>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              Things to Do
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {activities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover-elevate"
                  data-testid={`activity-${index}`}
                >
                  <div className="mt-0.5 text-primary">
                    {getActivityIcon(activity.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground" data-testid="text-activity-name">
                      {activity.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5" data-testid="text-activity-description">
                      {activity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Best Time:</span>
              <span className="font-medium text-foreground" data-testid="text-best-time">{bestTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Estimated Budget:</span>
              <span className="font-medium text-foreground" data-testid="text-budget">{estimatedBudget}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
