'use client'

interface GeoRaydarLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { height: 24 },
  md: { height: 36 },
  lg: { height: 56 },
}

export function GeoRaydarLogo({ size = 'md', className = '' }: GeoRaydarLogoProps) {
  const s = sizes[size]
  return (
    <img
      src="/georaydar-logo.png"
      alt="GeoRaydar"
      height={s.height}
      style={{ height: s.height, width: 'auto', display: 'inline-block' }}
      className={className}
    />
  )
}
