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
  MessageSquareWarning,
  UserRoundSearch,
  Mail,
  ArrowLeft,
  FileText,
  MessageCircleQuestion,
  ExternalLink,
  Send,
} from "lucide-react"
import { validatePlan, STUDENT } from "@/lib/validation"
import type { Course, CourseStatus } from "@/lib/validation"
import { WorksheetVisual } from "@/components/worksheet-visual"

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

type ViewMode = "review" | "approve-email" | "meeting-email" | "meeting-prep" | "question-email"

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ScreenReview({ planned }: { planned: Course[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>("review")
  const [advisorNotes, setAdvisorNotes] = useState("")
  const result = useMemo(() => validatePlan(planned), [planned])
  const { advisorIntel } = result

  const toggle = (code: string) =>
    setExpanded((prev) => (prev === code ? null : code))

  // Seed advisor notes on first render
  const defaultNotes = useMemo(() => {
    const lines: string[] = []
    if (result.failCount > 0) {
      result.courses.filter(c => c.status === "fail").forEach(c => {
        if (c.code === "FINN 30603") {
          lines.push("FINN 30603 needs to be swapped for FINN 30103 -- Jordan needs it for the minor and hasn't started those 15 hours yet.")
        } else {
          lines.push(`${c.code} has unmet prerequisites and cannot be registered. Needs attention.`)
        }
      })
    }
    if (result.courses.find(c => c.code === "FINN 30103" && c.status === "pass")) {
      lines.push("Good that Jordan is taking FINN 30103 -- this starts the Finance minor and unlocks upper-level FINN courses for Fall 2027.")
    }
    if (lines.length === 0) {
      lines.push("Plan looks reasonable overall. No major concerns.")
    }
    return lines.join(" ")
  }, [result])

  /* ---------------------------------------------------------------- */
  /*  Email Generators                                                 */
  /* ---------------------------------------------------------------- */

  const approveEmailBody = useMemo(() => {
    const notes = advisorNotes.trim()
    const lines = [
      `Hi Jordan,`,
      ``,
      `I've reviewed your Spring 2027 course plan and you're good to go. Here's a quick summary of what I see:`,
      ``,
      `Courses: ${planned.map(c => `${c.code} (${c.name})`).join(", ")}`,
      `Total Hours: ${result.totalHrs}`,
      ``,
    ]

    // Incorporate advisor notes as student-facing guidance (not verbatim)
    // Parse notes for common themes and rewrite in a student-friendly tone
    if (notes) {
      const hasSwapNote = notes.toLowerCase().includes("swap") || notes.toLowerCase().includes("replace")
      const hasMinorNote = notes.toLowerCase().includes("minor") || notes.toLowerCase().includes("finn")
      const hasPositiveNote = notes.toLowerCase().includes("good") || notes.toLowerCase().includes("solid") || notes.toLowerCase().includes("reasonable")
      const hasPrereqNote = notes.toLowerCase().includes("prereq") || notes.toLowerCase().includes("cannot") || notes.toLowerCase().includes("unmet")

      if (hasSwapNote || hasPrereqNote) {
        lines.push(`A heads-up: there may be a course adjustment needed before you register. Double-check that all prerequisites are met for each course on your list, and reach out if you need help finding an alternative.`)
        lines.push(``)
      }
      if (hasMinorNote) {
        lines.push(`Regarding your Finance minor -- you're heading in the right direction. Make sure you have a clear plan for which Finance courses you'll take in Fall 2027 and Spring 2028 so you can finish on time.`)
        lines.push(``)
      }
      if (hasPositiveNote && !hasSwapNote && !hasPrereqNote) {
        lines.push(`Overall, this is a solid plan. You're making good progress and your course selections line up well with your degree requirements.`)
        lines.push(``)
      }
      // If notes don't match any pattern, synthesize a general version
      if (!hasSwapNote && !hasMinorNote && !hasPositiveNote && !hasPrereqNote) {
        lines.push(`A couple of things to keep in mind as you finalize registration:`)
        // Split notes into sentences and rephrase as bullet points
        const sentences = notes.split(/[.!]\s*/).filter(s => s.trim().length > 5)
        sentences.slice(0, 3).forEach(s => {
          lines.push(`  - ${s.trim().charAt(0).toUpperCase() + s.trim().slice(1)}${s.trim().endsWith('.') ? '' : '.'}`)
        })
        lines.push(``)
      }
    }

    if (result.suggestion?.severity === "yellow" && !notes) {
      lines.push(`One thing to keep in mind: ${result.suggestion.body[0]}`, ``)
    }
    lines.push(
      `Your updated degree worksheet is attached below showing your completed, in-progress, and newly planned courses.`,
      ``,
      `You're on track for Spring 2028 graduation. Let me know if you have any questions -- happy to help.`,
      ``,
      `Best,`,
      `Academic Advisor`,
      `Walton College of Business`,
    )
    return lines.join("\n")
  }, [planned, result, advisorNotes])

  const meetingEmailBody = useMemo(() => {
    const redFlags = advisorIntel.allIssues.filter(i => i.severity === "red")
    const yellowFlags = advisorIntel.allIssues.filter(i => i.severity === "yellow")

    const lines = [
      `Hi Jordan,`,
      ``,
      `I've been reviewing your Spring 2027 course plan and I'd like to meet with you to discuss a few things before we finalize it.`,
      ``,
    ]
    if (redFlags.length > 0) {
      lines.push(`There ${redFlags.length === 1 ? "is" : "are"} ${redFlags.length} issue${redFlags.length > 1 ? "s" : ""} that ${redFlags.length === 1 ? "needs" : "need"} to be resolved before you can register:`)
      redFlags.forEach(f => lines.push(`  - ${f.message}`))
      lines.push(``)
    }
    if (yellowFlags.length > 0) {
      lines.push(`I also have ${yellowFlags.length > 1 ? "a few" : "a"} question${yellowFlags.length > 1 ? "s" : ""} about your plan that would be helpful to talk through in person.`)
      lines.push(``)
    }
    lines.push(
      `Please schedule a 20-minute appointment using this link:`,
      `https://calendly.com/walton-advising/jordan-martinez`,
      ``,
      `Looking forward to connecting.`,
      ``,
      `Best,`,
      `Academic Advisor`,
      `Walton College of Business`,
    )
    return lines.join("\n")
  }, [advisorIntel])

  const questionEmailBody = useMemo(() => {
    const lines = [
      `Hi Jordan,`,
      ``,
      `I'm reviewing your Spring 2027 course plan and had a couple of quick questions before I can approve it:`,
      ``,
    ]
    advisorIntel.questionsForStudent.forEach((q, i) => {
      lines.push(`${i + 1}. ${q.question}`)
      lines.push(``)
    })
    lines.push(
      `Once I hear back from you, I should be able to finalize everything. Just reply to this email -- no need to schedule a meeting unless you'd prefer to talk in person.`,
      ``,
      `Best,`,
      `Academic Advisor`,
      `Walton College of Business`,
    )
    return lines.join("\n")
  }, [advisorIntel])

  /* ---------------------------------------------------------------- */
  /*  Sub-views                                                        */
  /* ---------------------------------------------------------------- */

  if (view === "approve-email") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
        <button onClick={() => setView("review")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Review
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-foreground">Approval Email Preview</h2>
          </div>
          <p className="text-sm text-muted-foreground">This email will be sent to Jordan confirming the plan is approved.</p>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex flex-col gap-1 border-b bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">To:</span> jordan.martinez@uark.edu
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Subject:</span> Your Spring 2027 Plan Has Been Approved
            </div>
          </div>
          <div className="px-4 py-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{approveEmailBody}</pre>
          </div>
          <div className="border-t px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Attached: Degree Worksheet</p>
            <WorksheetVisual degreeProgress={result.degreeProgress} compact />
          </div>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setView("review")}>
            <Send className="h-4 w-4" /> Send Approval
          </Button>
          <Button variant="outline" onClick={() => setView("review")}>Cancel</Button>
        </div>
      </div>
    )
  }

  if (view === "meeting-email") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
        <button onClick={() => setView("review")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Review
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Meeting Request Email</h2>
          </div>
          <p className="text-sm text-muted-foreground">This email explains the reason for the meeting and includes a scheduling link.</p>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex flex-col gap-1 border-b bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">To:</span> jordan.martinez@uark.edu
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Subject:</span> {"Let's"} Meet to Discuss Your Spring 2027 Plan
            </div>
          </div>
          <div className="px-4 py-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{meetingEmailBody}</pre>
          </div>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2" onClick={() => setView("review")}>
            <Send className="h-4 w-4" /> Send Meeting Request
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setView("meeting-prep")}>
            <FileText className="h-4 w-4" /> Open Meeting Prep
          </Button>
          <Button variant="ghost" onClick={() => setView("review")}>Cancel</Button>
        </div>
      </div>
    )
  }

  if (view === "meeting-prep") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
        <button onClick={() => setView("meeting-email")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Meeting Email
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Meeting Prep</h2>
          </div>
          <p className="text-sm text-muted-foreground">Everything you need for the advising appointment at a glance.</p>
        </div>

        {/* Student Summary */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="bg-muted/30 border-b px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Overview</p>
          </div>
          <div className="px-4 py-3">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-3">
              <span><span className="text-muted-foreground">Name:</span> <span className="font-medium">Jordan Martinez</span></span>
              <span><span className="text-muted-foreground">Year:</span> <span className="font-medium">{STUDENT.classification}</span></span>
              <span><span className="text-muted-foreground">GPA:</span> <span className="font-medium">{STUDENT.gpa}</span></span>
              <span><span className="text-muted-foreground">Major:</span> <span className="font-medium">{STUDENT.major}</span></span>
              <span><span className="text-muted-foreground">Minor:</span> <span className="font-medium">{STUDENT.minor}</span></span>
              <span><span className="text-muted-foreground">Grad Target:</span> <span className="font-medium">{STUDENT.expectedGrad}</span></span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">{advisorIntel.studentSummary}</p>
          </div>
        </div>

        {/* Flags & Watch-outs */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="bg-muted/30 border-b px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Flags & Watch-outs</p>
          </div>
          <div className="px-4 py-3 flex flex-col gap-2">
            {advisorIntel.allIssues.length === 0 && (
              <p className="text-sm text-muted-foreground">No issues flagged -- plan looks clean.</p>
            )}
            {advisorIntel.allIssues.map((issue, i) => (
              <div key={i} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${issue.severity === "red" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-800"}`}>
                {issue.severity === "red" ? <XCircle className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />}
                {issue.message}
              </div>
            ))}
          </div>
        </div>

        {/* Worksheet */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="bg-muted/30 border-b px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Degree Worksheet</p>
          </div>
          <div className="px-4 py-3">
            <WorksheetVisual degreeProgress={result.degreeProgress} compact />
          </div>
        </div>

        {/* Talking Points */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="bg-muted/30 border-b px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Talking Points</p>
          </div>
          <div className="px-4 py-3">
            <ol className="flex flex-col gap-3">
              {advisorIntel.talkingPoints.map((point, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                  <span className="text-foreground/80">{point}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <Button variant="outline" onClick={() => setView("meeting-email")} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Meeting Email
        </Button>
      </div>
    )
  }

  if (view === "question-email") {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8">
        <button onClick={() => setView("review")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Review
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageCircleQuestion className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-bold text-foreground">Question Email Preview</h2>
          </div>
          <p className="text-sm text-muted-foreground">Ask Jordan 1-2 targeted questions before making a decision on the plan.</p>
        </div>
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="flex flex-col gap-1 border-b bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">To:</span> jordan.martinez@uark.edu
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Subject:</span> Quick Question About Your Spring 2027 Plan
            </div>
          </div>
          <div className="px-4 py-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{questionEmailBody}</pre>
          </div>
        </div>
        {/* Show the reasoning behind each question */}
        <div className="rounded-xl border bg-muted/20 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b bg-muted/30">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why these questions</p>
          </div>
          <div className="px-4 py-3 flex flex-col gap-2">
            {advisorIntel.questionsForStudent.map((q, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="shrink-0 font-bold text-foreground">Q{i + 1}:</span>
                <span>{q.reason}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button className="gap-2 bg-amber-600 text-white hover:bg-amber-700" onClick={() => setView("review")}>
            <Send className="h-4 w-4" /> Send Question
          </Button>
          <Button variant="outline" onClick={() => setView("review")}>Cancel</Button>
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Main review view                                                 */
  /* ---------------------------------------------------------------- */
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
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Jordan Martinez
          </h2>
          {advisorIntel.inPersonSuggested && (
            <Badge className="gap-1 bg-red-100 text-red-700 border-red-200 text-xs font-semibold">
              <UserRoundSearch className="h-3 w-3" />
              In-Person Suggested
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Business Economics (Junior) &middot; Finance Minor &middot; Spring
          2027 Plan &middot; {planned.length} courses, {result.totalHrs} credit hours
        </p>
      </div>

      {/* Summary badges */}
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

      {/* Biggest Flags */}
      {advisorIntel.biggestFlags.length > 0 && (
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-amber-100/60 border-b border-amber-200 px-4 py-2.5">
            <MessageSquareWarning className="h-4 w-4 text-amber-700" />
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Biggest Flags to Dig Into
            </p>
          </div>
          <div className="px-4 py-3 flex flex-col gap-4">
            {advisorIntel.biggestFlags.map((flag, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-amber-900">{flag.question}</p>
                <p className="text-sm leading-relaxed text-amber-800/80">{flag.context}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
                    <span className="font-medium text-muted-foreground">Counts toward:</span>{" "}
                    {c.countsToward}
                  </p>
                  <p>
                    <span className="font-medium text-muted-foreground">Prerequisites:</span>{" "}
                    {c.prereqs}
                  </p>
                  <p>
                    <span className="font-medium text-muted-foreground">Note:</span>{" "}
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
          defaultValue={defaultNotes}
          onChange={(e) => setAdvisorNotes(e.target.value)}
          rows={5}
          className="text-sm leading-relaxed shadow-sm"
          placeholder="Add any notes for your records or to include in the student email..."
        />
      </div>

      {/* Actions -- 3 buttons */}
      <div className="border-t pt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Actions
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
          <Button
            size="lg"
            className="gap-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
            onClick={() => setView("approve-email")}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve Plan & Notify Student
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 shadow-sm"
            onClick={() => setView("meeting-email")}
          >
            <CalendarDays className="h-4 w-4" />
            Request Meeting
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 shadow-sm border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
            onClick={() => setView("question-email")}
          >
            <MessageCircleQuestion className="h-4 w-4" />
            Ask a Question
          </Button>
        </div>
      </div>

      <p className="pb-8 text-xs text-muted-foreground leading-relaxed">
        Student will receive your feedback via email. Approving sends the plan with the attached worksheet.
        Requesting a meeting sends a scheduling link. Asking a question emails 1-2 follow-up items. All
        records are saved to the student{"'"}s advising file.
      </p>
    </div>
  )
}
