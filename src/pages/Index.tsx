import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Upload, Filter, Image as ImageIcon, 
  Loader2, Terminal
} from 'lucide-react';
import { 
  collection, addDoc, serverTimestamp, 
  query, orderBy, onSnapshot, doc, updateDoc, increment
} from "firebase/firestore";
import { 
  signInAnonymously, onAuthStateChanged, 
  signInWithEmailAndPassword, signOut 
} from "firebase/auth";
import { db, auth, isConfigured } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { LoginModal } from '@/components/LoginModal';
import { Notification } from '@/components/Notification';
import { UploadModal, UploadFormData } from '@/components/UploadModal';
import { ArtworkCard } from '@/components/ArtworkCard';
import { ArtworkDetailModal } from '@/components/ArtworkDetailModal';

const MOCK_DATA = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1675271591211-6029fe4066d1?q=80&w=800&auto=format&fit=crop',
    prompt: 'Cyberpunk city street at night, neon lights reflecting on wet pavement',
    model: 'Midjourney v6',
    description: 'Neo-Tokyo night drive',
    likes: 124,
    createdAt: { seconds: 1709251200 }
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?q=80&w=800&auto=format&fit=crop',
    prompt: 'A cute robot gardener watering plants in a greenhouse',
    model: 'DALL-E 3',
    description: 'Eco-bot 3000',
    likes: 89,
    createdAt: { seconds: 1709164800 }
  }
];

const Index = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedArt, setSelectedArt] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const isAdmin = !!(user && !user.isAnonymous);

  useEffect(() => {
    if (!isConfigured) {
      setArtworks(MOCK_DATA);
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (error: any) {
        console.error("Auth error:", error);
        if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
          setNotification({ 
            message: "SETUP REQUIRED: Enable 'Anonymous' Sign-in in Firebase Console", 
            type: "error" 
          });
        }
      }
    };
    
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
    const unsubscribeDocs = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArtworks(docs);
      setLoading(false);
    }, (error) => {
      console.error("Data fetch error:", error);
      setNotification({ message: "Error connecting to database", type: "error" });
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDocs();
    };
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdminLogin = async (email: string, password: string) => {
    if (!auth) return;
    await signOut(auth);
    await signInWithEmailAndPassword(auth, email, password);
    showNotification("Welcome back, Admin!");
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    await signInAnonymously(auth); 
    showNotification("Logged out");
  };

  const handleCopy = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showNotification("Prompt copied!");
      }).catch(() => {
        showNotification("Failed to copy", "error");
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showNotification("Prompt copied!");
      } catch (err) {
        showNotification("Failed to copy", "error");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleLike = async (id: string) => {
    if (!isConfigured || !user) return;
    try {
      const artRef = doc(db, "artworks", id);
      await updateDoc(artRef, { likes: increment(1) });
    } catch (error) {
      console.error("Error liking:", error);
    }
  };

  const handleUpload = async (data: UploadFormData) => {
    if (!data.image || !data.prompt) {
      showNotification("Image and Prompt are required", "error");
      return;
    }

    if (!isConfigured) {
      showNotification("Configure API keys first", "error");
      return;
    }

    try {
      const imageUrl = await uploadToCloudinary(data.image);

      await addDoc(collection(db, "artworks"), {
        imageUrl: imageUrl,
        prompt: data.prompt,
        description: data.description,
        model: data.model,
        likes: 0,
        createdAt: serverTimestamp(),
        uploaderId: user ? user.uid : 'anon'
      });

      showNotification("Artwork published!");
    } catch (error: any) {
      console.error(error);
      showNotification("Upload failed: " + error.message, "error");
      throw error;
    }
  };

  const filteredArtworks = useMemo(() => {
    let result = [...artworks];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.prompt.toLowerCase().includes(lower) || 
        item.description.toLowerCase().includes(lower) ||
        item.model.toLowerCase().includes(lower)
      );
    }

    if (selectedModel !== 'All') {
      result = result.filter(item => item.model === selectedModel);
    }

    if (sortBy === 'oldest') {
      result.sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
    } else if (sortBy === 'likes') {
      result.sort((a, b) => b.likes - a.likes);
    } else {
      result.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    }

    return result;
  }, [artworks, searchTerm, selectedModel, sortBy]);

  const uniqueModels = ['All', ...new Set(artworks.map(a => a.model))];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLogin={handleAdminLogin} 
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        isConfigured={isConfigured}
      />

      <ArtworkDetailModal
        artwork={selectedArt}
        onClose={() => setSelectedArt(null)}
        onCopy={handleCopy}
      />

      {notification && (
        <Notification message={notification.message} type={notification.type} />
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 text-primary">
              <Terminal size={28} />
              <span className="text-xl font-bold text-foreground tracking-tight">
                Prompt<span className="text-primary">Gallery</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-card border border-border text-sm rounded-full pl-10 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-ring transition-all text-foreground"
                />
              </div>
              {isAdmin && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="text-xs font-medium px-3 py-1 rounded-full bg-primary/20 border border-primary text-primary hover:bg-primary/30 transition-colors"
                >
                  Admin Panel
                </button>
              )}
              <button 
                onClick={() => {
                  if (isAdmin) {
                    handleLogout();
                  } else {
                    setIsLoginOpen(true);
                  }
                }}
                className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                  isAdmin 
                    ? 'bg-primary/20 border-primary text-primary' 
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {isAdmin ? 'Log Out' : 'Admin Login'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative bg-gradient-to-b from-card to-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Discover the Art of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Prompt Engineering
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            A curated collection of AI-generated imagery and the exact prompts used to create them. 
            Explore, learn, and create.
          </p>
          
          {isAdmin && (
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium transition-all shadow-lg"
            >
              <Upload size={18} />
              Upload Artwork
            </button>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 no-scrollbar">
            <Filter size={16} className="text-muted-foreground mr-2 flex-shrink-0" />
            {uniqueModels.map(model => (
              <button
                key={model}
                onClick={() => setSelectedModel(model)}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedModel === model 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {model}
              </button>
            ))}
          </div>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-card border-none text-foreground text-sm rounded-lg focus:ring-2 focus:ring-ring block w-full sm:w-auto p-2.5 cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
      </div>

      {/* GALLERY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p>Loading library...</p>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl font-medium">No artworks found</p>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredArtworks.map((art) => (
              <ArtworkCard
                key={art.id}
                artwork={art}
                onCopy={handleCopy}
                onLike={handleLike}
                onClick={() => setSelectedArt(art)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
