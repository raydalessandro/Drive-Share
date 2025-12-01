import { Card } from "@/components/ui/card";
import { FeedPostHeader } from "./FeedPostHeader";
import { FeedPostContent } from "./FeedPostContent";
import { FeedPostActions } from "./FeedPostActions";
import type { FeedPost as FeedPostType } from "@/stores/feedStore";
import { useToast } from "@/hooks/use-toast";

interface FeedPostProps {
  post: FeedPostType;
  onLike: (postId: string) => void;
  onUnlike: (postId: string) => void;
}

export function FeedPost({ post, onLike, onUnlike }: FeedPostProps) {
  const { toast } = useToast();

  const handleLike = () => {
    if (post.is_liked) {
      onUnlike(post.id);
    } else {
      onLike(post.id);
    }
  };

  const handleComment = () => {
    toast({
      title: "Commenti",
      description: "Funzionalità commenti in arrivo!",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.route?.title || "Percorso condiviso",
          text: post.content || "Guarda questo percorso!",
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiato!",
        description: "Il link è stato copiato negli appunti",
      });
    }
  };

  const handleRouteClick = (routeId: string) => {
    // TODO: navigare alla pagina del percorso
    toast({
      title: "Percorso",
      description: "Visualizzazione dettagli percorso in arrivo!",
    });
  };

  return (
    <Card className="overflow-hidden border-2 hover:border-red-200 transition-colors">
      <FeedPostHeader 
        author={post.author}
        createdAt={post.created_at}
      />
      
      <FeedPostContent
        content={post.content}
        route={post.route}
        onRouteClick={handleRouteClick}
      />

      <FeedPostActions
        likesCount={post.likes_count || 0}
        commentsCount={post.comments_count || 0}
        isLiked={post.is_liked || false}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
      />
    </Card>
  );
}



