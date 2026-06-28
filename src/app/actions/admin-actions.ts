"use server";

import path from "path";
import crypto from "crypto";
import { put } from "@vercel/blob";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createBook, updateBook, deleteBook, GENRES, updateOrderStatus, getOrder, getOrderItems } from "@/lib/db";
import { sendOrderShippedEmail, sendOrderDeliveredEmail, sendOrderOutForDeliveryEmail } from "@/lib/email";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    redirect("/login?next=/admin");
  }
}

const bookSchema = z.object({
  title: z.string().min(1, "Title is required."),
  author: z.string().min(1, "Author is required."),
  description: z.string().min(1, "Description is required."),
  genre: z.enum(GENRES, "Choose a genre."),
  price: z.coerce.number().min(0.01, "Price must be more than PKR 0."),
  stock: z.coerce.number().int().min(0, "Stock can't be negative."),
  isbn: z.string().optional().default(""),
  cover_seed: z.string().optional().default(""),
  cover_seed_2: z.string().optional().default(""),
});

export type BookFormState = { error?: string } | undefined;

async function processUpload(file: any, fieldName: string, titleSlug: string): Promise<string | undefined> {
  if (!file || !(file instanceof File) || file.size === 0) return undefined;
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error(`${fieldName} must be JPG, PNG, or WEBP`);
  if (file.size > 2 * 1024 * 1024) throw new Error(`${fieldName} exceeds 2 MB size limit`);

  const ext = path.extname(file.name).toLowerCase();
  const slug = titleSlug.replace(/\s+/g, "-").toLowerCase();
  const filename = `${slug}-${crypto.randomUUID()}${ext}`;

  // Upload directly without sharp resize (avoids SharedArrayBuffer restriction on Vercel)
  const blob = await put(`uploads/${filename}`, file, { access: "public" });
  return blob.url;
}

export async function createBookAction(
  _prev: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = bookSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Process cover image uploads
  let coverUrl: string | undefined;
  let coverUrl2: string | undefined;
  try {
    coverUrl = await processUpload(formData.get("cover_file"), "Primary cover image", parsed.data.title);
    coverUrl2 = await processUpload(formData.get("cover_file_2"), "Secondary cover image", parsed.data.title);
  } catch (err: any) {
    return { error: err.message || "Image upload failed." };
  }

  await createBook({
    title: parsed.data.title,
    author: parsed.data.author,
    description: parsed.data.description,
    genre: parsed.data.genre,
    price_cents: Math.round(parsed.data.price * 100),
    stock: parsed.data.stock,
    isbn: parsed.data.isbn ?? "",
    cover_seed: coverUrl || parsed.data.cover_seed || undefined,
    cover_seed_2: coverUrl2 || parsed.data.cover_seed_2 || null,
  });

  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect("/admin");
}

export async function updateBookAction(
  id: number,
  _prev: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  await requireAdmin();

  const parsed = bookSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // Process cover image uploads for update
  let coverUrl: string | undefined;
  let coverUrl2: string | undefined;
  try {
    coverUrl = await processUpload(formData.get("cover_file"), "Primary cover image", parsed.data.title);
    coverUrl2 = await processUpload(formData.get("cover_file_2"), "Secondary cover image", parsed.data.title);
  } catch (err: any) {
    return { error: err.message || "Image upload failed." };
  }

  await updateBook(id, {
    title: parsed.data.title,
    author: parsed.data.author,
    description: parsed.data.description,
    genre: parsed.data.genre,
    price_cents: Math.round(parsed.data.price * 100),
    stock: parsed.data.stock,
    isbn: parsed.data.isbn ?? "",
    cover_seed: coverUrl || parsed.data.cover_seed || undefined,
    cover_seed_2: coverUrl2 || parsed.data.cover_seed_2 || null,
  });

  revalidatePath("/admin");
  revalidatePath("/shop");
  revalidatePath(`/shop/${id}`);
  redirect("/admin");
}

export async function deleteBookAction(id: number) {
  await requireAdmin();
  await deleteBook(id);
  revalidatePath("/admin");
  revalidatePath("/shop");
}

export async function updateOrderStatusAction(orderId: number, formData: FormData): Promise<{ error?: string } | undefined> {
  await requireAdmin();
  const status = formData.get("status") as string;
  if (!status) return;

  try {
    await updateOrderStatus(orderId, status);
  } catch (error: any) {
    console.error("Failed to update order status:", error);
    return { error: error.message || "Failed to update order status." };
  }

  // Trigger status emails asynchronously (fire-and-forget)
  try {
    const order = await getOrder(orderId);
    if (order) {
      const items = await getOrderItems(orderId);
      const shipping = order.shipping_json ? JSON.parse(order.shipping_json) : {};

      const email = order.user_email || shipping.email || "";
      const customerName = shipping.fullName || order.user_name || "Customer";

      console.log(`[EMAIL DEBUG] orderId=${orderId} status=${status} email="${email}" shipping_keys=${Object.keys(shipping).join(",")} user_email="${order.user_email}"`);

      if (email) {
        if (status === "Shipped") {
          await sendOrderShippedEmail(email, orderId, customerName, items, order.total_cents, {
            address: shipping.address || "",
            area: shipping.area || "",
            city: shipping.city || "",
            phone: shipping.phone || "",
          });
        } else if (status === "Out for Delivery") {
          await sendOrderOutForDeliveryEmail(email, orderId, customerName, items, order.total_cents, {
            address: shipping.address || "",
            area: shipping.area || "",
            city: shipping.city || "",
            phone: shipping.phone || "",
          });
        } else if (status === "Delivered") {
          await sendOrderDeliveredEmail(email, orderId, customerName, items);
        }
      }
    }
  } catch (error) {
    console.error("Failed to send status update email:", error);
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
