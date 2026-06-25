"use client";

import { useActionState } from "react";
import Link from "next/link";
import BloomMark from "@/components/BloomMark";
import { forgotPasswordAction } from "@/app/actions/auth-actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, undefined);

  return (
    <div className="max-w-sm mx-auto px-4 py-20 animate-fadeIn">
      <div className="flex flex-col items-center gap-3 mb-8">
        <BloomMark size={36} />
        <h1
          className="text-3xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          Reset Password
        </h1>
        <p className="text-sm text-ink-soft text-center">
          Enter your email address and we'll send you a secure link to reset your password.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood transition-colors"
          />
        </div>

        {state?.error && <p className="text-sm text-oxblood">{state.error}</p>}
        {state?.success && (
          <div className="bg-moss/10 border border-moss/20 text-moss px-4 py-3 rounded-lg text-sm font-medium text-center">
            {state.success}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full px-5 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                     transition-colors text-sm disabled:opacity-60 cursor-pointer"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          {isPending ? "SENDING LINK…" : "SEND RESET LINK"}
        </button>

        <p className="text-sm text-ink-soft text-center">
          Remember your password?{" "}
          <Link href="/login" className="trail-link text-oxblood font-semibold">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
