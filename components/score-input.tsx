"use client"

import { cn } from "@/lib/utils"

interface ScoreInputProps {
  value: number | null
  onChange: (value: number | null) => void
  disabled?: boolean
  ariaLabel: string
  className?: string
}

/** Compact numeric input for goals (0-99, empty = not played). */
export function ScoreInput({
  value,
  onChange,
  disabled,
  ariaLabel,
  className,
}: ScoreInputProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={99}
      aria-label={ariaLabel}
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => {
        const raw = e.target.value
        if (raw === "") {
          onChange(null)
          return
        }
        const n = Math.max(0, Math.min(99, Math.floor(Number(raw))))
        onChange(Number.isNaN(n) ? null : n)
      }}
      className={cn(
        "h-9 w-10 rounded-md border border-input bg-background text-center text-base font-semibold tabular-nums",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        className,
      )}
    />
  )
}
