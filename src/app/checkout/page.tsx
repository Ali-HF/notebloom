import { auth } from "@/lib/auth";
import { getCart, getUserSavedShipping, getBook, type CartRow } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage() {
  const session = await auth();
  let items: CartRow[] = [];
  let savedShipping = null;
  const isGuest = !session?.user?.id;

  if (session?.user?.id) {
    const userId = Number(session.user.id);
    items = await getCart(userId);
    const savedShippingJson = await getUserSavedShipping(userId);
    savedShipping = savedShippingJson ? JSON.parse(savedShippingJson) : null;
  } else {
    try {
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get("notebloom_cart")?.value;
      if (cartCookie) {
        const parsed = JSON.parse(cartCookie);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const resolvedItems = [];
          let i = 0;
          for (const it of parsed) {
            const book = await getBook(Number(it.book_id));
            if (book) {
              resolvedItems.push({
                id: i,
                book_id: book.id,
                quantity: Number(it.quantity) || 1,
                title: book.title,
                author: book.author,
                price_cents: book.price_cents,
                cover_seed: book.cover_seed,
                stock: book.stock,
                color: it.color || null,
                color_images: book.color_images,
                weight_grams: book.weight_grams
              });
              i++;
            }
          }
          items = resolvedItems;
        }
      }
    } catch (e) {
      console.error("Error resolving guest cart in checkout:", e);
    }
  }

  if (items.length === 0) {
    redirect("/cart");
  }

  return (
    <CheckoutClient
      items={items}
      savedShipping={savedShipping}
      userEmail={session?.user?.email || ""}
      isGuest={isGuest}
    />
  );
}
