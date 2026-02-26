"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  User,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Compact course summaries                                           */
/* ------------------------------------------------------------------ */

interface ReviewCourse {
  code: string
  name: string
  status: "pass" | "conditional" | "fail"
  summary: string
  detail: string
}

const reviewCourses: ReviewCourse[] = [
  {
    code: "ECON 31303",
    name: "Intermediate Macroeconomics",
    status: "pass",
    summary: "All prerequisites met. Required for concentration.",
    detail:
      "Counts toward Economics Major (Business Economics). Prerequisites: MATH 22003 (C+), ECON 21003 (A), ECON 22003 (A\u2212). On track.",
  },
  {
    code: "ECON 47403",
    name: "Introduction to Econometrics",
    status: "pass",
    summary: "Prerequisites met. 4-credit course (16 hrs total).",
    detail:
      "Counts toward Economics Major (4 credit hours). Prerequisites: MATH 22003 (C+), BUSI 10303 (B). Plan for the heavier credit load.",
  },
  {
    code: "SEVI 30103",
    name: "Strategic Management",
    status: "pass",
    summary: "Conditional on passing MKTG 34303 this fall with a C or better.",
    detail:
      "Business Core capstone. Requires a \u201CC\u201D or better in ALL other business core courses. MKTG 34303 is currently in progress. Last business core requirement.",
  },
  {
    code: "ECON 43303",
    name: "Economics of Organizations",
    status: "conditional",
    summary: "Depends on ECON 30303 (in progress). Heavy workload semester.",
    detail:
      "Requires ECON 30303 (Intermediate Micro, in progress this fall). 3 required ECON courses + 4-credit econometrics = 16 hrs of heavy quantitative load. 8-semester plan recommends deferring to Fall 2027.",
  },
  {
    code: "FINN 30603",
    name: "Investments",
    status: "fail",
    summary: "Prerequisite not met: missing FINN 30103 (Financial Analysis).",
    detail:
      "FINN 30603 requires FINN 20403 (completed) AND FINN 30103 (not taken, not planned). Cannot register. Blocks Finance minor progress. Suggested fix: take FINN 30103 instead.",
  },
]

const advisorNoteDefault = `FINN 30603 \u2192 FINN 30103 swap is a must \u2014 Jordan needs it for the minor and hasn\u2019t started those 15 hours yet. With 3 semesters left, the minor is doable but tight. I\u2019d also consider deferring ECON 43303 to Fall 2027 to lighten the load \u2014 16 hrs with econometrics is a lot. That frees up room for a science lab this spring, which still needs to get done. Let\u2019s meet to map out the full minor sequence.`

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function StatusIcon({ status }: { status: "pass" | "conditional" | "fail" }) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
    case "conditional":
      return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
    case "fail":
      return <XCircle className="h-4 w-4 shrink-0 text-red-500" />
  }
}

function borderColor(status: "pass" | "conditional" | "fail") {
  switch (status) {
    case "pass":
      return "border-l-emerald-500"
    case "conditional":
      return "border-l-amber-400"
    case "fail":
      return "border-l-red-500"
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ScreenReview() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (code: string) =>
    setExpanded((prev) => (prev === code ? null : code))

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-8">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Advisor Review
          </p>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Jordan Martinez
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Business Economics (Junior) &middot; Finance Minor &middot; Spring
          2027 Plan
        </p>
      </div>

      {/* Summary card */}
      <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />3 passed
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
          <AlertTriangle className="h-4 w-4" />1 conditional
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
          <XCircle className="h-4 w-4" />1 prereq issue
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          <Lightbulb className="h-4 w-4" />1 suggestion
        </div>
      </div>

      {/* Collapsible course cards */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          QuickCheck Results (click to expand)
        </p>
        {reviewCourses.map((c) => (
          <div
            key={c.code}
            className={`overflow-hidden rounded-xl border border-l-4 ${borderColor(c.status)} bg-card shadow-sm transition-shadow hover:shadow-md`}
          >
            <button
              onClick={() => toggle(c.code)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
            >
              <StatusIcon status={c.status} />
              <Badge
                variant="secondary"
                className="shrink-0 font-mono text-xs"
              >
                {c.code}
              </Badge>
              <span className="flex-1 text-sm font-medium text-foreground">
                {c.name}
              </span>
              <span className="hidden max-w-xs truncate text-xs text-muted-foreground sm:inline">
                {c.summary}
              </span>
              {expanded === c.code ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {expanded === c.code && (
              <div className="border-t bg-muted/20 px-4 py-3.5 text-sm text-foreground/80 leading-relaxed">
                {c.detail}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Advisor Notes */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Advisor Notes
          </p>
        </div>
        <Textarea
          defaultValue={advisorNoteDefault}
          rows={6}
          className="text-sm leading-relaxed shadow-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:gap-4">
        <Button
          size="lg"
          className="gap-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve Plan & Notify Student
        </Button>
        <Button variant="outline" size="lg" className="gap-2 shadow-sm">
          <CalendarDays className="h-4 w-4" />
          Request Meeting
        </Button>
      </div>
      <p className="pb-8 text-xs text-muted-foreground leading-relaxed">
        Student will receive your feedback and the approved plan via email. All
        records are saved to the student{"'"}s advising file. Requesting a
        meeting will prompt the student to schedule an advising session.
      </p>
    </div>
  )
}
