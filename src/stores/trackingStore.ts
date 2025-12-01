import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';
import { toast } from '@/hooks/use-toast';

export interface TrackPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number; // km/h
  accuracy?: number;
  photoUrl?: string;
  note?: string;
}

export interface TrackedRoute {
  id?: string;
  title: string;
  description?: string;
  points: TrackPoint[];
  distanceKm: number;
  durationSeconds: number;
  averageSpeedKmh: number;
  maxSpeedKmh: number;
  createdAt: string;
}

interface TrackingState {
  isTracking: boolean;
  isPaused: boolean;
  watchId: number | null;
  currentPosition: { lat: number; lng: number } | null;
  points: TrackPoint[];
  startTime: number | null;
  pauseTime: number | null;
  totalPausedTime: number; // seconds
  distanceKm: number;
  currentSpeed: number; // km/h
  maxSpeed: number; // km/h
  
  // Actions
  startTracking: () => Promise<void>;
  pauseTracking: () => void;
  resumeTracking: () => Promise<void>;
  stopTracking: () => void;
  addPoint: (point: TrackPoint) => void;
  updatePoint: (index: number, updates: Partial<TrackPoint>) => void;
  saveRoute: (title: string, description?: string) => Promise<string | null>;
  exportGPX: (route: TrackedRoute) => string;
  reset: () => void;
}

