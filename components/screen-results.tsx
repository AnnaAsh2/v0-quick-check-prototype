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
    countsToward: "Economics Major — Required (Business Economics concentration)",
    prereqs:
      "Met — MATH 22003 (C+), ECON 21003 (A), ECON 22003 (A\u2212)",
    prereqStatus: "met",
    note: "Required for your concentration. On track.",
  },
  {
    code: "ECON 47403",
    name: "Introduction to Econometrics",
    status: "pass",
    countsToward: "Economics Major — Required (4 credit hours)",
    prereqs: "Met — MATH 22003 (C+), BUSI 10303 (B)",
    prereqStatus: "met",
    note: "This is a 4-credit course — your semester total is 16 hours, not 15. Plan accordingly.",
  },
  {
    code: "SEVI 30103",
    name: "Strategic Management",
    status: "pass",
    countsToward: "Business Core — Required (capstone)",
    prereqs:
      'Conditional — Requires a "C" or better in ALL other business core courses. You are currently enrolled in MKTG 34303, which must be completed with a C or better this fall.',
    prereqStatus: "conditional",
    note: "As long as you pass MKTG 34303, you\u2019re clear. This is the right time to take it — it\u2019s your last business core requirement.",
  },
  {
    code: "ECON 43303",
    name: "Economics of Organizations",
    status: "conditional",
    countsToward: "Economics Major — Required",
    prereqs:
      'Conditional — Requires ECON 30303 (Intermediate Microeconomics), which you are taking this fall. Must complete with a "C" or better.',
    prereqStatus: "conditional",
    note: "Workload flag — you\u2019re planning 3 required economics courses plus a 4-credit econometrics course in one semester (16 hrs, heavy quantitative load). The 8-semester plan recommends deferring ECON 43303 to Fall 2027. Consider this carefully.",
  },
  {
    code: "FINN 30603",
    name: "Investments",
    status: "fail",
    countsToward: "Finance Minor requirement + Junior/Senior Business Elective",
    prereqs:
      "Not met. FINN 30603 requires FINN 20403 (you have it) AND FINN 30103 Financial Analysis as a prerequisite or corequisite. You have not taken FINN 30103 and it is not in your plan.",
    prereqStatus: "notmet",
    note: "You cannot register for this course.",
    impact:
      "This also blocks your Finance minor — FINN 30103 is required for the minor anyway, so you need it regardless. If you want Investments in Fall 2027, take FINN 30103 this spring.",
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
}

const degreeProgress: DegreeItem[] = [
  { label: "Credit Hours", detail: "After this semester: 65 → 81 of 120 hours (68%)", value: 81, total: 120 },
  { label: "Economics Major", detail: "After this semester: 13 of 24 required major hours", value: 13, total: 24 },
  { label: "Business Core", detail: "Complete after this semester (SEVI 30103 finishes it)", value: 21, total: 21, done: true },
  { label: "Finance Minor", detail: "0 of 15 hours — not started. FINN 30103 (required) is not in your plan.", value: 0, total: 15 },
  { label: "Jr/Sr Business Electives", detail: "0 of 12 hours — finance minor courses can count toward this", value: 0, total: 12 },
  { label: "State Minimum Core", detail: "16 of 20 hours — still need 1 Natural Science lecture + lab (4 hrs)", value: 16, total: 20 },
  { label: "General Electives", detail: "0 of 6 hours remaining", value: 0, total: 6 },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function borderColor(status: CourseStatus) {
  switch (status) {
    case "pass":
      return "border-l-emerald-500"
    case "conditional":
      return "border-l-amber-500"
    case "fail":
      return "border-l-red-500"
  }
}

function bgTint(status: CourseStatus) {
  if (status === "fail") return "bg-red-50/60"
  return "bg-card"
}

function StatusIcon({ status }: { status: CourseStatus }) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" />
    case "conditional":
      return <AlertTriangle className="h-5 w-5 text-amber-600" />
    case "fail":
      return <XCircle className="h-5 w-5 text-red-600" />
  }
}

