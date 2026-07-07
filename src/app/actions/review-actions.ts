"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { upsertReview, hasUserPurchasedBook } from "@/lib/db";

export type ReviewState = { error?: string } | undefined;

export async function submitReviewAction(
  bookId: number,
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?next=/shop/${bookId}`);

  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").slice(0, 1000);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Choose a rating from 1 to 5." };
  }



  const isAllowed = session.user.isAdmin || await hasUserPurchasedBook(Number(session.user.id), bookId);
  if (!isAllowed) {
    return { error: "Only verified buyers or admins can review this product." };
  }

  await upsertReview(bookId, Number(session.user.id), rating, comment);
  revalidatePath(`/shop/${bookId}`);
}
