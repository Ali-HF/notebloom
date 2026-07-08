import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { addToCart, getBook } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { bookId, qty = 1, color } = await request.json();

    if (!bookId || !Number.isFinite(bookId)) {
      return NextResponse.json({ error: "Invalid bookId" }, { status: 400 });
    }

    const cleanQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
    const session = await auth();

    if (session?.user?.id) {
      await addToCart(Number(session.user.id), bookId, cleanQty, color);
    } else {
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get("notebloom_cart")?.value;
      let cart: Array<{ book_id: number; quantity: number; color?: string | null }> = [];
      if (cartCookie) {
        try {
          const parsed = JSON.parse(cartCookie);
          if (Array.isArray(parsed)) cart = parsed;
        } catch (_e) {
          // ignore
        }
      }
      const cleanColor = color || "";
      const book = await getBook(bookId);
      if (book) {
        let availableStock = book.stock;
        if (cleanColor && book.color_images) {
          try {
            const parsed = JSON.parse(book.color_images);
            if (parsed && typeof parsed === "object" && Array.isArray(parsed.categories)) {
              const cat = parsed.categories.find(
                (c: any) => c.name.toLowerCase() === cleanColor.toLowerCase()
              );
              if (cat) {
                availableStock = cat.stock;
              }
            }
          } catch {}
        }

        const idx = cart.findIndex((it) => it.book_id === bookId && (it.color || "") === cleanColor);
        if (idx >= 0) {
          const currentQty = cart[idx].quantity;
          const allowedAdd = Math.max(0, availableStock - currentQty);
          cart[idx].quantity += allowedAdd;
        } else {
          const allowedAdd = Math.min(availableStock, cleanQty);
          if (allowedAdd > 0) {
            cart.push({ book_id: bookId, quantity: allowedAdd, color: cleanColor });
          }
        }
        cookieStore.set("notebloom_cart", JSON.stringify(cart), { maxAge: 86400 * 30, path: "/" });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cart add error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
