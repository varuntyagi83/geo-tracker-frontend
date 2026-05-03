"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  min?: number
  max?: number
  step?: number
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  disabled?: boolean
  className?: string
}

function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  disabled,
  className,
}: SliderProps) {
  const initialValue = value?.[0] ?? defaultValue?.[0] ?? min
  const [internal, setInternal] = React.useState(initialValue)

  const current = value !== undefined ? value[0] : internal

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value)
    setInternal(next)
    onValueChange?.([next])
  }

  const pct = max === min ? 0 : ((current - min) / (max - min)) * 100

  return (
    <div
      data-slot="slider"
      className={cn("relative flex w-full touch-none items-center select-none", className)}
    >
      <div
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full h-1.5 w-full bg-muted"
      >
        <div
          data-slot="slider-range"
          className="absolute h-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={handleChange}
        role="slider"
        className="absolute w-full opacity-0 h-4 cursor-pointer disabled:cursor-not-allowed"
        style={{ zIndex: 1 }}
      />
      {/* Visible thumb */}
      <div
        data-slot="slider-thumb"
        className="pointer-events-none absolute block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm"
        style={{ left: `calc(${pct}% - 8px)`, zIndex: 0 }}
      />
    </div>
  )
}

export { Slider }
