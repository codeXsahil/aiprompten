import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArtworkCard } from '@/components/ArtworkCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ShareModal } from '@/components/ShareModal';

const SharedArtwork = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [artwork, setArtwork] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isShareOpen, setIsShareOpen] = useState(false);

    useEffect(() => {
        const fetchArtwork = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "artworks", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setArtwork({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError("Artwork not found");
                }
            } catch (err) {
                console.error("Error fetching artwork:", err);
                setError("Failed to load artwork");
            } finally {
                setLoading(false);
            }
        };

        fetchArtwork();
    }, [id]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // Ideally show a toast here, but for simplicity we'll rely on the user knowing it copied
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (error || !artwork) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">{error || "Artwork not found"}</h1>
                <button
                    onClick={() => navigate('/')}
                    className="text-primary hover:underline flex items-center gap-2"
                >
                    <ArrowLeft size={20} />
                    Back to Gallery
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Gallery
                </button>

                <ArtworkCard
                    artwork={artwork}
                    onCopy={handleCopy}
                    onShare={() => setIsShareOpen(true)}
                    onClick={() => { }}
                />

                <ShareModal
                    isOpen={isShareOpen}
                    onClose={() => setIsShareOpen(false)}
                    url={window.location.href}
                    title={artwork.description || "AI Artwork"}
                />
            </div>
        </div>
    );
};

export default SharedArtwork;
