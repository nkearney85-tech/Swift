export function SwiftLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Swift bird icon */}
      <path
        d="M8 8C12 4 20 4 24 8C20 6 14 8 10 12C14 10 18 10 22 12C18 16 12 18 6 16C10 20 16 22 22 20C18 24 10 26 4 22C8 26 16 28 24 24C28 20 28 12 24 8"
        fill="#3FC919"
        strokeWidth="0"
      />
      {/* SWIFT text */}
      <text
        x="36"
        y="22"
        fill="#E8F5EE"
        fontFamily="DM Sans, sans-serif"
        fontSize="18"
        fontWeight="700"
        letterSpacing="0.05em"
      >
        SWIFT
      </text>
    </svg>
  )
}
