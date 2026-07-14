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
  console.log("Starting reset of orders and stock...");
  const { sql } = await import("../src/lib/db");

  try {
    // 1. Delete all order items and orders
    console.log("Deleting all orders...");
    await sql`DELETE FROM order_items`;
    await sql`DELETE FROM orders`;
    console.log("Successfully deleted all orders and order items.");

    // 2. Define original seed stock values
    const seedStocks: Record<string, number> = {
      "SKU-STW-001": 25,
      "SKU-CBP-002": 15,
      "SKU-FPC-003": 18,
      "SKU-BGP-004": 12,
      "SKU-PTN-005": 22,
      "SKU-SIS-006": 40,
      "SKU-RSA-007": 10,
      "SKU-HCD-008": 8,
      "SKU-CBW-009": 15,
      "SKU-CPC-010": 30,
    };

    // 3. Reset books stock
    console.log("Resetting stock for books...");
    for (const [isbn, stock] of Object.entries(seedStocks)) {
      await sql`UPDATE books SET stock = ${stock} WHERE isbn = ${isbn}`;
      
      // Get the book ID to reset variations as well
      const bookResult = await sql`SELECT id, color_images FROM books WHERE isbn = ${isbn}`;
      if (bookResult.length > 0) {
        const bookId = bookResult[0].id;
        const colorImagesStr = bookResult[0].color_images;
        
        // Reset overall stock
        console.log(`Reset book ID ${bookId} (${isbn}) stock to ${stock}.`);

        // If book_variations exists, reset variation stock to matches in color_images categories
        if (colorImagesStr) {
          try {
            const parsed = JSON.parse(colorImagesStr);
            if (parsed && typeof parsed === "object" && Array.isArray(parsed.categories)) {
              for (const cat of parsed.categories) {
                const name = String(cat.name || "").trim();
                if (!name) continue;
                // If the variation had a specific default stock, use it; otherwise fall back to the book's stock
                const catStock = typeof cat.stock === "number" ? cat.stock : stock;
                await sql`
                  UPDATE book_variations 
                  SET stock = ${catStock} 
                  WHERE book_id = ${bookId} AND LOWER(name) = LOWER(${name})
                `;
                console.log(`  Reset variation "${name}" stock to ${catStock}`);
              }
            }
          } catch (e) {
            // Ignore parse errors, fallback to setting all variations for this book to the main stock
            await sql`
              UPDATE book_variations 
              SET stock = ${stock} 
              WHERE book_id = ${bookId}
            `;
            console.log(`  Fallback reset all variations for book ID ${bookId} to ${stock}`);
          }
        } else {
          // If no specific color_images structure, reset any variations to book stock
          await sql`
            UPDATE book_variations 
            SET stock = ${stock} 
            WHERE book_id = ${bookId}
          `;
        }
      }
    }

    console.log("Stock reset completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to reset orders and stock:", error);
    process.exit(1);
  }
}

main();
