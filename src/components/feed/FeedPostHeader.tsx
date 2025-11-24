import { Avatar } from "@/components/avatar";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

interface FeedPostHeaderProps {
  author: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  createdAt: string;
}

export function FeedPostHeader({ author, createdAt }: FeedPostHeaderProps) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${author.id}`);
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: it,
  });

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button
        onClick={handleProfileClick}
        className="flex-shrink-0 hover:opacity-80 transition-opacity"
        aria-label={`Vai al profilo di ${author.username}`}
      >
        <Avatar
          src={author.avatar_url}
          fallback={author.username}
          size={40}
        />
      </button>
      <div className="flex-1 min-w-0">
        <button
          onClick={handleProfileClick}
          className="font-semibold text-sm hover:underline block truncate"
        >
          {author.username}
        </button>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
}

