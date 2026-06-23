"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRedirect({ to, delay = 3000 }: { to: string; delay?: number }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(to);
    }, delay);
    return () => clearTimeout(timer);
  }, [router, to, delay]);

  return (
    <p className="text-xs text-ink-soft/60 mt-4 text-center italic">
      Redirecting to login in {Math.round(delay / 1000)} seconds...
    </p>
  );
}
