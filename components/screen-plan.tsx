"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search, X, CheckCircle, BookOpen, Plus, ArrowRightLeft,
  Lightbulb, ChevronDown, ChevronUp, AlertTriangle, Lock, Sparkles,
} from "lucide-react"
import type { Course } from "@/lib/validation"
import { buildRecommendations } from "@/lib/validation"
import type { RequirementGroup, RecommendedCourse, SciencePair } from "@/lib/validation"

/* ------------------------------------------------------------------ */
/*  Full course catalogue for free-search mode                         */
/* ------------------------------------------------------------------ */

const catalogue: Course[] = [
  { code: "ECON 31303", name: "Intermediate Macroeconomics", hrs: 3, cat: "Economics Major (Required)" },
  { code: "ECON 47403", name: "Introduction to Econometrics", hrs: 4, cat: "Economics Major (Required)" },
  { code: "SEVI 30103", name: "Strategic Management", hrs: 3, cat: "Business Core (Capstone)" },
  { code: "ECON 43303", name: "Economics of Organizations", hrs: 3, cat: "Economics Major (Required)" },
  { code: "FINN 30603", name: "Investments", hrs: 3, cat: "Finance Minor" },
  { code: "FINN 30103", name: "Financial Analysis", hrs: 3, cat: "Finance Minor (Required)" },
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
  { code: "FINN 31003", name: "Financial Modeling", hrs: 3, cat: "Finance Minor" },
  { code: "FINN 36003", name: "Corporate Finance", hrs: 3, cat: "Finance Minor (Banking)" },
  { code: "FINN 31303", name: "Commercial Banking", hrs: 3, cat: "Finance Minor (Banking)" },
  { code: "FINN 30003", name: "Personal Financial Management", hrs: 3, cat: "Finance Minor (Ins/RE)" },
  { code: "FINN 30503", name: "Financial Markets & Institutions", hrs: 3, cat: "Jr/Sr Business Elective" },
  { code: "FINN 37003", name: "International Finance", hrs: 3, cat: "Finance Minor / Intl Econ" },
  { code: "FINN 36203", name: "Risk Management", hrs: 3, cat: "Finance Minor (Ins/RE)" },
  { code: "FINN 43203", name: "Financial Data Analytics I", hrs: 3, cat: "Jr/Sr Business Elective" },
  { code: "MGMT 42503", name: "Leadership", hrs: 3, cat: "Management Minor / Elective" },
  { code: "MGMT 42603", name: "Org Change & Development", hrs: 3, cat: "Management Minor / Elective" },
  { code: "MGMT 49403", name: "Talent Acquisition & Management", hrs: 3, cat: "Management Minor / Elective" },
  { code: "MKTG 35503", name: "Consumer Behavior", hrs: 3, cat: "Marketing Minor / Elective" },
  { code: "MKTG 36303", name: "Marketing Research", hrs: 3, cat: "Marketing Minor / Elective" },
  { code: "MKTG 38303", name: "Digital Marketing", hrs: 3, cat: "Jr/Sr Business Elective" },
  { code: "SCMT 34403", name: "Transportation & Distribution Mgmt", hrs: 3, cat: "Supply Chain Minor / Elective" },
  { code: "SCMT 36103", name: "Procurement & Supply Mgmt", hrs: 3, cat: "Supply Chain Minor / Elective" },
  { code: "ISYS 41903", name: "Business Analytics & Visualization", hrs: 3, cat: "Jr/Sr Business Elective" },
  { code: "SEVI 39303", name: "Entrepreneurship & New Venture Dev", hrs: 3, cat: "Innovation Minor / Elective" },
  { code: "SEVI 36703", name: "Social Entrepreneurship", hrs: 3, cat: "Innovation Minor / Elective" },
  { code: "BLAW 30303", name: "Commercial Law", hrs: 3, cat: "Jr/Sr Business Elective" },
  { code: "ECON 30303", name: "Intermediate Microeconomics", hrs: 3, cat: "Economics Major (Required)" },
  { code: "FINN 20403", name: "Principles of Finance", hrs: 3, cat: "Business Core" },
  { code: "MKTG 34303", name: "Introduction to Marketing", hrs: 3, cat: "Business Core" },
  // Science courses for State Minimum Core (less intensive options)
  { code: "ASTR 10003", name: "Survey of Astronomy", hrs: 3, cat: "State Minimum Core (Science)" },
  { code: "ASTR 10001", name: "Survey of Astronomy Lab", hrs: 1, cat: "State Minimum Core (Science Lab)" },
  { code: "ENSC 10003", name: "Intro to Environmental Science", hrs: 3, cat: "State Minimum Core (Science)" },
  { code: "ENSC 10001", name: "Environmental Science Lab", hrs: 1, cat: "State Minimum Core (Science Lab)" },
  { code: "PHYS 10103", name: "Physics in the Modern World", hrs: 3, cat: "State Minimum Core (Science)" },
  { code: "PHYS 10101", name: "Physics in the Modern World Lab", hrs: 1, cat: "State Minimum Core (Science Lab)" },
  // General electives
  { code: "COMM 13003", name: "Interpersonal Communication", hrs: 3, cat: "General Elective" },
  { code: "PSYC 21003", name: "Abnormal Psychology", hrs: 3, cat: "General Elective" },
  { code: "SOCI 20003", name: "Intro to Sociology", hrs: 3, cat: "General Elective" },
  { code: "PHIL 32003", name: "Business Ethics", hrs: 3, cat: "General Elective" },
  { code: "GEOS 10003", name: "World Regional Geography", hrs: 3, cat: "General Elective" },
  { code: "ANTH 10003", name: "Intro to Anthropology", hrs: 3, cat: "General Elective" },
]

