"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import WormMark from "@/components/WormMark";
import { resetPasswordAction } from "@/app/actions/auth-actions";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, formAction, isPending] = useActionState(resetPasswordAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <div>
        <label
          htmlFor="password"
          className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          New Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood transition-colors"
        />
      </div>

      {state?.error && <p className="text-sm text-oxblood">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending || !token}
        className="w-full px-5 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                   transition-colors text-sm disabled:opacity-60 cursor-pointer"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {isPending ? "UPDATING PASSWORD…" : "RESET PASSWORD"}
      </button>

      {!token && (
        <p className="text-sm text-oxblood text-center font-medium">
          Error: Invalid or missing reset token.
        </p>
      )}
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="max-w-sm mx-auto px-4 py-20 animate-fadeIn">
      <div className="flex flex-col items-center gap-3 mb-8">
        <WormMark size={36} />
        <h1
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Choose a new password
        </h1>
        <p className="text-sm text-ink-soft text-center">
          Enter your new password below. It must be at least 8 characters long.
        </p>
      </div>

      <Suspense fallback={<div className="text-center text-sm text-ink-soft">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
