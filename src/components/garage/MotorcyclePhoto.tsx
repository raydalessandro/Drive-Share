import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/stores/authStore";
import { Camera, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MotorcyclePhotoProps {
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function MotorcyclePhoto({ 
  photoUrl, 
  onPhotoChange,
  className 
}: MotorcyclePhotoProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Errore",
        description: "Formato non supportato. Usa JPG, PNG o WEBP",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Errore",
        description: "File troppo grande. Massimo 5MB",
        variant: "destructive",
      });
      return;
    }

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    // Upload
    await uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    if (!user) {
      toast({
        title: "Errore",
        description: "Utente non autenticato",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Delete old photo if exists
      if (photoUrl) {
        try {
          // Extract path from URL - handle both full URLs and paths
          let oldPath = photoUrl;
          if (photoUrl.startsWith('http')) {
            // Extract path from Supabase storage URL
            // URL format: https://[project].supabase.co/storage/v1/object/public/motorcycles/[path]
            const urlParts = photoUrl.split('/motorcycles/');
            if (urlParts.length > 1) {
              oldPath = urlParts[1];
            } else {
              // Fallback: try to extract from end of URL
              const pathParts = photoUrl.split('/').slice(-2);
              oldPath = pathParts.join('/');
            }
          }
          
          if (oldPath && oldPath !== photoUrl) {
            const { error: deleteError } = await supabase.storage
              .from('motorcycles')
              .remove([oldPath]);
            
            if (deleteError) {
              console.warn('Error deleting old photo:', deleteError);
              // Continue anyway - not critical
            }
          }
        } catch (deleteErr) {
          console.warn('Error during old photo cleanup:', deleteErr);
          // Continue anyway
        }
      }

      // Upload new photo
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('motorcycles')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('motorcycles')
        .getPublicUrl(fileName);

      onPhotoChange(publicUrl);
      
      toast({
        title: "Successo!",
        description: "Foto moto caricata con successo",
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Errore",
        description: error.message || "Errore nel caricamento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    }
  };

  const handleRemove = async () => {
    if (!photoUrl || !user) return;

    try {
      // Extract path from URL
      let path = photoUrl;
      if (photoUrl.startsWith('http')) {
        const urlParts = photoUrl.split('/motorcycles/');
        if (urlParts.length > 1) {
          path = urlParts[1];
        } else {
          // Fallback
          const pathParts = photoUrl.split('/').slice(-2);
          path = pathParts.join('/');
        }
      }
      
      const { error } = await supabase.storage
        .from('motorcycles')
        .remove([path]);
      
      if (error) throw error;
      
      onPhotoChange(null);
      toast({
        title: "Foto rimossa",
        description: "La foto è stata eliminata",
      });
    } catch (error: any) {
      console.error('Error removing photo:', error);
      toast({
        title: "Errore",
        description: error.message || "Errore nella rimozione",
        variant: "destructive",
      });
    }
  };

  const displayUrl = preview || photoUrl;

  return (
    <div className={cn("relative group", className)}>
      <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300">
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
              alt="Moto"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nessuna foto</p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        {displayUrl && !uploading && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleRemove}
            className="shadow-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="shadow-lg"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}



