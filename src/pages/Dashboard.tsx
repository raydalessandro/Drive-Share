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
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2,
  Navigation,
  Plus,
  Gauge,
  MapPin,
  Sun,
  Activity,
  Timer
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const profile = useAuthStore((s) => s.profile);
  const navigate = useNavigate();
  
  const [publicPosts, setPublicPosts] = useState<any[]>([]);
  const [monthlyKm, setMonthlyKm] = useState(0);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({ temp: 18, condition: "☀️ Soleggiato" });

  useEffect(() => {
    if (profile) {
      loadDashboardData();
    }
  }, [profile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (username, display_name, avatar_url, bike_model),
          routes:route_id (title, description, distance_km, difficulty)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (posts) setPublicPosts(posts);

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

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'medium': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'hard': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-zinc-500/20 text-zinc-500 border-zinc-500/30';
    }
  };

  if (!profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse">
            <Gauge className="h-12 w-12 text-red-600 animate-spin" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* HERO SECTION EPICA */}
        <div className="relative overflow-hidden rounded-2xl">
          {/* Background animato */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-orange-500 to-red-700">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-400 rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-400 rounded-full blur-3xl opacity-20 animate-pulse animation-delay-2000" />
          </div>
          
          {/* Contenuto */}
          <div className="relative p-8">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Pronti a partire, {profile.displayName || profile.username}?
                  </h1>
                  <p className="text-xl text-white/90">
                    {weather.condition} • {weather.temp}°C • Perfetto per un giro! 🏍️
                  </p>
                </div>
                
                {/* Quick stats nel hero */}
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Road className="h-5 w-5 text-white/70" />
                    <span className="text-white font-semibold">{monthlyKm} km questo mese</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-white/70" />
                    <span className="text-white font-semibold">24 riders online</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="lg" 
                  className="bg-white text-red-600 hover:bg-white/90"
                  onClick={() => navigate('/routes')}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nuovo Percorso
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* STATS CARDS TEMATICHE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-red-900/20 bg-zinc-900/50 hover:bg-zinc-900/70 transition-all hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Chilometri</p>
                  <p className="text-3xl font-bold text-white">{monthlyKm}</p>
                  <p className="text-xs text-green-500 mt-1">↑ 12% vs mese scorso</p>
                </div>
                <div className="p-3 bg-red-600/10 rounded-lg">
                  <Gauge className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-900/20 bg-zinc-900/50 hover:bg-zinc-900/70 transition-all hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Percorsi</p>
                  <p className="text-3xl font-bold text-white">7</p>
                  <p className="text-xs text-orange-500 mt-1">3 condivisi</p>
                </div>
                <div className="p-3 bg-orange-600/10 rounded-lg">
                  <Map className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-900/20 bg-zinc-900/50 hover:bg-zinc-900/70 transition-all hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Ore in sella</p>
                  <p className="text-3xl font-bold text-white">42</p>
                  <p className="text-xs text-blue-500 mt-1">Tempo totale</p>
                </div>
                <div className="p-3 bg-blue-600/10 rounded-lg">
                  <Timer className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-900/20 bg-zinc-900/50 hover:bg-zinc-900/70 transition-all hover:scale-105">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Gruppo</p>
                  <p className="text-3xl font-bold text-white">24</p>
                  <p className="text-xs text-green-500 mt-1">Riders connessi</p>
                </div>
                <div className="p-3 bg-green-600/10 rounded-lg">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PERCORSO CONSIGLIATO DEL GIORNO */}
        <Card className="border-red-600/20 bg-gradient-to-r from-zinc-900 to-zinc-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sunrise className="h-5 w-5 text-orange-500" />
                <CardTitle>Percorso del Giorno</CardTitle>
              </div>
              <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                Consigliato
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Passo dello Stelvio</h3>
                <p className="text-sm text-zinc-400 mb-2">48 tornanti di pura adrenalina</p>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Road className="h-3 w-3" /> 115 km
                  </span>
                  <span className="flex items-center gap-1">
                    <Mountain className="h-3 w-3" /> 2.757m altitudine
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3" /> 3h 30min
                  </span>
                </div>
              </div>
              <Button variant="outline" className="border-orange-500/30 hover:bg-orange-500/10">
                Esplora →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FEED E SIDEBAR */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* FEED PRINCIPALE */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Dal tuo gruppo riders</CardTitle>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => navigate('/explore')}>
                  Esplora tutti <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-pulse flex items-center gap-2">
                      <Navigation className="h-5 w-5 text-red-600 animate-spin" />
                      <span className="text-zinc-500">Caricamento percorsi...</span>
                    </div>
                  </div>
                ) : publicPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <Road className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-500">Nessun percorso condiviso ancora</p>
                    <p className="text-zinc-600 text-sm">Sii il primo a condividere un'avventura!</p>
                  </div>
                ) : (
                  publicPosts.map((post) => (
                    <div key={post.id} className="border border-zinc-800 rounded-xl p-4 hover:border-red-900/30 transition-all">
                      {/* Post header */}
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar
                          src={post.profiles?.avatar_url}
                          fallback={post.profiles?.username?.[0] || 'R'}
                          size={40}
                          className="ring-2 ring-red-600/20"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white">
                              {post.profiles?.display_name || post.profiles?.username}
                            </p>
                            {post.profiles?.bike_model && (
                              <Badge variant="outline" className="text-xs border-zinc-700">
                                {post.profiles.bike_model}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">
                            {new Date(post.created_at).toLocaleDateString('it-IT')} • {new Date(post.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Post content */}
                      <p className="text-sm text-zinc-300 mb-3">{post.content}</p>

                      {/* Route card */}
                      {post.routes && (
                        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-lg p-4 mb-3 border border-zinc-700">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-semibold text-white flex items-center gap-2">
                                {post.routes.title}
                                {post.routes.difficulty && (
                                  <Badge className={`text-xs ${getDifficultyColor(post.routes.difficulty)}`}>
                                    {post.routes.difficulty === 'easy' ? 'Facile' : 
                                     post.routes.difficulty === 'medium' ? 'Media' : 'Difficile'}
                                  </Badge>
                                )}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-zinc-400">
                                <span className="flex items-center gap-1">
                                  <Road className="h-3 w-3" />
                                  {post.routes.distance_km?.toFixed(1)} km
                                </span>
                                <span className="flex items-center gap-1">
                                  <Fuel className="h-3 w-3" />
                                  ~{(post.routes.distance_km * 0.04).toFixed(1)}L
                                </span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-red-900/30 hover:bg-red-900/10">
                              <Map className="h-4 w-4 mr-1" />
                              Visualizza
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Post actions */}
                      <div className="flex gap-1 pt-3 border-t border-zinc-800">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="flex-1 hover:bg-red-900/10 hover:text-red-500"
                          onClick={() => console.log('Like')}
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes || 0}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="flex-1 hover:bg-blue-900/10 hover:text-blue-500"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Commenta
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="flex-1 hover:bg-green-900/10 hover:text-green-500"
                        >
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

          {/* SIDEBAR SUPER TEMATICA */}
          <div className="space-y-4">
            {/* Meteo Riders */}
            <Card className="border-blue-900/20 bg-gradient-to-br from-blue-950/20 to-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  ☀️ Meteo Riders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Oggi</span>
                    <span className="text-sm font-semibold">☀️ 22°C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Domani</span>
                    <span className="text-sm font-semibold">⛅ 19°C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Weekend</span>
                    <span className="text-sm font-semibold">☀️ 24°C</span>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-green-500/10 rounded text-xs text-green-500 text-center">
                  Condizioni perfette per uscire! 🏍️
                </div>
              </CardContent>
            </Card>

            {/* Prossimi raduni */}
            <Card className="border-orange-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Prossimi Raduni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm">Lago di Garda Tour</p>
                      <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-xs">
                        HOT
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">Domenica 15 Dic • 14:00</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="w-6 h-6 bg-zinc-700 rounded-full border-2 border-zinc-900" />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-400">+20 riders</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-sm">Dolomiti Experience</p>
                      <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-xs">
                        Epic
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">Sabato 21 Dic • 09:00</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2].map(i => (
                          <div key={i} className="w-6 h-6 bg-zinc-700 rounded-full border-2 border-zinc-900" />
                        ))}
                      </div>
                      <span className="text-xs text-zinc-400">+12 riders</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full border-orange-900/30 hover:bg-orange-900/10" size="sm">
                  Calendario completo →
                </Button>
              </CardContent>
            </Card>

            {/* Top Riders con medaglie */}
            <Card className="border-yellow-900/20 bg-gradient-to-br from-yellow-950/10 to-zinc-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  🏆 Top Riders - Novembre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Marco R.', km: 1250, bike: 'BMW R1250GS', medal: '🥇' },
                    { name: 'Laura B.', km: 980, bike: 'Ducati Monster', medal: '🥈' },
                    { name: 'Giuseppe M.', km: 875, bike: 'Honda Africa', medal: '🥉' }
                  ].map((rider, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-zinc-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{rider.medal}</span>
                        <div>
                          <p className="text-sm font-medium">{rider.name}</p>
                          <p className="text-xs text-zinc-500">{rider.bike}</p>
                        </div>
                      </div>
                      <Badge className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-600/30">
                        {rider.km} km
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-3 border-yellow-900/30 hover:bg-yellow-900/10" 
                  size="sm"
                  onClick={() => navigate('/leaderboard')}
                >
                  Classifica completa →
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
