import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllOrders, formatPrice } from "@/lib/db";
import OrderStatusSelect from "@/components/OrderStatusSelect";

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) notFound();

  const orders = await getAllOrders();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p
            className="text-xs tracking-[0.22em] uppercase text-oxblood mb-2"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Admin
          </p>
          <h1
            className="text-4xl"
            style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
          >
            All orders
          </h1>
        </div>
        <Link
          href="/admin"
          className="px-4 py-2 rounded-full ring-1 ring-ink/20 text-sm hover:ring-oxblood transition-colors"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          ← INVENTORY
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-ink-soft">No orders yet.</p>
      ) : (
        <ul className="divide-y divide-ink/10">
          {orders.map((o) => (
            <li key={o.id} className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                  {(o as any).order_code ?? `#${o.id}`}
                  <span className="text-xs text-ink-soft/50 ml-1.5">(#{o.id})</span>
                  {" — "}
                  {o.user_name}
                </p>
                <p className="text-sm text-ink-soft">
                  {o.user_email} ·{" "}
                  {new Date(o.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                <span className="font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
                  {formatPrice(o.total_cents)}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/orders/${o.id}/receipt`}
                    target="_blank"
                    className="text-[10px] px-2.5 py-1 rounded-full bg-cream ring-1 ring-ink/20 text-ink hover:ring-oxblood hover:text-oxblood transition-colors inline-block whitespace-nowrap"
                    style={{ fontFamily: "var(--font-stamp)" }}
                  >
                    PRINT RECEIPT
                  </Link>
                  <OrderStatusSelect orderId={o.id} currentStatus={o.status} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}