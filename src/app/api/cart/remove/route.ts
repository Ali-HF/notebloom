import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { removeFromCart } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { bookId } = await request.json();

    if (!bookId || !Number.isFinite(bookId)) {
      return NextResponse.json({ error: "Invalid bookId" }, { status: 400 });
    }

    const session = await auth();

    if (session?.user?.id) {
      await removeFromCart(Number(session.user.id), bookId);
    } else {
      const cookieStore = await cookies();
      const cartCookie = cookieStore.get("notebloom_cart")?.value;
      if (cartCookie) {
        try {
          const cart: Array<{ book_id: number; quantity: number }> = JSON.parse(cartCookie);
          if (Array.isArray(cart)) {
            const filtered = cart.filter((it) => it.book_id !== bookId);
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
