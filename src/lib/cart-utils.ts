/**
 * Shared types and utilities that are safe for both server and client components.
 * Extracted from db.ts to avoid pulling Node.js-only modules (postgres) into the browser bundle.
 */

export type CartRow = {
  id: number;
  book_id: number;
  quantity: number;
  title: string;
  author: string;
  price_cents: number;
  cover_seed: string;
  stock: number;
  color?: string | null;
};

export function formatPrice(cents: number): string {
  return `PKR ${(cents / 100).toFixed(2)}`;
}
