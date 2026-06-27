"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const GUEST_ORDERS_KEY = "guestOrders";
const EXPIRY_DAYS = 14;

type SavedOrder = { id: string; savedAt: number; orderCode?: string };

function getSavedOrders(): SavedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_ORDERS_KEY);
    if (!raw) return [];
    const parsed: unknown[] = JSON.parse(raw);
    const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Support both old format (string[]) and new format ({ id, savedAt }[])
    const normalised: SavedOrder[] = parsed.map((entry) => {
      if (typeof entry === "string") return { id: entry, savedAt: now };
      return entry as SavedOrder;
    });

    // Filter to only non-expired orders
    return normalised.filter((o) => now - o.savedAt < expiryMs);
  } catch {
    return [];
  }
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fresh = getSavedOrders();
    setOrders(fresh);
    // Write back cleaned list (expired removed)
    try {
      localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(fresh));
    } catch {}
  }, []);

  const handleClick = (id: string) => {
    router.push(`/account/orders/${id}`);
  };

  const daysLeft = (savedAt: number) => {
    const ms = EXPIRY_DAYS * 24 * 60 * 60 * 1000 - (Date.now() - savedAt);
    return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        My Orders
      </h1>
      <p className="text-sm text-ink-soft mb-6">
        Orders are remembered on this device for {EXPIRY_DAYS} days.
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-ink-soft">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-lg mb-1">No saved orders yet.</p>
          <p className="text-sm">
            After you place an order your tracking info will appear here automatically.
          </p>
          <button
            onClick={() => router.push("/orders")}
            className="mt-6 bg-oxblood text-cream px-5 py-2 rounded-full text-sm hover:bg-oxblood/80 transition"
          >
            Track an order manually
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map(({ id, savedAt, orderCode }) => (
            <li
              key={id}
              onClick={() => handleClick(id)}
              className="border border-ink/10 p-4 rounded-xl hover:border-oxblood/40 hover:bg-parchment cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <p
                  className="font-bold text-oxblood"
                  style={{ fontFamily: "var(--font-stamp)" }}
                >
                  {orderCode ? `Order ${orderCode}` : `Order #${id}`}
                </p>
                <p className="text-xs text-ink-soft mt-0.5">
                  Expires in {daysLeft(savedAt)} day{daysLeft(savedAt) !== 1 ? "s" : ""}
                </p>
              </div>
              <span className="text-ink-soft/50 group-hover:text-oxblood transition text-lg">→</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
