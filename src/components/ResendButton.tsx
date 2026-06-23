"use client";

import { useState, useTransition } from "react";
import { resendVerificationAction } from "@/app/actions/auth-actions";

export default function ResendButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleResend = () => {
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
    <div className="space-y-3 w-full text-center">
      <button
        onClick={handleResend}
        disabled={isPending}
        className="w-full px-5 py-2.5 rounded-full bg-oxblood text-cream hover:bg-oxblood-dark
                   transition-colors text-sm disabled:opacity-60 cursor-pointer font-semibold shadow-sm"
        style={{ fontFamily: "var(--font-stamp)" }}
      >
        {isPending ? "SENDING LINK…" : "RESEND VERIFICATION LINK"}
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
    </div>
  );
}
