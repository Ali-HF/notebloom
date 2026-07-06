import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { setCartQty } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { bookId, qty, color } = await request.json();
    const cleanQty = Number.isFinite(qty) ? qty : 1;

    if (!bookId || !Number.isFinite(bookId)) {
      return NextResponse.json({ error: "Invalid bookId" }, { status: 400 });
    }

    const session = await auth();

    if (session?.user?.id) {
      await setCartQty(Number(session.user.id), bookId, cleanQty, color);
    } else {
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get("notebloom_cart")?.value;
      if (cartCookie) {
        try {
          const cart: Array<{ book_id: number; quantity: number; color?: string | null }> = JSON.parse(cartCookie);
          if (Array.isArray(cart)) {
            const cleanColor = color || "";
            const idx = cart.findIndex((it) => it.book_id === bookId && (it.color || "") === cleanColor);
            if (idx >= 0) {
              if (cleanQty <= 0) {
                cart.splice(idx, 1);
              } else {
                cart[idx].quantity = cleanQty;
              }
              cookieStore.set("notebloom_cart", JSON.stringify(cart), { maxAge: 86400 * 30, path: "/" });
            }
          }
        } catch (_e) {
          // ignore parse errors
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cart update-qty error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
