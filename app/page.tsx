"use client"

import { useState } from "react"
import { StepIndicator } from "@/components/step-indicator"
import { ScreenUpload } from "@/components/screen-upload"
import { ScreenProfile } from "@/components/screen-profile"
import { ScreenPlan } from "@/components/screen-plan"
import { ScreenResults } from "@/components/screen-results"
import { ScreenReview } from "@/components/screen-review"
import { Skeleton } from "@/components/ui/skeleton"
import { Check } from "lucide-react"
import type { Course } from "@/lib/validation"

export default function Home() {
  const [screen, setScreen] = useState(1)
  const [loading, setLoading] = useState(false)
  const [planned, setPlanned] = useState<Course[]>([])

  const goTo = (s: number) => setScreen(s)

  const handleLoadSample = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setScreen(2)
    }, 700)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Crimson accent line */}
      <div className="h-1 w-full bg-[oklch(0.50_0.20_25)]" />

      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
            <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold tracking-tight text-foreground">
              QuickCheck
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Instant Schedule Sanity Check
            </span>
          </div>
        </div>

        <StepIndicator current={screen} />

        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
          <span className="font-medium">Walton College of Business</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-20">
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-3 w-72 rounded-full" />
              <Skeleton className="h-3 w-56 rounded-full" />
              <Skeleton className="h-3 w-64 rounded-full" />
              <Skeleton className="h-3 w-48 rounded-full" />
            </div>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Parsing worksheet...
            </p>
            <p className="text-xs text-muted-foreground">
              Extracting student data, course history, and degree progress
            </p>
          </div>
        ) : (
          <div
            key={screen}
            className="flex flex-1 flex-col animate-in fade-in duration-300"
          >
            {screen === 1 && <ScreenUpload onLoadSample={handleLoadSample} />}
            {screen === 2 && <ScreenProfile onNext={() => goTo(3)} />}
            {screen === 3 && (
              <ScreenPlan
                planned={planned}
                setPlanned={setPlanned}
                onRunCheck={() => goTo(4)}
              />
            )}
            {screen === 4 && (
              <ScreenResults
                planned={planned}
                onBack={() => goTo(3)}
                onSubmit={() => goTo(5)}
              />
            )}
            {screen === 5 && <ScreenReview planned={planned} />}
          </div>
        )}
      </main>
    </div>
  )
}
