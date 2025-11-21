import { Calendar, Wand2, Copy } from 'lucide-react';
import { Modal } from './Modal';

interface ArtworkDetailModalProps {
  artwork: {
    id: string;
    imageUrl: string;
    prompt: string;
    model: string;
    description: string;
    likes: number;
    createdAt: { seconds: number };
  } | null;
  onClose: () => void;
  onCopy: (text: string) => void;
}

export const ArtworkDetailModal = ({ artwork, onClose, onCopy }: ArtworkDetailModalProps) => {
  if (!artwork) return null;

  return (
    <Modal isOpen={!!artwork} onClose={onClose} title="Artwork Details">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg overflow-hidden bg-black">
          <img 
            src={artwork.imageUrl} 
            alt={artwork.description} 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {artwork.description}
            </h3>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <Wand2 size={14}/> {artwork.model}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14}/> 
                {artwork.createdAt?.seconds 
                  ? new Date(artwork.createdAt.seconds * 1000).toLocaleDateString() 
                  : 'Recent'
                }
              </span>
            </div>
          </div>
          
          <div className="bg-background p-4 rounded-xl border border-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Prompt
              </span>
              <button 
                onClick={() => onCopy(artwork.prompt)}
                className="text-primary hover:text-primary/80 text-xs flex items-center gap-1 transition-colors"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
            <p className="font-mono text-sm text-foreground leading-relaxed">
              {artwork.prompt}
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-border">
            <button 
              className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground py-3 rounded-lg transition-colors" 
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
