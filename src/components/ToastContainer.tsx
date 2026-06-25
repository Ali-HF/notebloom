"use client";

import { useEffect, useState } from "react";

type Toast = {
  id: string;
  message: string;
  type: "success" | "error";
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: "success" | "error" }>;
      const { message, type } = customEvent.detail;
      const id = Math.random().toString(36).substring(2, 9);
      
      setToasts((prev) => [...prev, { id, message, type }]);

      // Remove after 3.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    window.addEventListener("notebloom-toast", handleToast);
    return () => window.removeEventListener("notebloom-toast", handleToast);
  }, []);

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 w-full max-w-[340px] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-md border transition-all duration-300 animate-slideIn ${
            t.type === "success"
              ? "bg-cream/95 border-moss/20 text-moss"
              : "bg-cream/95 border-oxblood/20 text-oxblood"
          }`}
          style={{ backdropFilter: "blur(8px)" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-base">
              {t.type === "success" ? "🛍️" : "⚠️"}
            </span>
            <p className="text-sm font-medium text-ink" style={{ fontFamily: "var(--font-body)" }}>
              {t.message}
            </p>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
            className="text-ink-soft/40 hover:text-ink-soft/80 text-[10px] tracking-wider font-bold cursor-pointer transition-colors"
            style={{ fontFamily: "var(--font-stamp)" }}
          >
            DISMISS
          </button>
        </div>
      ))}
    </div>
  );
}
