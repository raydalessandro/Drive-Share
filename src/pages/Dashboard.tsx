import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from '@/integrations/supabase/client';
import MainLayout from "@/components/layout/MainLayout";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Map, 
  Users, 
  Calendar, 
  ArrowRight, 
  Heart, 
  MessageCircle, 
  Share2,
  Navigation,
  Plus,
  Gauge,
  MapPin,
  Sun,
  Timer,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const profile = useAuthStore((s) => s.profile);
  const navigate = useNavigate();
  
  const [publicPosts, setPublicPosts] = useState<any[]>([]);
  const [monthlyKm, setMonthlyKm] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carica feed pubblico
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (username, avatar_url),
          routes:route_id (title, description, distance_km)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (posts) setPublicPosts(posts);

      // Calcola KM del mese
      const { data: myRoutes } = await supabase
        .from('routes')
        .select('distance_km')
        .eq('user_id', profile?.id);
      
      if (myRoutes) {
        const totalKm = myRoutes.reduce((acc, route) => 
          acc + (route.distance_km || 0), 0
        );
        setMonthlyKm(Math.round(totalKm));
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* HEADER HERO SEMPLIFICATO */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 rounded-lg text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Ciao {profile?.username || 'Rider'}! 🏍️
              </h1>
              <p className="opacity-90">
                Pronti per il prossimo giro? Scopri nuovi percorsi dalla community.
              </p>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-red-600 hover:bg-gray-100"
              onClick={() => navigate('/routes')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Carica GPX
            </Button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">KM questo mese</p>
                  <p className="text-2xl font-bold">{monthlyKm}</p>
                </div>
                <Navigation className="h-8 w-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Percorsi</p>
                  <p className="text-2xl font-bold">7</p>
                </div>
                <Map className="h-8 w-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Amici</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Users className="h-8 w-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Eventi</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Calendar className="h-8 w-8 text-red-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FEED E SIDEBAR */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* FEED PRINCIPALE */}
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ultimi percorsi condivisi</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/explore')}>
                  Vedi tutti <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-center text-muted-foreground py-4">
                    Caricamento...
                  </p>
                ) : publicPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Nessun percorso condiviso ancora
                    </p>
                  </div>
                ) : (
                  publicPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      {/* Post header */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar
                          src={post.profiles?.avatar_url}
                          fallback={post.profiles?.username?.[0] || 'U'}
                          size={40}
                        />
                        <div className="flex-1">
                          <p className="font-semibold">
                            {post.profiles?.username || 'Rider'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                      </div>

                      {/* Post content */}
                      <p className="text-sm mb-3">{post.content || 'Ha condiviso un percorso'}</p>

                      {/* Route details */}
                      {post.routes && (
                        <div className="bg-muted rounded-lg p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">
                                {post.routes.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {post.routes.distance_km?.toFixed(1) || 0} km
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Map className="h-4 w-4 mr-1" />
                              Vedi
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Post actions */}
                      <div className="flex gap-4 pt-3 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes || 0}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Commenta
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-1" />
                          Condividi
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-4">
            {/* Prossimi eventi */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prossimi eventi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">Raduno Lago di Garda</p>
                      <p className="text-xs text-muted-foreground">Dom 15 Dic • 23 riders</p>
                    </div>
                    <Badge variant="secondary">In 3gg</Badge>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">Tour Dolomiti</p>
                      <p className="text-xs text-muted-foreground">Sab 21 Dic • 15 riders</p>
                    </div>
                    <Badge variant="secondary">In 1 sett</Badge>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" size="sm">
                  Vedi tutti gli eventi
                </Button>
              </CardContent>
            </Card>

            {/* Top Riders */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Riders del mese</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Marco R.', km: 1250 },
                    { name: 'Laura B.', km: 980 },
                    { name: 'Giuseppe M.', km: 875 }
                  ].map((rider, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-muted-foreground">
                          {i + 1}.
                        </span>
                        <span className="text-sm font-medium">{rider.name}</span>
                      </div>
                      <Badge variant="outline">{rider.km} km</Badge>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-3" 
                  size="sm"
                  onClick={() => navigate('/feed')}
                >
                  Vai al Feed
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