const calculateDistance = (point1: TrackPoint, point2: TrackPoint): number => {
  const R = 6371; // Earth radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useTrackingStore = create<TrackingState>((set, get) => ({
  isTracking: false,
  isPaused: false,
  watchId: null,
  currentPosition: null,
  points: [],
  startTime: null,
  pauseTime: null,
  totalPausedTime: 0,
  distanceKm: 0,
  currentSpeed: 0,
  maxSpeed: 0,

  startTracking: async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Errore",
        description: "Il tuo browser non supporta la geolocalizzazione",
        variant: "destructive",
      });
      return;
    }

    try {
      // Request permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed, accuracy } = position.coords;
          const speedKmh = speed ? (speed * 3.6) : 0; // m/s to km/h
          
          const point: TrackPoint = {
            lat: latitude,
            lng: longitude,
            timestamp: Date.now(),
            speed: speedKmh,
            accuracy: accuracy || undefined,
          };

          const state = get();
          if (state.points.length > 0) {
            const lastPoint = state.points[state.points.length - 1];
            const distance = calculateDistance(lastPoint, point);
            set({
              distanceKm: state.distanceKm + distance,
              currentSpeed: speedKmh,
              maxSpeed: Math.max(state.maxSpeed, speedKmh),
            });
          }

          set({
            currentPosition: { lat: latitude, lng: longitude },
            points: [...state.points, point],
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Errore GPS",
            description: "Impossibile ottenere la posizione. Verifica i permessi.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000,
        }
      );

      set({
        isTracking: true,
        isPaused: false,
        watchId,
        startTime: Date.now(),
        pauseTime: null,
        currentPosition: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        points: [{
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
          speed: position.coords.speed ? (position.coords.speed * 3.6) : 0,
          accuracy: position.coords.accuracy || undefined,
        }],
      });

      toast({
        title: "Tracking avviato",
        description: "Il percorso viene tracciato in tempo reale",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile avviare il tracking",
        variant: "destructive",
      });
    }
  },

  pauseTracking: () => {
    const state = get();
    if (!state.isTracking || state.isPaused) return;

    if (state.watchId !== null) {
      navigator.geolocation.clearWatch(state.watchId);
    }

    set({
      isPaused: true,
      pauseTime: Date.now(),
      watchId: null,
    });
  },

  resumeTracking: async () => {
    const state = get();
    if (!state.isTracking || !state.isPaused) return;

    // Add paused time to total
    if (state.pauseTime) {
      const pausedDuration = (Date.now() - state.pauseTime) / 1000;
      set({ totalPausedTime: state.totalPausedTime + pausedDuration });
    }

    // Restart tracking
    const currentPoints = state.points;
    const currentDistance = state.distanceKm;
    const currentMaxSpeed = state.maxSpeed;

    if (!navigator.geolocation) {
      toast({
        title: "Errore",
        description: "Il tuo browser non supporta la geolocalizzazione",
        variant: "destructive",
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed, accuracy } = position.coords;
          const speedKmh = speed ? (speed * 3.6) : 0;
          
          const point: TrackPoint = {
            lat: latitude,
            lng: longitude,
            timestamp: Date.now(),
            speed: speedKmh,
            accuracy: accuracy || undefined,
          };

          const state = get();
          if (state.points.length > 0) {
            const lastPoint = state.points[state.points.length - 1];
            const distance = calculateDistance(lastPoint, point);
            set({
              distanceKm: state.distanceKm + distance,
              currentSpeed: speedKmh,
              maxSpeed: Math.max(state.maxSpeed, speedKmh),
            });
          }

          set({
            currentPosition: { lat: latitude, lng: longitude },
            points: [...state.points, point],
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            title: "Errore GPS",
            description: "Impossibile ottenere la posizione. Verifica i permessi.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 1000,
        }
      );

      set({
        isPaused: false,
        watchId,
        pauseTime: null,
        points: currentPoints,
        distanceKm: currentDistance,
        maxSpeed: currentMaxSpeed,
      });

      toast({
        title: "Tracking ripreso",
        description: "Il percorso viene tracciato di nuovo",
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile riprendere il tracking",
        variant: "destructive",
      });
    }
  },

  stopTracking: () => {
    const state = get();
    if (state.watchId !== null) {
      navigator.geolocation.clearWatch(state.watchId);
    }

    set({
      isTracking: false,
      isPaused: false,
      watchId: null,
    });
  },

  addPoint: (point) => {
    set((state) => ({
      points: [...state.points, point],
    }));
  },

  updatePoint: (index, updates) => {
    set((state) => {
      const newPoints = [...state.points];
      if (newPoints[index]) {
        newPoints[index] = { ...newPoints[index], ...updates };
      }
      return { points: newPoints };
    });
  },

  saveRoute: async (title: string, description?: string) => {
    const state = get();
    const user = useAuthStore.getState().user;

    if (!user) {
      toast({
        title: "Errore",
        description: "Utente non autenticato",
        variant: "destructive",
      });
      return null;
    }

    if (state.points.length < 2) {
      toast({
        title: "Errore",
        description: "Il percorso deve avere almeno 2 punti",
        variant: "destructive",
      });
      return null;
    }

    try {
      const duration = state.startTime 
        ? (Date.now() - state.startTime - state.totalPausedTime * 1000) / 1000
        : 0;
      
      const averageSpeed = duration > 0 
        ? (state.distanceKm / duration) * 3600 
        : 0;

      // Convert points to format expected by database
      const coordinates = state.points.map(p => ({
        lat: p.lat,
        lng: p.lng,
      }));

      // Prepare metadata with photos and notes
      const metadata = {
        points: state.points.map(p => ({
          lat: p.lat,
          lng: p.lng,
          timestamp: p.timestamp,
          photoUrl: p.photoUrl,
          note: p.note,
        })),
        duration: duration,
        averageSpeed: averageSpeed,
        maxSpeed: state.maxSpeed,
      };

      // Combine description with metadata
      const fullDescription = description 
        ? `${description}\n\n[METADATA:${JSON.stringify(metadata)}]`
        : `[METADATA:${JSON.stringify(metadata)}]`;

      const { data: route, error } = await supabase
        .from('routes')
        .insert({
          user_id: user.id,
          title,
          description: fullDescription,
          distance_km: state.distanceKm,
          points: { coordinates },
          visibility: 'private',
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Percorso salvato!",
        description: "Il tuo percorso è stato salvato con successo",
      });

      get().reset();
      return route.id;
    } catch (error: any) {
      console.error("Error saving route:", error);
      toast({
        title: "Errore",
        description: error.message || "Impossibile salvare il percorso",
        variant: "destructive",
      });
      return null;
    }
  },

  exportGPX: (route: TrackedRoute) => {
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Drive Share" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${route.title}</name>
    <desc>${route.description || ''}</desc>
    <time>${new Date(route.createdAt).toISOString()}</time>
  </metadata>
  <trk>
    <name>${route.title}</name>
    <desc>${route.description || ''}</desc>
    <trkseg>
`;

    route.points.forEach((point) => {
      gpx += `      <trkpt lat="${point.lat}" lon="${point.lng}">
        <time>${new Date(point.timestamp).toISOString()}</time>
        ${point.speed ? `<extensions><speed>${point.speed}</speed></extensions>` : ''}
        ${point.note ? `<cmt>${point.note}</cmt>` : ''}
      </trkpt>\n`;
    });

    gpx += `    </trkseg>
  </trk>
`;

    // Add waypoints for points with photos/notes
    route.points.forEach((point, index) => {
      if (point.photoUrl || point.note) {
        gpx += `  <wpt lat="${point.lat}" lon="${point.lng}">
    <name>Punto ${index + 1}</name>
    ${point.note ? `<desc>${point.note}</desc>` : ''}
    ${point.photoUrl ? `<link href="${point.photoUrl}">Foto</link>` : ''}
  </wpt>\n`;
      }
    });

    gpx += `</gpx>`;
    return gpx;
  },

  reset: () => {
    const state = get();
    if (state.watchId !== null) {
      navigator.geolocation.clearWatch(state.watchId);
    }
    set({
      isTracking: false,
      isPaused: false,
      watchId: null,
      currentPosition: null,
      points: [],
      startTime: null,
      pauseTime: null,
      totalPausedTime: 0,
      distanceKm: 0,
      currentSpeed: 0,
      maxSpeed: 0,
    });
  },
}));

