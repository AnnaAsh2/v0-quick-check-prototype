"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Send,
  Clock,
  TrendingUp,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Course cards data                                                  */
/* ------------------------------------------------------------------ */

type CourseStatus = "pass" | "conditional" | "fail"

interface CourseResult {
  code: string
  name: string
  status: CourseStatus
  countsToward: string
  prereqs: string
  prereqStatus: "met" | "conditional" | "notmet"
  note: string
  impact?: string
}

const courses: CourseResult[] = [
  {
    code: "ECON 31303",
    name: "Intermediate Macroeconomics",
    status: "pass",
    countsToward: "Economics Major \u2014 Required (Business Economics concentration)",
    prereqs: "Met \u2014 MATH 22003 (C+), ECON 21003 (A), ECON 22003 (A\u2212)",
    prereqStatus: "met",
    note: "Required for your concentration. On track.",
  },
  {
    code: "ECON 47403",
    name: "Introduction to Econometrics",
    status: "pass",
    countsToward: "Economics Major \u2014 Required (4 credit hours)",
    prereqs: "Met \u2014 MATH 22003 (C+), BUSI 10303 (B)",
    prereqStatus: "met",
    note: "This is a 4-credit course \u2014 your semester total is 16 hours, not 15. Plan accordingly.",
  },
  {
    code: "SEVI 30103",
    name: "Strategic Management",
    status: "pass",
    countsToward: "Business Core \u2014 Required (capstone)",
    prereqs:
      "Conditional \u2014 Requires a \u201CC\u201D or better in ALL other business core courses. You are currently enrolled in MKTG 34303, which must be completed with a C or better this fall.",
    prereqStatus: "conditional",
    note: "As long as you pass MKTG 34303, you\u2019re clear. This is the right time to take it \u2014 it\u2019s your last business core requirement.",
  },
  {
    code: "ECON 43303",
    name: "Economics of Organizations",
    status: "conditional",
    countsToward: "Economics Major \u2014 Required",
    prereqs:
      "Conditional \u2014 Requires ECON 30303 (Intermediate Microeconomics), which you are taking this fall. Must complete with a \u201CC\u201D or better.",
    prereqStatus: "conditional",
    note: "Workload flag \u2014 you\u2019re planning 3 required economics courses plus a 4-credit econometrics course in one semester (16 hrs, heavy quantitative load). The 8-semester plan recommends deferring ECON 43303 to Fall 2027. Consider this carefully.",
  },
  {
    code: "FINN 30603",
    name: "Investments",
    status: "fail",
    countsToward: "Finance Minor requirement + Junior/Senior Business Elective",
    prereqs:
      "Not met. FINN 30603 requires FINN 20403 (\u2713 you have it) AND FINN 30103 Financial Analysis as a prerequisite or corequisite. You have not taken FINN 30103 and it is not in your plan.",
    prereqStatus: "notmet",
    note: "You cannot register for this course.",
    impact:
      "This also blocks your Finance minor \u2014 FINN 30103 is required for the minor anyway, so you need it regardless. If you want Investments in Fall 2027, take FINN 30103 this spring.",
  },
]

/* ------------------------------------------------------------------ */
/*  Degree progress data                                               */
/* ------------------------------------------------------------------ */

interface DegreeItem {
  label: string
  detail: string
  value: number
  total: number
  done?: boolean
  color?: string
}

const degreeProgress: DegreeItem[] = [
  {
    label: "Credit Hours",
    detail: "After this semester: 65 \u2192 81 of 120 hours (68%)",
    value: 81,
    total: 120,
    color: "bg-primary",
  },
  {
    label: "Economics Major",
    detail: "After this semester: 13 of 24 required major hours",
    value: 13,
    total: 24,
    color: "bg-primary",
  },
  {
    label: "Business Core",
    detail: "Complete after this semester (SEVI 30103 finishes it)",
    value: 21,
    total: 21,
    done: true,
    color: "bg-emerald-500",
  },
  {
    label: "Finance Minor",
    detail: "0 of 15 hours \u2014 not started. FINN 30103 (required) is not in your plan.",
    value: 0,
    total: 15,
    color: "bg-red-400",
  },
  {
    label: "Jr/Sr Business Electives",
    detail: "0 of 12 hours \u2014 finance minor courses can count toward this",
    value: 0,
    total: 12,
    color: "bg-red-400",
  },
  {
    label: "State Minimum Core",
    detail: "16 of 20 hours \u2014 still need 1 Natural Science lecture + lab (4 hrs)",
    value: 16,
    total: 20,
    color: "bg-amber-500",
  },
  {
    label: "General Electives",
    detail: "0 of 6 hours remaining",
    value: 0,
    total: 6,
    color: "bg-red-400",
  },
]

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

