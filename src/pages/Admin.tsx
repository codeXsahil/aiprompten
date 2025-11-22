import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Trash2, Image as ImageIcon, Users,
  TrendingUp, Eye, Heart, Upload, ArrowLeft, Loader2, Mail, Download,
  Check, X
} from 'lucide-react';
import {
  collection, query, orderBy, onSnapshot,
  doc, deleteDoc, getDocs, where, Timestamp, updateDoc
} from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db, auth } from '@/lib/firebase';
import { Notification } from '@/components/Notification';
import { LoginModal } from '@/components/LoginModal';
import { UploadModal, UploadFormData } from '@/components/UploadModal';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { addDoc, serverTimestamp } from 'firebase/firestore';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [emails, setEmails] = useState<any[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalLikes: 0,
    totalViews: 0,
    recentUploads: 0
  });

  const isAdmin = !!(user && !user.isAnonymous);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser || currentUser.isAnonymous) {
        setIsLoginOpen(true);
        setLoading(false);
      }
    });

    if (!db) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
    const unsubscribeDocs = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArtworks(docs);

      // Calculate stats
      const totalLikes = docs.reduce((sum, art: any) => sum + (art.likes || 0), 0);
      const now = Date.now() / 1000;
      const recentUploads = docs.filter((art: any) =>
        art.createdAt?.seconds > (now - 7 * 24 * 60 * 60)
      ).length;

      setStats({
        totalArtworks: docs.length,
        totalLikes,
        totalViews: docs.length * 15, // Simulated
        recentUploads
      });

      setLoading(false);
    }, (error) => {
      console.error("Data fetch error:", error);
      setLoading(false);
    });

    // Fetch emails
    const emailsQuery = query(collection(db, "prompt_access_emails"), orderBy("submittedAt", "desc"));
    const unsubscribeEmails = onSnapshot(emailsQuery, (snapshot) => {
      const emailDocs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmails(emailDocs);
      setEmailsLoading(false);
    }, (error) => {
      console.error("Email fetch error:", error);
      setEmailsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDocs();
      unsubscribeEmails();
    };
  }, [navigate]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAdminLogin = async (email: string, password: string) => {
    if (!auth) return;
    await signOut(auth);
    await signInWithEmailAndPassword(auth, email, password);
    showNotification("Welcome back, Admin!");
    setIsLoginOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this artwork?')) return;

    try {
      await deleteDoc(doc(db, "artworks", id));
      showNotification("Artwork deleted successfully");
    } catch (error) {
      console.error("Error deleting:", error);
      showNotification("Failed to delete artwork", "error");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, "artworks", id), { status: 'approved' });
      showNotification("Artwork approved!");
    } catch (error) {
      console.error("Error approving:", error);
      showNotification("Failed to approve artwork", "error");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this artwork?')) return;
    try {
      await updateDoc(doc(db, "artworks", id), { status: 'rejected' });
      showNotification("Artwork rejected");
    } catch (error) {
      console.error("Error rejecting:", error);
      showNotification("Failed to reject artwork", "error");
    }
  };

  const handleUpload = async (data: UploadFormData) => {
    if (!data.image || !data.prompt) {
      showNotification("Image and Prompt are required", "error");
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
      setIsUploadOpen(false);
    } catch (error: any) {
      console.error(error);
      showNotification("Upload failed: " + error.message, "error");
      throw error;
    }
  };

  const handleExportEmails = () => {
    if (emails.length === 0) {
      showNotification("No emails to export", "error");
      return;
    }

    const csvContent = [
      ['Email', 'Submitted At', 'User Agent'].join(','),
      ...emails.map(item => [
        item.email,
        item.submittedAt?.seconds
          ? new Date(item.submittedAt.seconds * 1000).toISOString()
          : 'Recent',
        `"${(item.userAgent || 'N/A').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `email_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("Emails exported successfully!");
  };

  // Show login modal if not admin
  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => navigate('/')}
          onLogin={handleAdminLogin}
        />

        {notification && (
          <Notification message={notification.message} type={notification.type} />
        )}

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Admin Access Required</h1>
            <p className="text-muted-foreground mb-6">Please log in to access the admin dashboard.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-muted hover:bg-muted/80 text-foreground px-6 py-2 rounded-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => navigate('/')}
        onLogin={handleAdminLogin}
      />

      {notification && (
        <Notification message={notification.message} type={notification.type} />
      )}

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        isConfigured={true}
      />

      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your prompt gallery</p>
              </div>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Upload size={18} />
              Upload New
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ImageIcon className="text-primary" size={24} />
              </div>
              <TrendingUp className="text-emerald-400" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.totalArtworks}</h3>
            <p className="text-sm text-muted-foreground">Total Artworks</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Heart className="text-primary" size={24} />
              </div>
              <TrendingUp className="text-emerald-400" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.totalLikes}</h3>
            <p className="text-sm text-muted-foreground">Total Likes</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Eye className="text-primary" size={24} />
              </div>
              <TrendingUp className="text-emerald-400" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.totalViews}</h3>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BarChart3 className="text-primary" size={24} />
              </div>
              <TrendingUp className="text-emerald-400" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stats.recentUploads}</h3>
            <p className="text-sm text-muted-foreground">This Week</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="text-primary" size={24} />
              </div>
              <TrendingUp className="text-emerald-400" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{emails.length}</h3>
            <p className="text-sm text-muted-foreground">Email Submissions</p>
          </div>
        </div>

        {/* Email Submissions Section */}
        <div className="bg-card border border-border rounded-xl overflow-hidden mb-8">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Mail size={20} className="text-primary" />
                Email Submissions
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Users who submitted emails to access prompts</p>
            </div>
            <button
              onClick={handleExportEmails}
              disabled={emails.length === 0}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            {emailsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-12">
                <Mail size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No email submissions yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Submitted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      User Agent
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {emails.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">{item.email}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.submittedAt?.seconds
                          ? new Date(item.submittedAt.seconds * 1000).toLocaleString()
                          : 'Recent'}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">
                        {item.userAgent || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Artworks Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">All Artworks</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage and moderate your gallery content</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Artwork
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Uploader
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {artworks.map((artwork) => (
                  <tr key={artwork.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={artwork.imageUrl}
                          alt={artwork.description}
                          className="w-16 h-16 rounded-lg object-cover border border-border"
                        />
                        <div>
                          <p className="font-medium text-foreground">{artwork.description}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                            {artwork.prompt}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground mt-1">
                            {artwork.model}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-foreground">{artwork.uploaderName || 'Anonymous'}</p>
                        <p className="text-xs text-muted-foreground">{artwork.uploaderEmail || 'No email'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${artwork.status === 'approved'
                          ? 'bg-green-500/10 text-green-500'
                          : artwork.status === 'rejected'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                        {artwork.status || 'approved'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-foreground">
                        <Heart size={14} className={artwork.likes > 0 ? "fill-primary text-primary" : ""} />
                        <span className="text-sm font-medium">{artwork.likes || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {artwork.createdAt?.seconds
                        ? new Date(artwork.createdAt.seconds * 1000).toLocaleDateString()
                        : 'Just now'
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(!artwork.status || artwork.status === 'pending') && (
                          <>
                            <button
                              onClick={() => handleApprove(artwork.id)}
                              className="p-1 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(artwork.id)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              title="Reject"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(artwork.id)}
                          className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {artworks.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No artworks yet. Upload your first piece!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
