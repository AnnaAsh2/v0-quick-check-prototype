"use client"

const steps = [
  { label: "Upload", num: 1 },
  { label: "Profile", num: 2 },
  { label: "Plan", num: 3 },
  { label: "QuickCheck", num: 4 },
  { label: "Review", num: 5 },
]

export function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Demo progress" className="flex items-center justify-center gap-2">
      {steps.map((s, i) => {
        const isActive = s.num === current
        const isDone = s.num < current
        return (
          <div key={s.num} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isDone
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                ) : (
                  s.num
                )}
              </div>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-6 ${
                  s.num < current ? "bg-primary/30" : "bg-border"
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
