import Image from "next/image";

type Palette = { bg: string; fg: string; band: string };


const PALETTES: Record<string, Palette> = {
  Notebooks: { bg: "#faf0e6", fg: "#4a3c31", band: "#d8c3a5" },
  Planners: { bg: "#eef1f6", fg: "#2c3e50", band: "#adc5d9" },
  Pens: { bg: "#fff0f5", fg: "#603040", band: "#e899b3" },
  "Sticky Notes": { bg: "#feffd9", fg: "#55521a", band: "#e0d86a" },
  "Washi Tape": { bg: "#e8fdf5", fg: "#1f4a3e", band: "#8feac6" },
  "Pencil Cases": { bg: "#faf1e6", fg: "#5a4d41", band: "#cbb89e" },
  Accessories: { bg: "#f0f8ff", fg: "#1c3d5a", band: "#a0c4ff" },
  "Desk Decor": { bg: "#fdf2f8", fg: "#701a4f", band: "#f472b6" },
};

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const candidate = current ? `${current} ${w}` : w;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = w;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

export default function BookCover({
  title,
  author,
  genre,
  seed,
  isSecondary = false,
  className = "",
}: {
  title: string;
  author: string;
  genre: string;
  seed: string;
  isSecondary?: boolean;
  className?: string;
}) {
  const isUrl = seed.startsWith("http://") || seed.startsWith("https://") || seed.startsWith("/");
  if (isUrl && !isSecondary) {
    return (
      <div className={`relative overflow-hidden bg-stone-50 rounded-xl shadow-md ring-1 ring-ink/10 ${className}`} style={{ aspectRatio: "1/1" }}>
        <Image
          src={seed}
          alt={`Cover of ${title} by ${author}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* spine shadow overlay */}
        <div className="absolute top-0 left-0 w-[10px] h-full bg-black/10 pointer-events-none" />
      </div>
    );
  }

  const displaySeed = isUrl ? `${title}-${author}-alt` : seed;
  const palette = PALETTES[genre] ?? PALETTES.Notebooks;
  const variant = isSecondary ? (hashCode(displaySeed) + 1) % 4 : hashCode(displaySeed) % 4;
  const titleLines = wrapText(title, 14);

  return (
    <svg
      viewBox="0 0 240 240"
      className={`rounded-xl transition-transform duration-500 group-hover:scale-105 ${className}`}
      role="img"
      aria-label={`Cover of ${title} by ${author}`}
      style={{ aspectRatio: "1/1" }}
    >
      <rect width="240" height="240" fill={palette.bg} />
      {/* paper grain */}
      <rect width="240" height="240" fill="url(#grain)" opacity="0.5" />
      <defs>
        <pattern id="grain" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="transparent" />
          <circle cx="1" cy="1" r="0.4" fill="#000" opacity="0.04" />
        </pattern>
      </defs>

      {/* spine shadow */}
      <rect width="10" height="240" fill="#000" opacity="0.18" />

      {variant === 0 && (
        <>
          <line x1="24" y1="40" x2="216" y2="40" stroke={palette.band} strokeWidth="2" />
          <line x1="24" y1="200" x2="216" y2="200" stroke={palette.band} strokeWidth="2" />
        </>
      )}
      {variant === 1 && (
        <circle
          cx="120"
          cy="70"
          r="24"
          fill="none"
          stroke={palette.band}
          strokeWidth="2"
          opacity="0.8"
        />
      )}
      {variant === 2 && (
        <line x1="20" y1="30" x2="20" y2="210" stroke={palette.band} strokeWidth="3" />
      )}
      {variant === 3 && (
        <polygon points="0,240 50,240 0,190" fill={palette.band} opacity="0.85" />
      )}

      {/* title */}
      <text
        x="120"
        y={120 - (titleLines.length - 1) * 12}
        textAnchor="middle"
        fill={palette.fg}
        fontFamily="var(--font-display)"
        fontWeight={600}
        fontSize="17"
      >
        {titleLines.map((line, i) => (
          <tspan key={i} x="120" dy={i === 0 ? 0 : 20}>
            {line}
          </tspan>
        ))}
      </text>

      {/* author */}
      <text
        x="120"
        y="215"
        textAnchor="middle"
        fill={palette.fg}
        opacity="0.85"
        fontFamily="var(--font-stamp)"
        fontSize="10"
        letterSpacing="0.5"
      >
        {author.toUpperCase()}
      </text>

      {/* signature corner bite */}
      <path
        d={`M${228 - (hashCode(seed + "b") % 6)},0 A10,10 0 0 1 240,12 V0 Z`}
        fill="var(--color-parchment)"
      />
      <circle
        cx={233 - (hashCode(seed + "c") % 4)}
        cy={7 - (hashCode(seed + "d") % 3)}
        r="4.5"
        fill="var(--color-charcoal)"
        opacity="0.5"
      />
    </svg>
  );
}
