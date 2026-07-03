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
  color_images?: string | null;
};

export function formatPrice(cents: number): string {
  return `PKR ${(cents / 100).toFixed(2)}`;
}

export interface ProductMedia {
  generic_pictures: string[];
  categories: Array<{ name: string; stock: number; images: string[] }>;
}

export function parseProductMedia(
  colorImagesJson: string | null | undefined,
  overallStock: number = 0
): ProductMedia {
  const defaultMedia: ProductMedia = { generic_pictures: [], categories: [] };
  if (!colorImagesJson) return defaultMedia;

  try {
    const parsed = JSON.parse(colorImagesJson);
    
    // Check if it matches the new format
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const generic_pictures = Array.isArray(parsed.generic_pictures) ? parsed.generic_pictures : [];
      const rawCategories = Array.isArray(parsed.categories) ? parsed.categories : [];
      
      const categories = rawCategories.map((c: any) => {
        const name = String(c.name || "").trim();
        // Fallback to overallStock if c.stock is missing/undefined
        const stock = typeof c.stock === "number" ? c.stock : overallStock;
        return {
          name,
          stock,
          images: Array.isArray(c.images) ? c.images.map(String) : []
        };
      }).filter((c: any) => c.name !== "");

      return { generic_pictures, categories };
    }
    
    // Handle legacy format: Array<{ url: string, color: string }>
    if (Array.isArray(parsed)) {
      const categoriesMap: Record<string, string[]> = {};
      parsed.forEach((item: any) => {
        if (item && typeof item === "object") {
          const colorName = String(item.color || "Default").trim();
          const url = String(item.url || "");
          if (url) {
            if (!categoriesMap[colorName]) {
              categoriesMap[colorName] = [];
            }
            categoriesMap[colorName].push(url);
          }
        }
      });

      const categories = Object.entries(categoriesMap).map(([name, images]) => {
        // Fallback category stock to overall stock or divide evenly
        const stock = overallStock;
        return {
          name,
          stock,
          images
        };
      });

      return { generic_pictures: [], categories };
    }
  } catch (err) {
    console.error("Error parsing product media:", err);
  }

  return defaultMedia;
}
