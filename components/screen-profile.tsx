"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  GraduationCap,
  User,
  Hash,
  BookOpen,
  Calendar,
  TrendingUp,
} from "lucide-react"

const quickStats = [
  { label: "Pre-Business Core", value: "Complete", color: "green" as const, icon: CheckCircle2 },
  { label: "Business Core", value: "5 of 7", color: "yellow" as const, icon: Clock },
  { label: "Economics Major", value: "0/8 complete, 2 IP", color: "red" as const, icon: AlertCircle },
  { label: "Finance Minor", value: "Not started", color: "red" as const, icon: AlertCircle },
]

const currentCourses = [
  { code: "MKTG 34303", name: "Introduction to Marketing" },
  { code: "ECON 30303", name: "Intermediate Microeconomics" },
  { code: "ECON 34303", name: "Money & Banking" },
  { code: "PHIL 21003", name: "Introduction to Ethics" },
  { code: "HIST 20003", name: "US History to 1877" },
]

function StatBadge({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string
  value: string
  color: "green" | "yellow" | "red"
  icon: typeof CheckCircle2
}) {
  const styles = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    yellow: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-800",
  }
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium ${styles[color]}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>
        {label}:{" "}
        <span className="font-semibold">{value}</span>
      </span>
    </div>
  )
}

export function ScreenProfile({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Student summary strip */}
      <div className="border-b bg-[oklch(0.20_0.025_255)] px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-[oklch(0.65_0.03_250)]" />
            <span className="font-semibold text-white">Jordan Martinez</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-[oklch(0.65_0.03_250)]" />
            <span className="text-[oklch(0.85_0.01_250)]">Business Economics</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-[oklch(0.65_0.03_250)]" />
            <span className="text-[oklch(0.85_0.01_250)]">Finance Minor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5 text-[oklch(0.65_0.03_250)]" />
            <span className="text-[oklch(0.85_0.01_250)]">65 hrs completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-[oklch(0.65_0.03_250)]" />
            <span className="text-[oklch(0.85_0.01_250)]">GPA 3.19</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[oklch(0.65_0.03_250)]" />
            <span className="text-[oklch(0.85_0.01_250)]">Spring 2028</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
        {/* Worksheet images section */}
        <div className="relative">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Uploaded Advising Worksheet
          </p>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Page 1 */}
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b bg-muted/50 px-4 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Page 1 — Pre-Business Core, Business Core, State Min Core, Gen Electives
                </p>
              </div>
              <div className="p-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-gJBYFEhGVc116l6L9fOAD5lF5bXDth.png"
                  alt="Page 1 of Jordan Martinez's BSBA advising worksheet showing Pre-Business Core, Business Core, State Minimum Core, and General Electives"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
            {/* Page 2 */}
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b bg-muted/50 px-4 py-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Page 2 — Jr/Sr Business Electives, Economics Major Courses
                </p>
              </div>
              <div className="p-2">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-q8pK4bgkJB2fjk3uIhmti1KlErGUKw.png"
                  alt="Page 2 of Jordan Martinez's BSBA advising worksheet showing Junior/Senior Business Electives and Economics Major courses"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>
          {/* Parsed badge */}
          <div className="absolute -bottom-3 right-4 z-10 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-md">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Worksheet parsed — 91 fields extracted
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Stats
          </p>
          <div className="flex flex-wrap gap-2.5">
            {quickStats.map((s) => (
              <StatBadge key={s.label} {...s} />
            ))}
          </div>
        </div>

        {/* Currently Enrolled */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Currently Enrolled — Fall 2026
          </p>
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            {currentCourses.map((c, i) => (
              <div
                key={c.code}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i < currentCourses.length - 1 ? "border-b" : ""
                }`}
              >
                <Badge
                  variant="secondary"
                  className="shrink-0 font-mono text-xs"
                >
                  {c.code}
                </Badge>
                <span className="text-sm text-foreground">{c.name}</span>
                <Badge className="ml-auto shrink-0 border-amber-200 bg-amber-50 text-[10px] font-medium text-amber-700">
                  IP
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col items-start gap-3 pb-6">
          <Button onClick={onNext} size="lg" className="gap-2 shadow-sm">
            <Send className="h-4 w-4" />
            Send to Student for Course Planning
          </Button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Student will select their planned courses for Spring 2027 and run
            QuickCheck.
          </p>
        </div>
      </div>
    </div>
  )
}
