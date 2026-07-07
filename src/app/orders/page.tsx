"use client";

import { Suspense, useState, useEffect } from "react";

import { useRouter } from "next/navigation";
export const dynamic = "force-dynamic";

// Utility for localStorage handling (guest orders)
const GUEST_ORDERS_KEY = "guestOrders";
const EXPIRY_DAYS = 14;

function saveGuestOrder(id: string) {
  try {
    const raw = localStorage.getItem(GUEST_ORDERS_KEY);
    const parsed: unknown[] = raw ? JSON.parse(raw) : [];
    const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Normalise old string[] format → {id, savedAt}[]
    const existing = parsed.map((e) =>
      typeof e === "string" ? { id: e, savedAt: now } : (e as { id: string; savedAt: number })
    );

    // Remove expired entries
    const fresh = existing.filter((o) => now - o.savedAt < expiryMs);

    // Add if not already saved
    if (!fresh.find((o) => o.id === id)) {
      fresh.push({ id, savedAt: now });
    }

    localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(fresh));
  } catch (e) {
    console.error("Failed to save guest order", e);
  }
}


export default function OrdersPage() {

  // Parse orderId from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qId = params.get('orderId');
    if (qId) setOrderId(qId);
  }, []);

  // State variables
  const [orderId, setOrderId] = useState<string>("");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);
  const router = useRouter();

  const fetchStatus = async () => {
    if (!orderId) return;
    setIsFetching(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`);
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setOrder(data);
      saveGuestOrder(orderId);
      if (data.status && data.status !== lastStatus) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Order Update", {
            body: `Order #${orderId} is now ${data.status}`,
          });
        }
        setLastStatus(data.status);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    await fetchStatus();
  };

  const handleRefresh = async () => {
    await fetchStatus();
  };

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-stamp)" }}>
          Check Your Order
        </h1>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="flex-1 border rounded px-2 py-1"
            required
          />
          <button type="submit" className="bg-oxblood text-cream px-4 py-1 rounded mr-2">Check</button>
          <button type="button" onClick={() => router.push('/my-orders')} className="bg-cream text-oxblood px-4 py-1 rounded">My Orders</button>
        </form>
        {error && <p className="mt-2 text-red-600 text-sm">❌ {error}</p>}
        {order && (
          <div className="border border-ink/10 p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-stamp)" }}>
                Order #{order.id}
              </h2>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                order.status === "Delivered" || order.status === "Confirmed"
                  ? "bg-emerald-100 text-emerald-700"
                  : order.status === "Shipped" || order.status === "Out for Delivery"
                  ? "bg-indigo-100 text-indigo-700"
                  : order.status === "Cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {order.status}
              </span>
            </div>

            {order.items && order.items.length > 0 && (
              <ul className="divide-y divide-ink/10">
                {order.items.map((item: any, i: number) => (
                  <li key={i} className="py-2 flex justify-between text-sm">
                    <span>{item.title} × {item.quantity}</span>
                    <span className="text-ink-soft">${((item.price_cents * item.quantity) / 100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-ink/10">
              <span className="font-semibold">Total</span>
              <span className="font-bold" style={{ fontFamily: "var(--font-stamp)" }}>
                ${(order.total_cents / 100).toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="w-full mt-1 bg-oxblood text-cream px-3 py-2 rounded-lg hover:bg-oxblood/80 transition text-sm font-semibold"
            >
              {isFetching ? "Refreshing…" : "↻ Refresh Status"}
            </button>
          </div>
        )}
      </div>
    </Suspense>
  );
}


