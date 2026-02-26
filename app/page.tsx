"use client"

import { useState } from "react"
import { StepIndicator } from "@/components/step-indicator"
import { ScreenUpload } from "@/components/screen-upload"
import { ScreenProfile } from "@/components/screen-profile"
import { ScreenPlan } from "@/components/screen-plan"
import { ScreenResults } from "@/components/screen-results"
import { ScreenReview } from "@/components/screen-review"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const [screen, setScreen] = useState(1)
  const [loading, setLoading] = useState(false)

  const goTo = (s: number) => setScreen(s)

  const handleLoadSample = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setScreen(2)
    }, 600)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b bg-card px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-foreground">
              QuickCheck
            </span>
            <span className="ml-1.5 hidden text-xs text-muted-foreground sm:inline">
              Instant Schedule Sanity Check
            </span>
          </div>
        </div>
        <StepIndicator current={screen} />
        <div className="hidden text-xs text-muted-foreground sm:block">
          Walton College of Business
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
            <Skeleton className="h-4 w-64 rounded" />
            <Skeleton className="h-4 w-48 rounded" />
            <Skeleton className="h-4 w-56 rounded" />
            <p className="mt-2 text-sm text-muted-foreground">
              Parsing worksheet...
            </p>
          </div>
        ) : (
          <div
            key={screen}
            className="flex flex-1 flex-col animate-in fade-in duration-300"
          >
            {screen === 1 && <ScreenUpload onLoadSample={handleLoadSample} />}
            {screen === 2 && <ScreenProfile onNext={() => goTo(3)} />}
            {screen === 3 && <ScreenPlan onRunCheck={() => goTo(4)} />}
            {screen === 4 && (
              <ScreenResults
                onBack={() => goTo(3)}
                onSubmit={() => goTo(5)}
              />
            )}
            {screen === 5 && <ScreenReview />}
          </div>
        )}
      </main>
    </div>
  )
}
