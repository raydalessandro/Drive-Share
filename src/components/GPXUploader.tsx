import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface GPXUploaderProps {
  onUploadComplete?: (route: any) => void;
}

export default function GPXUploader({ onUploadComplete }: GPXUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const parseGPX = async (file: File): Promise<any> => {
    const text = await file.text();
    const parser = new DOMParser();
    const gpx = parser.parseFromString(text, 'text/xml');
    
    const trackPoints = gpx.querySelectorAll('trkpt');
    const points: Array<{ lat: number; lng: number }> = [];
    
    trackPoints.forEach(point => {
      const lat = parseFloat(point.getAttribute('lat') || '0');
      const lng = parseFloat(point.getAttribute('lon') || '0');
      points.push({ lat, lng });
    });

    // Calculate distance (simplified)
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
      const R = 6371; // Earth radius in km
      const dLat = (points[i].lat - points[i-1].lat) * Math.PI / 180;
      const dLon = (points[i].lng - points[i-1].lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(points[i-1].lat * Math.PI / 180) * 
                Math.cos(points[i].lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distance += R * c;
    }

    return { points, distance };
  };

  const handleUpload = async () => {
    if (!file || !title) {
      toast({
        title: "Errore",
        description: "Inserisci titolo e file GPX",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Parse GPX
      const { points, distance } = await parseGPX(file);

      // Upload file to storage
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('gpx-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gpx-files')
        .getPublicUrl(fileName);

      // Save route to database
      const { data: authData } = await supabase.auth.getSession();
      const user = authData?.session?.user;
      
      const { data: route, error: dbError } = await supabase
        .from('routes')
        .insert({
          user_id: user?.id,
          title,
          description,
          gpx_url: publicUrl,
          distance_km: distance,
          points: { coordinates: points }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Successo!",
        description: "Percorso caricato con successo"
      });

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      
      if (onUploadComplete) onUploadComplete(route);

    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <Label htmlFor="title">Titolo percorso *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="es. Giro del Lago di Como"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrivi il percorso, difficoltà, punti di interesse..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="gpx">File GPX *</Label>
        <Input
          id="gpx"
          type="file"
          accept=".gpx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <Button 
        onClick={handleUpload} 
        disabled={uploading}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? 'Caricamento...' : 'Carica percorso'}
      </Button>
    </div>
  );
}
