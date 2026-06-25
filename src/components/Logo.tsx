import Link from "next/link";

export default function Logo({ tagline = false }: { tagline?: boolean }) {
  return (
    <Link
      href="/"
      className="flex flex-col focus-visible:outline-none focus-visible:rounded-sm hover:opacity-85 transition-opacity"
    >
      <span
        className="text-2xl font-bold tracking-wide text-ink leading-none"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Notebloom
      </span>
      {tagline && (
        <span
          className="text-[10px] tracking-[0.18em] uppercase text-ink-soft mt-1"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          Ideas in full bloom
        </span>
      )}
    </Link>
  );
}


