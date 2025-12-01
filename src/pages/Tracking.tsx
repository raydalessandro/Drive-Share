import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useTrackingStore } from '@/stores/trackingStore';
import { PauseDialog } from '@/components/tracking/PauseDialog';
import { SaveRouteDialog } from '@/components/tracking/SaveRouteDialog';
import MapView from '@/components/MapView';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Square, Navigation, Gauge, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Tracking() {
  const {
    isTracking,
    isPaused,
    currentPosition,
    points,
    distanceKm,
    currentSpeed,
    maxSpeed,
    startTime,
    totalPausedTime,
    startTracking,
    pauseTracking,
    resumeTracking,
    stopTracking,
    updatePoint,
  } = useTrackingStore();

  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pausePointIndex, setPausePointIndex] = useState(-1);
  const navigate = useNavigate();

  const duration = startTime 
    ? (Date.now() - startTime - totalPausedTime * 1000) / 1000
    : 0;

  const averageSpeed = duration > 0 ? (distanceKm / duration) * 3600 : 0;

  // Convert points to map format
  const mapRoutes = points.length > 0 ? [{
    id: 'current-track',
    title: 'Percorso in corso',
    points: points.map(p => ({ lat: p.lat, lng: p.lng })),
    color: '#ef4444',
  }] : [];

  const handlePause = () => {
    pauseTracking();
    setPausePointIndex(points.length - 1);
    setShowPauseDialog(true);
  };

  const handleResume = () => {
    resumeTracking();
    setShowPauseDialog(false);
  };

  const handleSavePoint = (photoUrl: string | null, note: string) => {
    if (pausePointIndex >= 0 && pausePointIndex < points.length) {
      updatePoint(pausePointIndex, { 
        photoUrl: photoUrl || undefined, 
        note: note || undefined 
      });
    }
  };

  const handleStop = () => {
    stopTracking();
    setShowSaveDialog(true);
  };

  const handleSaved = (routeId: string) => {
    navigate('/routes');
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tracking GPS</h1>
            <p className="text-muted-foreground">
              Traccia il tuo percorso in tempo reale
            </p>
          </div>
          <Navigation className="h-8 w-8 text-red-600" />
        </div>

        {/* Map */}
        <Card className="vercel-card">
          <CardContent className="p-0">
            <MapView
              routes={mapRoutes}
              height="400px"
              center={currentPosition ? [currentPosition.lat, currentPosition.lng] : undefined}
              zoom={15}
            />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-4 w-4 text-red-600" />
                <p className="text-sm text-muted-foreground">Distanza</p>
              </div>
              <p className="text-2xl font-bold">{distanceKm.toFixed(2)} km</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <p className="text-sm text-muted-foreground">Tempo</p>
              </div>
              <p className="text-2xl font-bold">
                {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4 text-green-600" />
                <p className="text-sm text-muted-foreground">Velocità</p>
              </div>
              <p className="text-2xl font-bold">{currentSpeed.toFixed(0)} km/h</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge className="h-4 w-4 text-purple-600" />
                <p className="text-sm text-muted-foreground">Media</p>
              </div>
              <p className="text-2xl font-bold">{averageSpeed.toFixed(0)} km/h</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          {!isTracking ? (
            <Button
              size="lg"
              onClick={startTracking}
              className="bg-red-600 hover:bg-red-700"
            >
              <Play className="h-5 w-5 mr-2" />
              Avvia Tracking
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button
                  size="lg"
                  onClick={handleResume}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Riprendi
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePause}
                >
                  <Pause className="h-5 w-5 mr-2" />
                  Pausa
                </Button>
              )}
              <Button
                size="lg"
                variant="destructive"
                onClick={handleStop}
              >
                <Square className="h-5 w-5 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* Info */}
        {points.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{points.length} punti tracciati</span>
                {maxSpeed > 0 && (
                  <>
                    <span>•</span>
                    <span>Max: {maxSpeed.toFixed(0)} km/h</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <PauseDialog
          open={showPauseDialog}
          onClose={() => setShowPauseDialog(false)}
          onSave={handleSavePoint}
          onResume={handleResume}
          pointIndex={pausePointIndex}
        />

        <SaveRouteDialog
          open={showSaveDialog}
          onClose={() => {
            setShowSaveDialog(false);
            if (!isTracking) {
              navigate('/routes');
            }
          }}
          onSaved={handleSaved}
        />
      </div>
    </MainLayout>
  );
}

