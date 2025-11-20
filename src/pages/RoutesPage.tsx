import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MapView from '@/components/MapView';
import GPXUploader from '@/components/GPXUploader';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, Upload, Download, Globe, Lock, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadMyRoutes();
  }, []);

  const loadMyRoutes = async () => {
    const { data: authData } = await supabase.auth.getSession();
    const userId = authData?.session?.user?.id;
    
    if (!userId) return;
    
    const { data } = await supabase
      .from('routes')
      .select('*')
      .eq('user_id', userId) // SOLO I MIEI PERCORSI
      .order('created_at', { ascending: false });
    
    if (data) setRoutes(data);
  };

  const publishRoute = async (route: any) => {
    try {
      // Aggiorna route come pubblicata
      const { error: routeError } = await supabase
        .from('routes')
        .update({ 
          visibility: 'public',
          is_published: true 
        })
        .eq('id', route.id);

      if (routeError) throw routeError;

      // Crea post nel feed
      const { data: authData } = await supabase.auth.getSession();
      const userId = authData?.session?.user?.id;
      
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: userId,
          type: 'route',
          route_id: route.id,
          content: `Ho condiviso un nuovo percorso: ${route.title}`,
          visibility: 'public'
        });

      if (postError) throw postError;

      toast({
        title: "Percorso pubblicato!",
        description: "Il tuo percorso è ora visibile a tutti",
      });

      // Ricarica la lista
      loadMyRoutes();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const unpublishRoute = async (route: any) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({ 
          visibility: 'private',
          is_published: false 
        })
        .eq('id', route.id);

      if (error) throw error;

      // Rimuovi dal feed
      await supabase
        .from('posts')
        .delete()
        .eq('route_id', route.id);

      toast({
        title: "Percorso rimosso dal feed",
        description: "Il percorso è ora privato",
      });

      loadMyRoutes();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Lock className="h-8 w-8" />
              I miei percorsi
            </h1>
            <p className="text-muted-foreground mt-1">
              Area privata - solo tu puoi vedere questi percorsi
            </p>
          </div>
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="mr-2 h-4 w-4" />
            Carica GPX
          </Button>
        </div>

        {showUpload && (
          <Card>
            <CardHeader>
              <CardTitle>Nuovo Percorso</CardTitle>
            </CardHeader>
            <CardContent>
              <GPXUploader onUploadComplete={(route) => {
                setRoutes([route, ...routes]);
                setShowUpload(false);
              }} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Anteprima Mappa</CardTitle>
          </CardHeader>
          <CardContent>
            <MapView
              routes={selectedRoute ? [selectedRoute] : routes}
              height="400px"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <Card key={route.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg flex-1">{route.title}</CardTitle>
                  <Badge variant={route.is_published ? "default" : "secondary"}>
                    {route.is_published ? (
                      <><Globe className="h-3 w-3 mr-1" /> Pubblico</>
                    ) : (
                      <><Lock className="h-3 w-3 mr-1" /> Privato</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {route.description || 'Nessuna descrizione'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>KM {route.distance_km?.toFixed(1) || 0}</span>
                  <span>{new Date(route.created_at).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedRoute(route)}
                  >
                    <Map className="h-4 w-4 mr-1" />
                    Mappa
                  </Button>
                  
                  {route.is_published ? (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => unpublishRoute(route)}
                    >
                      <Lock className="h-4 w-4 mr-1" />
                      Rendi privato
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      className="flex-1"
                      onClick={() => publishRoute(route)}
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Pubblica
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {routes.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Nessun percorso ancora</p>
              <p className="text-sm">Carica il tuo primo file GPX per iniziare</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
                  }
