"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth-actions";

export default function LoginForm({ next, verified, resetSuccess }: { next: string; verified?: boolean; resetSuccess?: boolean }) {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {verified && (
        <div className="bg-moss/10 border border-moss/20 text-moss px-4 py-3 rounded-lg text-sm font-medium text-center animate-fadeIn">
          Your account is verified! You can now log in.
        </div>
      )}
      {resetSuccess && (
        <div className="bg-moss/10 border border-moss/20 text-moss px-4 py-3 rounded-lg text-sm font-medium text-center animate-fadeIn">
          Your password has been reset! Please log in with your new password.
        </div>
      )}
      <input type="hidden" name="next" value={next} />

      <div>
        <label
          htmlFor="email"
          className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          Email
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

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label
            htmlFor="password"
            className="text-xs tracking-[0.18em] uppercase text-ink-soft block"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            Password
          </label>
          <Link href={`/forgot-password?next=${encodeURIComponent(next)}`} className="text-xs text-oxblood hover:underline">
            Forgot?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood transition-colors"
        />
      </div>

      {state?.error && <p className="text-sm text-oxblood">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-5 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                   transition-colors text-sm disabled:opacity-60 cursor-pointer"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {isPending ? "LOGGING IN…" : "LOG IN"}
      </button>

      <p className="text-sm text-ink-soft text-center">
        New here?{" "}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="trail-link text-oxblood">
          Create an account
        </Link>
      </p>
      <p className="text-xs text-ink-soft/70 text-center">
        Demo admin: admin@paperworm.shop / paperworm123
      </p>
    </form>
  );
}
