import { useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useFeedStore } from "@/stores/feedStore";
import { useFriendsStore } from "@/stores/friendsStore";
import MainLayout from "@/components/layout/MainLayout";
import { FeedPost } from "@/components/feed";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCw, 
  Globe, 
  Users, 
  Loader2,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

const Feed = () => {
  const profile = useAuthStore((state) => state.profile);
  const { 
    posts, 
    loading, 
    error, 
    feedMode, 
    hasMore,
    setFeedMode,
    loadFeed,
    loadMore,
    refreshFeed,
    likePost,
    unlikePost,
  } = useFeedStore();
  const { friends } = useFriendsStore();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Carica il feed quando cambia la modalità o quando l'utente è autenticato
  useEffect(() => {
    if (profile) {
      loadFeed(feedMode, true);
    }
  }, [profile, feedMode]);

  // Scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadMore]);

  const handleModeChange = (mode: 'all' | 'friends') => {
    setFeedMode(mode);
  };

  const handleLike = useCallback((postId: string) => {
    likePost(postId);
  }, [likePost]);

  const handleUnlike = useCallback((postId: string) => {
    unlikePost(postId);
  }, [unlikePost]);

  if (!profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
        {/* Header con toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Feed</h1>
            <p className="text-muted-foreground">
              Scopri i percorsi condivisi dalla community
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshFeed}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Aggiorna
          </Button>
        </div>

        {/* Toggle Feed Mode */}
        <Tabs 
          value={feedMode} 
          onValueChange={(value) => handleModeChange(value as 'all' | 'friends')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="gap-2">
              <Globe className="h-4 w-4" />
              Tutti
            </TabsTrigger>
            <TabsTrigger value="friends" className="gap-2">
              <Users className="h-4 w-4" />
              Amici ({friends.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Feed Posts */}
        <div className="space-y-4">
          {loading && posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Caricamento feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                {feedMode === 'friends' ? (
                  <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                ) : (
                  <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">
                {feedMode === 'friends' 
                  ? 'Nessun post dagli amici' 
                  : 'Nessun post ancora'}
              </h3>
              <p className="text-muted-foreground">
                {feedMode === 'friends'
                  ? 'I tuoi amici non hanno ancora condiviso percorsi. Prova a vedere il feed generale!'
                  : 'Sii il primo a condividere un percorso!'}
              </p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                />
              ))}
              
              {/* Loading more indicator */}
              {loading && posts.length > 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Scroll trigger per infinite scroll */}
              <div ref={observerTarget} className="h-4" />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Feed;



