"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, CheckCircle, BookOpen, Plus, ArrowRightLeft } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Course catalogue — worksheet courses + FINN 30103                  */
/* ------------------------------------------------------------------ */

interface Course {
  code: string
  name: string
  hrs: number
  cat: string
}

const catalogue: Course[] = [
  // Current planned courses
  { code: "ECON 31303", name: "Intermediate Macroeconomics", hrs: 3, cat: "Economics Major" },
  { code: "ECON 47403", name: "Introduction to Econometrics", hrs: 4, cat: "Economics Major" },
  { code: "SEVI 30103", name: "Strategic Management", hrs: 3, cat: "Business Core" },
  { code: "ECON 43303", name: "Economics of Organizations", hrs: 3, cat: "Economics Major" },
  { code: "FINN 30603", name: "Investments", hrs: 3, cat: "Finance Minor" },
  // The key swap suggestion
  { code: "FINN 30103", name: "Financial Analysis", hrs: 3, cat: "Finance Minor" },
  // Other worksheet courses (not currently planned)
  { code: "ECON 47503", name: "Forecasting", hrs: 3, cat: "Economics Major" },
  { code: "ECON 30303", name: "Intermediate Microeconomics", hrs: 3, cat: "Economics Major" },
  { code: "ECON 34303", name: "Money & Banking", hrs: 3, cat: "Economics Major / Elective" },
  { code: "FINN 20403", name: "Principles of Finance", hrs: 3, cat: "Business Core" },
  { code: "MKTG 34303", name: "Introduction to Marketing", hrs: 3, cat: "Business Core" },
  { code: "BLAW 20003", name: "Legal Environment of Business", hrs: 3, cat: "Business Core" },
  { code: "ISYS 21003", name: "Business Information Systems", hrs: 3, cat: "Business Core" },
  { code: "SCMT 21003", name: "Integrated Supply Chain Management", hrs: 3, cat: "Business Core" },
  { code: "MGMT 21003", name: "Managing People and Organizations", hrs: 3, cat: "Business Core" },
  { code: "ACCT 20103", name: "Accounting I", hrs: 3, cat: "Pre-Business Core" },
  { code: "ACCT 20203", name: "Accounting II", hrs: 3, cat: "Pre-Business Core" },
  { code: "MATH 22003", name: "Survey of Calculus", hrs: 3, cat: "Pre-Business Core" },
  { code: "SPCH 10003", name: "Public Speaking", hrs: 3, cat: "Pre-Business Core / State Min" },
  { code: "ECON 21003", name: "Principles of Macroeconomics", hrs: 3, cat: "Pre-Business Core" },
  { code: "ECON 22003", name: "Principles of Microeconomics", hrs: 3, cat: "Pre-Business Core" },
  { code: "COMM 12003", name: "Intro to Communication", hrs: 3, cat: "General Elective" },
]

const defaultPlannedCodes = [
  "ECON 31303",
  "ECON 47403",
  "SEVI 30103",
  "ECON 43303",
  "FINN 30603",
]

export function ScreenPlan({ onRunCheck }: { onRunCheck: () => void }) {
  const [planned, setPlanned] = useState<Course[]>(
    catalogue.filter((c) => defaultPlannedCodes.includes(c.code))
  )
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeText, setAnalyzeText] = useState("")
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  const totalHrs = planned.reduce((acc, c) => acc + c.hrs, 0)
  const plannedCodes = new Set(planned.map((c) => c.code))

  // Close search results on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Filter catalogue based on search query
  const searchResults = query.trim().length > 0
    ? catalogue.filter(
        (c) =>
          !plannedCodes.has(c.code) &&
          (c.code.toLowerCase().includes(query.toLowerCase()) ||
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.cat.toLowerCase().includes(query.toLowerCase()))
      )
    : catalogue.filter((c) => !plannedCodes.has(c.code))

  const removeCourse = (code: string) => {
    setPlanned((prev) => prev.filter((c) => c.code !== code))
  }

  const addCourse = (course: Course) => {
    setPlanned((prev) => [...prev, course])
    setQuery("")
    setShowResults(false)
  }

  /* Analysis animation */
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
          Add the courses you{"'"}re thinking about for next semester. You can
          search, add, or remove courses. When you{"'"}re ready, run QuickCheck
          to see if your plan works.
        </p>
      </div>

      {/* Search with dropdown */}
      <div ref={searchRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses by name, code, or category..."
            className="h-11 pl-10 pr-4 text-sm shadow-sm"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
          />
        </div>

        {/* Search results dropdown */}
        {showResults && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border bg-card shadow-xl">
            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No matching courses found
              </div>
            ) : (
              searchResults.map((c) => (
                <button
                  key={c.code}
                  onClick={() => addCourse(c)}
                  className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                >
                  <Plus className="h-4 w-4 shrink-0 text-primary" />
                  <Badge
                    variant="secondary"
                    className="shrink-0 font-mono text-xs"
                  >
                    {c.code}
                  </Badge>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {c.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {c.cat}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {c.hrs} hrs
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Planned course list */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Planned Courses
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-semibold">
              {planned.length} courses
            </Badge>
            <Badge className="border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
              {totalHrs} credit hours
            </Badge>
          </div>
        </div>

        {planned.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed bg-muted/30 px-6 py-10 text-center">
            <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              No courses planned yet
            </p>
            <p className="text-xs text-muted-foreground">
              Use the search above to add courses
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {planned.map((c) => (
              <div
                key={c.code}
                className="flex items-center justify-between rounded-xl border bg-card px-4 py-3.5 shadow-sm transition-all hover:shadow-md"
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
                    onClick={() => removeCourse(c.code)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label={`Remove ${c.code}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
            Analyzing {planned.length} courses against degree requirements...
          </p>
        </div>
      ) : (
        <Button
          onClick={() => setAnalyzing(true)}
          size="lg"
          disabled={planned.length === 0}
          className="gap-2 self-start bg-emerald-600 px-8 text-white shadow-sm hover:bg-emerald-700"
        >
          <CheckCircle className="h-4 w-4" />
          Run QuickCheck
        </Button>
      )}
    </div>
  )
}
