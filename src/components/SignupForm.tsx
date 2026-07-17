"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth-actions";

export default function SignupForm({ next, initialEmail = "" }: { next: string; initialEmail?: string }) {
  const [state, formAction, isPending] = useActionState(signupAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label
          htmlFor="name"
          className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood transition-colors"
        />
      </div>

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
          defaultValue={initialEmail}
          autoComplete="email"
          className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood transition-colors"
        />
        <p className="text-xs text-ink-soft/70 mt-1">At least 8 characters.</p>
      </div>

      {state?.error && <p className="text-sm text-oxblood">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-5 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                   transition-colors text-sm disabled:opacity-60 cursor-pointer"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {isPending ? "CREATING ACCOUNT…" : "CREATE ACCOUNT"}
      </button>

      <p className="text-sm text-ink-soft text-center">
        Already have an account?{" "}
        <Link href={`/notebloom-secure-gate-77?next=${encodeURIComponent(next)}`} className="trail-link text-oxblood">
          Log in
        </Link>
      </p>
    </form>
  );
}
