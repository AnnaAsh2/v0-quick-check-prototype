"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, CheckCircle, BookOpen } from "lucide-react"

const plannedCourses = [
  { code: "ECON 31303", name: "Intermediate Macroeconomics", hrs: 3, cat: "Economics Major" },
  { code: "ECON 47403", name: "Introduction to Econometrics", hrs: 4, cat: "Economics Major" },
  { code: "SEVI 30103", name: "Strategic Management", hrs: 3, cat: "Business Core" },
  { code: "ECON 43303", name: "Economics of Organizations", hrs: 3, cat: "Economics Major" },
  { code: "FINN 30603", name: "Investments", hrs: 3, cat: "Finance Minor" },
]

export function ScreenPlan({ onRunCheck }: { onRunCheck: () => void }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeText, setAnalyzeText] = useState("")
  const [analyzeProgress, setAnalyzeProgress] = useState(0)

  const totalHrs = plannedCourses.reduce((acc, c) => acc + c.hrs, 0)

  useEffect(() => {
    if (!analyzing) return
    const texts = [
      "Checking prerequisites...",
      "Evaluating degree requirements...",
      "Analyzing graduation timeline...",
    ]
    let i = 0
    setAnalyzeText(texts[0])
    setAnalyzeProgress(15)

    const interval = setInterval(() => {
      i++
      if (i < texts.length) {
        setAnalyzeText(texts[i])
        setAnalyzeProgress(15 + i * 35)
      } else {
        clearInterval(interval)
        setAnalyzeProgress(100)
        setTimeout(() => onRunCheck(), 300)
      }
    }, 600)

    return () => clearInterval(interval)
  }, [analyzing, onRunCheck])

  const handleRun = () => {
    setAnalyzing(true)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      {/* Greeting */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs font-medium">
            Spring 2027
          </Badge>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          Hi Jordan — plan your Spring 2027 semester
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Add the courses you{"'"}re thinking about for next semester. When you
          {"'"}re ready, run QuickCheck to see if your plan works.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          className="h-11 pl-10 text-sm shadow-sm"
          readOnly
        />
      </div>

      {/* Course list */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Planned Courses
          </p>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-xs font-semibold"
            >
              {plannedCourses.length} courses
            </Badge>
            <Badge className="border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
              {totalHrs} credit hours
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {plannedCourses.map((c) => (
            <div
              key={c.code}
              className="flex items-center justify-between rounded-xl border bg-card px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="shrink-0 font-mono text-xs"
                >
                  {c.code}
                </Badge>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {c.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {c.cat}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {c.hrs} hrs
                </span>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${c.code}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Run button or analyzing state */}
      {analyzing ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-8 py-10 text-center shadow-sm">
          <div className="h-2 w-56 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${analyzeProgress}%` }}
            />
          </div>
          <p className="text-sm font-medium text-foreground">{analyzeText}</p>
          <p className="text-xs text-muted-foreground">
            Analyzing 5 courses against degree requirements...
          </p>
        </div>
      ) : (
        <Button
          onClick={handleRun}
          size="lg"
          className="gap-2 self-start bg-emerald-600 px-8 text-white shadow-sm hover:bg-emerald-700"
        >
          <CheckCircle className="h-4 w-4" />
          Run QuickCheck
        </Button>
      )}
    </div>
  )
}
