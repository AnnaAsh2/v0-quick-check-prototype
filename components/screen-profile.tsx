"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle2, Clock, AlertCircle, BookOpen } from "lucide-react"

const quickStats = [
  { label: "Pre-Business Core", value: "Complete", color: "green" as const },
  { label: "Business Core", value: "5/7", color: "yellow" as const },
  { label: "Economics Major", value: "0/8 complete, 2 IP", color: "red" as const },
  { label: "Finance Minor", value: "Not started", color: "red" as const },
]

const currentCourses = [
  { code: "MKTG 34303", name: "Introduction to Marketing" },
  { code: "ECON 30303", name: "Intermediate Microeconomics" },
  { code: "ECON 34303", name: "Money & Banking" },
  { code: "PHIL 21003", name: "Introduction to Ethics" },
  { code: "HIST 20003", name: "US History to 1877" },
]

function StatBadge({ label, value, color }: { label: string; value: string; color: "green" | "yellow" | "red" }) {
  const styles = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    yellow: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-red-200 bg-red-50 text-red-700",
  }
  const icons = {
    green: <CheckCircle2 className="h-3.5 w-3.5" />,
    yellow: <Clock className="h-3.5 w-3.5" />,
    red: <AlertCircle className="h-3.5 w-3.5" />,
  }
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${styles[color]}`}>
      {icons[color]}
      <span>{label}: {value}</span>
    </div>
  )
}

export function ScreenProfile({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Student summary strip */}
      <div className="flex items-center justify-center gap-3 bg-[oklch(0.22_0.02_255)] px-4 py-2.5 text-sm text-[oklch(0.92_0.01_250)] flex-wrap">
        <span className="font-semibold text-[oklch(0.98_0_0)]">Jordan Martinez</span>
        <span className="text-[oklch(0.65_0.02_250)]">|</span>
        <span>Business Economics</span>
        <span className="text-[oklch(0.65_0.02_250)]">|</span>
        <span>Finance Minor</span>
        <span className="text-[oklch(0.65_0.02_250)]">|</span>
        <span>65 hrs completed</span>
        <span className="text-[oklch(0.65_0.02_250)]">|</span>
        <span>GPA 3.19</span>
        <span className="text-[oklch(0.65_0.02_250)]">|</span>
        <span>Expected Graduation: Spring 2028</span>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-6">
        {/* Worksheet images section */}
        <div className="relative">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Page 1 placeholder */}
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-6 shadow-sm">
              <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">Page 1</p>
              <p className="mt-1 text-center text-xs text-muted-foreground/70">
                Pre-Business Core, Business Core,{"\n"}State Min Core, Gen Electives
              </p>
              <a
                href="/worksheet.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80"
              >
                View uploaded worksheet (PDF)
              </a>
            </div>
            {/* Page 2 placeholder */}
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-6 shadow-sm">
              <BookOpen className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">Page 2</p>
              <p className="mt-1 text-center text-xs text-muted-foreground/70">
                Jr/Sr Business Electives,{"\n"}Economics Major Courses
              </p>
              <a
                href="/worksheet.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80"
              >
                View uploaded worksheet (PDF)
              </a>
            </div>
          </div>
          {/* Parsed badge */}
          <div className="absolute -bottom-3 right-4 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Worksheet parsed — 91 fields extracted
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Stats</p>
          <div className="flex flex-wrap gap-2">
            {quickStats.map((s) => (
              <StatBadge key={s.label} {...s} />
            ))}
          </div>
        </div>

        {/* Currently Enrolled */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Currently Enrolled — Fall 2026
          </p>
          <div className="rounded-lg border bg-card">
            {currentCourses.map((c, i) => (
              <div
                key={c.code}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm ${
                  i < currentCourses.length - 1 ? "border-b" : ""
                }`}
              >
                <Badge variant="secondary" className="font-mono text-xs">
                  {c.code}
                </Badge>
                <span className="text-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col items-start gap-2 pb-4">
          <Button onClick={onNext} size="lg" className="gap-2">
            <Send className="h-4 w-4" />
            Send to Student for Course Planning
          </Button>
          <p className="text-xs text-muted-foreground">
            Student will select their planned courses for Spring 2027 and run QuickCheck.
          </p>
        </div>
      </div>
    </div>
  )
}
