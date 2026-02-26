"use client"

import { Check } from "lucide-react"

const steps = [
  { label: "Upload", num: 1 },
  { label: "Profile", num: 2 },
  { label: "Plan", num: 3 },
  { label: "QuickCheck", num: 4 },
  { label: "Review", num: 5 },
]

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav
      aria-label="Demo progress"
      className="flex items-center gap-1"
    >
      {steps.map((s, i) => {
        const isActive = s.num === current
        const isDone = s.num < current
        return (
          <div key={s.num} className="flex items-center gap-1">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                    : isDone
                    ? "bg-emerald-100 text-emerald-700"
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
                    ? "text-emerald-700"
                    : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
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
