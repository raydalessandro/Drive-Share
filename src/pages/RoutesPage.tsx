import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MapView from '@/components/MapView';
import GPXUploader from '@/components/GPXUploader';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Upload, Download } from 'lucide-react';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    const { data } = await supabase
      .from('routes')
      .select('*, profiles:user_id (username, display_name)')
      .order('created_at', { ascending: false });
    
    if (data) setRoutes(data);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Map className="h-8 w-8" />
            Percorsi
          </h1>
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
            <CardTitle>Mappa Percorsi</CardTitle>
          </CardHeader>
          <CardContent>
            <MapView
              routes={selectedRoute ? [selectedRoute] : routes}
              height="500px"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <Card 
              key={route.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRoute(route)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{route.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  di {route.profiles?.display_name || 'Anonimo'}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-2">{route.description}</p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>KM {route.distance_km?.toFixed(1) || 0}</span>
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {routes.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Nessun percorso ancora. Sii il primo a condividerne uno!
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
