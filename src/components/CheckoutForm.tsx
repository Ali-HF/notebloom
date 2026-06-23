"use client";

import { useActionState } from "react";
import { checkoutAction } from "@/app/actions/cart-actions";

type ShippingDetails = {
  fullName: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  altPhone?: string;
  landmark?: string;
  apartment?: string;
  instructions?: string;
};

export default function CheckoutForm({
  savedShipping,
  isGuest = false,
}: {
  savedShipping: ShippingDetails | null;
  isGuest?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(checkoutAction, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <h2
        className="text-lg border-b border-ink/10 pb-2 font-semibold text-ink"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Shipment Details
      </h2>

      {isGuest && (
        <div>
          <label htmlFor="email" className="text-[10px] tracking-[0.18em] uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm focus:border-oxblood focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Full Name & Phone Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="text-[10px] tracking-[0.18em] uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            placeholder="John Doe"
            defaultValue={savedShipping?.fullName || ""}
            className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm focus:border-oxblood focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-[10px] tracking-[0.18em] uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            placeholder="03001234567"
            defaultValue={savedShipping?.phone || ""}
            className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm focus:border-oxblood focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Alternate Phone Number & Flat/Floor/Building Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="altPhone" className="text-[10px] tracking-[0.18em] uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
            Alt Phone (Optional)
          </label>
          <input
            type="tel"
            id="altPhone"
            name="altPhone"
            placeholder="03217654321"
            defaultValue={savedShipping?.altPhone || ""}
            className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm focus:border-oxblood focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="apartment" className="text-[10px] tracking-[0.18em] uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
            Flat / Floor / Building (Optional)
          </label>
          <input
            type="text"
            id="apartment"
            name="apartment"
            placeholder="Flat 4B, 3rd Floor"
            defaultValue={savedShipping?.apartment || ""}
            className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm focus:border-oxblood focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Complete Street Address */}
      <div>
        <label htmlFor="address" className="text-[10px] tracking-[0.18em] uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
          Street Address *
        </label>
        <textarea
          id="address"
          name="address"
          rows={2}
          required
          placeholder="House number, street name, block..."
          defaultValue={savedShipping?.address || ""}
          className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm focus:border-oxblood focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Area & Nearest Landmark */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="area" className="text-[10px] tracking-[0.18em] uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
            Area / Neighbourhood *
          </label>
          <input
            type="text"
            id="area"
            name="area"
            required
            placeholder="DHA, Clifton, Gulshan, etc."
            defaultValue={savedShipping?.area || ""}
            className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm focus:border-oxblood focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label htmlFor="landmark" className="text-[10px] tracking-[0.18em] uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
            Nearest Landmark (Optional)
          </label>
          <input
            type="text"
            id="landmark"
            name="landmark"
            placeholder="e.g. Near Shell Pump"
            defaultValue={savedShipping?.landmark || ""}
            className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm focus:border-oxblood focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* City */}
      <div>
        <label htmlFor="city" className="text-[10px] tracking-[0.18em] uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
          City *
        </label>
        <select
          id="city"
          name="city"
          required
          defaultValue={savedShipping?.city || "Karachi"}
          className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood focus:outline-none cursor-pointer"
        >
          <option value="Karachi">Karachi</option>
          <option value="Lahore">Lahore</option>
          <option value="Islamabad">Islamabad</option>
          <option value="Rawalpindi">Rawalpindi</option>
          <option value="Faisalabad">Faisalabad</option>
          <option value="Multan">Multan</option>
          <option value="Peshawar">Peshawar</option>
          <option value="Quetta">Quetta</option>
        </select>
      </div>

      {/* Delivery Instructions */}
      <div>
        <label htmlFor="instructions" className="text-[10px] tracking-[0.18em] uppercase text-ink-soft block mb-1" style={{ fontFamily: "var(--font-stamp)" }}>
          Delivery Instructions (Optional)
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows={1.5}
          placeholder="e.g. Call before arriving, leave with guard..."
          defaultValue={savedShipping?.instructions || ""}
          className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm focus:border-oxblood focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Save address checkbox */}
      <label className="flex items-center gap-2 cursor-pointer py-1">
        <input
          type="checkbox"
          name="saveAddress"
          value="yes"
          defaultChecked={!!savedShipping}
          className="accent-oxblood"
        />
        <span className="text-xs text-ink-soft select-none">Save this address for future orders</span>
      </label>

      {/* Payment Options Section */}
      <div className="pt-2">
        <span
          className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-2.5"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          Payment Method
        </span>
        <div className="space-y-2.5">
          {/* Cash on Delivery */}
          <label className="flex items-center justify-between p-3 rounded-lg border border-ink/20 bg-cream cursor-pointer hover:border-oxblood/40 transition-colors">
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                defaultChecked
                className="accent-oxblood"
              />
              <span className="text-sm font-medium text-ink">Cash on Delivery (CoD)</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-moss bg-moss/15 px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-stamp)" }}>
              Active
            </span>
          </label>

          {/* Visa / Card */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-ink/10 bg-cream/50 opacity-60">
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                disabled
                className="accent-oxblood"
              />
              <span className="text-sm font-medium text-ink-soft">Visa / Credit Card</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-oxblood bg-oxblood/10 px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-stamp)" }}>
              Coming Soon
            </span>
          </div>

          {/* JazzCash */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-ink/10 bg-cream/50 opacity-60">
            <div className="flex items-center gap-2.5">
              <input
                type="radio"
                name="paymentMethod"
                value="jazzcash"
                disabled
                className="accent-oxblood"
              />
              <span className="text-sm font-medium text-ink-soft">JazzCash Mobile Wallet</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-oxblood bg-oxblood/10 px-2 py-0.5 rounded-full" style={{ fontFamily: "var(--font-stamp)" }}>
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-oxblood font-semibold">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-6 py-3 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                   transition-all text-sm disabled:opacity-60 cursor-pointer shadow-sm hover:shadow"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {isPending ? "PLACING ORDER…" : "PLACE ORDER"}
      </button>
    </form>
  );
}
