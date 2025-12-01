import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Download } from 'lucide-react';
import { useTrackingStore, TrackedRoute } from '@/stores/trackingStore';
import MapView from '@/components/MapView';

interface SaveRouteDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (routeId: string) => void;
}

export function SaveRouteDialog({ open, onClose, onSaved }: SaveRouteDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const { 
    points, 
    distanceKm, 
    startTime, 
    totalPausedTime,
    maxSpeed,
    saveRoute,
    exportGPX,
    reset 
  } = useTrackingStore();

  const duration = startTime 
    ? (Date.now() - startTime - totalPausedTime * 1000) / 1000
    : 0;
  const averageSpeed = duration > 0 ? (distanceKm / duration) * 3600 : 0;

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setSaving(true);
    try {
      const routeId = await saveRoute(title, description);
      if (routeId) {
        onSaved(routeId);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleExportGPX = () => {
    const route: TrackedRoute = {
      title: title || 'Percorso senza titolo',
      description,
      points,
      distanceKm,
      durationSeconds: duration,
      averageSpeedKmh: averageSpeed,
      maxSpeedKmh: maxSpeed,
      createdAt: new Date().toISOString(),
    };

    const gpxContent = exportGPX(route);
    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'percorso'}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Prepare map route for preview
  const mapRoute = points.length > 0 ? [{
    id: 'preview-track',
    title: title || 'Percorso',
    points: points.map(p => ({ lat: p.lat, lng: p.lng })),
    color: '#ef4444',
  }] : [];

  const mapCenter = points.length > 0 
    ? [points[Math.floor(points.length / 2)].lat, points[Math.floor(points.length / 2)].lng] as [number, number]
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Salva Percorso</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Map Preview */}
          {points.length > 0 && (
            <div className="space-y-2">
              <Label>Anteprima Percorso</Label>
              <div className="rounded-lg overflow-hidden border">
                <MapView
                  routes={mapRoute}
                  height="300px"
                  center={mapCenter}
                  zoom={13}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {points.length} punti tracciati • {distanceKm.toFixed(2)} km
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Distanza</p>
              <p className="font-bold">{distanceKm.toFixed(2)} km</p>
            </div>
            <div>
              <p className="text-muted-foreground">Durata</p>
              <p className="font-bold">
                {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Velocità Media</p>
              <p className="font-bold">{averageSpeed.toFixed(1)} km/h</p>
            </div>
            <div>
              <p className="text-muted-foreground">Velocità Max</p>
              <p className="font-bold">{maxSpeed.toFixed(1)} km/h</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-2">
            <Label htmlFor="title">Titolo *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Giro del Lago di Garda"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Aggiungi una descrizione..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleExportGPX} disabled={!title.trim()}>
            <Download className="h-4 w-4 mr-2" />
            Esporta GPX
          </Button>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? 'Salvataggio...' : 'Salva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

