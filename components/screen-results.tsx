"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Send,
  Clock,
  Info,
  Gauge,
} from "lucide-react"
import { validatePlan } from "@/lib/validation"
import type { Course, CourseStatus, PrereqStatus, LoadFlag } from "@/lib/validation"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

function bgTint(status: CourseStatus) {
  if (status === "fail") return "bg-red-50/70"
  return "bg-card"
}

function StatusIcon({ status }: { status: CourseStatus }) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
    case "conditional":
      return <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
    case "fail":
      return <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
  }
}

function PrereqIcon({ s }: { s: PrereqStatus }) {
  switch (s) {
    case "met":
      return <span className="font-semibold text-emerald-600">{"\u2713"}</span>
    case "conditional":
      return <span className="font-semibold text-amber-500">{"\u26A0"}</span>
    case "notmet":
      return <span className="font-semibold text-red-500">{"\u2717"}</span>
  }
}

function LoadFlagIcon({ flag }: { flag: LoadFlag }) {
  switch (flag.type) {
    case "info":
      return <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
    case "warning":
      return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
    case "error":
      return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
  }
}

function loadFlagBg(flag: LoadFlag) {
  switch (flag.type) {
    case "info":
      return "bg-primary/5 border-primary/15"
    case "warning":
      return "bg-amber-50 border-amber-200"
    case "error":
      return "bg-red-50 border-red-200"
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ScreenResults({
  planned,
  onBack,
  onSubmit,
}: {
  planned: Course[]
  onBack: () => void
  onSubmit: () => void
}) {
  const result = useMemo(() => validatePlan(planned), [planned])

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-8">
      {/* ========== Overall assessment banner ========== */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/40 px-6 py-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            QuickCheck Results
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Spring 2027 plan for Jordan Martinez — {planned.length} courses,{" "}
            {result.totalHrs} credit hours
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 px-6 py-4">
          {result.passCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {result.passCount} of {planned.length} courses check out
            </div>
          )}
          {result.failCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              <XCircle className="h-4 w-4" />
              {result.failCount} prerequisite issue{result.failCount > 1 ? "s" : ""}
            </div>
          )}
          {result.conditionalCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {result.conditionalCount} conditional
            </div>
          )}
          {result.suggestionCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              <Lightbulb className="h-4 w-4" />
              {result.suggestionCount} suggestion
            </div>
          )}
        </div>
      </div>

      {/* ========== Credit-hour load flags ========== */}
      {result.loadFlags.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Gauge className="h-3.5 w-3.5" />
            Course Load Assessment
          </div>
          {result.loadFlags.map((flag, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${loadFlagBg(flag)}`}
            >
              <LoadFlagIcon flag={flag} />
              <p className="text-sm text-foreground/80 leading-relaxed">
                {flag.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ========== Course-by-course breakdown ========== */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Course-by-Course Breakdown
        </p>
        {result.courses.map((c) => (
          <div
            key={c.code}
            className={`rounded-xl border border-l-4 ${borderColor(c.status)} ${bgTint(c.status)} p-5 shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <StatusIcon status={c.status} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="shrink-0 font-mono text-xs">
                    {c.code}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {c.name}
                  </span>
                  {c.badges.map((b) => {
                    const cls =
                      b === "cannot register"
                        ? "border-red-200 bg-red-100 text-red-700"
                        : b === "workload flag" || b === "conditional"
                          ? "border-amber-200 bg-amber-100 text-amber-800"
                          : b === "overload"
                            ? "border-red-200 bg-red-100 text-red-700"
                            : "border-primary/20 bg-primary/10 text-primary"
                    return (
                      <Badge
                        key={b}
                        className={`px-1.5 py-0 text-[10px] font-semibold ${cls}`}
                      >
                        {b}
                      </Badge>
                    )
                  })}
                </div>
                <div className="mt-3 flex flex-col gap-2 text-sm leading-relaxed">
                  <p className="text-foreground/80">
                    <span className="font-medium text-muted-foreground">
                      Counts toward:
                    </span>{" "}
                    {c.countsToward}
                  </p>
                  <p className="text-foreground/80">
                    <span className="font-medium text-muted-foreground">
                      Prerequisites:
                    </span>{" "}
                    <PrereqIcon s={c.prereqStatus} /> {c.prereqs}
                  </p>
                  <p className="text-foreground/80">
                    <span className="font-medium text-muted-foreground">
                      Note:
                    </span>{" "}
                    {c.note}
                  </p>
                  {c.impact && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-red-800">
                      <span className="font-semibold">Impact:</span> {c.impact}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========== Degree Progress ========== */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Degree Progress
        </p>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-5">
            {result.degreeProgress.map((d) => {
              const pct =
                d.total > 0 ? Math.round((d.value / d.total) * 100) : 0
              return (
                <div key={d.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {d.label}
                    </span>
                    {d.done ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Complete
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {d.value}/{d.total} ({pct}%)
                      </span>
                    )}
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${d.color || "bg-primary"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {d.detail}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ========== Graduation Timeline ========== */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            Graduation Timeline
          </p>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {result.timeline}
        </p>
      </div>

      {/* ========== Suggestion Box ========== */}
      {result.suggestion && (
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.04] p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground">Suggestion</p>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {result.suggestion.title}
          </p>
          <div className="mt-3 flex flex-col gap-2.5 text-sm text-foreground/80 leading-relaxed">
            {result.suggestion.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      )}

      {/* ========== Bottom actions ========== */}
      <div className="flex flex-col gap-4 border-t pb-8 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Swap a Course & Re-Run
          </Button>
          <Button onClick={onSubmit} className="gap-2 shadow-sm">
            <Send className="h-4 w-4" />
            Submit to Advisor for Review
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          You can run as many scenarios as you want before submitting.
        </p>
      </div>
    </div>
  )
}
