import postgres from "postgres";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { Book } from "./types";
import { sendLowStockAlert } from "./email";

export { GENRES } from "./constants";
export type { Book } from "./types";

// ---------- types ----------

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  is_admin: number;
  saved_shipping_json: string | null;
  created_at: Date;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires: Date | null;
  reset_token: string | null;
  reset_token_expires: Date | null;
};

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

export type Order = {
  id: number;
  order_code: string;
  user_id: number;
  total_cents: number;
  status: string;
  shipping_json: string | null;
  payment_method: string | null;
  created_at: Date;
};

export type OrderItem = {
  id: number;
  order_id: number;
  book_id: number | null;
  title: string;
  author: string;
  price_cents: number;
  quantity: number;
  cover_seed: string;
  color?: string | null;
};

export type Review = {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: Date;
  user_name: string;
};

// ---------- connection (singleton across dev hot-reloads) ----------

declare global {
  var __notebloomSql: postgres.Sql | undefined;
}

const connectionString = process.env.DATABASE_URL || "";

function createSqlInstance(): postgres.Sql {
  const isPlaceholder =
    !connectionString ||
    connectionString.includes("[PROJECT-ID]") ||
    connectionString.includes("[PASSWORD]") ||
    connectionString.includes("[REGION]");

  if (isPlaceholder) {
    console.warn("Using placeholder DATABASE_URL. Real queries will fail until a valid DATABASE_URL is configured.");
    const dummy = ((...args: any[]) => {
      // If used as a template tag sql`query`
      throw new Error("DATABASE_URL is not set or is still a placeholder. Please configure DATABASE_URL in your environment variables.");
    }) as any;
    dummy.begin = () => {
      throw new Error("DATABASE_URL is not set or is still a placeholder. Please configure DATABASE_URL in your environment variables.");
    };
    return dummy;
  }

  return postgres(connectionString, { ssl: "require", prepare: false });
}

export const sql = globalThis.__notebloomSql ?? createSqlInstance();
if (process.env.NODE_ENV !== "production") {
  globalThis.__notebloomSql = sql;
}

// ---------- seed ----------

