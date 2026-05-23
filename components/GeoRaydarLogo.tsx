'use client'

interface GeoRaydarLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { text: 'text-lg', svgW: 16, svgH: 18 },
  md: { text: 'text-2xl', svgW: 22, svgH: 24 },
  lg: { text: 'text-4xl', svgW: 36, svgH: 40 },
}

// Inline wordmark: "GeoRayd" + rose signal-arc icon + "r"
// The arc icon mimics the WiFi/RSS signal mark from the v5-rose brand guidelines.
export function GeoRaydarLogo({ size = 'md', className = '' }: GeoRaydarLogoProps) {
  const s = sizes[size]
  return (
    <span
      className={`inline-flex items-baseline font-bold tracking-tight select-none ${s.text} ${className}`}
      style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
    >
      GeoRayd
      <svg
        width={s.svgW}
        height={s.svgH}
        viewBox="0 0 22 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="inline-block mx-0.5"
        style={{ verticalAlign: 'text-bottom', marginBottom: '0.05em' }}
        aria-hidden="true"
      >
        {/* Signal dot */}
        <circle cx="11" cy="22" r="2.5" fill="#F472B6" />
        {/* Inner arc */}
        <path
          d="M6.5 17.5 C6.5 17.5 8 15 11 15 C14 15 15.5 17.5 15.5 17.5"
          stroke="#F472B6"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Outer arc */}
        <path
          d="M2 12.5 C2 12.5 5 7.5 11 7.5 C17 7.5 20 12.5 20 12.5"
          stroke="#F472B6"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      r
    </span>
  )
}