/* ------------------------------------------------------------------ */
/*  Science lecture <-> lab auto-pair map                                */
/* ------------------------------------------------------------------ */

const scienceLinks: Record<string, string> = {
  "ASTR 10003": "ASTR 10001",
  "ASTR 10001": "ASTR 10003",
  "ENSC 10003": "ENSC 10001",
  "ENSC 10001": "ENSC 10003",
  "PHYS 10103": "PHYS 10101",
  "PHYS 10101": "PHYS 10103",
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface Props {
  planned: Course[]
  setPlanned: React.Dispatch<React.SetStateAction<Course[]>>
  onRunCheck: () => void
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function ScreenPlan({ planned, setPlanned, onRunCheck }: Props) {
  const [mode, setMode] = useState<"choose" | "guided">("choose")
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzeText, setAnalyzeText] = useState("")
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  const totalHrs = planned.reduce((acc, c) => acc + c.hrs, 0)
  const plannedCodes = useMemo(() => new Set(planned.map((c) => c.code)), [planned])

  // Build guided recommendations (recomputed when planned changes)
  const groups = useMemo(() => buildRecommendations(planned), [planned])

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
      : []

  const removeCourse = (code: string) => {
    const linked = scienceLinks[code]
    setPlanned((prev) => prev.filter((c) => c.code !== code && c.code !== linked))
  }

  const addCourse = (course: Course) => {
    setPlanned((prev) => {
      const existing = new Set(prev.map(c => c.code))
      const next = [...prev]
      if (!existing.has(course.code)) {
        next.push(course)
        existing.add(course.code)
      }
      // Auto-pair science lecture <-> lab
      const linked = scienceLinks[course.code]
      if (linked && !existing.has(linked)) {
        const pair = catalogue.find(c => c.code === linked)
        if (pair) {
          next.push(pair)
          existing.add(pair.code)
        }
      }
      return next
    })
    setQuery("")
    setShowResults(false)
  }

  const addFromRec = (rec: RecommendedCourse) => {
    const course = catalogue.find(c => c.code === rec.code)
    if (!course) return
    setPlanned((prev) => {
      const codes = new Set(prev.map(c => c.code))
      const next = [...prev]
      if (!codes.has(course.code)) {
        next.push(course)
        codes.add(course.code)
      }
      // Auto-pair science lecture <-> lab
      const linked = scienceLinks[course.code]
      if (linked && !codes.has(linked)) {
        const pair = catalogue.find(c => c.code === linked)
        if (pair) next.push(pair)
      }
      return next
    })
  }

  const addPair = (lecture: RecommendedCourse, lab: RecommendedCourse) => {
    const lec = catalogue.find(c => c.code === lecture.code)
    const labC = catalogue.find(c => c.code === lab.code)
    setPlanned(prev => {
      const next = [...prev]
      if (lec && !plannedCodes.has(lec.code)) next.push(lec)
      if (labC && !plannedCodes.has(labC.code)) next.push(labC)
      return next
    })
  }

  // Analysis animation
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
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <Badge variant="secondary" className="text-xs font-medium">Spring 2027</Badge>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">
          Plan your Spring 2027 semester
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          Choose how you{"'"}d like to build your schedule, then run QuickCheck to validate.
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 rounded-xl border bg-muted/40 p-1">
        <button
          onClick={() => setMode("choose")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            mode === "choose"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          I Know What I Want
        </button>
        <button
          onClick={() => setMode("guided")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            mode === "guided"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          What Should I Take?
        </button>
      </div>

      {/* ============================================================ */}
      {/*  MODE A: "I Know What I Want" - Free search                   */}
      {/* ============================================================ */}
      {mode === "choose" && (
        <div className="flex flex-col gap-6">
          {/* Search box */}
          <div ref={searchRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by course name, code, or category..."
                className="h-11 pl-10 pr-4 text-sm shadow-sm"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowResults(true) }}
                onFocus={() => setShowResults(true)}
              />
            </div>
            {showResults && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border bg-card shadow-xl">
                {searchResults.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => addCourse(c)}
                    className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                  >
                    <Plus className="h-4 w-4 shrink-0 text-primary" />
                    <Badge variant="secondary" className="shrink-0 font-mono text-xs">{c.code}</Badge>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm font-medium text-foreground">{c.name}</span>
                      <span className="text-[11px] text-muted-foreground">{c.cat}</span>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">{c.hrs} hrs</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  MODE B: "What Should I Take?" - Guided recommendations       */}
      {/* ============================================================ */}
      {mode === "guided" && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Based on your completed courses, in-progress classes, and the recommended
            8-semester BSBA Business Economics plan, here are the requirements you still
            need to fulfill. Add courses directly to your schedule below.
          </p>

          {groups.map((group) => (
            <RequirementGroupCard
              key={group.id}
              group={group}
              plannedCodes={plannedCodes}
              onAdd={addFromRec}
              onAddPair={addPair}
              onRemove={removeCourse}
            />
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/*  Planned courses list (always visible in both modes)          */}
      {/* ============================================================ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your Schedule
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-semibold">{planned.length} courses</Badge>
            <Badge className="border-primary/20 bg-primary/10 text-xs font-semibold text-primary">{totalHrs} credit hours</Badge>
          </div>
        </div>

        {planned.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed bg-muted/30 px-6 py-10 text-center">
            <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">No courses planned yet</p>
            <p className="text-xs text-muted-foreground">
              {mode === "choose"
                ? "Use the search above to add courses"
                : "Select courses from the recommendations above"}
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
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs">{c.code}</Badge>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                    <span className="text-[11px] text-muted-foreground">{c.cat}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground">{c.hrs} hrs</span>
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

      {/* Run button / analysis animation */}
      {analyzing ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-8 py-10 text-center shadow-sm">
          <div className="h-2 w-56 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${analyzeProgress}%` }}
            />
          </div>
          <p className="text-sm font-medium text-foreground">{analyzeText}</p>
          <p className="text-xs text-muted-foreground">Analyzing {planned.length} courses against degree requirements...</p>
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

/* ------------------------------------------------------------------ */
/*  Requirement Group Card (collapsible)                                */
/* ------------------------------------------------------------------ */

function RequirementGroupCard({
  group,
  plannedCodes,
  onAdd,
  onAddPair,
  onRemove,
}: {
  group: RequirementGroup
  plannedCodes: Set<string>
  onAdd: (rec: RecommendedCourse) => void
  onAddPair: (lecture: RecommendedCourse, lab: RecommendedCourse) => void
  onRemove: (code: string) => void
}) {
  const [expanded, setExpanded] = useState(
    group.id === "business-core" || group.id === "econ-major-required" || group.id === "finance-minor"
  )

  const plannedInGroup = group.courses.filter(c => plannedCodes.has(c.code)).length
  const pct = group.hoursNeeded > 0
    ? Math.min(100, Math.round((group.hoursCompleted / (group.hoursCompleted + group.hoursNeeded)) * 100))
    : 100

  // Filter courses into buckets -- do NOT exclude planned courses (they show green)
  const allEligible = group.courses.filter(c => c.eligible && !c.linkedLecture)
  const ineligibleCourses = group.courses.filter(c => !c.eligible && !plannedCodes.has(c.code))
  const critical = allEligible.filter(c => c.priority === "critical")
  const recommended = allEligible.filter(c => c.priority === "recommended")
  const options = allEligible.filter(c => c.priority === "option")



  const isScience = group.id === "state-min-core" && group.sciencePairs && group.sciencePairs.length > 0

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{group.label}</span>
            {plannedInGroup > 0 && (
              <Badge className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700">
                {plannedInGroup} added
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 max-w-32 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              {group.hoursCompleted} of {group.hoursCompleted + group.hoursNeeded} hrs
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="flex flex-col gap-3 border-t px-4 py-4">
          {group.description && (
            <p className="text-xs leading-relaxed text-muted-foreground">{group.description}</p>
          )}

          {/* ======================================================== */}
          {/* SCIENCE PAIRS - auto-linked lecture+lab buttons            */}
          {/* ======================================================== */}
          {isScience && group.sciencePairs!.map((pair) => {
            const pairAdded = plannedCodes.has(pair.lecture.code) && plannedCodes.has(pair.lab.code)
            return (
              <div
                key={pair.lecture.code}
                className={`relative flex flex-col gap-2 rounded-lg border-2 px-4 py-3.5 text-left transition-all ${
                  pairAdded
                    ? "border-emerald-300 bg-emerald-50"
                    : pair.lecture.priority === "recommended"
                      ? "border-primary/20 bg-primary/[0.03] cursor-pointer hover:border-primary/40 hover:bg-primary/[0.06]"
                      : "border-border bg-muted/20 cursor-pointer hover:border-muted-foreground/20 hover:bg-muted/40"
                }`}
                onClick={() => { if (!pairAdded) onAddPair(pair.lecture, pair.lab) }}
                role="button"
                tabIndex={0}
              >
                {pairAdded && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(pair.lecture.code) }}
                    className="absolute right-2.5 top-2.5 rounded-full p-1 text-emerald-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                    aria-label={`Remove ${pair.lecture.code} and ${pair.lab.code}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <div className="flex items-center gap-2 pr-6">
                  {pairAdded ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={`text-sm font-semibold ${pairAdded ? "text-emerald-800" : "text-foreground"}`}>{pair.lecture.code}</span>
                    <span className={`text-sm ${pairAdded ? "text-emerald-700" : "text-foreground"}`}>{pair.lecture.name}</span>
                    <span className="text-[10px] text-muted-foreground">+</span>
                    <span className={`text-sm font-semibold ${pairAdded ? "text-emerald-800" : "text-foreground"}`}>{pair.lab.code}</span>
                    <span className={`text-sm ${pairAdded ? "text-emerald-700" : "text-foreground"}`}>{pair.lab.name}</span>
                  </div>
                  <Badge
                    className={`shrink-0 text-[10px] font-bold ${
                      pairAdded
                        ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                        : "border-primary/20 bg-primary/10 text-primary"
                    }`}
                  >
                    {pair.lecture.hrs + pair.lab.hrs} hrs
                  </Badge>
                </div>
                <p className={`pl-6 text-[11px] leading-relaxed ${pairAdded ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {pairAdded ? "Added to your schedule (lecture + lab)" : pair.lecture.note}
                </p>
              </div>
            )
          })}

          {/* ======================================================== */}
          {/* CRITICAL courses - single select, prominent style         */}
          {/* ======================================================== */}
          {!isScience && critical.length > 0 && (
            <div className="flex flex-col gap-2">
              {critical.map(c => {
                const added = plannedCodes.has(c.code)
                return (
                  <div
                    key={c.code}
                    onClick={() => { if (!added) onAdd(c) }}
                    role="button"
                    tabIndex={0}
                    className={`relative flex flex-col gap-1.5 rounded-lg border-2 px-4 py-3.5 text-left transition-all ${
                      added
                        ? "border-emerald-300 bg-emerald-50"
                        : "cursor-pointer border-primary/20 bg-primary/[0.04] hover:border-primary/40 hover:bg-primary/[0.08]"
                    }`}
                  >
                    {added && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemove(c.code) }}
                        className="absolute right-2.5 top-2.5 rounded-full p-1 text-emerald-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                        aria-label={`Remove ${c.code}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <div className="flex items-center gap-2 pr-6">
                      {added ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                      )}
                      <span className={`text-sm font-semibold ${added ? "text-emerald-800" : "text-foreground"}`}>{c.code}</span>
                      <span className={`text-sm ${added ? "text-emerald-700" : "text-foreground"}`}>{c.name}</span>
                      <Badge className={`ml-auto shrink-0 text-[10px] font-bold ${
                        added
                          ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                          : "border-primary/20 bg-primary/10 text-primary"
                      }`}>{c.hrs} hrs</Badge>
                    </div>
                    <p className={`pl-6 text-[11px] leading-relaxed ${added ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {added ? "Added to your schedule" : c.note}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* ======================================================== */}
          {/* RECOMMENDED courses - selectable cards with rationale     */}
          {/* ======================================================== */}
          {!isScience && recommended.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended
              </span>
              <div className="flex flex-col gap-2">
                {recommended.slice(0, 8).map(c => {
                  const added = plannedCodes.has(c.code)
                  return (
                    <div
                      key={c.code}
                      onClick={() => { if (!added) onAdd(c) }}
                      role="button"
                      tabIndex={0}
                      className={`relative flex flex-col gap-1 rounded-lg border px-3.5 py-3 text-left transition-all ${
                        added
                          ? "border-emerald-300 bg-emerald-50"
                          : "cursor-pointer bg-card hover:border-primary/30 hover:shadow-sm"
                      }`}
                    >
                      {added && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemove(c.code) }}
                          className="absolute right-2 top-2 rounded-full p-1 text-emerald-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                          aria-label={`Remove ${c.code}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      <div className="flex items-center gap-2 pr-6">
                        {added ? (
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        ) : (
                          <Plus className="h-3.5 w-3.5 shrink-0 text-primary" />
                        )}
                        <span className={`text-xs font-semibold ${added ? "text-emerald-800" : "text-foreground"}`}>{c.code}</span>
                        <span className={`text-xs ${added ? "text-emerald-700" : "text-foreground"}`}>{c.name}</span>
                        <span className={`ml-auto text-[10px] font-medium ${added ? "text-emerald-600" : "text-muted-foreground"}`}>{c.hrs} hrs</span>
                      </div>
                      <p className={`pl-[1.375rem] text-[10px] leading-relaxed ${added ? "text-emerald-600" : "text-muted-foreground"}`}>
                        {added ? "Added to your schedule" : c.note}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* OPTION courses - up to 8 selectable boxes                 */}
          {/* ======================================================== */}
          {!isScience && options.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Other Options
              </span>
              <div className="flex flex-col gap-1.5">
                {options.slice(0, 8).map(c => {
                  const added = plannedCodes.has(c.code)
                  return (
                    <div
                      key={c.code}
                      onClick={() => { if (!added) onAdd(c) }}
                      role="button"
                      tabIndex={0}
                      className={`relative flex flex-col gap-0.5 rounded-md border px-3 py-2 text-left transition-colors ${
                        added
                          ? "border-emerald-300 bg-emerald-50"
                          : "cursor-pointer bg-muted/30 hover:bg-muted/60"
                      }`}
                    >
                      {added && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemove(c.code) }}
                          className="absolute right-2 top-2 rounded-full p-1 text-emerald-500 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                          aria-label={`Remove ${c.code}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      <div className="flex items-center gap-1.5 pr-6">
                        {added ? (
                          <CheckCircle className="h-3 w-3 shrink-0 text-emerald-600" />
                        ) : (
                          <Plus className="h-3 w-3 shrink-0 text-muted-foreground" />
                        )}
                        <span className={`text-[11px] font-medium ${added ? "text-emerald-800" : "text-foreground"}`}>{c.code}</span>
                        <span className={`text-[10px] ${added ? "text-emerald-700" : "text-muted-foreground"}`}>{c.name}</span>
                        <span className={`ml-auto text-[10px] ${added ? "text-emerald-600" : "text-muted-foreground"}`}>{c.hrs}h</span>
                      </div>
                      {c.note && (
                        <p className={`pl-[1.125rem] text-[10px] leading-snug ${added ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {added ? "Added to your schedule" : c.note}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* INELIGIBLE courses                                        */}
          {/* ======================================================== */}
          {ineligibleCourses.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Not Yet Eligible
              </span>
              {ineligibleCourses.map(c => (
                <div
                  key={c.code}
                  className="flex flex-col gap-0.5 rounded-md border border-dashed bg-muted/20 px-3 py-2 opacity-70"
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground">{c.code} - {c.name}</span>
                  </div>
                  {c.reason && (
                    <span className="flex items-center gap-1 pl-[1.125rem] text-[10px] text-amber-600">
                      <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                      {c.reason}
                    </span>
                  )}
                  {c.note && (
                    <p className="pl-[1.125rem] text-[10px] leading-snug text-muted-foreground">{c.note}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
