"use client";

import { useState, useTransition } from "react";
import { resendVerificationAction } from "@/app/actions/auth-actions";

export default function ResendForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await resendVerificationAction(email);
        if (result.error) {
          setMessage({ type: "error", text: result.error });
        } else if (result.success) {
          setMessage({ type: "success", text: result.success });
        }
      } catch (err) {
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <label
          htmlFor="resend-email"
          className="text-xs tracking-[0.18em] uppercase text-ink-soft block mb-1.5"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          Email Address
        </label>
        <input
          id="resend-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full rounded-md border border-ink/20 bg-cream px-3 py-2.5 text-sm focus:border-oxblood transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !email}
        className="w-full px-5 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                   transition-colors text-sm disabled:opacity-60 cursor-pointer font-semibold shadow-sm"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {isPending ? "SENDING LINK…" : "SEND VERIFICATION LINK"}
      </button>

      {message && (
        <div 
          className={`text-xs px-3 py-2 rounded border transition-all duration-300 animate-fadeIn ${
            message.type === "success" 
              ? "bg-moss/10 border-moss/20 text-moss font-medium" 
              : "bg-oxblood/10 border-oxblood/20 text-oxblood font-medium"
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
}