export async function seedIfEmpty() {
  if (!connectionString) {
    console.warn("DATABASE_URL is not set in environment. Skipping database seed check.");
    return;
  }

  try {
    // Ensure rate limiting table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'otp_resend_limits'
      )
    `;
    if (!tableExists[0].exists) {
      await sql`
        CREATE TABLE otp_resend_limits (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL,
          last_otp_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          request_count INT DEFAULT 1
        )
      `;
    }

    // Migrate: add order_code column if it doesn't exist
    const orderCodeExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'order_code'
      )
    `;
    if (!orderCodeExists[0].exists) {
      await sql`ALTER TABLE orders ADD COLUMN order_code TEXT`;
      const existingOrders = await sql`SELECT id FROM orders WHERE order_code IS NULL`;
      for (const o of existingOrders) {
        const code = "NB-" + crypto.randomBytes(4).toString("hex").toUpperCase();
        await sql`UPDATE orders SET order_code = ${code} WHERE id = ${o.id}`;
      }
      await sql`ALTER TABLE orders ADD CONSTRAINT orders_order_code_unique UNIQUE (order_code)`;
    }

    const countResult = await sql`SELECT COUNT(*)::int as c FROM books`;
    const count = countResult[0]?.c ?? 0;

    if (count === 0) {
      console.log("Seeding Supabase Postgres database with initial stationery products...");

      const seedBooks = [
        {
          title: "Strawberry Milk Washi Tape Set",
          author: "Mochi Studios",
          genre: "Washi Tape",
          description: "A pack of 3 pastel pink washi tapes featuring retro strawberry milk designs and cherry blossoms. Perfect for journaling and decoration.",
          price_cents: 599,
          stock: 25,
          isbn: "SKU-STW-001",
          cover_seed: "/images/strawberry_washi.png",
        },
        {
          title: "Cute Bear Weekly Planner",
          author: "Bunny & Bear",
          genre: "Planners",
          description: "An undated weekly planner featuring cute bear illustrations on every page. Smooth 120gsm paper with lay-flat binding.",
          price_cents: 1250,
          stock: 15,
          isbn: "SKU-CBP-002",
          cover_seed: "/images/bear_planner.png",
        },
        {
          title: "Fluffy Peach Pencil Case",
          author: "Haru Goods",
          genre: "Pencil Cases",
          description: "A soft, plush pencil case in the shape of a happy peach. Spacious enough for all your pens with a cute custom zipper pull.",
          price_cents: 899,
          stock: 18,
          isbn: "SKU-FPC-003",
          cover_seed: "/images/peach_case.png",
        },
        {
          title: "Boba Tea Gel Pen Pack",
          author: "Bunny & Bear",
          genre: "Pens",
          description: "A set of 4 black gel ink pens with adorable miniature boba bubble tea charms dangling from the caps. 0.5mm fine point.",
          price_cents: 799,
          stock: 12,
          isbn: "SKU-BGP-004",
          cover_seed: "/images/boba_pens.png",
        },
        {
          title: "Pastel Tulip Aesthetic Notebook",
          author: "Haru Goods",
          genre: "Notebooks",
          description: "A grid-ruled notebook with a dreamy pastel tulip cover. Includes high-quality paper, ideal for scrapbooking and bullet journals.",
          price_cents: 650,
          stock: 22,
          isbn: "SKU-PTN-005",
          cover_seed: "/images/tulip_notebook.png",
        },
        {
          title: "Shiba Inu Sticky Notes",
          author: "Mochi Studios",
          genre: "Sticky Notes",
          description: "A pad of 50 self-adhesive sticky notes with an adorable smiling Shiba Inu checking in on your daily goals.",
          price_cents: 299,
          stock: 40,
          isbn: "SKU-SIS-006",
          cover_seed: "/images/shiba_notes.png",
        },
        {
          title: "Retro Soda Acrylic Keyring",
          author: "Mochi Studios",
          genre: "Accessories",
          description: "A cute acrylic charm keyring of a retro melon soda float. Decorate your backpack, airpod case, or pencil pouch.",
          price_cents: 600,
          stock: 10,
          isbn: "SKU-RSA-007",
          cover_seed: "/images/soda_keyring.png",
        },
        {
          title: "Happy Cloud Desk Organizer",
          author: "Haru Goods",
          genre: "Desk Decor",
          description: "A small, pastel-colored desk tidy shaped like a fluffy cloud, perfect for organizing your markers and memo pads.",
          price_cents: 1499,
          stock: 8,
          isbn: "SKU-HCD-008",
          cover_seed: "/images/cloud_organizer.png",
        },
        {
          title: "Cherry Blossom Writing Set",
          author: "Kyoto Petals",
          genre: "Accessories",
          description: "Traditional writing set with 10 cherry blossom patterned sheets and 5 matching envelopes. Delicate texture.",
          price_cents: 499,
          stock: 15,
          isbn: "SKU-CBW-009",
          cover_seed: "/images/cherry_letters.png",
        },
        {
          title: "Cat Paw Correction Tape",
          author: "Neko Stationery",
          genre: "Accessories",
          description: "Correction tape in a super cute cat-paw shaped dispenser. Compact, easy to hold, and leaves a neat white strip.",
          price_cents: 350,
          stock: 30,
          isbn: "SKU-CPC-010",
          cover_seed: "/images/cat_paw_tape.png",
        },
      ];

      for (const b of seedBooks) {
        await sql`
          INSERT INTO books (title, author, description, genre, price_cents, stock, isbn, cover_seed)
          VALUES (${b.title}, ${b.author}, ${b.description}, ${b.genre}, ${b.price_cents}, ${b.stock}, ${b.isbn}, ${b.cover_seed})
        `;
      }
      console.log("Database books seeding completed.");
    }

    // Always ensure the demo admin account is seeded
    const adminExists = await sql`SELECT id FROM users WHERE email = 'admin@notebloom.shop'`;
    if (adminExists.length === 0) {
      console.log("Seeding demo admin account...");
      const adminHash = bcrypt.hashSync("notebloom123", 10);
      await sql`
        INSERT INTO users (name, email, password_hash, is_admin)
        VALUES ('Notebloom Admin', 'admin@notebloom.shop', ${adminHash}, 1)
        ON CONFLICT (email) DO NOTHING
      `;
      console.log("Demo admin account seeded.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// seedIfEmpty disabled after initial setup
// if (connectionString) {
//   seedIfEmpty().catch(console.error);
// }

// ---------- helpers ----------

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// books

export async function listBooks(opts: { q?: string; genre?: string; sort?: string } = {}): Promise<Book[]> {
  const { q, genre, sort = "best" } = opts;
  
  if (sort === "best") {
    if (genre && q) {
      const term = `%${q}%`;
      const result = await sql`
        SELECT b.*, COALESCE(SUM(oi.quantity), 0) as sales
        FROM books b
        LEFT JOIN order_items oi ON b.id = oi.book_id
        WHERE b.genre = ${genre} AND (b.title ILIKE ${term} OR b.author ILIKE ${term})
        GROUP BY b.id
        ORDER BY sales DESC, b.created_at DESC
      `;
      return result as unknown as Book[];
    } else if (genre) {
      const result = await sql`
        SELECT b.*, COALESCE(SUM(oi.quantity), 0) as sales
        FROM books b
        LEFT JOIN order_items oi ON b.id = oi.book_id
        WHERE b.genre = ${genre}
        GROUP BY b.id
        ORDER BY sales DESC, b.created_at DESC
      `;
      return result as unknown as Book[];
    } else if (q) {
      const term = `%${q}%`;
      const result = await sql`
        SELECT b.*, COALESCE(SUM(oi.quantity), 0) as sales
        FROM books b
        LEFT JOIN order_items oi ON b.id = oi.book_id
        WHERE (b.title ILIKE ${term} OR b.author ILIKE ${term})
        GROUP BY b.id
        ORDER BY sales DESC, b.created_at DESC
      `;
      return result as unknown as Book[];
    } else {
      const result = await sql`
        SELECT b.*, COALESCE(SUM(oi.quantity), 0) as sales
        FROM books b
        LEFT JOIN order_items oi ON b.id = oi.book_id
        GROUP BY b.id
        ORDER BY sales DESC, b.created_at DESC
      `;
      return result as unknown as Book[];
    }
  }

  let orderFragment = sql`ORDER BY created_at DESC`;
  if (sort === "price-asc") {
    orderFragment = sql`ORDER BY price_cents ASC, created_at DESC`;
  } else if (sort === "price-desc") {
    orderFragment = sql`ORDER BY price_cents DESC, created_at DESC`;
  } else if (sort === "new") {
    orderFragment = sql`ORDER BY created_at DESC`;
  }

  if (genre && q) {
    const term = `%${q}%`;
    const result = await sql`
      SELECT * FROM books 
      WHERE genre = ${genre} AND (title ILIKE ${term} OR author ILIKE ${term})
      ${orderFragment}
    `;
    return result as unknown as Book[];
  } else if (genre) {
    const result = await sql`
      SELECT * FROM books 
      WHERE genre = ${genre}
      ${orderFragment}
    `;
    return result as unknown as Book[];
  } else if (q) {
    const term = `%${q}%`;
    const result = await sql`
      SELECT * FROM books 
      WHERE (title ILIKE ${term} OR author ILIKE ${term})
      ${orderFragment}
    `;
    return result as unknown as Book[];
  } else {
    const result = await sql`
      SELECT * FROM books 
      ${orderFragment}
    `;
    return result as unknown as Book[];
  }
}

export async function listBooksWithSales(): Promise<(Book & { sales: number })[]> {
  const result = await sql`
    SELECT b.*, COALESCE(SUM(oi.quantity), 0) as sales
    FROM books b
    LEFT JOIN order_items oi ON b.id = oi.book_id
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `;
  return result as unknown as (Book & { sales: number })[];
}

export async function getBook(id: number): Promise<Book | undefined> {
  const result = await sql`SELECT * FROM books WHERE id = ${id}`;
  return result[0] as unknown as Book | undefined;
}

export async function checkAndNotifyLowStock(bookId: number): Promise<void> {
  try {
    const book = await getBook(bookId);
    if (book && book.stock <= 5) {
      console.log(`[Low Stock Check] Product "${book.title}" is at low stock level: ${book.stock}. Triggering admin alert email.`);
      await sendLowStockAlert(book.title, book.stock);
    }
  } catch (error) {
    console.error("Error in checkAndNotifyLowStock:", error);
  }
}

export async function createBook(
  b: Omit<Book, "id" | "created_at" | "cover_seed" | "cover_seed_2" | "color_images"> & { cover_seed?: string; cover_seed_2?: string | null; color_images?: string | null }
): Promise<number> {
  const coverSeed = b.cover_seed || (slug(b.title) + "-" + Date.now());
  const coverSeed2 = b.cover_seed_2 || null;
  const colorImages = b.color_images || "[]";
  const result = await sql`
    INSERT INTO books (title, author, description, genre, price_cents, stock, isbn, cover_seed, cover_seed_2, color_images)
    VALUES (${b.title}, ${b.author}, ${b.description}, ${b.genre}, ${b.price_cents}, ${b.stock}, ${b.isbn}, ${coverSeed}, ${coverSeed2}, ${colorImages})
    RETURNING id
  `;
  return Number(result[0].id);
}

export async function updateBook(
  id: number,
  b: Omit<Book, "id" | "created_at" | "cover_seed" | "cover_seed_2" | "color_images"> & { cover_seed?: string; cover_seed_2?: string | null; color_images?: string | null }
): Promise<void> {
  await sql`
    UPDATE books 
    SET title=${b.title}, author=${b.author}, description=${b.description}, genre=${b.genre}, price_cents=${b.price_cents}, stock=${b.stock}, isbn=${b.isbn},
        cover_seed=${b.cover_seed || sql`cover_seed`}, 
        cover_seed_2=${b.cover_seed_2 !== undefined ? b.cover_seed_2 : sql`cover_seed_2`},
        color_images=${b.color_images !== undefined ? b.color_images : sql`color_images`}
    WHERE id=${id}
  `;
  checkAndNotifyLowStock(id).catch(console.error);
}

export async function deleteBook(id: number): Promise<void> {
  await sql.begin(async (sql) => {
    // 1. Delete associated cart items
    await sql`DELETE FROM cart_items WHERE book_id = ${id}`;
    // 2. Delete associated reviews
    await sql`DELETE FROM reviews WHERE book_id = ${id}`;
    // 3. Detach historical order items to avoid foreign key violations
    await sql`UPDATE order_items SET book_id = NULL WHERE book_id = ${id}`;
    // 4. Finally delete the book
    await sql`DELETE FROM books WHERE id = ${id}`;
  });
}

// users

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const result = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}`;
  return result[0] as unknown as User | undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`;
  return result[0] as unknown as User | undefined;
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<number> {
  const result = await sql`
    INSERT INTO users (name, email, password_hash) 
    VALUES (${name.trim()}, ${email.toLowerCase().trim()}, ${passwordHash})
    RETURNING id
  `;
  return Number(result[0].id);
}

export async function getOrCreateGuestUser(name: string, email: string): Promise<number> {
  const trimmedEmail = email.toLowerCase().trim();
  const existing = await getUserByEmail(trimmedEmail);
  if (existing) {
    return existing.id;
  }

  const result = await sql`
    INSERT INTO users (name, email, password_hash, email_verified) 
    VALUES (${name.trim()}, ${trimmedEmail}, 'NO_PASSWORD', TRUE)
    RETURNING id
  `;
  return Number(result[0].id);
}

export async function upgradeGuestUser(userId: number, name: string, passwordHash: string): Promise<void> {
  await sql`
    UPDATE users 
    SET name = ${name.trim()}, password_hash = ${passwordHash}, email_verified = FALSE
    WHERE id = ${userId}
  `;
}

export async function createVerificationCode(userId: number): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now (standard for OTP)
  await sql`
    UPDATE users 
    SET verification_token = ${code}, verification_token_expires = ${expires}
    WHERE id = ${userId}
  `;
  return code;
}

export async function verifyEmailCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  const trimmedEmail = email.toLowerCase().trim();
  const trimmedCode = code.trim();
  if (!trimmedEmail || !trimmedCode) {
    return { success: false, error: "Email and verification code are required." };
  }

  const result = await sql`
    SELECT id, verification_token, verification_token_expires FROM users 
    WHERE email = ${trimmedEmail}
  `;
  const user = result[0];
  if (!user) {
    return { success: false, error: "No account found with that email address." };
  }

  if (!user.verification_token || user.verification_token !== trimmedCode) {
    return { success: false, error: "The verification code you entered is incorrect." };
  }

  const expires = new Date(user.verification_token_expires);
  if (expires.getTime() < Date.now()) {
    return { success: false, error: "This verification code has expired. Please request a new code." };
  }

  await sql`
    UPDATE users 
    SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL 
    WHERE id = ${user.id}
  `;
  return { success: true };
}

