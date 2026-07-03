import { auth } from "@/lib/auth";
import { getCart, getBook } from "@/lib/db";
import type { CartRow } from "@/lib/cart-utils";
import { cookies } from "next/headers";
import CartClient from "@/components/CartClient";

export default async function CartPage() {
  const session = await auth();

  let items: CartRow[] = [];
  const isGuest = !session?.user?.id;

  if (session?.user?.id) {
    const userId = Number(session.user.id);
    items = await getCart(userId);
  } else {
    try {
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get("notebloom_cart")?.value;
      if (cartCookie) {
        const parsed = JSON.parse(cartCookie);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const resolvedItems = [];
          for (const it of parsed) {
            const book = await getBook(Number(it.book_id));
            if (book) {
              resolvedItems.push({
                id: Number(it.book_id),
                book_id: book.id,
                quantity: Number(it.quantity) || 1,
                title: book.title,
                author: book.author,
                price_cents: book.price_cents,
                cover_seed: book.cover_seed,
                stock: book.stock,
                color: it.color || null,
                color_images: book.color_images,
              });
            }
          }
          items = resolvedItems;
        }
      }
    } catch (e) {
      console.error("Error resolving guest cart:", e);
    }
  }

  return <CartClient items={items} isGuest={isGuest} />;
}