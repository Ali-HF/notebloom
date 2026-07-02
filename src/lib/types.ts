export type Book = {
  id: number;
  title: string;
  author: string;
  description: string;
  genre: string;
  price_cents: number;
  stock: number;
  isbn: string;
  cover_seed: string;
  cover_seed_2?: string | null;
  color_images?: string | null;
  created_at: string;
};
