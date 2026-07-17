import { NextResponse } from "next/server";
import { getOrder, getOrderByCode, getOrderItems } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  let order;
  const isAlphanumericCode = id.toUpperCase().startsWith("NB-");

  if (isAlphanumericCode) {
    order = await getOrderByCode(id);
  } else {
    const orderId = Number(id);
    if (!Number.isNaN(orderId)) {
      order = await getOrder(orderId);
    }
  }

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const session = await auth();

  // If logged in, make sure it's their order
  if (session?.user?.id && Number(session.user.id) !== order.user_id) {
    // Admin can always see
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const items = await getOrderItems(order.id);

  // Set the guest access cookie on this device so they can view details for this order
  const cookieStore = await cookies();
  cookieStore.set(`guest_order_access_${order.id}`, "true", { maxAge: 86400 * 7, path: "/" });

  return NextResponse.json({
    id: order.id,
    order_code: order.order_code,
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