export async function createPasswordResetToken(email: string): Promise<string | null> {
  const trimmedEmail = email.toLowerCase().trim();
  const user = await getUserByEmail(trimmedEmail);
  if (!user) return null;

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  await sql`
    UPDATE users 
    SET reset_token = ${token}, reset_token_expires = ${expires}
    WHERE id = ${user.id}
  `;
  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<User | undefined> {
  const trimmedToken = token.trim();
  if (!trimmedToken) return undefined;

  const result = await sql`
    SELECT * FROM users 
    WHERE reset_token = ${trimmedToken}
  `;
  const user = result[0] as unknown as User | undefined;
  if (!user) return undefined;

  if (user.reset_token_expires && new Date(user.reset_token_expires).getTime() < Date.now()) {
    return undefined;
  }

  return user;
}

export async function resetUserPassword(userId: number, passwordHash: string): Promise<void> {
  await sql`
    UPDATE users 
    SET password_hash = ${passwordHash}, reset_token = NULL, reset_token_expires = NULL, email_verified = TRUE
    WHERE id = ${userId}
  `;
}

export async function isEmailVerified(userId: number): Promise<boolean> {
  const result = await sql`SELECT email_verified FROM users WHERE id = ${userId}`;
  return !!result[0]?.email_verified;
}

export async function saveUserShipping(userId: number, shippingJson: string): Promise<void> {
  await sql`UPDATE users SET saved_shipping_json = ${shippingJson} WHERE id = ${userId}`;
}

export async function getUserSavedShipping(userId: number): Promise<string | null> {
  const result = await sql`SELECT saved_shipping_json FROM users WHERE id = ${userId}`;
  return result[0]?.saved_shipping_json ?? null;
}

// cart

export async function getCart(userId: number): Promise<CartRow[]> {
  const result = await sql`
    SELECT ci.id, ci.book_id, ci.quantity, b.title, b.author, b.price_cents, b.cover_seed, b.stock, b.color_images, ci.color
    FROM cart_items ci JOIN books b ON b.id = ci.book_id
    WHERE ci.user_id = ${userId}
    ORDER BY ci.id DESC
  `;
  return result as unknown as CartRow[];
}

export async function addToCart(userId: number, bookId: number, quantity: number, color?: string): Promise<void> {
  await sql`
    INSERT INTO cart_items (user_id, book_id, quantity, color) 
    VALUES (${userId}, ${bookId}, ${quantity}, ${color || null})
    ON CONFLICT (user_id, book_id) 
    DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, color = EXCLUDED.color
  `;
}

export async function setCartQty(userId: number, bookId: number, qty: number): Promise<void> {
  if (qty <= 0) {
    await sql`DELETE FROM cart_items WHERE user_id=${userId} AND book_id=${bookId}`;
  } else {
    await sql`
      UPDATE cart_items 
      SET quantity=${qty} 
      WHERE user_id=${userId} AND book_id=${bookId}
    `;
  }
}

export async function removeFromCart(userId: number, bookId: number): Promise<void> {
  await sql`DELETE FROM cart_items WHERE user_id=${userId} AND book_id=${bookId}`;
}

export async function clearCart(userId: number): Promise<void> {
  await sql`DELETE FROM cart_items WHERE user_id=${userId}`;
}

export async function cartCount(userId: number): Promise<number> {
  const result = await sql`
    SELECT COALESCE(SUM(quantity), 0)::int as c 
    FROM cart_items 
    WHERE user_id=${userId}
  `;
  return result[0]?.c ?? 0;
}

// orders

async function adjustCategoryStock(
  sqlConn: any,
  bookId: number,
  quantityDelta: number,
  colorName: string | null | undefined
) {
  if (!colorName) return;

  const result = await sqlConn`SELECT color_images FROM books WHERE id = ${bookId}`;
  if (result.length === 0 || !result[0].color_images) return;

  try {
    const parsed = JSON.parse(result[0].color_images);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.categories)) {
      const cat = parsed.categories.find(
        (c: any) => c.name.toLowerCase() === colorName.toLowerCase()
      );
      if (cat) {
        cat.stock = Math.max(0, (cat.stock || 0) + quantityDelta);
        const updatedJson = JSON.stringify(parsed);
        await sqlConn`UPDATE books SET color_images = ${updatedJson} WHERE id = ${bookId}`;
      }
    }
  } catch (err) {
    console.error("Failed to adjust category stock:", err);
  }
}

