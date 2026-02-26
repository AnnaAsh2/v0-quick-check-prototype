"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, CheckCircle } from "lucide-react"

const plannedCourses = [
  { code: "ECON 31303", name: "Intermediate Macroeconomics", hrs: 3 },
  { code: "ECON 47403", name: "Introduction to Econometrics", hrs: 4 },
  { code: "SEVI 30103", name: "Strategic Management", hrs: 3 },
  { code: "ECON 43303", name: "Economics of Organizations", hrs: 3 },
  { code: "FINN 30603", name: "Investments", hrs: 3 },
]

export function ScreenPlan({ onRunCheck }: { onRunCheck: () => void }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeText, setAnalyzeText] = useState("")

  const totalHrs = plannedCourses.reduce((acc, c) => acc + c.hrs, 0)

  const handleRun = () => {
    setAnalyzing(true)
    const texts = [
      "Checking prerequisites...",
      "Evaluating degree requirements...",
      "Analyzing graduation timeline...",
    ]
    let i = 0
    setAnalyzeText(texts[0])
    const interval = setInterval(() => {
      i++
      if (i < texts.length) {
        setAnalyzeText(texts[i])
      } else {
        clearInterval(interval)
        onRunCheck()
      }
    }, 500)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Hi Jordan — plan your Spring 2027 semester
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Add the courses you{"'"}re thinking about for next semester. When you{"'"}re
          ready, run QuickCheck to see if your plan works.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          className="pl-9"
          readOnly
        />
      </div>

      {/* Course list */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Planned Courses for Spring 2027
          </p>
          <Badge variant="secondary" className="text-xs">
            {totalHrs} credit hours
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          {plannedCourses.map((c) => (
            <div
              key={c.code}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="font-mono text-xs">
                  {c.code}
                </Badge>
                <span className="text-sm text-foreground">{c.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{c.hrs} hrs</span>
                <button
                  className="flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`Remove ${c.code}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Run button */}
      {analyzing ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border bg-card px-6 py-8 text-center shadow-sm">
          <div className="h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
            <div className="h-full animate-pulse rounded-full bg-primary" style={{ width: "70%" }} />
          </div>
          <p className="text-sm font-medium text-foreground">{analyzeText}</p>
        </div>
      ) : (
        <Button onClick={handleRun} size="lg" className="gap-2 self-start bg-emerald-600 text-[oklch(0.98_0_0)] hover:bg-emerald-700">
          <CheckCircle className="h-4 w-4" />
          Run QuickCheck
        </Button>
      )}
    </div>
  )
}
