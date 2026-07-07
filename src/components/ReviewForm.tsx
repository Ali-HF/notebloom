"use client";

import { useActionState, useState } from "react";
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
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [state, formAction, isPending] = useActionState(
    submitReviewAction.bind(null, bookId, orderId, orderCode),
    undefined
  );

  return (
    <form action={formAction} className="space-y-3 max-w-md" data-no-progress>
      <div className="flex items-center gap-3">
        <span
          className="text-sm text-ink-soft"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          RATING
        </span>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => {
            const active = hoverRating !== null ? hoverRating >= n : rating >= n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(null)}
                className="focus:outline-none transition-transform hover:scale-110 cursor-pointer p-0.5"
                aria-label={`${n} Star${n > 1 ? "s" : ""}`}
              >
                <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 1.5l2.6 5.6 6.1.6-4.6 4 1.4 6-5.5-3.3-5.5 3.3 1.4-6-4.6-4 6.1-.6L10 1.5Z"
                    fill={active ? "var(--color-brass)" : "transparent"}
                    stroke="var(--color-brass)"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            );
          })}
        </div>
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
