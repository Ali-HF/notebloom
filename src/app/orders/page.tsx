"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Utility for localStorage handling (guest orders)
const GUEST_ORDERS_KEY = "guestOrders";
function saveGuestOrder(id: string) {
  try {
    const existing = JSON.parse(localStorage.getItem(GUEST_ORDERS_KEY) || "[]");
    if (!existing.includes(id)) {
      existing.push(id);
      localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(existing));
    }
  } catch (e) {
    console.error("Failed to save guest order", e);
  }
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramId = searchParams?.get("orderId");

  const [orderId, setOrderId] = useState<string>(paramId ?? "");
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastStatus, setLastStatus] = useState<string>("");
  const [isFetching, setIsFetching] = useState(false);

  // Request notification permission once on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // When query param changes (e.g., from My Orders page), load that order automatically
  useEffect(() => {
    if (paramId) {
      setOrderId(paramId);
    }
  }, [paramId]);

  // Poll for status updates when an order is loaded
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [orderId, lastStatus]);

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
        <button type="submit" className="bg-oxblood text-cream px-4 py-1 rounded">
          Check
        </button>
      </form>
      {error && <p className="text-oxblood">{error}</p>}
      {order && (
        <div className="border p-4 rounded">
          <h2 className="text-xl font-medium mb-2">Order #{order.id}</h2>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> ${(order.total_cents / 100).toFixed(2)}</p>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="mt-2 bg-oxblood text-cream px-3 py-1 rounded hover:bg-oxblood/80 transition"
          >
            {isFetching ? "Refreshing…" : "Refresh Status"}
          </button>
        </div>
      )}
    </div>
  );
}


