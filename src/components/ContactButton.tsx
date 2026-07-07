"use client";

import { useState, useRef, useEffect } from "react";

export default function ContactButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="trail-link cursor-pointer uppercase tracking-wider text-sm font-medium focus:outline-none"
      >
        CONTACT
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-3 w-64 bg-cream border border-[#c8b090] rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ fontFamily: "sans-serif" }}
        >
          <h4 className="text-xs font-bold tracking-widest text-ink uppercase mb-2.5" style={{ fontFamily: "var(--font-stamp)" }}>
            CONTACT US
          </h4>
          <div className="space-y-3 text-sm text-ink-soft">
            <div>
              <span className="text-[10px] uppercase tracking-wider block font-bold text-ink-soft/60" style={{ fontFamily: "var(--font-stamp)" }}>PHONE</span>
              <a href="tel:03373876846" className="text-oxblood font-semibold hover:underline block text-[13px]">
                03373876846
              </a>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider block font-bold text-ink-soft/60" style={{ fontFamily: "var(--font-stamp)" }}>EMAIL</span>
              <a href="mailto:support@notebloom.shop" className="text-oxblood font-semibold hover:underline block text-[13px]">
                support@notebloom.shop
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
