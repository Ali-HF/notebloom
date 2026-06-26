import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Reuse the same localStorage key as orders page
const GUEST_ORDERS_KEY = "guestOrders";

function getSavedOrders(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(GUEST_ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    setOrders(getSavedOrders());
  }, []);

  const handleClick = (id: string) => {
    router.push(`/orders?orderId=${id}`);
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-stamp)" }}>
        My Orders
      </h1>
      {orders.length === 0 ? (
        <p>No saved orders.</p>
      ) : (
        <ul className="space-y-2">
          {orders.map((id) => (
            <li key={id} className="border p-2 rounded hover:bg-gray-100 cursor-pointer" onClick={() => handleClick(id)}>
              Order #{id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
