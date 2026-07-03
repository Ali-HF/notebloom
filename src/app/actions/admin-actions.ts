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

  // Process primary thumbnail/cover image upload
  let coverUrl: string | undefined;
  try {
    coverUrl = await processUpload(formData.get("cover_file"), "Thumbnail image", parsed.data.title);
  } catch (err: any) {
    return { error: err.message || "Thumbnail upload failed." };
  }

  const coverSeedInput = formData.get("cover_seed") as string;
  let resolvedThumbnail = coverUrl || coverSeedInput || "";

  // 1. Process Generic Pictures
  const genericKeysStr = formData.get("generic_picture_keys") as string || "";
  const genericKeys = genericKeysStr.split(",").filter(Boolean);
  const genericPictures: string[] = [];

  try {
    for (const key of genericKeys) {
      const file = formData.get(`generic_file_${key}`);
      const url = formData.get(`generic_url_${key}`) as string;

      let imageUrl = url || "";
      if (file && (file as File).size > 0) {
        const uploadedUrl = await processUpload(file, "Generic picture", parsed.data.title);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      if (imageUrl) {
        genericPictures.push(imageUrl);
      }
    }
  } catch (err: any) {
    return { error: err.message || "Generic pictures upload failed." };
  }

  // 2. Process Categories
  const categoryKeysStr = formData.get("category_keys") as string || "";
  const categoryKeys = categoryKeysStr.split(",").filter(Boolean);
  const categoriesList: Array<{ name: string; images: string[] }> = [];

  try {
    for (const catKey of categoryKeys) {
      const name = (formData.get(`category_name_${catKey}`) as string || "").trim();
      if (!name) continue;

      const imgKeysStr = formData.get(`category_${catKey}_picture_keys`) as string || "";
      const imgKeys = imgKeysStr.split(",").filter(Boolean);
      const categoryImages: string[] = [];

      for (const imgKey of imgKeys) {
        const file = formData.get(`category_${catKey}_file_${imgKey}`);
        const url = formData.get(`category_${catKey}_url_${imgKey}`) as string;

        let imageUrl = url || "";
        if (file && (file as File).size > 0) {
          const uploadedUrl = await processUpload(file, `Category (${name}) picture`, parsed.data.title);
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
          }
        }
        if (imageUrl) {
          categoryImages.push(imageUrl);
        }
      }

      categoriesList.push({
        name,
        images: categoryImages
      });
    }
  } catch (err: any) {
    return { error: err.message || "Category pictures upload failed." };
  }

  // Backwards compatibility fallback for thumbnail
  if (!resolvedThumbnail) {
    resolvedThumbnail = genericPictures[0] || categoriesList[0]?.images[0] || "/images/placeholder.png";
  }

  const mediaJson = JSON.stringify({
    generic_pictures: genericPictures,
    categories: categoriesList
  });

  await createBook({
    title: parsed.data.title,
    author: parsed.data.author,
    description: parsed.data.description,
    genre: parsed.data.genre,
    price_cents: Math.round(parsed.data.price * 100),
    stock: parsed.data.stock,
    isbn: parsed.data.isbn ?? "",
    cover_seed: resolvedThumbnail,
    cover_seed_2: genericPictures[0] || null,
    color_images: mediaJson,
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

  // Process primary thumbnail/cover image upload
  let coverUrl: string | undefined;
  try {
    coverUrl = await processUpload(formData.get("cover_file"), "Thumbnail image", parsed.data.title);
  } catch (err: any) {
    return { error: err.message || "Thumbnail upload failed." };
  }

  const coverSeedInput = formData.get("cover_seed") as string;
  let resolvedThumbnail = coverUrl || coverSeedInput || undefined;

  // 1. Process Generic Pictures
  const genericKeysStr = formData.get("generic_picture_keys") as string || "";
  const genericKeys = genericKeysStr.split(",").filter(Boolean);
  const genericPictures: string[] = [];

  try {
    for (const key of genericKeys) {
      if (key.startsWith("existing_")) {
        const url = formData.get(`generic_url_${key}`) as string;
        if (url) genericPictures.push(url);
      } else {
        const file = formData.get(`generic_file_${key}`);
        const url = formData.get(`generic_url_${key}`) as string;

        let imageUrl = url || "";
        if (file && (file as File).size > 0) {
          const uploadedUrl = await processUpload(file, "Generic picture", parsed.data.title);
          if (uploadedUrl) {
            imageUrl = uploadedUrl;
          }
        }
        if (imageUrl) {
          genericPictures.push(imageUrl);
        }
      }
    }
  } catch (err: any) {
    return { error: err.message || "Generic pictures upload failed." };
  }

  // 2. Process Categories
  const categoryKeysStr = formData.get("category_keys") as string || "";
  const categoryKeys = categoryKeysStr.split(",").filter(Boolean);
  const categoriesList: Array<{ name: string; images: string[] }> = [];

  try {
    for (const catKey of categoryKeys) {
      const name = (formData.get(`category_name_${catKey}`) as string || "").trim();
      if (!name) continue;

      const imgKeysStr = formData.get(`category_${catKey}_picture_keys`) as string || "";
      const imgKeys = imgKeysStr.split(",").filter(Boolean);
      const categoryImages: string[] = [];

      for (const imgKey of imgKeys) {
        if (imgKey.startsWith("existing_")) {
          const url = formData.get(`category_${catKey}_url_${imgKey}`) as string;
          if (url) categoryImages.push(url);
        } else {
          const file = formData.get(`category_${catKey}_file_${imgKey}`);
          const url = formData.get(`category_${catKey}_url_${imgKey}`) as string;

          let imageUrl = url || "";
          if (file && (file as File).size > 0) {
            const uploadedUrl = await processUpload(file, `Category (${name}) picture`, parsed.data.title);
            if (uploadedUrl) {
              imageUrl = uploadedUrl;
            }
          }
          if (imageUrl) {
            categoryImages.push(imageUrl);
          }
        }
      }

      categoriesList.push({
        name,
        images: categoryImages
      });
    }
  } catch (err: any) {
    return { error: err.message || "Category pictures upload failed." };
  }

  // Backwards compatibility fallback for thumbnail
  if (!resolvedThumbnail) {
    resolvedThumbnail = coverUrl || coverSeedInput || genericPictures[0] || categoriesList[0]?.images[0] || undefined;
  }

  const mediaJson = JSON.stringify({
    generic_pictures: genericPictures,
    categories: categoriesList
  });

  await updateBook(id, {
    title: parsed.data.title,
    author: parsed.data.author,
    description: parsed.data.description,
    genre: parsed.data.genre,
    price_cents: Math.round(parsed.data.price * 100),
    stock: parsed.data.stock,
    isbn: parsed.data.isbn ?? "",
    cover_seed: resolvedThumbnail,
    cover_seed_2: genericPictures[0] || null,
    color_images: mediaJson,
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
