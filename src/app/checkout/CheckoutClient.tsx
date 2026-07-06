"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { checkoutAction } from "@/app/actions/cart-actions";
import BookCover from "@/components/BookCover";
import { parseProductMedia } from "@/lib/cart-utils";
import { calculateDelivery, getDeliveryOptions, formatWeight } from "@/lib/delivery-pricing";

type CartRow = {
  id: number;
  book_id: number;
  quantity: number;
  title: string;
  author: string;
  price_cents: number;
  cover_seed: string;
  stock: number;
  color?: string | null;
  color_images?: string | null;
  weight_grams: number;
};

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
  addressType?: string;
  delivery?: string;
};

export default function CheckoutClient({
  items,
  savedShipping,
  userEmail,
  isGuest,
}: {
  items: CartRow[];
  savedShipping: ShippingDetails | null;
  userEmail: string;
  isGuest: boolean;
}) {
  const [state, formAction, isPending] = useActionState(checkoutAction, undefined);

  // Initialize selected colors for each item (keyed by unique item.id)
  const [selectedColors, setSelectedColors] = useState<Record<number, string>>(() => {
    const initialColors: Record<number, string> = {};
    items.forEach((item) => {
      if (item.color) {
        initialColors[item.id] = item.color;
      } else if (item.color_images) {
        const media = parseProductMedia(item.color_images);
        if (media.categories.length > 0) {
          initialColors[item.id] = media.categories[0].name;
        }
      }
    });
    return initialColors;
  });

  const [form, setForm] = useState({
    fullName: savedShipping?.fullName || "",
    email: userEmail || "",
    phone: savedShipping?.phone || "",
    addressType: savedShipping?.addressType || "home",
    street: savedShipping?.address || "",
    apartment: savedShipping?.apartment || "",
    city: savedShipping?.city || "Karachi",
    area: savedShipping?.area || "",
    landmark: savedShipping?.landmark || "",
    delivery: savedShipping?.delivery || "standard",
    notes: savedShipping?.instructions || "",
    promo: "",
    promoOpen: false,
  });

  const set = (key: string, val: string | boolean) => setForm((p) => ({ ...p, [key]: val }));

  const subtotalCents = items.reduce((s, i) => s + i.price_cents * i.quantity, 0);
  const totalWeightGrams = items.reduce((sum, item) => sum + (item.weight_grams || 200) * item.quantity, 0);
  const shippingCost = calculateDelivery(totalWeightGrams, form.city, form.delivery as "standard" | "express");
  const shippingCents = shippingCost * 100;
  const totalCents = subtotalCents + shippingCents;

  const formatPrice = (cents: number) => `PKR ${(cents / 100).toFixed(2)}`;

  const s = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#faf6ec", // adjusted to match Cream background of the site
      backgroundImage: "radial-gradient(circle, #20283a0a 1px, transparent 1px)", // adjusted dots color
      backgroundSize: "20px 20px",
      fontFamily: "var(--font-stamp)", // adjusted to match site space mono font variable
      display: "flex",
      flexDirection: "column" as const,
    },
    nav: {
      backgroundColor: "#faf6ec",
      borderBottom: "1px solid #ddd4c0",
      padding: "0.75rem 1.25rem",
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.5rem",
    },
    backBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "0.72rem",
      color: "var(--color-oxblood)", // adjusted to brand oxblood
      cursor: "pointer",
      background: "none",
      border: "none",
      fontFamily: "inherit",
      letterSpacing: "0.05em",
    },
    navCenter: {
      position: "absolute" as const,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: "4px",
    },
    navLogo: {
      fontSize: "1.25rem",
      fontWeight: "700",
      color: "var(--color-ink)", // adjusted to brand ink
      fontFamily: "var(--font-display)", // adjusted to brand display font
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    breadcrumb: {
      display: "flex",
      gap: "1rem",
      fontSize: "0.65rem",
      letterSpacing: "0.08em",
    },
    breadcrumbStep: (active: boolean) => ({
      color: active ? "var(--color-oxblood)" : "var(--color-ink-soft)",
      fontWeight: active ? "700" : "400",
      borderBottom: active ? "2px solid var(--color-oxblood)" : "none",
      paddingBottom: "1px",
    }),
    lockIcon: { fontSize: "1rem", color: "var(--color-ink-soft)" },
    main: {
      flex: 1,
      maxWidth: "1060px",
      width: "100%",
      margin: "0 auto",
      padding: "2.5rem 1.5rem",
      display: "flex",
      flexDirection: "column" as const,
      gap: "1.75rem",
      alignItems: "flex-start",
    },
    left: { flex: 1, display: "flex", flexDirection: "column" as const, gap: "1.25rem" },
    card: {
      backgroundColor: "#fff",
      border: "1px solid #ddd4c0",
      borderRadius: "10px",
      padding: "1.5rem",
      boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "1.25rem",
    },
    stepBadge: {
      width: "28px",
      height: "28px",
      border: "1.5px solid var(--color-oxblood)",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.75rem",
      fontWeight: "700",
      color: "var(--color-oxblood)",
      flexShrink: 0,
    },
    cardTitle: {
      fontSize: "1.1rem",
      fontWeight: "700",
      color: "var(--color-ink)",
      fontFamily: "var(--font-display)",
    },
    row2: { display: "flex", gap: "0.75rem" },
    fieldWrap: {
      display: "flex",
      flexDirection: "column" as const,
      flex: 1,
      border: "1px solid #ddd4c0",
      borderRadius: "6px",
      padding: "8px 12px",
      backgroundColor: "#fdfaf5",
    },
    fieldLabel: {
      fontSize: "0.6rem",
      color: "var(--color-ink-soft)",
      letterSpacing: "0.08em",
      marginBottom: "4px",
      textTransform: "uppercase" as const,
    },
    fieldInput: {
      border: "none",
      background: "transparent",
      outline: "none",
      fontSize: "0.88rem",
      color: "var(--color-ink)",
      fontFamily: "inherit",
      width: "100%",
    },
    phoneWrap: {
      display: "flex",
      border: "1px solid #ddd4c0",
      borderRadius: "6px",
      backgroundColor: "#fdfaf5",
      overflow: "hidden",
      marginTop: "0.75rem",
    },
    phonePrefix: {
      display: "flex",
      flexDirection: "column" as const,
      padding: "8px 12px",
      borderRight: "1px solid #ddd4c0",
      minWidth: "60px",
    },
    phoneInput: {
      flex: 1,
      display: "flex",
      flexDirection: "column" as const,
      padding: "8px 12px",
    },
    errorText: {
      fontSize: "0.7rem",
      color: "var(--color-oxblood)",
      marginTop: "8px",
      fontWeight: "600",
      letterSpacing: "0.05em",
    },
    addrToggle: {
      display: "flex",
      gap: "0.6rem",
      marginBottom: "1rem",
    },
    addrBtn: (active: boolean) => ({
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 14px",
      border: `1.5px solid ${active ? "var(--color-oxblood)" : "#ddd4c0"}`,
      borderRadius: "20px",
      fontSize: "0.72rem",
      fontWeight: active ? "700" : "400",
      color: active ? "var(--color-oxblood)" : "var(--color-ink-soft)",
      backgroundColor: active ? "var(--color-cream)" : "#fff",
      cursor: "pointer",
      fontFamily: "inherit",
      letterSpacing: "0.04em",
    }),
    select: {
      border: "none",
      background: "transparent",
      outline: "none",
      fontSize: "0.88rem",
      color: "var(--color-ink)",
      fontFamily: "inherit",
      width: "100%",
      cursor: "pointer",
    },
    deliveryGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "0.75rem",
    },
    deliveryCard: (active: boolean) => ({
      border: `1.5px solid ${active ? "var(--color-oxblood)" : "#ddd4c0"}`,
      borderRadius: "8px",
      padding: "0.9rem 1rem",
      cursor: "pointer",
      backgroundColor: active ? "#fdfaf5" : "#fff",
      transition: "all 0.2s ease",
    }),
    deliveryTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px",
    },
    deliveryName: {
      fontSize: "0.95rem",
      fontWeight: "700",
      color: "var(--color-ink)",
      fontFamily: "var(--font-display)",
    },
    deliveryPrice: { fontSize: "0.8rem", color: "var(--color-oxblood)", fontWeight: "600" },
    deliveryDesc: { fontSize: "0.72rem", color: "var(--color-ink-soft)", lineHeight: "1.5" },
    payCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      border: "1.5px solid var(--color-oxblood)",
      borderRadius: "8px",
      padding: "0.9rem 1rem",
      backgroundColor: "#fdfaf5",
    },
    payLeft: { display: "flex", alignItems: "center", gap: "0.75rem" },
    payName: { fontSize: "0.95rem", fontWeight: "700", color: "var(--color-ink)", fontFamily: "var(--font-display)" },
    payDesc: { fontSize: "0.72rem", color: "var(--color-ink-soft)", marginTop: "2px" },
    checkCircle: { fontSize: "1.1rem", color: "var(--color-oxblood)" },
    textarea: {
      width: "100%",
      border: "1px solid #ddd4c0",
      borderRadius: "6px",
      padding: "10px 12px",
      fontSize: "0.85rem",
      color: "var(--color-ink)",
      fontFamily: "inherit",
      backgroundColor: "#fdfaf5",
      resize: "vertical" as const,
      minHeight: "80px",
      outline: "none",
      boxSizing: "border-box" as const,
    },
    placeBtn: {
      width: "100%",
      marginTop: "1rem",
      padding: "1rem",
      backgroundColor: "#3d1208",
      color: "#f5f0e8",
      border: "none",
      borderRadius: "8px",
      fontSize: "0.82rem",
      fontWeight: "700",
      letterSpacing: "0.12em",
      cursor: "pointer",
      fontFamily: "inherit",
      transition: "opacity 0.2s",
    },

    // Right summary
    right: { width: "100%", flexShrink: 0 },
    summaryCard: {
      backgroundColor: "#fff",
      border: "1px solid #ddd4c0",
      borderRadius: "10px",
      padding: "1.25rem",
    },
    summaryTitle: {
      fontSize: "1.1rem",
      fontWeight: "700",
      color: "var(--color-ink)",
      fontFamily: "var(--font-display)",
      marginBottom: "1rem",
      paddingBottom: "0.75rem",
      borderBottom: "1px solid #ddd4c0",
    },
    summaryItem: {
      display: "flex",
      gap: "0.75rem",
      alignItems: "center",
      marginBottom: "0.9rem",
    },
    summaryImg: {
      width: "52px",
      height: "52px",
      borderRadius: "6px",
      border: "1px solid #ddd4c0",
      flexShrink: 0,
    },
    summaryItemInfo: { flex: 1 },
    summaryItemName: { fontSize: "0.85rem", fontWeight: "700", color: "var(--color-ink)", fontFamily: "var(--font-display)", marginBottom: "2px" },
    summaryItemSku: { fontSize: "0.68rem", color: "var(--color-ink-soft)" },
    summaryItemPrice: { fontSize: "0.82rem", fontWeight: "700", color: "var(--color-ink)", whiteSpace: "nowrap" as const },
    promoToggle: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "0.72rem",
      color: "var(--color-ink-soft)",
      cursor: "pointer",
      padding: "0.75rem 0",
      borderTop: "1px solid #ddd4c0",
      borderBottom: "1px solid #ddd4c0",
      marginBottom: "0.9rem",
      letterSpacing: "0.05em",
    },
    summaryRow: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "0.82rem",
      color: "var(--color-ink-soft)",
      marginBottom: "0.5rem",
    },
    summaryTotal: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "1rem",
      fontWeight: "700",
      color: "var(--color-ink)",
      fontFamily: "var(--font-display)",
      marginTop: "0.5rem",
      paddingTop: "0.75rem",
      borderTop: "1px solid #ddd4c0",
    },
    trustGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "0.75rem",
      marginTop: "0.75rem",
    },
    trustCard: {
      border: "1px solid #ddd4c0",
      borderRadius: "8px",
      padding: "0.75rem",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      gap: "6px",
      backgroundColor: "#fdfaf5",
    },
    trustIcon: { fontSize: "1.2rem" },
    trustLabel: { fontSize: "0.62rem", color: "var(--color-ink-soft)", textAlign: "center" as const, letterSpacing: "0.05em" },

    footer: {
      backgroundColor: "#faf6ec",
      borderTop: "1px solid #ddd4c0",
      padding: "2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "3rem",
    },
    footerLogo: {
      fontSize: "1rem",
      fontWeight: "700",
      color: "var(--color-ink)",
      fontFamily: "var(--font-display)",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    footerSub: { fontSize: "0.72rem", color: "var(--color-ink-soft)", marginTop: "4px" },
    footerLinks: {
      display: "flex",
      gap: "1.25rem",
    },
    footerLink: {
      fontSize: "0.72rem",
      color: "var(--color-oxblood)",
      textDecoration: "underline",
      cursor: "pointer",
    },
  };

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        {/* Row 1: back + lock */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/cart" style={s.backBtn as React.CSSProperties}>
            ← BACK TO CART
          </Link>
          <span style={s.lockIcon}>🔒</span>
        </div>

        {/* Row 2: logo + breadcrumb centered */}
        <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: "6px" }}>
          <div className="relative h-20 w-64 shrink-0 -my-5">
            <Image
              src="/logo-transparent.png"
              alt="Notebloom Logo"
              fill
              priority
              className="object-contain scale-145 origin-center"
            />
          </div>
          <div style={s.breadcrumb}>
            <span style={s.breadcrumbStep(false)}>CART</span>
            <span style={s.breadcrumbStep(true)}>CHECKOUT</span>
            <span style={s.breadcrumbStep(false)}>CONFIRMATION</span>
          </div>
        </div>
      </nav>

      <form action={formAction}>
        {/* Hidden inputs to pass state elements to server actions */}
        <input type="hidden" name="addressType" value={form.addressType} />
        <input type="hidden" name="delivery" value={form.delivery} />
        <input type="hidden" name="paymentMethod" value="cod" />

        <main style={s.main} className="md:!flex-row">
          <div style={s.left}>
            {/* 01 Contact */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.stepBadge}>01</div>
                <span style={s.cardTitle}>Contact Information</span>
              </div>
              <div style={s.row2}>
                <label style={s.fieldWrap} className="focus-within:!border-oxblood/60 focus-within:ring-1 focus-within:ring-oxblood/30 transition-all cursor-text">
                  <span style={s.fieldLabel}>Full Name *</span>
                  <input
                    style={s.fieldInput}
                    name="fullName"
                    required
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                  />
                </label>
                <label style={{ ...s.fieldWrap, position: "relative" }} className="focus-within:!border-oxblood/60 focus-within:ring-1 focus-within:ring-oxblood/30 transition-all cursor-text">
                  <span style={s.fieldLabel}>Email Address *</span>
                  <input
                    style={s.fieldInput}
                    name="email"
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    disabled={!isGuest}
                  />
                  <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem" }}>🔒</span>
                </label>
              </div>
              <label style={s.phoneWrap} className="focus-within:!border-oxblood/60 focus-within:ring-1 focus-within:ring-oxblood/30 transition-all cursor-text">
                <div style={s.phonePrefix}>
                  <span style={s.fieldLabel}>Phone Number *</span>
                  <span style={{ fontSize: "0.88rem", color: "var(--color-ink)" }}>+92</span>
                </div>
                <div style={s.phoneInput}>
                  <span style={s.fieldLabel}>&nbsp;</span>
                  <input
                    style={s.fieldInput}
                    name="phone"
                    required
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </div>
              </label>
              {state?.error && state.error.toLowerCase().includes("phone") && (
                <div style={s.errorText}>{state.error.toUpperCase()}</div>
              )}
            </div>

            {/* 02 Delivery Address */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.stepBadge}>02</div>
                <span style={s.cardTitle}>Delivery Address</span>
              </div>
              <div style={s.addrToggle}>
                <button
                  type="button"
                  style={s.addrBtn(form.addressType === "home")}
                  onClick={() => set("addressType", "home")}
                >
                  🏠 HOME (PRIMARY)
                </button>
                <button
                  type="button"
                  style={s.addrBtn(form.addressType === "studio")}
                  onClick={() => set("addressType", "studio")}
                >
                  🗂 STUDIO
                </button>
              </div>
              <label style={{ ...s.fieldWrap, marginBottom: "0.75rem" }} className="focus-within:!border-oxblood/60 focus-within:ring-1 focus-within:ring-oxblood/30 transition-all cursor-text">
                <span style={s.fieldLabel}>Street Address *</span>
                <input
                  style={s.fieldInput}
                  name="address"
                  required
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                />
              </label>
              <div style={{ ...s.row2, marginBottom: "0.75rem" }}>
                <label style={s.fieldWrap} className="focus-within:!border-oxblood/60 focus-within:ring-1 focus-within:ring-oxblood/30 transition-all cursor-text">
                  <span style={s.fieldLabel}>Apartment / Suite (Optional)</span>
                  <input
                    style={s.fieldInput}
                    name="apartment"
                    value={form.apartment}
                    onChange={(e) => set("apartment", e.target.value)}
                  />
                </label>
                <label style={s.fieldWrap} className="focus-within:!border-oxblood/60 focus-within:ring-1 focus-within:ring-oxblood/30 transition-all cursor-text">
                  <span style={s.fieldLabel}>Area / Neighbourhood *</span>
                  <input
                    style={s.fieldInput}
                    name="area"
                    required
                    value={form.area}
                    onChange={(e) => set("area", e.target.value)}
                    placeholder="e.g. DHA Phase 5"
                  />
                </label>
              </div>
              <div style={s.row2}>
                <label style={s.fieldWrap} className="focus-within:!border-oxblood/60 focus-within:ring-1 focus-within:ring-oxblood/30 transition-all cursor-text">
                  <span style={s.fieldLabel}>City *</span>
                  <select
                    style={s.select}
                    name="city"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  >
                    <option value="Lahore">Lahore, Punjab</option>
                    <option value="Karachi">Karachi, Sindh</option>
                    <option value="Islamabad">Islamabad, ICT</option>
                    <option value="Rawalpindi">Rawalpindi, Punjab</option>
                    <option value="Faisalabad">Faisalabad, Punjab</option>
                  </select>
                </label>
                <label style={s.fieldWrap} className="focus-within:!border-oxblood/60 focus-within:ring-1 focus-within:ring-oxblood/30 transition-all cursor-text">
                  <span style={s.fieldLabel}>Landmark (Optional)</span>
                  <input
                    style={s.fieldInput}
                    name="landmark"
                    value={form.landmark}
                    onChange={(e) => set("landmark", e.target.value)}
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-4 select-none">
                <input
                  type="checkbox"
                  name="saveAddress"
                  value="yes"
                  defaultChecked={!!savedShipping}
                  className="accent-oxblood"
                />
                <span className="text-xs text-ink-soft font-medium">Save this address for future orders</span>
              </label>
            </div>

            {/* 03 Delivery Method */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.stepBadge}>03</div>
                <span style={s.cardTitle}>Delivery Method</span>
              </div>
              <div style={s.deliveryGrid}>
                {(() => {
                  const options = getDeliveryOptions(totalWeightGrams, form.city);
                  const isKarachi = form.city.toLowerCase() === "karachi";
                  return [
                    { key: "standard", name: "Standard", price: `Rs. ${options.standard}`, desc: "3-5 Business Days. Tracked courier service." },
                    { key: "express", name: "Express", price: `Rs. ${options.express}`, desc: isKarachi ? "Next Day Delivery (Karachi Only)." : "48-72 hours nationwide." },
                  ].map((opt) => (
                    <div
                      key={opt.key}
                      style={s.deliveryCard(form.delivery === opt.key)}
                      onClick={() => set("delivery", opt.key)}
                    >
                      <div style={s.deliveryTop}>
                        <span style={s.deliveryName}>{opt.name}</span>
                        <span style={s.deliveryPrice}>{opt.price}</span>
                      </div>
                      <div style={s.deliveryDesc}>{opt.desc}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* 04 Payment */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.stepBadge}>04</div>
                <span style={s.cardTitle}>Payment</span>
              </div>
              <div style={s.payCard}>
                <div style={s.payLeft}>
                  <span style={{ fontSize: "1.1rem" }}>💵</span>
                  <div>
                    <div style={s.payName}>Cash on Delivery</div>
                    <div style={s.payDesc}>Pay in cash upon receiving your order.</div>
                  </div>
                </div>
                <span style={s.checkCircle}>✅</span>
              </div>
            </div>

            {/* 05 Order Notes */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.stepBadge}>05</div>
                <span style={s.cardTitle}>Order Notes</span>
              </div>
              <div style={{ ...s.fieldWrap, padding: 0, border: "none" }}>
                <span style={{ ...s.fieldLabel, padding: "8px 12px 0" }}>Additional Instructions</span>
                <textarea
                  style={s.textarea}
                  name="instructions"
                  placeholder="e.g. Please leave at the porch if not home."
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </div>

            {state?.error && !state.error.toLowerCase().includes("phone") && (
              <p className="text-sm text-oxblood font-semibold my-1">{state.error}</p>
            )}

            <button type="submit" disabled={isPending} style={s.placeBtn}>
              {isPending ? "PLACING ORDER..." : "PLACE ORDER · COD"}
            </button>
          </div>

          {/* Right: Order Summary */}
          <div style={s.right} className="md:!w-[320px] order-first md:order-last">
            <div style={s.summaryCard}>
              <div style={s.summaryTitle}>Order Summary</div>

              <div className="max-h-[300px] overflow-y-auto pr-1">
                {items.map((item) => {
                  let currentSeed = item.cover_seed;
                  let colorsList: Array<{ url: string; color: string; stock: number }> = [];
                  if (item.color_images) {
                    const media = parseProductMedia(item.color_images);
                    colorsList = media.categories.map((c) => ({
                      color: c.name,
                      url: c.images[0] || item.cover_seed,
                      stock: c.stock,
                    }));
                    const selectedColor = selectedColors[item.id];
                    const found = colorsList.find((ci) => ci.color === selectedColor);
                    if (found) {
                      currentSeed = found.url;
                    }
                  }

                  return (
                    <div key={item.id} style={{ ...s.summaryItem, height: "auto", minHeight: "80px", alignItems: "flex-start", padding: "0.75rem 0" }}>
                      <input
                        type="hidden"
                        name={`color_${item.id}`}
                        value={selectedColors[item.id] || ""}
                      />
                      <div style={s.summaryImg} className="overflow-hidden bg-cream flex items-center justify-center shrink-0">
                        <BookCover
                          title={item.title}
                          author={item.author}
                          genre=""
                          seed={currentSeed}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div style={s.summaryItemInfo} className="flex-1 min-w-0 pr-2">
                        <div style={s.summaryItemName} className="truncate">
                          {item.title} {item.quantity > 1 ? `x${item.quantity}` : ""}
                        </div>
                        <div style={s.summaryItemSku}>SKU: NB-00{item.book_id}</div>
                        
                        {/* Dynamic Color Selector Pills */}
                        {colorsList.length > 0 && (
                          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[9px] tracking-wider text-ink-soft uppercase block mb-1 font-bold" style={{ fontFamily: "var(--font-stamp)" }}>
                              Color: {selectedColors[item.id] || "None"}
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {colorsList.map((ci) => {
                                const isSelected = selectedColors[item.id] === ci.color;
                                const isOutOfStock = ci.stock <= 0;
                                return (
                                  <button
                                    key={ci.color}
                                    type="button"
                                    disabled={isOutOfStock && !isSelected}
                                    onClick={() => setSelectedColors((prev) => ({ ...prev, [item.id]: ci.color }))}
                                    className={`px-3 py-1.5 sm:px-2 sm:py-0.5 rounded-full text-[10px] sm:text-[9px] uppercase font-bold tracking-wider transition-all border active:scale-95 touch-manipulation select-none ${
                                      isSelected
                                        ? "bg-oxblood text-cream border-oxblood shadow-sm scale-105"
                                        : isOutOfStock
                                        ? "bg-ink/5 text-ink-soft/40 border-ink/10 line-through cursor-not-allowed opacity-50"
                                        : "bg-cream text-ink-soft border-ink/20 hover:border-ink/40 active:bg-ink/5"
                                    }`}
                                    style={{ fontFamily: "var(--font-stamp)", minWidth: "44px", minHeight: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                  >
                                    {ci.color} {isOutOfStock ? "(SOLD OUT)" : `(${ci.stock})`}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <span style={s.summaryItemPrice} className="shrink-0">{formatPrice(item.price_cents * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div style={s.promoToggle} onClick={() => set("promoOpen", !form.promoOpen)}>
                <span>HAVE A PROMO CODE?</span>
                <span>{form.promoOpen ? "▲" : "▾"}</span>
              </div>
              {form.promoOpen && (
                <label style={{ ...s.fieldWrap, marginBottom: "0.9rem" }} className="focus-within:!border-oxblood/60 focus-within:ring-1 focus-within:ring-oxblood/30 transition-all cursor-text">
                  <span style={s.fieldLabel}>Promo Code</span>
                  <input
                    style={s.fieldInput}
                    placeholder="Enter code"
                    value={form.promo}
                    onChange={(e) => set("promo", e.target.value)}
                  />
                </label>
              )}

              <div style={s.summaryRow}>
                <span>Total Weight</span>
                <span>{formatWeight(totalWeightGrams)}</span>
              </div>
              <div style={s.summaryRow}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotalCents)}</span>
              </div>
              <div style={s.summaryRow}>
                <span>Shipping</span>
                <span>{formatPrice(shippingCents)}</span>
              </div>
              <div style={s.summaryTotal}>
                <span>Total</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
            </div>

            <div style={s.trustGrid}>
              <div style={s.trustCard}>
                <span style={s.trustIcon}>🛡️</span>
                <span style={s.trustLabel}>SECURE ENCRYPTION</span>
              </div>
              <div style={s.trustCard}>
                <span style={s.trustIcon}>📦</span>
                <span style={s.trustLabel}>PLASTIC-FREE SHIPPING</span>
              </div>
            </div>
          </div>
        </main>
      </form>

      {/* Footer */}
      <footer style={s.footer}>
        <div>
          <div className="relative h-7 w-28 shrink-0 mb-1">
            <Image
              src="/logo-transparent.png"
              alt="Notebloom Logo"
              fill
              className="object-contain"
            />
          </div>
          <div style={s.footerSub}>© 2026 Notebloom Stationery. Crafted for focus.</div>
        </div>
        <div style={s.footerLinks}>
          {["Privacy Policy", "Terms of Service", "Shipping Info"].map((l) => (
            <a key={l} style={s.footerLink}>
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
