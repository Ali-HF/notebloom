import Link from "next/link";
import Image from "next/image";

export default function Logo({ tagline = false }: { tagline?: boolean }) {
  return (
    <Link
      href="/"
      className="flex flex-col focus-visible:outline-none focus-visible:rounded-sm"
    >
      <div className="flex items-center justify-center overflow-hidden h-16 w-48">
        <Image
          src="/logo-transparent.png"
          alt="Notebloom Logo"
          width={220}
          height={220}
          className="h-48 w-auto -my-12 transition-transform duration-300 hover:scale-102"
          priority
        />
      </div>
      {tagline && (
        <span
          className="text-[11px] tracking-[0.18em] uppercase text-ink-soft mt-1"
          style={{ fontFamily: "var(--font-stamp)" }}
        >
          Ideas in full bloom
        </span>
      )}
    </Link>
  );
}