function PrereqIcon({ s }: { s: "met" | "conditional" | "notmet" }) {
  switch (s) {
    case "met":
      return <span className="font-semibold text-emerald-600">{"\u2713"}</span>
    case "conditional":
      return <span className="font-semibold text-amber-500">{"\u26A0"}</span>
    case "notmet":
      return <span className="font-semibold text-red-500">{"\u2717"}</span>
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ScreenResults({
  onBack,
  onSubmit,
}: {
  onBack: () => void
  onSubmit: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-8">
      {/* ========== Overall assessment banner ========== */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/40 px-6 py-4">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            QuickCheck Results
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Spring 2027 plan for Jordan Martinez — 5 courses, 16 credit hours
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 px-6 py-4">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            3 of 5 courses check out
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            <XCircle className="h-4 w-4" />
            1 prerequisite issue
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            <Lightbulb className="h-4 w-4" />
            1 suggestion
          </div>
        </div>
      </div>

      {/* ========== Course-by-course breakdown ========== */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Course-by-Course Breakdown
        </p>
        {courses.map((c) => (
          <div
            key={c.code}
            className={`rounded-xl border border-l-4 ${borderColor(c.status)} ${bgTint(c.status)} p-5 shadow-sm`}
          >
            <div className="flex items-start gap-3">
              <StatusIcon status={c.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="shrink-0 font-mono text-xs"
                  >
                    {c.code}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {c.name}
                  </span>
                  {c.status === "pass" && c.prereqStatus === "conditional" && (
                    <Badge className="border-amber-200 bg-amber-100 px-1.5 py-0 text-[10px] font-semibold text-amber-800">
                      conditional
                    </Badge>
                  )}
                  {c.status === "conditional" && (
                    <Badge className="border-amber-200 bg-amber-100 px-1.5 py-0 text-[10px] font-semibold text-amber-800">
                      workload flag
                    </Badge>
                  )}
                  {c.status === "fail" && (
                    <Badge className="border-red-200 bg-red-100 px-1.5 py-0 text-[10px] font-semibold text-red-700">
                      cannot register
                    </Badge>
                  )}
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
            {degreeProgress.map((d) => {
              const pct = d.total > 0 ? Math.round((d.value / d.total) * 100) : 0
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
                      style={{ width: `${pct}%` }}
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
          You have 39 credit hours remaining after this semester across 3
          semesters (Fall 2027, Spring 2028). That{"'"}s 13 hrs/semester — tight
          but doable. However, you still need 15 hours of Finance minor courses
          and haven{"'"}t started. Resolving the FINN 30103 issue this spring is
          critical to staying on track for both the degree and the minor.
        </p>
      </div>

      {/* ========== Suggestion Box ========== */}
      <div className="rounded-2xl border-2 border-primary/20 bg-primary/[0.04] p-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-bold text-foreground">Suggestion</p>
        </div>
        <p className="text-sm font-semibold text-foreground">
          Replace FINN 30603 with FINN 30103 (Financial Analysis) this semester.
        </p>
        <div className="mt-3 flex flex-col gap-2.5 text-sm text-foreground/80 leading-relaxed">
          <p>
            This is a no-brainer: FINN 30103 is required for your Finance minor,
            it only requires FINN 20403 (which you{"'"}ve completed), and it
            unlocks FINN 30603 (Investments), FINN 36003 (Corporate Finance),
            and FINN 31003 (Financial Modeling) for Fall 2027. You haven{"'"}t
            started your minor yet — 15 hours across 3 remaining semesters means
            you need to begin now.
          </p>
          <p>
            FINN 30103 also counts toward your Jr/Sr business elective
            requirement (0 of 12 hrs), so it pulls double duty.
          </p>
          <p>
            Separately, don{"'"}t forget you still need a Natural Science lecture
            + lab (4 hrs) for State Minimum Core. Fitting a lab into senior year
            is harder — consider taking it over the summer or in Fall 2027.
          </p>
        </div>
      </div>

      {/* ========== Bottom actions ========== */}
      <div className="flex flex-col gap-4 border-t pt-6 pb-8 sm:flex-row sm:items-center sm:justify-between">
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
