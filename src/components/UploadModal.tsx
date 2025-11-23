import { useState } from 'react';
import { Upload, Check, Cloud, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: UploadFormData) => Promise<void>;
  isConfigured: boolean;
}

export interface UploadFormData {
  image: File | null;
  prompt: string;
  description: string;
  model: string;
  uploaderName: string;
  uploaderEmail: string;
}

export const UploadModal = ({ isOpen, onClose, onUpload, isConfigured }: UploadModalProps) => {
  const [form, setForm] = useState<UploadFormData>({
    image: null,
    prompt: '',
    description: '',
    model: 'Gemini 2.5 Flash Image (Nano Banana)',
    uploaderName: '',
    uploaderEmail: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image || !form.prompt || !form.uploaderName || !form.uploaderEmail) return;

    setIsUploading(true);
    try {
      await onUpload(form);
      onClose();
      setForm({
        image: null,
        prompt: '',
        description: '',
        model: 'Gemini 2.5 Flash Image (Nano Banana)',
        uploaderName: '',
        uploaderEmail: ''
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload New Artwork">
      {!isConfigured && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/50 rounded text-amber-200 text-sm">
          <strong>Warning:</strong> Missing keys. Please set Firebase AND Cloudinary config.
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Image File
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors bg-background">
            {form.image ? (
              <div className="text-primary flex items-center justify-center gap-2">
                <Check size={18} /> {form.image.name}
              </div>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Upload size={24} />
                  <span>Click to select image</span>
                </label>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring outline-none text-foreground"
              value={form.uploaderName}
              onChange={(e) => setForm({ ...form, uploaderName: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Your Email
            </label>
            <input
              type="email"
              required
              className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring outline-none text-foreground"
              value={form.uploaderEmail}
              onChange={(e) => setForm({ ...form, uploaderEmail: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Title / Description
          </label>
          <input
            type="text"
            required
            className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring outline-none text-foreground"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Cyberpunk Cityscape"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            AI Model Used
          </label>
          <select
            className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring outline-none text-foreground"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          >

            <option>Midjourney v6</option>
            <option>Gemini 2.5 Flash Image (Nano Banana)</option>
            <option>DALL-E 3</option>
            <option>Stable Diffusion XL</option>
            <option>Leonardo AI</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Prompt
          </label>
          <textarea
            required
            rows={4}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring outline-none font-mono text-sm text-foreground"
            value={form.prompt}
            onChange={(e) => setForm({ ...form, prompt: e.target.value })}
            placeholder="Enter the exact prompt used..."
          />
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <Cloud size={18} />}
          {isUploading ? 'Uploading...' : 'Publish Artwork'}
        </button>
      </form>
    </Modal>
  );
};
