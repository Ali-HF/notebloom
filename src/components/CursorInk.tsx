"use client";

import { useEffect, useRef } from "react";

export default function CursorInk() {
  const rafId = useRef(0);

  useEffect(() => {
    const mql = window.matchMedia("(pointer: fine)");
    if (!mql.matches) return;

    const splatters: HTMLElement[] = [];

    const onClick = (e: MouseEvent) => spawnSplatter(e.clientX, e.clientY, splatters);
    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("mousedown", onClick);
      splatters.forEach((el) => el.remove());
    };
  }, []);

  return null;
}

// ─── Click splatter ───────────────────────────────────────────────────────────

function spawnSplatter(cx: number, cy: number, registry: HTMLElement[]) {
  const COLORS = [
    "rgba(124, 47, 47, 0.75)",
    "rgba(124, 47, 47, 0.50)",
    "rgba(32, 40, 58, 0.65)",
    "rgba(78, 38, 42, 0.55)",
  ];

  const center = document.createElement("div");
  Object.assign(center.style, {
    position: "fixed",
    left: cx + "px",
    top: cy + "px",
    width: "14px",
    height: "14px",
    borderRadius: "55% 45% 52% 48% / 48% 56% 44% 52%",
    background: COLORS[0],
    pointerEvents: "none",
    zIndex: "10000",
    transform: "translate(-50%,-50%) scale(0)",
    mixBlendMode: "multiply",
  });
  document.body.appendChild(center);
  registry.push(center);
  center.animate(
    [
      { transform: "translate(-50%,-50%) scale(0)", opacity: "1" },
      { transform: "translate(-50%,-50%) scale(1.8)", opacity: "0.5", offset: 0.4 },
      { transform: "translate(-50%,-50%) scale(1.4)", opacity: "0" },
    ],
    { duration: 400, easing: "ease-out", fill: "forwards" }
  ).onfinish = () => {
    center.remove();
    const i = registry.indexOf(center);
    if (i !== -1) registry.splice(i, 1);
  };

  const count = 5 + Math.floor(Math.random() * 3);
  for (let d = 0; d < count; d++) {
    const angle = (Math.PI * 2 * d) / count + (Math.random() - 0.5) * 1.0;
    const dist = 18 + Math.random() * 26;
    const size = 3 + Math.random() * 5;
    const dur = 340 + Math.random() * 160;
    const ex = Math.cos(angle) * dist;
    const ey = Math.sin(angle) * dist + Math.random() * 8;
    const rot = Math.random() * 360;
    const br = `${44 + Math.random() * 18}% ${44 + Math.random() * 18}% ${44 + Math.random() * 18}% ${44 + Math.random() * 18}%`;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    const drop = document.createElement("div");
    Object.assign(drop.style, {
      position: "fixed",
      left: cx + "px",
      top: cy + "px",
      width: size + "px",
      height: size + "px",
      borderRadius: br,
      background: color,
      pointerEvents: "none",
      zIndex: "10000",
      transform: `translate(-50%,-50%) rotate(${rot}deg) scale(0.3)`,
      mixBlendMode: "multiply",
    });
    document.body.appendChild(drop);
    registry.push(drop);
    drop.animate(
      [
        { transform: `translate(-50%,-50%) rotate(${rot}deg) scale(0.3)`, opacity: "1" },
        {
          transform: `translate(calc(-50% + ${ex * 0.55}px), calc(-50% + ${ey * 0.55}px)) rotate(${rot + 25}deg) scale(1)`,
          opacity: "0.8",
          offset: 0.35,
        },
        {
          transform: `translate(calc(-50% + ${ex}px), calc(-50% + ${ey}px)) rotate(${rot + 50}deg) scale(0.4)`,
          opacity: "0",
        },
      ],
      { duration: dur, delay: Math.random() * 30, easing: "cubic-bezier(.25,.46,.45,.94)", fill: "forwards" }
    ).onfinish = () => {
      drop.remove();
      const i = registry.indexOf(drop);
      if (i !== -1) registry.splice(i, 1);
    };
  }
}
