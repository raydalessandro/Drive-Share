import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map, Navigation, MapPin } from "lucide-react";
import MapView from "@/components/MapView";

interface FeedPostContentProps {
  content: string | null;
  route: {
    id: string;
    title: string;
    description: string | null;
    distance_km: number | null;
    points: { coordinates: Array<{ lat: number; lng: number }> } | null;
  } | null;
  onRouteClick?: (routeId: string) => void;
}

export function FeedPostContent({ 
  content, 
  route, 
  onRouteClick 
}: FeedPostContentProps) {
  // Estrai punti dal percorso se disponibile
  const routePoints = route?.points?.coordinates || [];
  const mapRoutes = routePoints.length > 0 ? [{
    id: route.id,
    title: route.title,
    points: routePoints,
    color: '#ef4444', // Rosso moto
  }] : [];

  return (
    <div className="px-4 pb-3 space-y-3">
      {/* Testo del post */}
      {content && (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      )}

      {/* Card del percorso */}
      {route && (
        <Card className="border-2 border-red-100 bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-4 space-y-3">
            {/* Header percorso */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Map className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <h3 className="font-bold text-base truncate">
                    {route.title}
                  </h3>
                </div>
                {route.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {route.description}
                  </p>
                )}
              </div>
              {route.distance_km && (
                <Badge 
                  variant="secondary" 
                  className="bg-red-100 text-red-700 border-red-200 flex-shrink-0"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  {route.distance_km.toFixed(1)} km
                </Badge>
              )}
            </div>

            {/* Mappa del percorso */}
            {mapRoutes.length > 0 && (
              <div className="rounded-lg overflow-hidden border border-red-200">
                <MapView 
                  routes={mapRoutes}
                  height="250px"
                />
              </div>
            )}

            {/* Bottone per vedere dettagli */}
            {onRouteClick && (
              <button
                onClick={() => onRouteClick(route.id)}
                className="w-full text-sm font-medium text-red-600 hover:text-red-700 py-2 rounded-md hover:bg-red-50 transition-colors"
              >
                <MapPin className="h-4 w-4 inline mr-1" />
                Vedi percorso completo
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

