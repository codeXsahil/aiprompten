import { Check, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error';
}

export const Notification = ({ message, type = 'success' }: NotificationProps) => (
  <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white transform transition-all duration-300 z-50 ${
    type === 'success' ? 'bg-emerald-600' : 'bg-destructive'
  }`}>
    {type === 'success' ? <Check size={18} /> : <X size={18} />}
    <span className="font-medium">{message}</span>
  </div>
);
