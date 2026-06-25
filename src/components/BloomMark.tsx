export default function BloomMark({
  className = "",
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Sprout Stem */}
      <path
        d="M20 34V18"
        stroke="var(--color-moss)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Left Leaf */}
      <path
        d="M20 26C15 26 11 23 11 18C11 13 20 18 20 18"
        stroke="var(--color-moss)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Blooming Heart on Top */}
      <path
        d="M24 19C20.5 15.5 18 12.5 20.2 10.2C22.5 8 24 10.2 24 10.2C24 10.2 25.5 8 27.8 10.2C30 12.5 27.5 15.5 24 19Z"
        fill="var(--color-oxblood)"
        transform="rotate(12 24 14.5)"
      />
    </svg>
  );
}