export async function placeOrder(
  userId: number,
  shippingJson: string = "{}",
  paymentMethod: string = "cod",
  items?: CartRow[],
  shippingCents: number = 0
): Promise<{ orderId: number; total: number } | { error: string }> {
  const finalItems = items ?? await getCart(userId);
  if (finalItems.length === 0) return { error: "Your cart is empty." };

  for (const it of finalItems) {
    if (it.quantity > it.stock) {
      return { error: `Only ${it.stock} left of "${it.title}".` };
    }
  }

  const total = finalItems.reduce((sum, it) => sum + it.price_cents * it.quantity, 0) + shippingCents;

  try {
    const result = await sql.begin(async (sql) => {
      // 1. Create order (Default COD orders to 'Pending')
      const orderCode = "NB-" + crypto.randomBytes(4).toString("hex").toUpperCase();
      const orderResult = await sql`
        INSERT INTO orders (user_id, total_cents, status, shipping_json, payment_method, order_code) 
        VALUES (${userId}, ${total}, 'Pending', ${shippingJson}, ${paymentMethod}, ${orderCode})
        RETURNING id
      `;
      const orderId = orderResult[0].id;

      // 2. Add order items & decrement stock
      for (const it of finalItems) {
        await sql`
          INSERT INTO order_items (order_id, book_id, title, author, price_cents, quantity, cover_seed, color)
          VALUES (${orderId}, ${it.book_id}, ${it.title}, ${it.author}, ${it.price_cents}, ${it.quantity}, ${it.cover_seed}, ${it.color || null})
        `;
        await sql`
          UPDATE books 
          SET stock = stock - ${it.quantity} 
          WHERE id = ${it.book_id}
        `;
        // Deduct stock of the specific selected category/variant color
        await adjustCategoryStock(sql, it.book_id, -it.quantity, it.color);
      }

      // 3. Clear cart
      await sql`DELETE FROM cart_items WHERE user_id=${userId}`;

      return orderId;
    });

    // Check stock levels after transaction succeeds
    for (const it of finalItems) {
      checkAndNotifyLowStock(it.book_id).catch(console.error);
    }

    return { orderId: Number(result), total };
  } catch (error) {
    console.error("Order placement transaction failed:", error);
    throw error;
  }
}

