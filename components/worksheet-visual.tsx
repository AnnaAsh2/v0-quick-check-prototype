"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, CalendarPlus, Circle } from "lucide-react"
import type { DegreeItem, DegreeCourseEntry } from "@/lib/validation"

function StatusBadge({ status }: { status: DegreeCourseEntry["status"] }) {
  switch (status) {
    case "completed":
      return (
        <Badge className="gap-1 bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] font-medium">
          <CheckCircle2 className="h-2.5 w-2.5" />
          Done
        </Badge>
      )
    case "in-progress":
      return (
        <Badge className="gap-1 bg-blue-100 text-blue-700 border-blue-200 text-[10px] font-medium">
          <Clock className="h-2.5 w-2.5" />
          In Progress
        </Badge>
      )
    case "planned":
      return (
        <Badge className="gap-1 bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-medium">
          <CalendarPlus className="h-2.5 w-2.5" />
          Planned
        </Badge>
      )
    case "remaining":
      return (
        <Badge variant="outline" className="gap-1 text-[10px] font-medium text-muted-foreground">
          <Circle className="h-2.5 w-2.5" />
          Needed
        </Badge>
      )
  }
}

function CourseRow({ course }: { course: DegreeCourseEntry }) {
  const rowBg =
    course.status === "planned"
      ? "bg-amber-50/60"
      : course.status === "in-progress"
        ? "bg-blue-50/40"
        : ""

  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 text-xs ${rowBg}`}>
      <span className="w-24 shrink-0 font-mono text-muted-foreground">{course.code}</span>
      <span className="flex-1 text-foreground">{course.name}</span>
      <span className="w-6 shrink-0 text-center text-muted-foreground">{course.hrs}</span>
      {course.grade && (
        <span className="w-6 shrink-0 text-center font-medium text-foreground">{course.grade}</span>
      )}
      {!course.grade && <span className="w-6 shrink-0" />}
      <StatusBadge status={course.status} />
    </div>
  )
}

function SectionBlock({ item }: { item: DegreeItem }) {
  if (!item.courses || item.courses.length === 0) return null

  const pct = Math.min(100, Math.round((item.value / item.total) * 100))
  const hasPlanned = item.courses.some((c) => c.status === "planned")

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{item.label}</span>
          {hasPlanned && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              + new
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          {item.value}/{item.total} hrs ({pct}%)
        </span>
      </div>
      {/* Column headers */}
      <div className="flex items-center gap-3 px-3 py-1 border-b bg-muted/20 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        <span className="w-24 shrink-0">Code</span>
        <span className="flex-1">Course</span>
        <span className="w-6 shrink-0 text-center">Hrs</span>
        <span className="w-6 shrink-0 text-center">Grd</span>
        <span className="w-16 shrink-0 text-center">Status</span>
      </div>
      <div className="divide-y divide-border/50">
        {item.courses.map((c) => (
          <CourseRow key={c.code} course={c} />
        ))}
      </div>
    </div>
  )
}

export function WorksheetVisual({
  degreeProgress,
  compact = false,
}: {
  degreeProgress: DegreeItem[]
  compact?: boolean
}) {
  // Skip the first item (Total Credit Hours bar) and show degree sections
  const sections = degreeProgress.filter((d) => d.courses && d.courses.length > 0)

  return (
    <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Degree Worksheet
          </p>
          <p className="text-[10px] text-muted-foreground">
            BSBA Business Economics / Finance Minor -- Spring 2027 Plan
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Planned
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Needed
          </span>
        </div>
      </div>

      {sections.map((item) => (
        <SectionBlock key={item.label} item={item} />
      ))}
    </div>
  )
}
