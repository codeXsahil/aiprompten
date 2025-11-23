import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, Twitter, MessageCircle } from "lucide-react";
import { useState } from "react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
}

export const ShareModal = ({ isOpen, onClose, url, title }: ShareModalProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareText = `Check out this AI artwork: ${title}`;
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(url);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Artwork</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex gap-4 justify-center">
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                        >
                            <div className="p-3 bg-[#1DA1F2]/10 rounded-full text-[#1DA1F2]">
                                <Twitter size={24} />
                            </div>
                            <span className="text-sm font-medium">Twitter</span>
                        </a>

                        <a
                            href={`https://wa.me/?text=${encodedText} ${encodedUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                        >
                            <div className="p-3 bg-[#25D366]/10 rounded-full text-[#25D366]">
                                <MessageCircle size={24} />
                            </div>
                            <span className="text-sm font-medium">WhatsApp</span>
                        </a>
                    </div>

                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50">
                        <input
                            readOnly
                            value={url}
                            className="flex-1 bg-transparent text-sm px-2 outline-none text-muted-foreground"
                        />
                        <button
                            onClick={handleCopy}
                            className="p-2 hover:bg-background rounded-md transition-colors"
                        >
                            {copied ? (
                                <span className="text-xs font-bold text-green-500">Copied!</span>
                            ) : (
                                <Copy size={16} />
                            )}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