export async function getOrder(orderId: number) {
  const result = await sql`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o JOIN users u ON u.id = o.user_id
    WHERE o.id = ${orderId}
  `;
  return result[0] as unknown as (Order & { user_name: string; user_email: string; shipping_json: string | null; payment_method: string | null }) | undefined;
}

export async function getOrdersForUser(userId: number): Promise<Order[]> {
  const result = await sql`
    SELECT * FROM orders WHERE user_id=${userId} ORDER BY created_at DESC
  `;
  return result as unknown as Order[];
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const result = await sql`
    SELECT * FROM order_items WHERE order_id=${orderId}
  `;
  return result as unknown as OrderItem[];
}

export async function getAllOrders(): Promise<(Order & { user_name: string; user_email: string })[]> {
  const result = await sql`
    SELECT o.*, COALESCE(u.name, 'Guest') as user_name, COALESCE(u.email, 'No Email') as user_email
    FROM orders o LEFT JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC
  `;
  return result as unknown as (Order & { user_name: string; user_email: string })[];
}

// reviews

export async function getReviewsForBook(bookId: number): Promise<Review[]> {
  const result = await sql`
    SELECT r.*, u.name as user_name FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.book_id = ${bookId}
    ORDER BY r.created_at DESC
  `;
  return result as unknown as Review[];
}

