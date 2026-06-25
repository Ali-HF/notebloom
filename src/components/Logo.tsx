import Link from "next/link";
import Image from "next/image";

export default function Logo({ tagline = false }: { tagline?: boolean }) {
  return (
    <Link
      href="/"
      className="flex flex-col focus-visible:outline-none focus-visible:rounded-sm"
    >
      <div className="flex items-center">
        <Image
          src="/logo.png"
          alt="Notebloom Logo"
          width={160}
          height={48}
          className="h-11 w-auto transition-transform duration-300 hover:scale-102"
          style={{ mixBlendMode: "multiply" }}
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

