"use client";

import { useActionState } from "react";
import { submitReviewAction } from "@/app/actions/review-actions";

export default function ReviewForm({
  bookId,
  orderId,
  orderCode,
}: {
  bookId: number;
  orderId?: number;
  orderCode?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    submitReviewAction.bind(null, bookId, orderId, orderCode),
    undefined
  );

  return (
    <form action={formAction} className="space-y-3 max-w-md" data-no-progress>
      <div className="flex items-center gap-3">
        <label
          htmlFor="rating"
          className="text-sm text-ink-soft"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          RATING
        </label>
        <select
          id="rating"
          name="rating"
          required
          defaultValue="5"
          className="rounded-md border border-ink/20 bg-cream px-2 py-1.5 text-sm focus:border-oxblood"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "star" : "stars"}
            </option>
          ))}
        </select>
      </div>

      <textarea
        name="comment"
        rows={3}
        placeholder="What did you think?"
        className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2 text-sm
                   focus:border-oxblood transition-colors"
      />

      {state?.error && <p className="text-sm text-oxblood">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="text-sm px-4 py-2 rounded-full bg-ink text-cream hover:bg-ink-soft transition-colors
                   disabled:opacity-60 cursor-pointer"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {isPending ? "POSTING…" : "POST REVIEW"}
      </button>
    </form>
  );
}
