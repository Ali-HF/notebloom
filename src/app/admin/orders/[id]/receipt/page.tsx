import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getOrder, getOrderItems, formatPrice } from "@/lib/db";
import PrintTrigger from "@/components/PrintTrigger";
import BloomMark from "@/components/BloomMark";

export default async function OrderReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) redirect("/login?next=/admin/orders");

  const { id } = await params;
  const orderId = Number(id);
  const order = await getOrder(orderId);
  if (!order) notFound();

  const items = await getOrderItems(orderId);
  const orderCode = (order as any).order_code ?? `#${order.id}`;

  let shipping = {
    fullName: order.user_name || "Customer",
    phone: "N/A",
    address: "N/A",
    area: "N/A",
    city: "Karachi",
    altPhone: "",
    landmark: "",
    apartment: "",
    instructions: "",
  };

  if (order.shipping_json) {
    try {
      shipping = { ...shipping, ...JSON.parse(order.shipping_json) };
    } catch (e) {
      console.error("Failed to parse shipping JSON for order:", orderId, e);
    }
  }

  return (
    <div className="min-h-screen bg-cream-light py-10 print:bg-white print:py-0">
      <PrintTrigger />

      <div className="max-w-2xl mx-auto bg-cream p-8 sm:p-12 ring-1 ring-ink/10 rounded-xl shadow-sm print:ring-0 print:shadow-none print:bg-white print:p-0">

        <div className="flex flex-col items-center text-center border-b border-ink/20 pb-6 mb-6">
          <BloomMark size={40} className="mb-2" />
          <h1
            className="text-2xl tracking-tight text-ink font-semibold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Notebloom
          </h1>
          <p className="text-[10px] tracking-[0.18em] uppercase text-ink-soft mt-1" style={{ fontFamily: "var(--font-stamp)" }}>
            Aesthetic Stationery & Journals
          </p>
          <p className="text-xs text-ink-soft/75 mt-1.5">Karachi, Pakistan · support@notebloom.shop</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm mb-6 pb-6 border-b border-ink/10">
          <div>
            <p className="text-xs uppercase text-ink-soft tracking-wider" style={{ fontFamily: "var(--font-stamp)" }}>Order Reference</p>
            <p className="font-semibold text-base mt-0.5 text-ink">{orderCode}</p>
            <p className="text-xs text-ink-soft/60 mt-0.5">Internal ID: #{order.id}</p>
            <p className="text-xs text-ink-soft mt-1">
              Date: {new Date(order.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-ink-soft tracking-wider" style={{ fontFamily: "var(--font-stamp)" }}>Payment Method</p>
            <p className="font-semibold text-base mt-0.5 text-ink">
              {order.payment_method === "cod" ? "Cash on Delivery" : "Prepaid"}
            </p>
            <p className="text-xs text-moss font-semibold uppercase tracking-wider mt-1" style={{ fontFamily: "var(--font-stamp)" }}>
              {order.status}
            </p>
          </div>
        </div>

        <div className="mb-8 p-4 bg-cream-dark/30 rounded-lg ring-1 ring-ink/5">
          <h2
            className="text-xs uppercase tracking-wider text-ink-soft mb-3 border-b border-ink/10 pb-1"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Delivery Address & Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            <div>
              <span className="text-xs text-ink-soft block">Recipient Name:</span>
              <span className="font-semibold text-ink">{shipping.fullName}</span>
            </div>
            <div>
              <span className="text-xs text-ink-soft block">Primary Phone:</span>
              <span className="font-semibold text-ink">{shipping.phone}</span>
            </div>
            {shipping.altPhone && (
              <div>
                <span className="text-xs text-ink-soft block">Alternate Phone:</span>
                <span className="font-semibold text-ink">{shipping.altPhone}</span>
              </div>
            )}
            <div>
              <span className="text-xs text-ink-soft block">Area / Sector:</span>
              <span className="font-semibold text-ink">{shipping.area}</span>
            </div>
            <div>
              <span className="text-xs text-ink-soft block">City:</span>
              <span className="font-semibold text-ink">{shipping.city}</span>
            </div>
            {shipping.apartment && (
              <div>
                <span className="text-xs text-ink-soft block">Apartment / Floor:</span>
                <span className="font-semibold text-ink">{shipping.apartment}</span>
              </div>
            )}
            {shipping.landmark && (
              <div>
                <span className="text-xs text-ink-soft block">Nearest Landmark:</span>
                <span className="font-semibold text-ink">{shipping.landmark}</span>
              </div>
            )}
            {shipping.instructions && (
              <div className="sm:col-span-2">
                <span className="text-xs text-ink-soft block">Instructions:</span>
                <span className="text-ink italic">&ldquo;{shipping.instructions}&rdquo;</span>
              </div>
            )}
            <div className="sm:col-span-2 mt-1 border-t border-ink/5 pt-2">
              <span className="text-xs text-ink-soft block">Full Delivery Destination:</span>
              <span className="text-ink font-medium">{shipping.address}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2
            className="text-xs uppercase tracking-wider text-ink-soft mb-3 border-b border-ink/10 pb-1"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Purchased Items
          </h2>
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-ink/20 text-xs text-ink-soft" style={{ fontFamily: "var(--font-stamp)" }}>
                <th className="py-2">Item Description</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-ink/10 text-ink">
                  <td className="py-2.5 pr-2 font-medium">
                    {item.title}
                    <span className="block text-xs font-normal text-ink-soft">{item.author}</span>
                  </td>
                  <td className="py-2.5 text-right" style={{ fontFamily: "var(--font-stamp)" }}>
                    {formatPrice(item.price_cents)}
                  </td>
                  <td className="py-2.5 text-center">{item.quantity}</td>
                  <td className="py-2.5 text-right font-semibold" style={{ fontFamily: "var(--font-stamp)" }}>
                    {formatPrice(item.price_cents * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-end text-sm gap-2 border-t border-ink/20 pt-4">
          <div className="flex justify-between w-64 text-ink-soft">
            <span>Subtotal</span>
            <span style={{ fontFamily: "var(--font-stamp)" }}>{formatPrice(order.total_cents)}</span>
          </div>
          <div className="flex justify-between w-64 text-ink-soft">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between w-64 font-bold text-base text-ink border-t border-ink/10 pt-2.5">
            <span>Order Total</span>
            <span style={{ fontFamily: "var(--font-stamp)" }}>{formatPrice(order.total_cents)}</span>
          </div>
        </div>

        <div className="text-center mt-12 text-xs text-ink-soft/70 border-t border-ink/10 pt-4">
          <p>Thank you for buying from Notebloom!</p>
          <p className="mt-1">Please retain this invoice as proof of purchase.</p>
        </div>
      </div>
    </div>
  );
}