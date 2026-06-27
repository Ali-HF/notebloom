import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrdersForUser, getOrderItems, formatPrice, getOrder } from "@/lib/db";
import BookCover from "@/components/BookCover";
import BloomMark from "@/components/BloomMark";
import { cookies } from "next/headers";
import Confetti from "@/components/Confetti";
import CancelOrderButton from "@/components/CancelOrderButton";
import SaveGuestOrder from "@/components/SaveGuestOrder";
import GuestOrderNumber from "@/components/GuestOrderNumber";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const orderId = Number(id);

  const { new: isNew } = await searchParams;
  const showConfetti = isNew === "true";

  const cookieStore = await cookies();
  const hasGuestAccess = cookieStore.get(`guest_order_access_${orderId}`)?.value === "true";

  let order;
  let userOrderNumber: number | null = null;
  const isGuest = !session?.user?.id;

  if (session?.user?.id) {
    const userOrders = await getOrdersForUser(Number(session.user.id));
    order = userOrders.find((o) => o.id === orderId);
    if (order) {
      const sorted = [...userOrders].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      userOrderNumber = sorted.findIndex((o) => o.id === orderId) + 1;
    }
  } else if (hasGuestAccess) {
    order = await getOrder(orderId);
  }

  if (!order) {
    redirect("/login");
  }

  const items = await getOrderItems(orderId);

  const statusConfig: Record<string, { color: string; bg: string; icon: string; heading: string }> = {
    Pending: { color: "text-amber-700", bg: "bg-amber-100", icon: "⏳", heading: "We've received your order!" },
    Confirmed: { color: "text-emerald-700", bg: "bg-emerald-100", icon: "✅", heading: "Order confirmed — it's blooming its way to you." },
    Processing: { color: "text-blue-700", bg: "bg-blue-100", icon: "📦", heading: "Your order is being processed." },
    Shipped: { color: "text-indigo-700", bg: "bg-indigo-100", icon: "🚚", heading: "Your order is on the way!" },
    Delivered: { color: "text-emerald-700", bg: "bg-emerald-100", icon: "🎉", heading: "Delivered — enjoy your goodies!" },
    Cancelled: { color: "text-red-700", bg: "bg-red-100", icon: "❌", heading: "This order was cancelled." },
  };

  const cfg = statusConfig[order.status] || statusConfig.Pending;

  // Determine order label
  let orderLabel: React.ReactNode;
  if (session?.user?.isAdmin) {
    orderLabel = `Order #${order.id}`;
  } else if (userOrderNumber) {
    orderLabel = `Your order #${userOrderNumber}`;
  } else if (isGuest) {
    orderLabel = <GuestOrderNumber orderId={orderId} />;
  } else {
    orderLabel = `Order #${order.id}`;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      {showConfetti && <Confetti />}
      <SaveGuestOrder orderId={orderId} />

      <div className="text-center mb-10">
        <BloomMark size={36} className="mx-auto mb-4" />
        <p
          className="text-xs tracking-[0.22em] uppercase text-oxblood mb-2"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          {orderLabel}
        </p>
        <h1
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          {cfg.heading}
        </h1>
        <p className="text-ink-soft mt-2">
          {new Date(order.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs uppercase text-ink-soft" style={{ fontFamily: "var(--font-stamp)" }}>Status:</span>
          <span
            className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${cfg.color} ${cfg.bg}`}
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            {cfg.icon} {order.status}
          </span>
        </div>
      </div>

      {/* Pending — call confirmation */}
      {order.status === "Pending" && (
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">📞</span>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 mb-1" style={{ fontFamily: "var(--font-body)" }}>
                We'll be in touch soon!
              </p>
              <p className="text-sm text-amber-800 leading-relaxed">
                Our team will give you a call shortly to confirm your order and arrange delivery.
                Please keep your phone handy.
              </p>
              <p className="text-xs text-amber-600 mt-2">
                If you don't hear from us within 24 hours, feel free to reach out to us directly.
              </p>
              <div className="mt-3 border-t border-amber-200/50 pt-3">
                <CancelOrderButton orderId={orderId} isGuest={isGuest} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed banner */}
      {order.status === "Confirmed" && (
        <div className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">🎉</span>
            <div>
              <p className="font-semibold text-emerald-900 mb-1" style={{ fontFamily: "var(--font-body)" }}>
                Order confirmed!
              </p>
              <p className="text-sm text-emerald-800 leading-relaxed">
                Thank you! Your order is now being prepared for delivery. We'll be in touch when it's on the way.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cancelled banner */}
      {order.status === "Cancelled" && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">😔</span>
            <div>
              <p className="font-semibold text-red-900 mb-1" style={{ fontFamily: "var(--font-body)" }}>
                Order cancelled
              </p>
              <p className="text-sm text-red-800 leading-relaxed">
                This order was cancelled. If this was a mistake, you can place a new order from our shop.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order items */}
      <ul className="divide-y divide-ink/10 mb-8">
        {items.map((item) => (
          <li key={item.id} className="py-4 flex gap-4">
            <div className="w-12 shrink-0">
              <BookCover
                title={item.title}
                author={item.author}
                genre=""
                seed={item.cover_seed}
                className="w-full h-auto rounded-xl ring-1 ring-ink/10"
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold leading-snug" style={{ fontFamily: "var(--font-body)" }}>
                {item.title}
              </p>
              <p className="text-sm text-ink-soft">
                {item.author} · Qty {item.quantity}
              </p>
            </div>
            <div style={{ fontFamily: "var(--font-stamp)" }}>
              {formatPrice(item.price_cents * item.quantity)}
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-between text-lg font-semibold pt-4 border-t border-ink/10 mb-10">
        <span>Total</span>
        <span style={{ fontFamily: "var(--font-stamp)" }}>{formatPrice(order.total_cents)}</span>
      </div>

      <div className="text-center">
        <Link href="/shop" className="trail-link text-oxblood">
          Keep browsing
        </Link>
      </div>
    </div>
  );
}