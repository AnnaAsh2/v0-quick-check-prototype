"use client"

import { useMemo, useState } from "react"
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
  ChevronDown,
  ChevronRight,
  BookOpen,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Shield,
} from "lucide-react"
import { validatePlan } from "@/lib/validation"
import type { Course, CourseStatus, PrereqStatus, LoadFlag, DegreeCourseEntry, SemesterPlan, SuggestionSeverity } from "@/lib/validation"

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

function courseStatusBadge(entry: DegreeCourseEntry) {
  switch (entry.status) {
    case "completed":
      return (
        <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-1.5 py-0">
          {entry.grade || "Done"}
        </Badge>
      )
    case "in-progress":
      return (
        <Badge className="border-sky-200 bg-sky-100 text-sky-700 text-[10px] font-semibold px-1.5 py-0">
          IP
        </Badge>
      )
    case "planned":
      return (
        <Badge className="border-violet-200 bg-violet-100 text-violet-700 text-[10px] font-semibold px-1.5 py-0">
          Planned
        </Badge>
      )
    case "remaining":
      return (
        <Badge className="border-border bg-muted text-muted-foreground text-[10px] font-semibold px-1.5 py-0">
          Needed
        </Badge>
      )
  }
}

function severityStyles(severity: SuggestionSeverity) {
  switch (severity) {
    case "red":
      return {
        border: "border-red-300",
        bg: "bg-red-50",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        titleColor: "text-red-900",
        bodyColor: "text-red-800/80",
        Icon: ShieldAlert,
      }
    case "yellow":
      return {
        border: "border-amber-300",
        bg: "bg-amber-50",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        titleColor: "text-amber-900",
        bodyColor: "text-amber-800/80",
        Icon: Shield,
      }
    case "green":
      return {
        border: "border-emerald-300",
        bg: "bg-emerald-50",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        titleColor: "text-emerald-900",
        bodyColor: "text-emerald-800/80",
        Icon: ShieldCheck,
      }
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

  // Derive Course Load status from loadFlags
  const loadStatus: "green" | "yellow" | "red" = useMemo(() => {
    if (result.loadFlags.some(f => f.type === "error")) return "red"
    if (result.loadFlags.some(f => f.type === "warning")) return "yellow"
    return "green"
  }, [result.loadFlags])

  // Derive Timeline status from timeline flags
  const timelineStatus: "green" | "yellow" | "red" = useMemo(() => {
    for (const sem of result.timeline) {
      if (sem.flags.some(f => f.type === "error")) return "red"
    }
    for (const sem of result.timeline) {
      if (sem.flags.some(f => f.type === "warning")) return "yellow"
    }
    return "green"
  }, [result.timeline])

  // The bottom suggestion section is the single source of truth for overall severity
  const suggestionSeverity: "green" | "yellow" | "red" = result.suggestion?.severity ?? "green"

  // 1-2 sentence summary assessment -- driven by suggestion severity
  const summaryAssessment = useMemo(() => {
    if (suggestionSeverity === "red") {
      const problems: string[] = []
      if (result.failCount > 0) problems.push(`${result.failCount} prerequisite issue${result.failCount > 1 ? "s" : ""}`)
      if (loadStatus === "red") problems.push("a course load concern")
      if (timelineStatus === "red") problems.push("a graduation timeline risk")
      return `This plan has ${problems.join(" and ")} that need to be resolved before registration. Review the details below and consider adjustments.`
    }
    if (suggestionSeverity === "yellow") {
      const concerns: string[] = []
      if (result.conditionalCount > 0) concerns.push(`${result.conditionalCount} course${result.conditionalCount > 1 ? "s" : ""} depending on Fall grades`)
      if (loadStatus === "yellow") concerns.push("a course load outside the standard 15-17 hour range")
      if (timelineStatus === "yellow") concerns.push("some scheduling pressure in future semesters")
      // Check for topic-specific concerns from the suggestion body
      const bodyText = (result.suggestion?.body ?? []).join(" ").toLowerCase()
      if (bodyText.includes("finance minor") || bodyText.includes("finn")) concerns.push("Finance minor pacing to track")
      if (bodyText.includes("natural science") || bodyText.includes("state min")) concerns.push("an outstanding State Minimum Core requirement")
      const unique = [...new Set(concerns)]
      return `This plan can move forward but has ${unique.join(" and ")}. Review the flagged items below to decide if any adjustments are needed.`
    }
    return "This plan looks solid. All prerequisites are met, the course load is within standard range, and the graduation timeline is on track for Spring 2028."
  }, [suggestionSeverity, result, loadStatus, timelineStatus])

  // Detect topic flags from the suggestion body so they surface in the top chips
  const suggestionTopics = useMemo(() => {
    const bodyText = (result.suggestion?.body ?? []).join(" ").toLowerCase()
    const topics: { key: string; label: string; severity: "yellow" | "red" }[] = []
    if (bodyText.includes("finn") || bodyText.includes("finance minor")) {
      topics.push({ key: "finance", label: "Finance minor", severity: suggestionSeverity === "red" ? "red" : "yellow" })
    }
    if (bodyText.includes("natural science") || bodyText.includes("state min")) {
      topics.push({ key: "natscience", label: "Nat. Science needed", severity: "yellow" })
    }
    if (bodyText.includes("conditional prerequisite") || bodyText.includes("in-progress")) {
      // Already shown via the conditional chip -- skip
    }
    if (bodyText.includes("concentration") || bodyText.includes("three econ") || bodyText.includes("three finn")) {
      topics.push({ key: "concentration", label: "Prefix concentration", severity: "yellow" })
    }
    return topics
  }, [result.suggestion, suggestionSeverity])

  const statusChipStyles = {
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  }
  const loadStatusLabel = {
    green: `${result.totalHrs} hrs — on target`,
    yellow: `${result.totalHrs} hrs — flagged`,
    red: `${result.totalHrs} hrs — action needed`,
  }
  const timelineStatusLabel = {
    green: "On track",
    yellow: "Flagged",
    red: "Risks identified",
  }

  // Banner border accent matches the bottom suggestion section color
  const bannerAccent = {
    green: "border-l-emerald-500",
    yellow: "border-l-amber-400",
    red: "border-l-red-500",
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-8">
      {/* ========== Overall assessment banner ========== */}
      <div className={`overflow-hidden rounded-2xl border border-l-4 ${bannerAccent[suggestionSeverity]} bg-card shadow-sm`}>
        <div className="border-b bg-muted/40 px-6 py-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            QuickCheck Results
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Spring 2027 plan for Jordan Martinez — {planned.length} courses,{" "}
            {result.totalHrs} credit hours
          </p>
        </div>

        {/* Status chips row */}
        <div className="flex flex-wrap items-center gap-2.5 px-6 py-4">
          {/* Course checks */}
          {result.passCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {result.passCount} of {planned.length} courses clear
            </div>
          )}
          {result.failCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              <XCircle className="h-4 w-4" />
              {result.failCount} prereq issue{result.failCount > 1 ? "s" : ""}
            </div>
          )}
          {result.conditionalCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {result.conditionalCount} conditional
            </div>
          )}

          {/* Course Load */}
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${statusChipStyles[loadStatus]}`}>
            <Gauge className="h-4 w-4" />
            {loadStatusLabel[loadStatus]}
          </div>

          {/* Graduation Timeline */}
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${statusChipStyles[timelineStatus]}`}>
            <Calendar className="h-4 w-4" />
            {timelineStatusLabel[timelineStatus]}
          </div>

          {/* Topic-specific flags from the bottom suggestion -- surface here */}
          {suggestionTopics.map((topic) => (
            <div
              key={topic.key}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${statusChipStyles[topic.severity]}`}
            >
              {topic.severity === "red" ? <XCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {topic.label}
            </div>
          ))}
        </div>

        {/* Summary assessment */}
        <div className="border-t px-6 py-3">
          <p className="text-sm leading-relaxed text-foreground/80">
            {summaryAssessment}
          </p>
        </div>
      </div>

      {/* ========== Degree Progress ========== */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          Degree Progress
        </div>
        <div className="flex flex-col gap-4">
          {result.degreeProgress.map((d) => (
            <DegreeProgressSection key={d.label} item={d} />
          ))}
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

      {/* ========== Graduation Timeline ========== */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          Graduation Timeline
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Best-case scenario to Spring 2028 graduation. We modeled multiple course arrangements across your remaining semesters -- optimizing for balanced loads, prerequisite sequencing, and minimal scheduling conflicts -- and selected the arrangement with the fewest issues.
        </p>
        <div className="flex flex-col gap-4">
          {result.timeline.map((sem, i) => (
            <SemesterBlock key={sem.label} semester={sem} isCurrent={i === 0} />
          ))}
        </div>
      </div>

      {/* ========== Suggestion Box ========== */}
      {result.suggestion && (
        <SuggestionBox suggestion={result.suggestion} />
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

/* ------------------------------------------------------------------ */
/*  Degree Progress Section (collapsible with course list)             */
/* ------------------------------------------------------------------ */

function DegreeProgressSection({ item }: { item: { label: string; detail: string; value: number; total: number; done?: boolean; color?: string; courses?: DegreeCourseEntry[] } }) {
  const [expanded, setExpanded] = useState(false)
  const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0
  const hasCourses = item.courses && item.courses.length > 0

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => hasCourses && setExpanded(!expanded)}
        className={`flex w-full items-start gap-3 px-5 py-4 text-left ${hasCourses ? "cursor-pointer hover:bg-muted/30" : ""}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-foreground">{item.label}</span>
            {item.done ? (
              <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </div>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">
                {item.value}/{item.total} ({pct}%)
              </span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-500 ${item.color || "bg-primary"}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
        </div>
        {hasCourses && (
          <div className="mt-1 shrink-0 text-muted-foreground">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        )}
      </button>

      {expanded && hasCourses && (
        <div className="border-t bg-muted/20 px-5 py-3">
          <div className="flex flex-col gap-1.5">
            {item.courses!.map((course, idx) => (
              <div key={`${course.code}-${idx}`} className="flex items-center gap-2 py-1">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {course.status === "completed" && <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />}
                  {course.status === "in-progress" && <Clock className="h-3 w-3 shrink-0 text-sky-500" />}
                  {course.status === "planned" && <ArrowRight className="h-3 w-3 shrink-0 text-violet-500" />}
                  {course.status === "remaining" && <div className="h-3 w-3 shrink-0 rounded-full border-2 border-muted-foreground/30" />}
                  <span className={`text-xs font-mono font-medium ${
                    course.status === "remaining" ? "text-muted-foreground" : "text-foreground"
                  }`}>
                    {course.code}
                  </span>
                  <span className={`text-xs truncate ${
                    course.status === "remaining" ? "text-muted-foreground" : "text-foreground/80"
                  }`}>
                    {course.name}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{course.hrs}h</span>
                {courseStatusBadge(course)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Semester Block (for graduation timeline)                           */
/* ------------------------------------------------------------------ */

function SemesterBlock({ semester, isCurrent }: { semester: SemesterPlan; isCurrent: boolean }) {
  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${
      isCurrent ? "border-primary/30 bg-primary/[0.02]" : "bg-card"
    }`}>
      <div className={`flex items-center justify-between px-5 py-3 border-b ${
        isCurrent ? "bg-primary/[0.06]" : "bg-muted/40"
      }`}>
        <div className="flex items-center gap-2">
          <Clock className={`h-4 w-4 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-sm font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>
            {semester.label}
          </span>
          {isCurrent && (
            <Badge className="border-primary/20 bg-primary/10 text-primary text-[10px] px-1.5 py-0">
              Current
            </Badge>
          )}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {semester.totalHrs} credit hours
        </span>
      </div>

      <div className="px-5 py-3">
        {semester.courses.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {semester.courses.map((course, idx) => (
              <div key={`${course.code}-${idx}`} className="flex items-center gap-2 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground/40 shrink-0" />
                <span className="text-xs font-mono font-medium text-foreground">{course.code}</span>
                <span className="text-xs text-foreground/80 flex-1 truncate">{course.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">{course.hrs}h</span>
                {course.note && (
                  <span className="text-[10px] text-muted-foreground/60 hidden sm:block max-w-[140px] truncate" title={course.note}>
                    {course.note}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic py-1">No additional courses projected for this semester.</p>
        )}
      </div>

      {semester.flags.length > 0 && (
        <div className="border-t px-5 py-3 flex flex-col gap-2">
          {semester.flags.map((flag, i) => (
            <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
              flag.type === "error" ? "bg-red-50 text-red-700" :
              flag.type === "warning" ? "bg-amber-50 text-amber-700" :
              "bg-primary/5 text-primary"
            }`}>
              {flag.type === "error" && <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
              {flag.type === "warning" && <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
              {flag.type === "info" && <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />}
              <span className="leading-relaxed">{flag.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Suggestion Box (color-coded)                                       */
/* ------------------------------------------------------------------ */

function SuggestionBox({ suggestion }: { suggestion: { title: string; body: string[]; severity: SuggestionSeverity } }) {
  const s = severityStyles(suggestion.severity)

  return (
    <div className={`rounded-2xl border-2 ${s.border} ${s.bg} p-6`}>
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${s.iconBg}`}>
          <s.Icon className={`h-4 w-4 ${s.iconColor}`} />
        </div>
        <p className={`text-sm font-bold ${s.titleColor}`}>
          {suggestion.severity === "red" ? "Action Required" : suggestion.severity === "yellow" ? "Heads Up" : "All Clear"}
        </p>
        <Badge className={`text-[10px] px-1.5 py-0 ${
          suggestion.severity === "red" ? "border-red-200 bg-red-100 text-red-700" :
          suggestion.severity === "yellow" ? "border-amber-200 bg-amber-100 text-amber-700" :
          "border-emerald-200 bg-emerald-100 text-emerald-700"
        }`}>
          {suggestion.severity === "red" ? "Critical" : suggestion.severity === "yellow" ? "Advisory" : "On Track"}
        </Badge>
      </div>
      <p className={`text-sm font-semibold ${s.titleColor}`}>
        {suggestion.title}
      </p>
      <div className={`mt-3 flex flex-col gap-2.5 text-sm ${s.bodyColor} leading-relaxed`}>
        {suggestion.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  )
}
