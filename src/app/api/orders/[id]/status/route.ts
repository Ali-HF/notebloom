import { NextResponse } from "next/server";
import { getOrder, getOrderItems } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const orderId = Number(id);

  if (Number.isNaN(orderId)) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const session = await auth();
  const cookieStore = await cookies();
  const hasGuestCookie =
    cookieStore.get(`guest_order_access_${orderId}`)?.value === "true";

  // Allow access if:
  // 1. Logged-in user (we'll verify it's their order below)
  // 2. Guest who has the access cookie (set after checkout)
  // 3. For now also allow any guest to look up by ID (the order page use-case)
  //    so guests can track without needing the cookie.
  const order = await getOrder(orderId);

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // If logged in, make sure it's their order
  if (session?.user?.id && Number(session.user.id) !== order.user_id) {
    // Admin can always see
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const items = await getOrderItems(orderId);

  return NextResponse.json({
    id: order.id,
    status: order.status,
    total_cents: order.total_cents,
    created_at: order.created_at,
    payment_method: order.payment_method,
    items: items.map((item) => ({
      title: item.title,
      author: item.author,
      quantity: item.quantity,
      price_cents: item.price_cents,
    })),
  });
}
