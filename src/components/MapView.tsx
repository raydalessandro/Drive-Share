import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  routes?: Array<{
    id: string;
    title: string;
    points: Array<{ lat: number; lng: number }>;
    color?: string;
  }>;
  height?: string;
  center?: [number, number];
  showControls?: boolean;
  className?: string;
}

export default function MapView({ 
  routes = [], 
  height = '400px',
  center = [45.4642, 9.1900], // Milano default
  showControls = true,
  className = ''
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routesRef = useRef<L.Polyline[]>([]);
  const markersRef = useRef<L.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Fix Leaflet icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Initialize map with better options
    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: showControls,
      attributionControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true,
    });

    // Use CartoDB Positron - a clean, modern tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Map ready
    setIsLoading(false);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      routesRef.current = [];
      markersRef.current = [];
    };
  }, [showControls]);

  // Update routes
  useEffect(() => {
    if (!mapRef.current || isLoading) return;

    // Clear existing routes and markers
    routesRef.current.forEach(route => mapRef.current?.removeLayer(route));
    markersRef.current.forEach(marker => mapRef.current?.removeLayer(marker));
    routesRef.current = [];
    markersRef.current = [];

    if (routes.length === 0) return;

    const bounds = L.latLngBounds([]);
    let hasValidBounds = false;

    // Add new routes with improved styling
    routes.forEach((route, index) => {
      if (route.points.length === 0) return;

      const routeColor = route.color || '#ef4444'; // Red-600 default
      const routePoints = route.points.map(p => [p.lat, p.lng] as [number, number]);

      // Create polyline with better styling
      const polyline = L.polyline(routePoints, {
        color: routeColor,
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round',
        smoothFactor: 1.0,
      }).addTo(mapRef.current!);

      // Add shadow effect (simulated with a thicker, semi-transparent line behind)
      const shadow = L.polyline(routePoints, {
        color: '#000000',
        weight: 7,
        opacity: 0.2,
        lineJoin: 'round',
        lineCap: 'round',
        smoothFactor: 1.0,
      }).addTo(mapRef.current!);
      
      // Bring main line to front
      polyline.bringToFront();

      // Enhanced popup
      const popupContent = `
        <div style="padding: 8px; min-width: 150px;">
          <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px; color: #1f2937;">
            ${route.title}
          </h3>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            ${route.points.length} punti
          </p>
        </div>
      `;
      polyline.bindPopup(popupContent, {
        className: 'custom-popup',
        closeButton: true,
        autoClose: false,
        autoPan: true,
      });

      routesRef.current.push(polyline, shadow);

      // Add start marker
      if (routePoints.length > 0) {
        const startIcon = L.divIcon({
          className: 'custom-start-marker',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background: ${routeColor};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            "></div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const startMarker = L.marker([routePoints[0][0], routePoints[0][1]], {
          icon: startIcon,
        }).addTo(mapRef.current!);
        markersRef.current.push(startMarker);
      }

      // Add end marker
      if (routePoints.length > 1) {
        const endIcon = L.divIcon({
          className: 'custom-end-marker',
          html: `
            <div style="
              width: 20px;
              height: 20px;
              background: ${routeColor};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const endMarker = L.marker(
          [routePoints[routePoints.length - 1][0], routePoints[routePoints.length - 1][1]],
          { icon: endIcon }
        ).addTo(mapRef.current!);
        markersRef.current.push(endMarker);
      }

      // Extend bounds
      routePoints.forEach(point => {
        bounds.extend([point[0], point[1]]);
        hasValidBounds = true;
      });
    });

    // Fit bounds with padding
    if (hasValidBounds && routes.length > 0) {
      mapRef.current.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: routes.length === 1 ? 14 : 12,
      });
    } else if (routes.length === 0 && center) {
      mapRef.current.setView(center, 10);
    }
  }, [routes, isLoading, center]);

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Caricamento mappa...</p>
          </div>
        </div>
      )}

      {/* Map container with improved styling */}
      <div 
        ref={mapContainerRef}
        className="w-full h-full rounded-lg overflow-hidden border border-gray-200 shadow-sm"
        style={{ 
          height,
          minHeight: '200px',
        }}
      />
      
      {/* Custom CSS for popups */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-start-marker,
        .custom-end-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #374151 !important;
          border: 1px solid #e5e7eb !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #f9fafb !important;
          color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
}
