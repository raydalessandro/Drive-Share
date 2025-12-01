import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedPostActionsProps {
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

export function FeedPostActions({
  likesCount,
  commentsCount,
  isLiked,
  onLike,
  onComment,
  onShare,
}: FeedPostActionsProps) {
  return (
    <div className="px-4 py-2 border-t border-b">
      <div className="flex items-center justify-between">
        {/* Like */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-2 h-9",
            isLiked && "text-red-600 hover:text-red-700"
          )}
          onClick={onLike}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all",
              isLiked && "fill-red-600 text-red-600"
            )}
          />
          <span className="font-medium">{likesCount}</span>
        </Button>

        {/* Comment */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-9"
          onClick={onComment}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">{commentsCount}</span>
        </Button>

        {/* Share */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-9"
          onClick={onShare}
        >
          <Share2 className="h-5 w-5" />
          <span className="font-medium">Condividi</span>
        </Button>
      </div>
    </div>
  );
}



