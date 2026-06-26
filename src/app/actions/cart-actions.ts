"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { 
  getCart, 
  addToCart, 
  setCartQty, 
  removeFromCart, 
  placeOrder, 
  saveUserShipping, 
  getBook, 
  getOrCreateGuestUser 
} from "@/lib/db";
import { sendWhatsappNotification } from "@/lib/whatsapp";
import { sendOrderConfirmationRequestEmail } from "@/lib/email";

export async function addToCartAction(bookId: number, qty: number = 1) {
  const session = await auth();
  if (session?.user?.id) {
    await addToCart(Number(session.user.id), bookId, qty);
  } else {
    // Guest cart in cookies
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get("notebloom_cart")?.value;
    let cart: Array<{ book_id: number; quantity: number }> = [];
    if (cartCookie) {
      try {
        const parsed = JSON.parse(cartCookie);
        if (Array.isArray(parsed)) cart = parsed;
      } catch (_e) {
      }
    }
    const idx = cart.findIndex((it) => it.book_id === bookId);
    if (idx >= 0) {
      cart[idx].quantity += qty;
    } else {
      cart.push({ book_id: bookId, quantity: qty });
    }
    cookieStore.set("notebloom_cart", JSON.stringify(cart), { maxAge: 86400 * 30, path: "/" });
  }
  revalidatePath("/cart");
  revalidatePath("/shop");
}

export async function addToCartWithQtyAction(bookId: number, formData: FormData) {
  const session = await auth();
  const qty = Number(formData.get("qty"));
  const cleanQty = Number.isFinite(qty) && qty > 0 ? qty : 1;

  if (session?.user?.id) {
    await addToCart(Number(session.user.id), bookId, cleanQty);
  } else {
    // Guest cart in cookies
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get("notebloom_cart")?.value;
    let cart: Array<{ book_id: number; quantity: number }> = [];
    if (cartCookie) {
      try {
        const parsed = JSON.parse(cartCookie);
        if (Array.isArray(parsed)) cart = parsed;
      } catch (_e) {
      }
    }
    const idx = cart.findIndex((it) => it.book_id === bookId);
    if (idx >= 0) {
      cart[idx].quantity += cleanQty;
    } else {
      cart.push({ book_id: bookId, quantity: cleanQty });
    }
    cookieStore.set("notebloom_cart", JSON.stringify(cart), { maxAge: 86400 * 30, path: "/" });
  }
  revalidatePath("/cart");
  revalidatePath("/shop");
}

export async function updateCartQtyAction(bookId: number, formData: FormData) {
  const session = await auth();
  const qty = Number(formData.get("qty"));
  const cleanQty = Number.isFinite(qty) ? qty : 1;

  if (session?.user?.id) {
    await setCartQty(Number(session.user.id), bookId, cleanQty);
  } else {
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get("notebloom_cart")?.value;
    if (cartCookie) {
      try {
        const cart: Array<{ book_id: number; quantity: number }> = JSON.parse(cartCookie);
        if (Array.isArray(cart)) {
          const idx = cart.findIndex((it) => it.book_id === bookId);
          if (idx >= 0) {
            if (cleanQty <= 0) {
              cart.splice(idx, 1);
            } else {
              cart[idx].quantity = cleanQty;
            }
            cookieStore.set("notebloom_cart", JSON.stringify(cart), { maxAge: 86400 * 30, path: "/" });
          }
        }
      } catch (_e) {
      }
    }
  }
  revalidatePath("/cart");
}

export async function removeFromCartAction(bookId: number) {
  const session = await auth();
  if (session?.user?.id) {
    await removeFromCart(Number(session.user.id), bookId);
  } else {
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get("notebloom_cart")?.value;
    if (cartCookie) {
      try {
        const cart: Array<{ book_id: number; quantity: number }> = JSON.parse(cartCookie);
        if (Array.isArray(cart)) {
          const filtered = cart.filter((it) => it.book_id !== bookId);
          cookieStore.set("notebloom_cart", JSON.stringify(filtered), { maxAge: 86400 * 30, path: "/" });
        }
      } catch (_e) {
      }
    }
  }
  revalidatePath("/cart");
}