export async function getRatingSummary(bookId: number): Promise<{ avg: number; count: number }> {
  const result = await sql`
    SELECT AVG(rating)::float as avg, COUNT(*)::int as count 
    FROM reviews 
    WHERE book_id=${bookId}
  `;
  const row = result[0];
  return { avg: row?.avg ?? 0, count: row?.count ?? 0 };
}

export async function hasUserPurchasedBook(userId: number, bookId: number): Promise<boolean> {
  const result = await sql`
    SELECT COUNT(*)::int as count 
    FROM orders o 
    JOIN order_items oi ON o.id = oi.order_id 
    WHERE o.user_id = ${userId} 
      AND oi.book_id = ${bookId} 
      AND o.status = 'Delivered'
  `;
  return (result[0]?.count ?? 0) > 0;
}

export async function checkAndIncrementOtpRateLimit(email: string): Promise<{ allowed: boolean; remaining: number; resetInMinutes: number }> {
  const trimmedEmail = email.toLowerCase().trim();
  const now = new Date();

  // 1. Fetch current limit record
  const result = await sql`
    SELECT attempts, last_attempt_at 
    FROM otp_resend_limits 
    WHERE email = ${trimmedEmail}
  `;

  if (result.length === 0) {
    // No record yet, create one
    await sql`
      INSERT INTO otp_resend_limits (email, attempts, last_attempt_at)
      VALUES (${trimmedEmail}, 1, ${now})
      ON CONFLICT (email) DO UPDATE 
      SET attempts = 1, last_attempt_at = ${now}
    `;
    return { allowed: true, remaining: 2, resetInMinutes: 10 };
  }

  const record = result[0];
  const lastAttemptAt = new Date(record.last_attempt_at);
  const diffMs = now.getTime() - lastAttemptAt.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes >= 10) {
    // Window has expired, reset attempts
    await sql`
      UPDATE otp_resend_limits 
      SET attempts = 1, last_attempt_at = ${now}
      WHERE email = ${trimmedEmail}
    `;
    return { allowed: true, remaining: 2, resetInMinutes: 10 };
  }

  if (record.attempts >= 3) {
    // Over the limit
    const remainingTime = Math.ceil(10 - diffMinutes);
    return { allowed: false, remaining: 0, resetInMinutes: remainingTime };
  }

  // Increment attempts
  const newAttempts = record.attempts + 1;
  await sql`
    UPDATE otp_resend_limits 
    SET attempts = ${newAttempts}, last_attempt_at = ${now}
    WHERE email = ${trimmedEmail}
  `;

  return { allowed: true, remaining: 3 - newAttempts, resetInMinutes: Math.ceil(10 - diffMinutes) };
}

