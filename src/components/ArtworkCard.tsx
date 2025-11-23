import { Calendar, Copy, Share2 } from 'lucide-react';

interface ArtworkCardProps {
  artwork: {
    id: string;
    imageUrl: string;
    prompt: string;
    model: string;
    description: string;

    createdAt: { seconds: number };
    uploaderName?: string;
  };
  onCopy: (text: string) => void;
  onShare?: () => void;
  onClick: () => void;
}

export const ArtworkCard = ({ artwork, onCopy, onShare, onClick }: ArtworkCardProps) => {
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
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-foreground truncate mb-1" title={artwork.description}>
          {artwork.description || "Untitled Artwork"}
        </h3>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar size={12} />
            {artwork.createdAt?.seconds
              ? new Date(artwork.createdAt.seconds * 1000).toLocaleDateString()
              : 'Just now'
            }
          </p>
          {artwork.uploaderName && (
            <p className="text-xs text-primary font-medium">
              by {artwork.uploaderName}
            </p>
          )}
        </div>

        <div className="mt-auto bg-background rounded-lg p-3 border border-border group-hover:border-primary/30 transition-colors">
          <p className="text-muted-foreground text-xs line-clamp-3 font-mono mb-3 select-none">
            {artwork.prompt.split(' ').slice(0, 2).join(' ')}...
          </p>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy(artwork.prompt);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground text-xs py-2 rounded-md transition-all font-medium"
            >
              <Copy size={14} />
              Copy Prompt
            </button>
            {onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                className="flex items-center justify-center px-3 bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground rounded-md transition-all"
                title="Share Artwork"
              >
                <Share2 size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
