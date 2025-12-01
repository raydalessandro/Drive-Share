import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface PauseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (photoUrl: string | null, note: string) => void;
  onResume: () => void;
  pointIndex: number;
}

export function PauseDialog({ open, onClose, onSave, onResume, pointIndex }: PauseDialogProps) {
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((state) => state.user);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('route-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('route-photos')
        .getPublicUrl(fileName);

      setPhotoUrl(publicUrl);
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      // Note: toast will be handled by parent component if needed
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    onSave(photoUrl, note);
    setNote('');
    setPhotoUrl(null);
    onClose();
  };

  const handleResume = () => {
    if (note || photoUrl) {
      handleSave();
    } else {
      onResume();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pausa - Aggiungi Foto o Note</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Photo Upload */}
          <div>
            <Label>Foto (opzionale)</Label>
            <div className="mt-2 space-y-2">
              {photoUrl ? (
                <div className="relative">
                  <img 
                    src={photoUrl} 
                    alt="Route photo" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setPhotoUrl(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {uploading ? 'Caricamento...' : 'Scatta/Upload Foto'}
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="note">Note (opzionale)</Label>
            <Textarea
              id="note"
              placeholder="Aggiungi una nota per questo punto..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          {(note || photoUrl) && (
            <Button variant="outline" onClick={handleSave}>
              Salva e Chiudi
            </Button>
          )}
          <Button onClick={handleResume}>
            Riprendi Tracking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