function PrereqIcon({ s }: { s: "met" | "conditional" | "notmet" }) {
  switch (s) {
    case "met":
      return <span className="text-emerald-600 font-medium">{"✓"}</span>
    case "conditional":
      return <span className="text-amber-600 font-medium">{"⚠"}</span>
    case "notmet":
      return <span className="text-red-600 font-medium">{"✗"}</span>
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
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
      {/* ========== Overall assessment banner ========== */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="text-lg font-bold tracking-tight text-foreground">
          QuickCheck Results
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            <span className="font-medium">3 of 5 courses check out</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-red-700">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">1 prerequisite issue found</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-primary">
            <Lightbulb className="h-4 w-4" />
            <span className="font-medium">1 suggestion</span>
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
            className={`rounded-lg border border-l-4 ${borderColor(c.status)} ${bgTint(c.status)} p-4 shadow-sm`}
          >
            {/* Header row */}
            <div className="flex items-start gap-3">
              <StatusIcon status={c.status} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {c.code}
                  </Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {c.name}
                  </span>
                  {c.status === "conditional" && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1.5 py-0">
                      conditional
                    </Badge>
                  )}
                </div>
                {/* Details */}
                <div className="mt-2 flex flex-col gap-1.5 text-sm text-foreground/80 leading-relaxed">
                  <p>
                    <span className="font-medium text-muted-foreground">Counts toward:</span>{" "}
                    {c.countsToward}
                  </p>
                  <p>
                    <span className="font-medium text-muted-foreground">Prerequisites:</span>{" "}
                    <PrereqIcon s={c.prereqStatus} /> {c.prereqs}
                  </p>
                  <p>
                    <span className="font-medium text-muted-foreground">Note:</span>{" "}
                    {c.note}
                  </p>
                  {c.impact && (
                    <p>
                      <span className="font-medium text-red-700">Impact:</span>{" "}
                      {c.impact}
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
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4">
            {degreeProgress.map((d) => (
              <div key={d.label}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{d.label}</span>
                  {d.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {d.value}/{d.total}
                    </span>
                  )}
                </div>
                <Progress
                  value={(d.value / d.total) * 100}
                  className="h-2"
                />
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{d.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========== Graduation Timeline ========== */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <p className="mb-1 text-sm font-semibold text-foreground">Graduation Timeline</p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          You have 39 credit hours remaining after this semester across 3 semesters
          (Fall 2027, Spring 2028). That{"'"}s 13 hrs/semester — tight but doable.
          However, you still need 15 hours of Finance minor courses and haven{"'"}t
          started. Resolving the FINN 30103 issue this spring is critical to staying on
          track for both the degree and the minor.
        </p>
      </div>

      {/* ========== Suggestion Box ========== */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="mb-2 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <p className="text-sm font-bold text-foreground">Suggestion</p>
        </div>
        <p className="text-sm font-semibold text-foreground">
          Replace FINN 30603 with FINN 30103 (Financial Analysis) this semester.
        </p>
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
          This is a no-brainer: FINN 30103 is required for your Finance minor, it only
          requires FINN 20403 (which you{"'"}ve completed), and it unlocks FINN 30603
          (Investments), FINN 36003 (Corporate Finance), and FINN 31003 (Financial
          Modeling) for Fall 2027. You haven{"'"}t started your minor yet — 15 hours across
          3 remaining semesters means you need to begin now.
        </p>
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
          FINN 30103 also counts toward your Jr/Sr business elective requirement (0 of
          12 hrs), so it pulls double duty.
        </p>
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
          Separately, don{"'"}t forget you still need a Natural Science lecture + lab (4
          hrs) for State Minimum Core. Fitting a lab into senior year is harder —
          consider taking it over the summer or in Fall 2027.
        </p>
      </div>

      {/* ========== Bottom actions ========== */}
      <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:gap-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Swap a Course & Re-Run
        </Button>
        <Button onClick={onSubmit} className="gap-2">
          <Send className="h-4 w-4" />
          Submit to Advisor for Review
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <p className="pb-4 text-xs text-muted-foreground">
        You can run as many scenarios as you want before submitting.
      </p>
    </div>
  )
}
