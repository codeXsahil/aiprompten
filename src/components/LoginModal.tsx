import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Modal } from './Modal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
}

export const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
      onClose();
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin Login">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/20 border border-destructive/50 text-destructive-foreground text-sm rounded">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Email
          </label>
          <input 
            type="email" 
            required 
            className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring outline-none text-foreground"
            value={email} 
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Password
          </label>
          <input 
            type="password" 
            required 
            className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring outline-none text-foreground"
            value={password} 
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-medium transition-colors"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Login"}
        </button>
      </form>
    </Modal>
  );
};
