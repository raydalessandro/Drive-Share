import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore"; 
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Trophy,
  User,
  LogOut,
  RefreshCcw,
  Map,
  Navigation,
  Gauge,
  MapPin,
  Calendar,
  Home,
  Newspaper
} from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const profile = useAuthStore(state => state.profile);
  const authLogout = useAuthStore(state => state.logout);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const user = useAuthStore(state => state.user);
  const fetchUserProfile = useAuthStore(state => state.fetchUserProfile);
  const isFetchingProfile = useAuthStore(state => state.isFetchingProfile);
  const isInitialized = useAuthStore(state => state.isInitialized);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Aggiorna ora ogni minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isInitialized, navigate]);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      label: "Garage", 
      path: "/garage",
      badge: null
    },
    { 
      icon: <Home className="h-5 w-5" />, 
      label: "Feed", 
      path: "/feed",
      badge: null
    },
    { 
      icon: <Map className="h-5 w-5" />, 
      label: "I Miei Percorsi", 
      path: "/routes",
      badge: null
    },
    { 
      icon: <Navigation className="h-5 w-5" />, 
      label: "Tracking", 
      path: "/tracking",
      badge: null
    },
    { 
      icon: <User className="h-5 w-5" />, 
      label: "Il Mio Profilo", 
      path: "/profile",
      badge: null
    },
  ];

  const handleLogout = async () => {
    await authLogout();
    navigate("/"); 
  };
  
  const handleRefreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  // Stati di caricamento
  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="animate-pulse">
          <div className="text-6xl mb-4">🏍️</div>
          <p className="text-lg text-zinc-400">Accensione motori...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && isFetchingProfile && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="animate-pulse">
          <Navigation className="h-12 w-12 text-red-600 mb-4 animate-spin" />
          <p className="text-lg text-zinc-400">Caricamento dati rider...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && !profile && !isFetchingProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="text-center space-y-4 p-6 vercel-card max-w-md">
          <h2 className="text-xl font-semibold">Profilo Rider Non Trovato</h2>
          <p className="text-muted-foreground">
            Non riesco a caricare i tuoi dati rider.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={handleRefreshProfile} disabled={isFetchingProfile}>
              <RefreshCcw className="w-4 h-4 mr-2" /> 
              {isFetchingProfile ? "Ricarico..." : "Ricarica Profilo"}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Esci
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !profile) {
    return null;
  }

  // Saluto basato sull'ora
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return "🌙 Ride notturno";
    if (hour < 12) return "☀️ Buongiorno rider";
    if (hour < 18) return "🌤️ Buon pomeriggio";
    return "🌅 Buona serata";
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar desktop con effetto speed */}
      <div className="hidden md:flex w-64 flex-col bg-zinc-900/50 border-r border-red-900/20 backdrop-blur-xl">
        {/* Header con logo animato */}
        <div className="h-20 border-b border-red-900/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-600/10 to-transparent animate-pulse" />
          <div className="relative flex items-center justify-center h-full">
            <div className="flex items-center gap-2">
              <div className="text-3xl animate-pulse">🏍️</div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
                  Drive Share
                </h1>
                <p className="text-xs text-zinc-500">Social Riders Network</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats mini */}
        <div className="p-4 border-b border-red-900/20">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-800/50 rounded-lg p-2">
              <Gauge className="h-3 w-3 text-red-500 mb-1" />
              <p className="text-zinc-400">KM Mese</p>
              <p className="font-bold text-white">347</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-2">
              <MapPin className="h-3 w-3 text-orange-500 mb-1" />
              <p className="text-zinc-400">Percorsi</p>
              <p className="font-bold text-white">12</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              className={`justify-between group ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-red-600/20 to-red-600/10 text-red-500 hover:from-red-600/30 hover:to-red-600/20 border border-red-600/30"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
              onClick={() => navigate(item.path)}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </div>
              {item.badge && (
                <Badge className="bg-red-600/20 text-red-500 border-red-600/30">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
          
          <div className="flex-grow" />
          
          {/* Prossimo evento */}
          <div className="bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-lg p-3 border border-red-600/20">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-orange-500" />
              <p className="text-xs font-semibold text-orange-500">Prossimo Raduno</p>
            </div>
            <p className="text-xs text-zinc-300">Lago di Garda Tour</p>
            <p className="text-xs text-zinc-500">Dom 15 Dic • 14:00</p>
          </div>
          
          <Button
            variant="ghost"
            className="justify-start text-zinc-400 hover:text-red-500 hover:bg-red-900/20"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span className="ml-2">Spegni Motori</span>
          </Button>
        </div>

        {/* Profile section con più dettagli */}
        <div className="p-4 border-t border-red-900/20 bg-zinc-900/80">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar
                src={profile.avatarUrl}
                alt={profile.username ? `${profile.username}'s avatar` : "User avatar"}
                size={40}
                userId={profile.id}
                fallback={profile.username || "?"}
                className="ring-2 ring-red-600/30"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                {profile.username}
              </p>
              <p className="text-xs text-zinc-500">{getGreeting()}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navbar bottom con stile moto */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-zinc-900/95 backdrop-blur-xl border-t border-red-900/20 z-50">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="icon"
              className={`relative py-4 ${
                isActive(item.path) 
                  ? "text-red-500" 
                  : "text-zinc-400"
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.badge && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              )}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Main content con effetto velocità */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto py-8 px-4 max-w-4xl relative">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