export async function upsertReview(bookId: number, userId: number, rating: number, comment: string): Promise<void> {
  await sql`
    INSERT INTO reviews (book_id, user_id, rating, comment) 
    VALUES (${bookId}, ${userId}, ${rating}, ${comment})
    ON CONFLICT(book_id, user_id) 
    DO UPDATE SET rating=EXCLUDED.rating, comment=EXCLUDED.comment, created_at=CURRENT_TIMESTAMP
  `;
}

export async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  const deductedStatuses = ["Pending", "Shipped", "Out for Delivery", "Delivered"];
  const newIsDeducted = deductedStatuses.includes(status);

  await sql.begin(async (sql) => {
    // 1. Fetch current order status
    const orderResult = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    if (orderResult.length === 0) {
      throw new Error(`Order #${orderId} not found.`);
    }
    const oldStatus = orderResult[0].status;
    const oldIsDeducted = deductedStatuses.includes(oldStatus);

    // 2. Perform status change in DB
    await sql`UPDATE orders SET status = ${status} WHERE id = ${orderId}`;

    // If status transition doesn't change the deduction state, do nothing
    if (oldIsDeducted === newIsDeducted) {
      return;
    }

    // Fetch order items (including color selection)
    const items = await sql`SELECT book_id, quantity, title, color FROM order_items WHERE order_id = ${orderId}`;

    if (newIsDeducted && !oldIsDeducted) {
      // Transitioning TO Shipped/Delivered: Decrement stock
      for (const item of items) {
        if (!item.book_id) continue;

        // Fetch current book stock
        const bookResult = await sql`SELECT stock FROM books WHERE id = ${item.book_id}`;
        if (bookResult.length === 0) continue;
        const currentStock = bookResult[0].stock;

        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for "${item.title}". Available: ${currentStock}, Required: ${item.quantity}.`);
        }

        // Decrement overall stock
        await sql`
          UPDATE books 
          SET stock = stock - ${item.quantity} 
          WHERE id = ${item.book_id}
        `;
        // Decrement specific variant category stock
        await adjustCategoryStock(sql, item.book_id, -item.quantity, item.color);
      }
    } else if (!newIsDeducted && oldIsDeducted) {
      // Transitioning FROM Shipped/Delivered: Restore stock
      for (const item of items) {
        if (!item.book_id) continue;

        // Increment overall stock back
        await sql`
          UPDATE books 
          SET stock = stock + ${item.quantity} 
          WHERE id = ${item.book_id}
        `;
        // Restore specific variant category stock
        await adjustCategoryStock(sql, item.book_id, item.quantity, item.color);
      }
    }
  });

  // Check stock levels after the transaction completes
  try {
    const orderItems = await sql`SELECT book_id FROM order_items WHERE order_id = ${orderId}`;
    for (const item of orderItems) {
      if (item.book_id) {
        checkAndNotifyLowStock(item.book_id).catch(console.error);
      }
    }
  } catch (err) {
    console.error("Error checking low stock after status update:", err);
  }
}

export async function getAdminStats() {
  const revenueResult = await sql`SELECT SUM(total_cents)::int as total FROM orders`;
  const ordersResult = await sql`SELECT COUNT(*)::int as count FROM orders`;
  const productsResult = await sql`SELECT COUNT(*)::int as count FROM books`;
  const lowStockResult = await sql`SELECT COUNT(*)::int as count FROM books WHERE stock < 5`;

  return {
    totalRevenueCents: revenueResult[0]?.total ?? 0,
    totalOrders: ordersResult[0]?.count ?? 0,
    totalProducts: productsResult[0]?.count ?? 0,
    lowStockCount: lowStockResult[0]?.count ?? 0,
  };
}

export function formatPrice(cents: number): string {
  return `PKR ${(cents / 100).toFixed(2)}`;
}

let migrated = false;
async function runAutoMigration() {
  if (migrated) return;
  migrated = true;
  try {
    // 1. Add color_images to books table
    const columnExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'color_images'
      )
    `;
    if (!columnExists[0].exists) {
      await sql`ALTER TABLE books ADD COLUMN color_images TEXT;`;
      console.log("Auto-Migration: added color_images column to books table.");
    }

    // 2. Add color to order_items table
    const orderItemColumnExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'color'
      )
    `;
    if (!orderItemColumnExists[0].exists) {
      await sql`ALTER TABLE order_items ADD COLUMN color TEXT;`;
      console.log("Auto-Migration: added color column to order_items table.");
    }

    // 2b. Add color to cart_items table
    const cartItemColumnExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'cart_items' AND column_name = 'color'
      )
    `;
    if (!cartItemColumnExists[0].exists) {
      await sql`ALTER TABLE cart_items ADD COLUMN color TEXT;`;
      console.log("Auto-Migration: added color column to cart_items table.");
    }

    // 3. Migrate existing books
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
        console.log(`Auto-Migration: Migrated book #${book.id} to use color_images list: ${json}`);
      }
    }
  } catch (err) {
    console.error("Auto-Migration failed:", err);
  }
}

if (connectionString) {
  runAutoMigration().catch(console.error);
}

export default sql;
