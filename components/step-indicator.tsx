"use client"

import { Check } from "lucide-react"

const steps = [
  { label: "Upload", num: 1 },
  { label: "Profile", num: 2 },
  { label: "Plan", num: 3 },
  { label: "QuickCheck", num: 4 },
  { label: "Review", num: 5 },
]

export function StepIndicator({
  current,
  onNavigate,
}: {
  current: number
  onNavigate?: (step: number) => void
}) {
  return (
    <nav
      aria-label="Demo progress"
      className="flex items-center gap-1"
    >
      {steps.map((s, i) => {
        const isActive = s.num === current
        const isDone = s.num < current
        const canClick = isDone && onNavigate

        const chip = (
          <div className={`flex items-center gap-1.5 ${canClick ? "cursor-pointer" : ""}`}>
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : isDone
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isDone ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                s.num
              )}
            </div>
            <span
              className={`hidden text-[11px] font-medium lg:inline ${
                isActive
                  ? "text-foreground"
                  : isDone
                  ? "text-emerald-700 hover:text-emerald-800"
                  : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
        )

        return (
          <div key={s.num} className="flex items-center gap-1">
            {canClick ? (
              <button
                type="button"
                onClick={() => onNavigate(s.num)}
                className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-label={`Go back to ${s.label}`}
              >
                {chip}
              </button>
            ) : (
              chip
            )}
            {i < steps.length - 1 && (
              <div
                className={`mx-0.5 h-px w-5 transition-colors duration-300 ${
                  s.num < current ? "bg-emerald-300" : "bg-border"
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
