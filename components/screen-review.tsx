"use client"

import { useState, useMemo } from "react"
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
import { validatePlan } from "@/lib/validation"
import type { Course, CourseStatus } from "@/lib/validation"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function StatusIcon({ status }: { status: CourseStatus }) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
    case "conditional":
      return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
    case "fail":
      return <XCircle className="h-4 w-4 shrink-0 text-red-500" />
  }
}

function borderColor(status: CourseStatus) {
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

export function ScreenReview({ planned }: { planned: Course[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const result = useMemo(() => validatePlan(planned), [planned])

  const toggle = (code: string) =>
    setExpanded((prev) => (prev === code ? null : code))

  // Generate a dynamic advisor note based on results
  const advisorNote = useMemo(() => {
    const failCourses = result.courses.filter((c) => c.status === "fail")
    const conditionalCourses = result.courses.filter(
      (c) => c.status === "conditional"
    )
    const plannedCodes = new Set(planned.map((c) => c.code))

    const lines: string[] = []

    if (failCourses.length > 0) {
      failCourses.forEach((c) => {
        if (c.code === "FINN 30603") {
          lines.push(
            "FINN 30603 \u2192 FINN 30103 swap is a must \u2014 Jordan needs it for the minor and hasn\u2019t started those 15 hours yet. With 3 semesters left, the minor is doable but tight."
          )
        } else {
          lines.push(
            `${c.code} has unmet prerequisites and cannot be registered. Needs attention.`
          )
        }
      })
    }

    if (plannedCodes.has("FINN 30103") && !plannedCodes.has("FINN 30603")) {
      lines.push(
        "Good that Jordan is taking FINN 30103 \u2014 this starts the Finance minor and unlocks upper-level FINN courses for Fall 2027."
      )
    }

    if (conditionalCourses.find((c) => c.code === "ECON 43303")) {
      lines.push(
        "I\u2019d consider deferring ECON 43303 to Fall 2027 to lighten the load \u2014 " +
          result.totalHrs +
          " hrs with econometrics is a lot. That frees up room for a science lab this spring, which still needs to get done."
      )
    }

    lines.push(
      "Let\u2019s meet to map out the full minor sequence and remaining requirements."
    )

    return lines.join(" ")
  }, [result, planned])

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
          2027 Plan &middot; {planned.length} courses, {result.totalHrs} credit
          hours
        </p>
      </div>

      {/* Summary card */}
      <div className="flex flex-wrap gap-3 rounded-xl border bg-card p-4 shadow-sm">
        {result.passCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {result.passCount} passed
          </div>
        )}
        {result.conditionalCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            {result.conditionalCount} conditional
          </div>
        )}
        {result.failCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700">
            <XCircle className="h-4 w-4" />
            {result.failCount} prereq issue{result.failCount > 1 ? "s" : ""}
          </div>
        )}
        {result.suggestionCount > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <Lightbulb className="h-4 w-4" />
            {result.suggestionCount} suggestion
          </div>
        )}
      </div>

      {/* Collapsible course cards */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          QuickCheck Results (click to expand)
        </p>
        {result.courses.map((c) => (
          <div
            key={c.code}
            className={`overflow-hidden rounded-xl border border-l-4 ${borderColor(c.status)} bg-card shadow-sm transition-shadow hover:shadow-md`}
          >
            <button
              onClick={() => toggle(c.code)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
            >
              <StatusIcon status={c.status} />
              <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                {c.code}
              </Badge>
              <span className="flex-1 text-sm font-medium text-foreground">
                {c.name}
              </span>
              <span className="hidden max-w-xs truncate text-xs text-muted-foreground sm:inline">
                {c.note}
              </span>
              {expanded === c.code ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {expanded === c.code && (
              <div className="border-t bg-muted/20 px-4 py-3.5 text-sm leading-relaxed">
                <div className="flex flex-col gap-1.5 text-foreground/80">
                  <p>
                    <span className="font-medium text-muted-foreground">
                      Counts toward:
                    </span>{" "}
                    {c.countsToward}
                  </p>
                  <p>
                    <span className="font-medium text-muted-foreground">
                      Prerequisites:
                    </span>{" "}
                    {c.prereqs}
                  </p>
                  <p>
                    <span className="font-medium text-muted-foreground">
                      Note:
                    </span>{" "}
                    {c.note}
                  </p>
                  {c.impact && (
                    <p className="mt-1 rounded-lg bg-red-50 px-3 py-2 text-red-800">
                      <span className="font-semibold">Impact:</span> {c.impact}
                    </p>
                  )}
                </div>
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
          defaultValue={advisorNote}
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
