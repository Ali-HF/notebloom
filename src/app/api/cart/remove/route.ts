import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { removeFromCart } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { bookId, color } = await request.json();

    if (!bookId || !Number.isFinite(bookId)) {
      return NextResponse.json({ error: "Invalid bookId" }, { status: 400 });
    }

    const session = await auth();

    if (session?.user?.id) {
      await removeFromCart(Number(session.user.id), bookId, color);
    } else {
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get("notebloom_cart")?.value;
      if (cartCookie) {
        try {
          const cart: Array<{ book_id: number; quantity: number; color?: string | null }> = JSON.parse(cartCookie);
          if (Array.isArray(cart)) {
            const cleanColor = color || "";
            const filtered = cart.filter((it) => !(it.book_id === bookId && (it.color || "") === cleanColor));
            cookieStore.set("notebloom_cart", JSON.stringify(filtered), { maxAge: 86400 * 30, path: "/" });
          }
        } catch (_e) {
          // ignore parse errors
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cart remove error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
