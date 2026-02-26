"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X, CheckCircle, BookOpen, Plus, ArrowRightLeft } from "lucide-react"
import type { Course } from "@/lib/validation"

/* ------------------------------------------------------------------ */
/*  Course catalogue                                                   */
/* ------------------------------------------------------------------ */

const catalogue: Course[] = [
  // ====== Planned defaults ======
  { code: "ECON 31303", name: "Intermediate Macroeconomics", hrs: 3, cat: "Economics Major (Required)" },
  { code: "ECON 47403", name: "Introduction to Econometrics", hrs: 4, cat: "Economics Major (Required)" },
  { code: "SEVI 30103", name: "Strategic Management", hrs: 3, cat: "Business Core (Capstone)" },
  { code: "ECON 43303", name: "Economics of Organizations", hrs: 3, cat: "Economics Major (Required)" },
  { code: "FINN 30603", name: "Investments", hrs: 3, cat: "Finance Minor" },
  // ====== Key swap course ======
  { code: "FINN 30103", name: "Financial Analysis", hrs: 3, cat: "Finance Minor (Required)" },
  // ====== Economics electives ======
  { code: "ECON 47503", name: "Forecasting", hrs: 3, cat: "Economics Major (Alt to 4743)" },
  { code: "ECON 47603", name: "Economic Analytics", hrs: 3, cat: "Economics Major (Elective)" },
  { code: "ECON 31403", name: "Economics of Poverty & Inequality", hrs: 3, cat: "ECON Elective" },
  { code: "ECON 33303", name: "Public Economics", hrs: 3, cat: "ECON Elective" },
  { code: "ECON 35303", name: "Labor Economics", hrs: 3, cat: "ECON Elective / Social Issues" },
  { code: "ECON 44203", name: "Behavioral Economics", hrs: 3, cat: "ECON Elective" },
  { code: "ECON 44303", name: "Experimental Economics", hrs: 3, cat: "ECON Elective" },
  { code: "ECON 46303", name: "International Trade", hrs: 3, cat: "ECON Elective / Intl Econ" },
  { code: "ECON 46403", name: "Intl Macroeconomics & Finance", hrs: 3, cat: "ECON Elective / Intl Econ" },
  { code: "ECON 38403", name: "Economics of the Developing World", hrs: 3, cat: "ECON Elective / Social Issues" },
  { code: "ECON 38503", name: "Emerging Markets", hrs: 3, cat: "ECON Elective / Social Issues" },
  { code: "ECON 34303", name: "Money & Banking", hrs: 3, cat: "ECON Elective" },
  // ====== Finance ======
  { code: "FINN 31003", name: "Financial Modeling", hrs: 3, cat: "Finance Minor" },
  { code: "FINN 36003", name: "Corporate Finance", hrs: 3, cat: "Finance Minor (Banking)" },
  { code: "FINN 31303", name: "Commercial Banking", hrs: 3, cat: "Finance Minor (Banking)" },
  { code: "FINN 30003", name: "Personal Financial Management", hrs: 3, cat: "Finance Minor (Ins/RE)" },
  { code: "FINN 30503", name: "Financial Markets & Institutions", hrs: 3, cat: "Jr/Sr Business Elective" },
  { code: "FINN 37003", name: "International Finance", hrs: 3, cat: "Finance Minor / Intl Econ" },
  { code: "FINN 36203", name: "Risk Management", hrs: 3, cat: "Finance Minor (Ins/RE)" },
  { code: "FINN 43203", name: "Financial Data Analytics I", hrs: 3, cat: "Jr/Sr Business Elective" },
  // ====== Management ======
  { code: "MGMT 42503", name: "Leadership", hrs: 3, cat: "Management Minor / Elective" },
  { code: "MGMT 42603", name: "Org Change & Development", hrs: 3, cat: "Management Minor / Elective" },
  { code: "MGMT 49403", name: "Talent Acquisition & Management", hrs: 3, cat: "Management Minor / Elective" },
  // ====== Marketing ======
  { code: "MKTG 35503", name: "Consumer Behavior", hrs: 3, cat: "Marketing Minor / Elective" },
  { code: "MKTG 36303", name: "Marketing Research", hrs: 3, cat: "Marketing Minor / Elective" },
  { code: "MKTG 38303", name: "Digital Marketing", hrs: 3, cat: "Jr/Sr Business Elective" },
  // ====== Supply Chain ======
  { code: "SCMT 34403", name: "Transportation & Distribution Mgmt", hrs: 3, cat: "Supply Chain Minor / Elective" },
  { code: "SCMT 36103", name: "Procurement & Supply Mgmt", hrs: 3, cat: "Supply Chain Minor / Elective" },
  // ====== ISYS ======
  { code: "ISYS 41903", name: "Business Analytics & Visualization", hrs: 3, cat: "Jr/Sr Business Elective" },
  // ====== SEVI ======
  { code: "SEVI 39303", name: "Entrepreneurship & New Venture Dev", hrs: 3, cat: "Innovation Minor / Elective" },
  { code: "SEVI 36703", name: "Social Entrepreneurship", hrs: 3, cat: "Innovation Minor / Elective" },
  // ====== BLAW ======
  { code: "BLAW 30303", name: "Commercial Law", hrs: 3, cat: "Jr/Sr Business Elective" },
  // ====== Worksheet / Pre-Business (already completed, for reference) ======
  { code: "ECON 30303", name: "Intermediate Microeconomics", hrs: 3, cat: "Economics Major (Required)" },
  { code: "FINN 20403", name: "Principles of Finance", hrs: 3, cat: "Business Core" },
  { code: "MKTG 34303", name: "Introduction to Marketing", hrs: 3, cat: "Business Core" },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface Props {
  planned: Course[]
  setPlanned: React.Dispatch<React.SetStateAction<Course[]>>
  onRunCheck: () => void
}

export function ScreenPlan({ planned, setPlanned, onRunCheck }: Props) {
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeText, setAnalyzeText] = useState("")
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  const totalHrs = planned.reduce((acc, c) => acc + c.hrs, 0)
  const plannedCodes = new Set(planned.map((c) => c.code))

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const searchResults =
    query.trim().length > 0
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

  useEffect(() => {
    if (!analyzing) return
    const texts = [
      "Checking prerequisites...",
      "Evaluating degree requirements...",
      "Validating credit-hour limits...",
      "Analyzing graduation timeline...",
    ]
    let i = 0
    setAnalyzeText(texts[0])
    setAnalyzeProgress(10)

    const interval = setInterval(() => {
      i++
      if (i < texts.length) {
        setAnalyzeText(texts[i])
        setAnalyzeProgress(10 + i * 25)
      } else {
        clearInterval(interval)
        setAnalyzeProgress(100)
        setTimeout(() => {
          setAnalyzing(false)
          onRunCheck()
        }, 300)
      }
    }, 500)

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
          to validate your plan.
        </p>
      </div>

      {/* Search */}
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
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                    {c.code}
                  </Badge>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <span className="text-[11px] text-muted-foreground">{c.cat}</span>
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

      {/* Planned list */}
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
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                    {c.code}
                  </Badge>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <span className="text-[11px] text-muted-foreground">{c.cat}</span>
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

      {/* Run button / analysis */}
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
