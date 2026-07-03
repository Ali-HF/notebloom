"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function FeedbackManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Progress bar state
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const fadeTimer = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);

    setProgress(10);
    setVisible(true);

    progressTimer.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (progressTimer.current) clearInterval(progressTimer.current);
          return 90;
        }
        // Decelerating growth
        const step = (90 - prev) * 0.15;
        return prev + step;
      });
    }, 150);
  };

  const stopProgress = () => {
    if (progressTimer.current) clearInterval(progressTimer.current);
    setProgress(100);

    fadeTimer.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setProgress(0), 250);
    }, 400);
  };

  // Complete progress on navigation change
  useEffect(() => {
    stopProgress();
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    // 1. Intercept standard <a> clicks to show top progress bar
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");
      const downloadAttr = anchor.getAttribute("download");

      // Skip external links, target="_blank", anchors/hash links, downloads, and javascript links
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        targetAttr === "_blank" ||
        downloadAttr !== null
      ) {
        return;
      }

      // Check same-origin
      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;

        // If it's the exact same pathname and search params, skip
        if (url.pathname === window.location.pathname && url.search === window.location.search && !url.hash) {
          return;
        }
      } catch (err) {
        return;
      }

      startProgress();
    };

    // 2. Form submission spinner handler
    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (!form.checkValidity()) return;

      const submitter = (e.submitter || form.querySelector('button[type="submit"], input[type="submit"]')) as HTMLElement;
      if (submitter) {
        if (!form.hasAttribute("data-no-loading")) {
          submitter.classList.add("btn-loading");
        }
        
        if (!form.hasAttribute("data-no-progress")) {
          startProgress();
        }

        // 8s automatic fallback in case page doesn't reload
        setTimeout(() => {
          submitter.classList.remove("btn-loading");
        }, 8000);
      }
    };

    // 3. Mobile touch feedback: Ripple & Bloom
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const cx = touch.clientX;
      const cy = touch.clientY;

      const target = touch.target as HTMLElement;
      const clickable = target.closest("button, a, [role='button'], input[type='submit'], input[type='button']");

      if (clickable) {
        const rect = clickable.getBoundingClientRect();
        const x = cx - rect.left;
        const y = cy - rect.top;

        // Spawn contained ripple
        clickable.classList.add("mobile-ripple-host");
        const ripple = document.createElement("span");
        ripple.className = "mobile-ripple-span";

        const size = Math.max(rect.width, rect.height) * 2.5;
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x - size / 2}px`;
        ripple.style.top = `${y - size / 2}px`;

        clickable.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
          if (clickable.querySelectorAll(".mobile-ripple-span").length === 0) {
            clickable.classList.remove("mobile-ripple-host");
          }
        }, 550);
      } else {
        // Spawn free-floating touch bloom ripple
        const bloom = document.createElement("div");
        bloom.style.cssText = `
          position: fixed;
          left: ${cx}px;
          top: ${cy}px;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(175,138,79,0.4) 0%, rgba(124,47,47,0.15) 60%, transparent 100%);
          transform: translate(-50%, -50%) scale(0);
          pointer-events: none;
          animation: mobile-touch-bloom 450ms ease-out forwards;
          z-index: 9998;
        `;
        document.body.appendChild(bloom);
        setTimeout(() => bloom.remove(), 480);
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    document.addEventListener("submit", handleFormSubmit);

    if (isCoarse) {
      document.addEventListener("touchstart", handleTouchStart, { passive: true });
    }

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      document.removeEventListener("submit", handleFormSubmit);
      if (isCoarse) {
        document.removeEventListener("touchstart", handleTouchStart);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      id="top-progress-bar"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
      }}
    />
  );
}

export default function MobileFeedback() {
  return (
    <Suspense fallback={null}>
      <FeedbackManager />
    </Suspense>
  );
}
