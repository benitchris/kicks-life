import * as React from "react"

export function AnimatedSearchIcon({ open }: { open: boolean }) {
  return (
    <span
      className={
        `inline-block transition-transform duration-500 ease-out will-change-transform ` +
        (open
          ? "scale-125 rotate-90 text-orange-600 opacity-100"
          : "scale-100 rotate-0 text-muted-foreground opacity-80")
      }
      style={{ transitionProperty: 'transform, color, opacity' }}
    >
      {/* SVG search icon */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </span>
  )
}
