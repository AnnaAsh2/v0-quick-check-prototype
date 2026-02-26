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
import type { RequirementGroup, RecommendedCourse } from "@/lib/validation"

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
]

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
  const plannedCodes = new Set(planned.map((c) => c.code))

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
      : catalogue.filter((c) => !plannedCodes.has(c.code))

  const removeCourse = (code: string) => setPlanned((prev) => prev.filter((c) => c.code !== code))

  const addCourse = (course: Course) => {
    if (!plannedCodes.has(course.code)) {
      setPlanned((prev) => [...prev, course])
    }
    setQuery("")
    setShowResults(false)
  }

  const addFromRec = (rec: RecommendedCourse) => {
    if (rec.code.includes("XXXX")) return // placeholder
    const existing = catalogue.find(c => c.code === rec.code)
    if (existing && !plannedCodes.has(existing.code)) {
      setPlanned(prev => [...prev, existing])
    }
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
            {showResults && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border bg-card shadow-xl">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">No matching courses found</div>
                ) : (
                  searchResults.map((c) => (
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
                  ))
                )}
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
              catalogue={catalogue}
              onAddCourse={addCourse}
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
  catalogue,
  onAddCourse,
}: {
  group: RequirementGroup
  plannedCodes: Set<string>
  onAdd: (rec: RecommendedCourse) => void
  catalogue: Course[]
  onAddCourse: (c: Course) => void
}) {
  const [expanded, setExpanded] = useState(
    group.id === "business-core" || group.id === "econ-major-required" || group.id === "finance-minor"
  )
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const groupSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (groupSearchRef.current && !groupSearchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Courses in this group that are already planned
  const plannedInGroup = group.courses.filter(c => plannedCodes.has(c.code)).length
  const pct = group.hoursNeeded > 0 ? Math.min(100, Math.round((group.hoursCompleted / (group.hoursCompleted + group.hoursNeeded)) * 100)) : 100

  // For the group search: filter catalogue to courses relevant to this group requirement
  const groupSearchResults = searchQuery.trim().length > 0
    ? catalogue.filter(c =>
        !plannedCodes.has(c.code) &&
        (c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
         c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : []

  // Partition courses into recommended (top 3 eligible) and rest
  const eligibleCourses = group.courses.filter(c => c.eligible && !plannedCodes.has(c.code))
  const ineligibleCourses = group.courses.filter(c => !c.eligible && !plannedCodes.has(c.code))
  const critical = eligibleCourses.filter(c => c.priority === "critical")
  const recommended = eligibleCourses.filter(c => c.priority === "recommended").slice(0, 3)
  const options = eligibleCourses.filter(c => c.priority === "option")

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
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
            <div className="h-1.5 flex-1 max-w-32 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/70 transition-all"
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
        <div className="border-t px-4 py-4 flex flex-col gap-3">
          {group.description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{group.description}</p>
          )}

          {/* Critical courses - single select with prominent styling */}
          {critical.length > 0 && (
            <div className="flex flex-col gap-2">
              {critical.map(c => (
                <button
                  key={c.code}
                  onClick={() => onAdd(c)}
                  disabled={plannedCodes.has(c.code) || c.code.includes("XXXX")}
                  className="flex items-center gap-3 rounded-lg border-2 border-primary/20 bg-primary/[0.04] px-3.5 py-3 text-left transition-all hover:border-primary/40 hover:bg-primary/[0.08] disabled:opacity-50 disabled:cursor-default"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{c.code}</span>
                      <span className="text-sm text-foreground">{c.name}</span>
                      <Badge className="border-primary/20 bg-primary/10 text-[10px] font-bold text-primary ml-auto">{c.hrs} hrs</Badge>
                    </div>
                    {c.note && <span className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">{c.note}</span>}
                  </div>
                  {plannedCodes.has(c.code) ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Recommended courses - button-style options */}
          {recommended.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recommended
              </span>
              <div className="flex flex-wrap gap-2">
                {recommended.map(c => (
                  <button
                    key={c.code}
                    onClick={() => onAdd(c)}
                    disabled={plannedCodes.has(c.code) || c.code.includes("XXXX")}
                    className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5 text-left transition-all hover:border-primary/30 hover:shadow-sm disabled:opacity-50 disabled:cursor-default"
                  >
                    {plannedCodes.has(c.code) ? (
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <Plus className="h-3.5 w-3.5 shrink-0 text-primary" />
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{c.code}</span>
                        <span className="text-[10px] text-muted-foreground">{c.hrs}h</span>
                      </div>
                      <span className="text-[11px] text-foreground leading-tight">{c.name}</span>
                      {c.note && <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">{c.note}</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Option courses - compact list */}
          {options.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Other Options
              </span>
              <div className="flex flex-wrap gap-1.5">
                {options.slice(0, 6).map(c => (
                  <button
                    key={c.code}
                    onClick={() => onAdd(c)}
                    disabled={plannedCodes.has(c.code)}
                    className="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 py-1.5 text-left transition-colors hover:bg-muted/60 disabled:opacity-50 disabled:cursor-default"
                  >
                    {plannedCodes.has(c.code) ? (
                      <CheckCircle className="h-3 w-3 shrink-0 text-emerald-500" />
                    ) : (
                      <Plus className="h-3 w-3 shrink-0 text-muted-foreground" />
                    )}
                    <span className="text-[11px] font-medium text-foreground">{c.code}</span>
                    <span className="text-[10px] text-muted-foreground">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ineligible courses */}
          {ineligibleCourses.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Not Yet Eligible
              </span>
              {ineligibleCourses.slice(0, 3).map(c => (
                <div
                  key={c.code}
                  className="flex items-center gap-2.5 rounded-md border border-dashed bg-muted/20 px-3 py-2 opacity-70"
                >
                  <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <div className="flex flex-1 flex-col">
                    <span className="text-[11px] font-medium text-muted-foreground">{c.code} - {c.name}</span>
                    {c.reason && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {c.reason}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Group-specific search */}
          {group.type === "choose" && (
            <div ref={groupSearchRef} className="relative mt-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={`Search for any course that meets ${group.label}...`}
                  className="h-9 pl-9 pr-3 text-xs shadow-sm"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true) }}
                  onFocus={() => setSearchOpen(true)}
                />
              </div>
              {searchOpen && groupSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-card shadow-lg">
                  {groupSearchResults.map(c => (
                    <button
                      key={c.code}
                      onClick={() => {
                        onAddCourse(c)
                        setSearchQuery("")
                        setSearchOpen(false)
                      }}
                      className="flex w-full items-center gap-2.5 border-b px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-muted/50"
                    >
                      <Plus className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">{c.code}</Badge>
                      <span className="flex-1 text-xs text-foreground">{c.name}</span>
                      <span className="text-[10px] text-muted-foreground">{c.hrs}h</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
