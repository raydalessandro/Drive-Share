import { useEffect, useRef } from 'react';
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
}

export default function MapView({ 
  routes = [], 
  height = '400px',
  center = [45.4642, 9.1900] // Milano default
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Fix Leaflet icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView(center, 10);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center]);

  // Update routes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing routes
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Polyline) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add new routes
    routes.forEach(route => {
      if (route.points.length > 0) {
        const polyline = L.polyline(
          route.points.map(p => [p.lat, p.lng]),
          { color: route.color || 'red', weight: 3 }
        ).addTo(mapRef.current!);
        
        polyline.bindPopup(route.title);
        
        if (routes.length === 1) {
          mapRef.current?.fitBounds(polyline.getBounds());
        }
      }
    });
  }, [routes]);

  return (
    <div 
      ref={mapContainerRef}
      className="w-full rounded-lg shadow-md" 
      style={{ height }}
    />
  );
}
