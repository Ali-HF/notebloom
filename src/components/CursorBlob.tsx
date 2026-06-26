"use client";

import { useEffect, useRef, useCallback } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function CursorBlob() {
  const blobRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ripplesRef = useRef<HTMLDivElement>(null);

  // Current lerp position of the blob
  const blobPos = useRef({ x: -100, y: -100 });
  // Exact mouse position
  const mousePos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);
  const rippleCounter = useRef(0);
  const isHovering = useRef(false);

  const animate = useCallback(() => {
    // Lerp blob toward mouse
    blobPos.current.x += (mousePos.current.x - blobPos.current.x) * 0.1;
    blobPos.current.y += (mousePos.current.y - blobPos.current.y) * 0.1;

    if (blobRef.current) {
      blobRef.current.style.transform = `translate(${blobPos.current.x - 14}px, ${blobPos.current.y - 14}px) scale(${isHovering.current ? 2 : 1})`;
      blobRef.current.style.opacity = isHovering.current ? "0.10" : "0.25";
    }

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${mousePos.current.x - 2.5}px, ${mousePos.current.y - 2.5}px)`;
    }

    rafId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Only apply custom cursor on pointer: fine devices (desktop mice)
    const mql = window.matchMedia("(pointer: fine)");
    if (!mql.matches) return;

    // Hide default cursor
    document.body.style.cursor = "none";

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      isHovering.current = !!(
        target.closest("a") ||
        target.closest("button") ||
        target.closest("select") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("[role='button']")
      );
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!ripplesRef.current) return;

      const id = rippleCounter.current++;
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(175,138,79,0.5) 0%, rgba(124,47,47,0.2) 60%, transparent 100%);
        transform: translate(-50%, -50%) scale(0);
        pointer-events: none;
        animation: cursorBloom 420ms ease-out forwards;
        z-index: 9998;
      `;
      ripple.dataset.id = String(id);
      ripplesRef.current.appendChild(ripple);

      // Remove after animation
      setTimeout(() => {
        ripple.remove();
      }, 450);
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mousedown", onMouseDown);

    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mousedown", onMouseDown);
      cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  return (
    <>
      {/* Bloom ripple keyframes injected once */}
      <style>{`
        @keyframes cursorBloom {
          0%   { width: 0; height: 0; opacity: 1; transform: translate(-50%, -50%) scale(0); }
          60%  { opacity: 0.7; }
          100% { width: 2.5rem; height: 2.5rem; opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>

      {/* Blob — slow lerp follower */}
      <div
        ref={blobRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "rgba(175, 138, 79, 0.25)",
          backdropFilter: "blur(2px)",
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform, opacity",
          transition: "opacity 200ms ease, scale 200ms ease",
        }}
      />

      {/* Dot — exact cursor position */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "rgba(124, 47, 47, 0.70)",
          pointerEvents: "none",
          zIndex: 10000,
          willChange: "transform",
        }}
      />

      {/* Ripple container */}
      <div
        ref={ripplesRef}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9998 }}
      />
    </>
  );
}
