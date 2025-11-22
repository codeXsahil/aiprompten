import { useState } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

interface EmailGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

const ALLOWED_DOMAINS = ['gmail.com', 'icloud.com'];

export const EmailGateModal = ({ isOpen, onClose, onSubmit }: EmailGateModalProps) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    const domain = email.split('@')[1]?.toLowerCase();
    if (!ALLOWED_DOMAINS.includes(domain)) {
      setError('Only @gmail.com and @icloud.com emails are allowed');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(email.toLowerCase().trim());
      setEmail('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Access Prompt">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="text-primary" size={24} />
        </div>
        <p className="text-muted-foreground">
          To copy prompts, please provide your email address. This is a one-time requirement for this session.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/20 border border-destructive/50 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@gmail.com"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-ring outline-none text-foreground"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Only @gmail.com and @icloud.com addresses are accepted
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Submitting...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>
    </Modal>
  );
};
