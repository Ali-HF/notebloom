import fs from "fs";
import path from "path";

// Manually load env variables from .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) {
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        process.env[match[1]] = val;
      }
    }
  }
} catch (e) {
  console.warn("Failed to load .env.local manually:", e);
}

async function main() {
  console.log("Altering tables for color-image features...");
  const { sql } = await import("../src/lib/db");

  // 1. Add color_images to books table
  try {
    const columnExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'color_images'
      )
    `;
    if (!columnExists[0].exists) {
      await sql`ALTER TABLE books ADD COLUMN color_images TEXT;`;
      console.log("Success: added color_images column to books table.");
    } else {
      console.log("Column color_images already exists in books table.");
    }
  } catch (e: any) {
    console.error("Error adding column to books table:", e);
    process.exitCode = 1;
  }

  // 2. Add color to order_items table
  try {
    const columnExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'color'
      )
    `;
    if (!columnExists[0].exists) {
      await sql`ALTER TABLE order_items ADD COLUMN color TEXT;`;
      console.log("Success: added color column to order_items table.");
    } else {
      console.log("Column color already exists in order_items table.");
    }
  } catch (e: any) {
    console.error("Error adding column to order_items table:", e);
    process.exitCode = 1;
  }

  // 3. Migrate existing books' cover seeds to color_images
  try {
    const books = await sql`SELECT id, cover_seed, cover_seed_2, color_images FROM books`;
    for (const book of books) {
      if (!book.color_images || book.color_images === "[]") {
        const list: Array<{ url: string; color: string }> = [];
        if (book.cover_seed) {
          list.push({ url: book.cover_seed, color: "Default" });
        }
        if (book.cover_seed_2) {
          list.push({ url: book.cover_seed_2, color: "Secondary" });
        }
        const json = JSON.stringify(list);
        await sql`UPDATE books SET color_images = ${json} WHERE id = ${book.id}`;
        console.log(`Migrated book #${book.id} to use color_images list: ${json}`);
      }
    }
  } catch (e: any) {
    console.error("Error migrating existing books:", e);
    process.exitCode = 1;
  }

  console.log("Migration completed.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Migration script failed:", e);
  process.exit(1);
});
