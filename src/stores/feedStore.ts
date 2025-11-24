import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "./authStore";
import { useFriendsStore } from "./friendsStore";
import { toast } from "@/components/ui/use-toast";

export interface FeedPost {
  id: string;
  author_id: string;
  route_id: string | null;
  content: string | null;
  type: 'route' | 'text' | 'image';
  visibility: 'public' | 'friends' | 'private';
  is_public: boolean;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  route: {
    id: string;
    title: string;
    description: string | null;
    distance_km: number | null;
    points: { coordinates: Array<{ lat: number; lng: number }> } | null;
  } | null;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

interface FeedState {
  posts: FeedPost[];
  loading: boolean;
  error: string | null;
  feedMode: 'all' | 'friends'; // 'all' = feed generale, 'friends' = solo amici
  hasMore: boolean;
  page: number;
}

interface FeedActions {
  setFeedMode: (mode: 'all' | 'friends') => void;
  loadFeed: (mode?: 'all' | 'friends', reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
}

const POSTS_PER_PAGE = 10;

export const useFeedStore = create<FeedState & FeedActions>((set, get) => ({
  posts: [],
  loading: false,
  error: null,
  feedMode: 'all',
  hasMore: true,
  page: 0,

  setFeedMode: (mode) => {
    set({ feedMode: mode, page: 0, posts: [], hasMore: true });
    get().loadFeed(mode, true);
  },

  loadFeed: async (mode, reset = false) => {
    const currentMode = mode || get().feedMode;
    const user = useAuthStore.getState().user;
    
    if (!user) {
      set({ error: 'User not authenticated', loading: false });
      return;
    }

    set({ loading: true, error: null });
    
    if (reset) {
      set({ posts: [], page: 0, hasMore: true });
    }

    try {
      const currentPage = reset ? 0 : get().page;
      const from = currentPage * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id (id, username, avatar_url),
          routes:route_id (id, title, description, distance_km, points)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      // Se modalità amici, filtra solo i post degli amici
      if (currentMode === 'friends') {
        const friends = useFriendsStore.getState().friends;
        const friendIds = friends.map(f => f.id);
        
        if (friendIds.length === 0) {
          set({ posts: [], loading: false, hasMore: false });
          return;
        }
        
        query = query.in('author_id', friendIds);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedPosts: FeedPost[] = (data || []).map((post: any) => ({
        id: post.id,
        author_id: post.author_id,
        route_id: post.route_id,
        content: post.content,
        type: post.type || 'route',
        visibility: post.visibility || 'public',
        is_public: post.is_public,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: {
          id: post.profiles?.id || post.author_id,
          username: post.profiles?.username || 'Unknown',
          avatar_url: post.profiles?.avatar_url || null,
        },
        route: post.routes ? {
          id: post.routes.id,
          title: post.routes.title,
          description: post.routes.description,
          distance_km: post.routes.distance_km,
          points: post.routes.points || null,
        } : null,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        is_liked: false, // TODO: implementare check like
      }));

      if (reset) {
        set({ 
          posts: formattedPosts, 
          page: 1, 
          hasMore: formattedPosts.length === POSTS_PER_PAGE,
          loading: false 
        });
      } else {
        set(state => ({
          posts: [...state.posts, ...formattedPosts],
          page: state.page + 1,
          hasMore: formattedPosts.length === POSTS_PER_PAGE,
          loading: false,
        }));
      }
    } catch (error: any) {
      console.error('Error loading feed:', error);
      const errorMessage = error.message || 'Failed to load feed';
      set({ 
        error: errorMessage, 
        loading: false 
      });
      // Mostra toast solo se non è un errore di autenticazione o di colonna mancante
      if (!errorMessage.includes('column') && !errorMessage.includes('permission')) {
        toast({
          title: 'Errore',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  },

  loadMore: async () => {
    const { hasMore, loading } = get();
    if (!hasMore || loading) return;
    await get().loadFeed();
  },

  refreshFeed: async () => {
    set({ page: 0, posts: [], hasMore: true });
    await get().loadFeed(undefined, true);
  },

  likePost: async (postId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      // TODO: implementare logica like nel database
      // Per ora aggiorniamo solo lo stato locale
      set(state => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                is_liked: true, 
                likes_count: (post.likes_count || 0) + 1 
              }
            : post
        ),
      }));
    } catch (error: any) {
      console.error('Error liking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to like post',
        variant: 'destructive',
      });
    }
  },

  unlikePost: async (postId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      // TODO: implementare logica unlike nel database
      set(state => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                is_liked: false, 
                likes_count: Math.max(0, (post.likes_count || 0) - 1) 
              }
            : post
        ),
      }));
    } catch (error: any) {
      console.error('Error unliking post:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlike post',
        variant: 'destructive',
      });
    }
  },
}));

