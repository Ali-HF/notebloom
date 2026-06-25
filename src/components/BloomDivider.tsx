export default function BloomDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-ink/15" />
      <svg width="64" height="16" viewBox="0 0 64 16" fill="none">
        <path
          d="M2 8c5-6 9-6 12 0s7 6 10 0 7-6 10 0 7 6 10 0 7-6 10 0 5 6 8 0"
          stroke="var(--color-brass)"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="32" cy="8" r="2" fill="var(--color-oxblood)" />
      </svg>
      <span className="h-px flex-1 bg-ink/15" />
    </div>
  );
}
