import Link from "next/link";
import Image from "next/image";

export default function Logo({ tagline = false }: { tagline?: boolean }) {
  return (
    <Link
      href="/"
      className="flex flex-col focus-visible:outline-none focus-visible:rounded-sm hover:opacity-85 transition-opacity"
    >
      <div className="relative h-16 w-48 sm:h-24 sm:w-72 shrink-0 -my-3 sm:-my-7">
        <Image
          src="/logo-transparent.png"
          alt="Notebloom Logo"
          fill
          priority
          className="object-contain object-left scale-145 sm:scale-155 origin-left"
        />
      </div>
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


