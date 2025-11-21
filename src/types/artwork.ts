export interface Artwork {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  description: string;
  likes: number;
  createdAt: { seconds: number };
  uploaderId?: string;
}
