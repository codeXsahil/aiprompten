import { Calendar, Heart, Copy } from 'lucide-react';

interface ArtworkCardProps {
  artwork: {
    id: string;
    imageUrl: string;
    prompt: string;
    model: string;
    description: string;
    likes: number;
    createdAt: { seconds: number };
  };
  onCopy: (text: string) => void;
  onLike: (id: string) => void;
  onClick: () => void;
}

export const ArtworkCard = ({ artwork, onCopy, onLike, onClick }: ArtworkCardProps) => {
  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 flex flex-col">
      <div 
        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <img 
          src={artwork.imageUrl} 
          alt={artwork.description} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
          <div className="flex justify-between items-end">
            <span className="bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded backdrop-blur-sm">
              {artwork.model}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onLike(artwork.id);
              }}
              className="flex items-center gap-1 text-foreground hover:text-primary transition-colors"
            >
              <Heart 
                size={18} 
                className={artwork.likes > 0 ? "fill-primary text-primary" : ""} 
              />
              <span className="text-sm font-medium">{artwork.likes}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-foreground truncate mb-1" title={artwork.description}>
          {artwork.description || "Untitled Artwork"}
        </h3>
        <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
          <Calendar size={12} />
          {artwork.createdAt?.seconds 
            ? new Date(artwork.createdAt.seconds * 1000).toLocaleDateString() 
            : 'Just now'
          }
        </p>
        
        <div className="mt-auto bg-background rounded-lg p-3 border border-border group-hover:border-primary/30 transition-colors">
          <p className="text-muted-foreground text-xs line-clamp-3 font-mono mb-3">
            {artwork.prompt}
          </p>
          <button 
            onClick={() => onCopy(artwork.prompt)}
            className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground text-xs py-2 rounded-md transition-all font-medium"
          >
            <Copy size={14} />
            Copy Prompt
          </button>
        </div>
      </div>
    </div>
  );
};