export async function checkoutAction(prevState: unknown, formData: FormData): Promise<{ error?: string }> {
  const session = await auth();
  let userId: number;
  let email = "";

  // 1. Retrieve shipping fields
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const area = formData.get("area") as string;
  const city = formData.get("city") as string;
  const altPhone = (formData.get("altPhone") as string) || "";
  const landmark = (formData.get("landmark") as string) || "";
  const apartment = (formData.get("apartment") as string) || "";
  const instructions = (formData.get("instructions") as string) || "";
  const saveAddress = formData.get("saveAddress") === "yes";

  // 2. Validate essential fields
  if (!fullName || fullName.trim() === "") return { error: "Full Name is required." };
  if (!phone || phone.trim() === "") return { error: "Phone Number is required." };
  if (!address || address.trim() === "") return { error: "Street Address is required." };
  if (!area || area.trim() === "") return { error: "Area / Neighbourhood is required." };
  if (!city || city.trim() === "") return { error: "City is required." };

  if (session?.user?.id) {
    userId = Number(session.user.id);
    email = session.user.email || "";
  } else {
    // Guest checkout requires email
    email = (formData.get("email") as string) || "";
    if (!email || !email.includes("@")) {
      return { error: "A valid Email Address is required for guest checkout." };
    }
    userId = await getOrCreateGuestUser(fullName, email);
  }

  // 3. Resolve cart items (from database for logged-in users, or from cookies for guests)
  let cartItems;
  if (session?.user?.id) {
    cartItems = await getCart(userId);
  } else {
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get("notebloom_cart")?.value;
    const tempCart: Array<{ book_id: number; quantity: number }> = cartCookie ? JSON.parse(cartCookie) : [];
    
    const resolvedItems = [];
    for (const item of tempCart) {
      const book = await getBook(item.book_id);
      if (book) {
        resolvedItems.push({
          id: 0,
          book_id: book.id,
          quantity: item.quantity,
          title: book.title,
          author: book.author,
          price_cents: book.price_cents,
          cover_seed: book.cover_seed,
          stock: book.stock,
        });
      }
    }
    cartItems = resolvedItems;
  }

  if (cartItems.length === 0) {
    return { error: "Your cart is empty. Please add items before checking out." };
  }

  // 4. Serialize shipping details
  const delivery = (formData.get("delivery") as string) || "standard";
  const shippingCost = delivery === "express" ? 350 : 150;
  const shippingCents = shippingCost * 100;

  const shippingDetails = {
    fullName: fullName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    area: area.trim(),
    city: city.trim(),
    altPhone: altPhone.trim(),
    landmark: landmark.trim(),
    apartment: apartment.trim(),
    instructions: instructions.trim(),
    delivery: delivery,
    shippingCost: shippingCost,
  };
  const shippingJson = JSON.stringify(shippingDetails);

  // 5. Place order
  const result = await placeOrder(userId, shippingJson, "cod", cartItems, shippingCents);
  if ("error" in result) {
    return { error: result.error };
  }

  // 6. Save address for future orders if checked and logged in
  if (saveAddress && session?.user?.id) {
    await saveUserShipping(userId, shippingJson);
  }

  // Set guest order access cookie and clear guest cart if not logged in
  if (!session?.user?.id) {
    const cookieStore = await cookies();
    cookieStore.set(`guest_order_access_${result.orderId}`, "true", { maxAge: 86400 * 7, path: "/" }); // 7 days access
    cookieStore.delete("notebloom_cart");
  }

  // 7. Format order summary details
  const itemsSummary = cartItems
    .map((item) => `${item.title} x${item.quantity} (PKR ${(item.price_cents / 100).toFixed(2)} each)`)
    .join(", ");
  const totalPKR = `PKR ${(result.total / 100).toFixed(2)}`;

  // 8. Log confirmation details to console
  console.log("\n==================================================");
  console.log("ORDER CONFIRMATION LOGGING");
  console.log(`Order ID:      #${result.orderId}`);
  console.log(`Customer Name: ${fullName}`);
  console.log(`Email:         ${email}`);
  console.log(`Phone:         ${phone} ${altPhone ? `(Alt: ${altPhone})` : ""}`);
  console.log(`Address:       ${address}`);
  console.log(`Location:      Area: ${area}, City: ${city}`);
  if (apartment) console.log(`Apartment:    ${apartment}`);
  if (landmark)  console.log(`Landmark:     ${landmark}`);
  if (instructions) console.log(`Instructions: ${instructions}`);
  console.log(`Items:         ${itemsSummary}`);
  console.log(`Total:         ${totalPKR}`);
  console.log("==================================================");

  // 9. Send WhatsApp confirmation (fire-and-forget)
  try {
    const whatsappBody =
      `Hi ${fullName}! 🛍️ Thanks for ordering from *Notebloom*!\n\n` +
      `Your order *#${result.orderId}* (Total: ${totalPKR}) has been received.\n\n` +
      `📦 Reply *confirm* to confirm your order\n` +
      `❌ Reply *cancel* to cancel\n\n` +
      `We'll start processing as soon as you confirm!`;
    const whatsappSent = await sendWhatsappNotification(phone, whatsappBody);
    console.log(`WhatsApp notification ${whatsappSent ? "✅ sent" : "⚠️ skipped/failed"} for order #${result.orderId}`);
  } catch (whatsappError) {
    console.error("WhatsApp notification failed (non-blocking):", whatsappError);
  }

  // 10. Send Email (fire-and-forget)
  try {
    const targetEmail = email || "customer@example.com";
    await sendOrderConfirmationRequestEmail(
      targetEmail,
      result.orderId,
      fullName,
      cartItems,
      result.total,
      shippingDetails
    );
  } catch (emailError) {
    console.error("Email notification failed (non-blocking):", emailError);
  }

  revalidatePath("/cart");
  revalidatePath("/account");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  redirect(`/account/orders/${result.orderId}?new=true`);
}
