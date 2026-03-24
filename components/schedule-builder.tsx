"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  X, Plus, Sparkles, AlertTriangle, Star, Clock, Calendar,
  Sun, Moon, CheckCircle, Loader2
} from "lucide-react"
import type { Course } from "@/lib/validation"

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface Section {
  id: string
  courseCode: string
  courseName: string
  section: string
  days: string
  startTime: string
  endTime: string
  instructor: string
  cap: number
  room: string
  hrs: number
}

interface TimeBlock {
  id: string
  days: string[]
  startTime: string
  endTime: string
  label: string
}

interface Preference {
  id: string
  label: string
  icon: React.ReactNode
  enabled: boolean
}

/* ------------------------------------------------------------------ */
/*  Section Data                                                        */
/* ------------------------------------------------------------------ */

const allSections: Section[] = [
  // SEVI 30103 Strategic Management — 20 sections
  { id: "sevi-001", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-001", days: "MWF", startTime: "9:40 AM", endTime: "10:30 AM", instructor: "Baldwin", cap: 48, room: "JBHT 148", hrs: 3 },
  { id: "sevi-002", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-002", days: "MWF", startTime: "10:45 AM", endTime: "11:35 AM", instructor: "Panda", cap: 48, room: "JBHT 148", hrs: 3 },
  { id: "sevi-003", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-003", days: "MW", startTime: "4:35 PM", endTime: "5:50 PM", instructor: "McCullough", cap: 44, room: "WJWH 103", hrs: 3 },
  { id: "sevi-004", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-004", days: "MWF", startTime: "12:55 PM", endTime: "1:45 PM", instructor: "Davis", cap: 50, room: "JBHT 147", hrs: 3 },
  { id: "sevi-005", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-005", days: "MWF", startTime: "2:00 PM", endTime: "2:50 PM", instructor: "Davis", cap: 48, room: "JBHT 147", hrs: 3 },
  { id: "sevi-006", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-006", days: "MWF", startTime: "3:05 PM", endTime: "3:55 PM", instructor: "Davis", cap: 50, room: "JBHT 147", hrs: 3 },
  { id: "sevi-007", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-007", days: "T/Th", startTime: "8:00 AM", endTime: "9:15 AM", instructor: "Welsh", cap: 49, room: "JBHT 148", hrs: 3 },
  { id: "sevi-008", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-008", days: "T/Th", startTime: "9:30 AM", endTime: "10:45 AM", instructor: "Smith", cap: 46, room: "JBHT 149", hrs: 3 },
  { id: "sevi-009", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-009", days: "T/Th", startTime: "11:00 AM", endTime: "12:15 PM", instructor: "Welsh", cap: 48, room: "JBHT 146", hrs: 3 },
  { id: "sevi-010", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-010", days: "T/Th", startTime: "12:30 PM", endTime: "1:45 PM", instructor: "Cummings", cap: 48, room: "JBHT 148", hrs: 3 },
  { id: "sevi-011", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-011", days: "T/Th", startTime: "2:00 PM", endTime: "3:15 PM", instructor: "Welsh", cap: 48, room: "JBHT 147", hrs: 3 },
  { id: "sevi-012", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-012", days: "T/Th", startTime: "3:30 PM", endTime: "4:45 PM", instructor: "Core", cap: 40, room: "WCOB 431", hrs: 3 },
  { id: "sevi-013", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-013", days: "T/Th", startTime: "5:00 PM", endTime: "6:15 PM", instructor: "Core", cap: 48, room: "JBHT 148", hrs: 3 },
  { id: "sevi-014", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-014", days: "MW", startTime: "5:00 PM", endTime: "6:15 PM", instructor: "Paul", cap: 48, room: "JBHT 146", hrs: 3 },
  { id: "sevi-015", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-015", days: "MW", startTime: "6:30 PM", endTime: "7:45 PM", instructor: "Paul", cap: 42, room: "WCOB 431", hrs: 3 },
  { id: "sevi-016", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-016", days: "T/Th", startTime: "8:00 AM", endTime: "9:15 AM", instructor: "Cummings", cap: 48, room: "JBHT 146", hrs: 3 },
  { id: "sevi-017", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-017", days: "T/Th", startTime: "9:30 AM", endTime: "10:45 AM", instructor: "Cooper", cap: 50, room: "JBHT 147", hrs: 3 },
  { id: "sevi-018", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-018", days: "T/Th", startTime: "11:00 AM", endTime: "12:15 PM", instructor: "Cooper", cap: 42, room: "JBHT 239", hrs: 3 },
  { id: "sevi-019", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-019", days: "T/Th", startTime: "12:30 PM", endTime: "1:45 PM", instructor: "Andrus", cap: 50, room: "JBHT 147", hrs: 3 },
  { id: "sevi-020", courseCode: "SEVI 30103", courseName: "Strategic Management", section: "-020", days: "T/Th", startTime: "2:00 PM", endTime: "3:15 PM", instructor: "Andrus", cap: 48, room: "JBHT 148", hrs: 3 },

  // ECON 31303 Intermediate Macroeconomics — 1 section
  { id: "econ313-001", courseCode: "ECON 31303", courseName: "Intermediate Macroeconomics", section: "-001", days: "T/Th", startTime: "9:30 AM", endTime: "10:45 AM", instructor: "Leite", cap: 55, room: "SCEN 501", hrs: 3 },

  // ECON 47403 Introduction to Econometrics — 2 sections
  { id: "econ474-001", courseCode: "ECON 47403", courseName: "Introduction to Econometrics", section: "-001", days: "T/Th", startTime: "11:00 AM", endTime: "12:15 PM", instructor: "Hossain", cap: 20, room: "WCOB 433", hrs: 4 },
  { id: "econ474-002", courseCode: "ECON 47403", courseName: "Introduction to Econometrics", section: "-002", days: "Tue", startTime: "6:00 PM", endTime: "8:45 PM", instructor: "Xu", cap: 20, room: "WCOB 437", hrs: 4 },

  // FINN 30103 Financial Analysis — 3 sections
  { id: "finn301-001", courseCode: "FINN 30103", courseName: "Financial Analysis", section: "-001", days: "T/Th", startTime: "11:00 AM", endTime: "12:15 PM", instructor: "Acrey", cap: 270, room: "RCED 120", hrs: 3 },
  { id: "finn301-002", courseCode: "FINN 30103", courseName: "Financial Analysis", section: "-002", days: "T/Th", startTime: "8:00 AM", endTime: "9:15 AM", instructor: "Dubowsky", cap: 65, room: "WCOB 116", hrs: 3 },
  { id: "finn301-003", courseCode: "FINN 30103", courseName: "Financial Analysis", section: "-003", days: "T/Th", startTime: "12:30 PM", endTime: "1:45 PM", instructor: "Dubowsky", cap: 65, room: "WJWH 403", hrs: 3 },

  // ASTR 10003 Intro to Astronomy — 2 sections
  { id: "astr100-001", courseCode: "ASTR 10003", courseName: "Survey of Astronomy", section: "-001", days: "MWF", startTime: "10:45 AM", endTime: "11:35 AM", instructor: "TBA", cap: 120, room: "PHYS 133", hrs: 3 },
  { id: "astr100-002", courseCode: "ASTR 10003", courseName: "Survey of Astronomy", section: "-002", days: "MWF", startTime: "12:55 PM", endTime: "1:45 PM", instructor: "TBA", cap: 120, room: "PHYS 133", hrs: 3 },

  // ASTR 10001 Astronomy Lab — 3 sections
  { id: "astr101-001", courseCode: "ASTR 10001", courseName: "Astronomy Lab", section: "-001", days: "Tue", startTime: "2:00 PM", endTime: "3:50 PM", instructor: "TBA", cap: 24, room: "PHYS 226", hrs: 1 },
  { id: "astr101-002", courseCode: "ASTR 10001", courseName: "Astronomy Lab", section: "-002", days: "Wed", startTime: "2:00 PM", endTime: "3:50 PM", instructor: "TBA", cap: 24, room: "PHYS 226", hrs: 1 },
  { id: "astr101-003", courseCode: "ASTR 10001", courseName: "Astronomy Lab", section: "-003", days: "Thu", startTime: "2:00 PM", endTime: "3:50 PM", instructor: "TBA", cap: 24, room: "PHYS 226", hrs: 1 },

  // ENSC 10003 Intro to Environmental Science — 2 sections
  { id: "ensc100-001", courseCode: "ENSC 10003", courseName: "Intro to Environmental Science", section: "-001", days: "T/Th", startTime: "9:30 AM", endTime: "10:45 AM", instructor: "TBA", cap: 150, room: "SCEN 101", hrs: 3 },
  { id: "ensc100-002", courseCode: "ENSC 10003", courseName: "Intro to Environmental Science", section: "-002", days: "T/Th", startTime: "11:00 AM", endTime: "12:15 PM", instructor: "TBA", cap: 150, room: "SCEN 101", hrs: 3 },

  // ENSC 10001 Environmental Science Lab — 3 sections
  { id: "ensc101-001", courseCode: "ENSC 10001", courseName: "Environmental Science Lab", section: "-001", days: "Mon", startTime: "2:00 PM", endTime: "3:50 PM", instructor: "TBA", cap: 24, room: "SCEN 205", hrs: 1 },
  { id: "ensc101-002", courseCode: "ENSC 10001", courseName: "Environmental Science Lab", section: "-002", days: "Wed", startTime: "2:00 PM", endTime: "3:50 PM", instructor: "TBA", cap: 24, room: "SCEN 205", hrs: 1 },
  { id: "ensc101-003", courseCode: "ENSC 10001", courseName: "Environmental Science Lab", section: "-003", days: "Fri", startTime: "11:50 AM", endTime: "1:40 PM", instructor: "TBA", cap: 24, room: "SCEN 205", hrs: 1 },

  // PHYS 10103 Intro to Physics — 2 sections
  { id: "phys101-001", courseCode: "PHYS 10103", courseName: "Physics in the Modern World", section: "-001", days: "MWF", startTime: "9:40 AM", endTime: "10:30 AM", instructor: "TBA", cap: 100, room: "PHYS 133", hrs: 3 },
  { id: "phys101-002", courseCode: "PHYS 10103", courseName: "Physics in the Modern World", section: "-002", days: "MWF", startTime: "11:50 AM", endTime: "12:40 PM", instructor: "TBA", cap: 100, room: "PHYS 133", hrs: 3 },

  // PHYS 10101 Physics Lab — 3 sections
  { id: "phys102-001", courseCode: "PHYS 10101", courseName: "Physics Lab", section: "-001", days: "Tue", startTime: "3:30 PM", endTime: "5:20 PM", instructor: "TBA", cap: 24, room: "PHYS 117", hrs: 1 },
  { id: "phys102-002", courseCode: "PHYS 10101", courseName: "Physics Lab", section: "-002", days: "Thu", startTime: "3:30 PM", endTime: "5:20 PM", instructor: "TBA", cap: 24, room: "PHYS 117", hrs: 1 },
  { id: "phys102-003", courseCode: "PHYS 10101", courseName: "Physics Lab", section: "-003", days: "Wed", startTime: "3:30 PM", endTime: "5:20 PM", instructor: "TBA", cap: 24, room: "PHYS 117", hrs: 1 },
]

/* ------------------------------------------------------------------ */
/*  Helper Functions                                                    */
/* ------------------------------------------------------------------ */

function parseTime(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return 0
  let hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const period = match[3].toUpperCase()
  if (period === "PM" && hours !== 12) hours += 12
  if (period === "AM" && hours === 12) hours = 0
  return hours * 60 + minutes
}

function getDaysArray(daysStr: string): string[] {
  if (daysStr === "MWF") return ["Mon", "Wed", "Fri"]
  if (daysStr === "MW") return ["Mon", "Wed"]
  if (daysStr === "T/Th") return ["Tue", "Thu"]
  if (daysStr === "Tue") return ["Tue"]
  if (daysStr === "Wed") return ["Wed"]
  if (daysStr === "Thu") return ["Thu"]
  if (daysStr === "Mon") return ["Mon"]
  if (daysStr === "Fri") return ["Fri"]
  return []
}

function timeOverlaps(start1: number, end1: number, start2: number, end2: number): boolean {
  return start1 < end2 && end1 > start2
}

function sectionsConflict(s1: Section, s2: Section): boolean {
  const days1 = getDaysArray(s1.days)
  const days2 = getDaysArray(s2.days)
  const sharedDays = days1.filter(d => days2.includes(d))
  if (sharedDays.length === 0) return false
  const start1 = parseTime(s1.startTime)
  const end1 = parseTime(s1.endTime)
  const start2 = parseTime(s2.startTime)
  const end2 = parseTime(s2.endTime)
  return timeOverlaps(start1, end1, start2, end2)
}

function sectionConflictsWithBlock(section: Section, block: TimeBlock): boolean {
  const sectionDays = getDaysArray(section.days)
  const blockDays = block.days
  const sharedDays = sectionDays.filter(d => blockDays.includes(d))
  if (sharedDays.length === 0) return false
  const sectionStart = parseTime(section.startTime)
  const sectionEnd = parseTime(section.endTime)
  const blockStart = parseTime(block.startTime)
  const blockEnd = parseTime(block.endTime)
  return timeOverlaps(sectionStart, sectionEnd, blockStart, blockEnd)
}

function isMorningSection(section: Section): boolean {
  return parseTime(section.endTime) <= parseTime("12:00 PM")
}

function isAfternoonSection(section: Section): boolean {
  return parseTime(section.startTime) >= parseTime("12:00 PM")
}

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface Props {
  planned: Course[]
  onRemove: (code: string) => void
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function ScheduleBuilder({ planned, onRemove }: Props) {
  // Constraints
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([
    { id: "work", days: ["Thu"], startTime: "1:00 PM", endTime: "5:00 PM", label: "Work" }
  ])

  // Preferences
  const [preferences, setPreferences] = useState<Preference[]>([
    { id: "morning", label: "Prefer morning classes", icon: <Sun className="h-3.5 w-3.5" />, enabled: true },
    { id: "afternoon", label: "Prefer afternoon/evening", icon: <Moon className="h-3.5 w-3.5" />, enabled: false },
    { id: "tth", label: "Prefer T/Th schedule", icon: <Calendar className="h-3.5 w-3.5" />, enabled: false },
    { id: "mwf", label: "Prefer MWF schedule", icon: <Calendar className="h-3.5 w-3.5" />, enabled: false },
    { id: "nogaps", label: "Avoid gaps over 2 hours", icon: <Clock className="h-3.5 w-3.5" />, enabled: false },
    { id: "no9am", label: "No classes before 9 AM", icon: <Clock className="h-3.5 w-3.5" />, enabled: false },
  ])

  // Selected sections (one per course)
  const [selectedSections, setSelectedSections] = useState<Record<string, Section>>({})

  // Optimization state
  const [optimizing, setOptimizing] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  // Get planned course codes (including science options)
  const plannedCodes = useMemo(() => {
    const codes = new Set(planned.map(c => c.code))
    // Add science options if any science course is selected
    const hasScience = planned.some(c => 
      c.code.startsWith("ASTR") || c.code.startsWith("ENSC") || c.code.startsWith("PHYS")
    )
    if (hasScience || planned.length > 0) {
      // Show science options by default for Jordan's profile
      codes.add("ASTR 10003")
      codes.add("ASTR 10001")
      codes.add("ENSC 10003")
      codes.add("ENSC 10001")
      codes.add("PHYS 10103")
      codes.add("PHYS 10101")
    }
    return codes
  }, [planned])

  // Filter sections to only show for planned courses
  const availableSections = useMemo(() => {
    return allSections.filter(s => plannedCodes.has(s.courseCode))
  }, [plannedCodes])

  // Group sections by course
  const sectionsByCourse = useMemo(() => {
    const grouped: Record<string, Section[]> = {}
    availableSections.forEach(s => {
      if (!grouped[s.courseCode]) grouped[s.courseCode] = []
      grouped[s.courseCode].push(s)
    })
    return grouped
  }, [availableSections])

  // Check conflicts
  const getConflicts = useMemo(() => {
    const conflicts: { sectionId: string, reason: string, type: "constraint" | "section" }[] = []
    
    Object.values(selectedSections).forEach(section => {
      // Check constraint conflicts
      timeBlocks.forEach(block => {
        if (sectionConflictsWithBlock(section, block)) {
          conflicts.push({
            sectionId: section.id,
            reason: `Overlaps ${block.label} (${block.days.join("/")} ${block.startTime}–${block.endTime})`,
            type: "constraint"
          })
        }
      })
      
      // Check section conflicts
      Object.values(selectedSections).forEach(other => {
        if (section.id !== other.id && sectionsConflict(section, other)) {
          conflicts.push({
            sectionId: section.id,
            reason: `Overlaps ${other.courseCode}${other.section}`,
            type: "section"
          })
        }
      })
    })
    
    return conflicts
  }, [selectedSections, timeBlocks])

  // Toggle preference
  const togglePreference = (id: string) => {
    setPreferences(prev => prev.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ))
  }

  // Select a section
  const selectSection = (section: Section) => {
    setSelectedSections(prev => ({
      ...prev,
      [section.courseCode]: section
    }))
  }

  // Check if section has conflicts with constraints or other selected sections
  const getSectionStatus = (section: Section) => {
    // Check constraint conflicts
    for (const block of timeBlocks) {
      if (sectionConflictsWithBlock(section, block)) {
        return { status: "blocked" as const, reason: `Conflicts with ${block.label}` }
      }
    }
    
    // Check conflicts with other selected sections
    for (const [code, selected] of Object.entries(selectedSections)) {
      if (code !== section.courseCode && sectionsConflict(section, selected)) {
        return { status: "conflict" as const, reason: `Conflicts with ${selected.courseCode}${selected.section}` }
      }
    }
    
    // Check preferences
    const morningPref = preferences.find(p => p.id === "morning")?.enabled
    const afternoonPref = preferences.find(p => p.id === "afternoon")?.enabled
    
    if (morningPref && !isMorningSection(section)) {
      return { status: "notpreferred" as const, reason: "Outside morning preference" }
    }
    if (afternoonPref && !isAfternoonSection(section)) {
      return { status: "notpreferred" as const, reason: "Outside afternoon preference" }
    }
    
    return { status: "ok" as const, reason: "" }
  }

  // Optimize schedule
  const optimizeSchedule = () => {
    setOptimizing(true)
    setTimeout(() => {
      // Hardcoded optimal schedule for Jordan
      setSelectedSections({
        "FINN 30103": allSections.find(s => s.id === "finn301-002")!,
        "ECON 31303": allSections.find(s => s.id === "econ313-001")!,
        "ECON 47403": allSections.find(s => s.id === "econ474-001")!,
        "SEVI 30103": allSections.find(s => s.id === "sevi-001")!,
        "ASTR 10003": allSections.find(s => s.id === "astr100-001")!,
        "ASTR 10001": allSections.find(s => s.id === "astr101-001")!,
      })
      setOptimizing(false)
      setShowExplanation(true)
    }, 1500)
  }

  // Calculate total hours and conflicts
  const totalHrs = Object.values(selectedSections).reduce((sum, s) => sum + s.hrs, 0)
  const conflictCount = getConflicts.length

  // Calendar grid data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
  const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 8 AM to 9 PM

  // Get color for course block
  const getCourseColor = (courseCode: string) => {
    const section = selectedSections[courseCode]
    if (!section) return "bg-blue-100 border-blue-300 text-blue-800"
    
    const sectionCount = sectionsByCourse[courseCode]?.length || 0
    
    if (sectionCount <= 2 || section.cap < 40) {
      return "bg-amber-100 border-amber-300 text-amber-800" // Yellow for limited
    }
    return "bg-emerald-100 border-emerald-300 text-emerald-800" // Green for good
  }

  return (
    <div className="flex gap-4 h-[600px]">
      {/* LEFT COLUMN: Constraints & Preferences */}
      <div className="w-[20%] flex flex-col gap-4 overflow-y-auto pr-2">
        {/* Constraints */}
        <div className="rounded-lg border bg-card p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Block off times
          </h3>
          <div className="flex flex-col gap-2">
            {timeBlocks.map(block => (
              <div key={block.id} className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-2 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{block.label}</span>
                  <span className="text-muted-foreground">
                    {block.days.join("/")} {block.startTime}–{block.endTime}
                  </span>
                </div>
                <button
                  onClick={() => setTimeBlocks(prev => prev.filter(b => b.id !== block.id))}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
              <Plus className="h-3 w-3" />
              Add block
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-lg border bg-card p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Preferences
          </h3>
          <div className="flex flex-col gap-2">
            {preferences.map(pref => (
              <div key={pref.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className={pref.enabled ? "text-foreground" : "text-muted-foreground"}>
                    {pref.icon}
                  </span>
                  <span className={pref.enabled ? "text-foreground" : "text-muted-foreground"}>
                    {pref.label}
                  </span>
                </div>
                <Switch
                  checked={pref.enabled}
                  onCheckedChange={() => togglePreference(pref.id)}
                  className="scale-75"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MIDDLE COLUMN: Section Listings */}
      <div className="w-[35%] flex flex-col gap-3 overflow-y-auto border-x px-4">
        {/* Optimize Button */}
        <Button
          onClick={optimizeSchedule}
          disabled={optimizing || planned.length === 0}
          className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-md"
        >
          {optimizing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding best schedule...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Optimize Schedule
            </>
          )}
        </Button>

        {/* Course Sections */}
        {Object.entries(sectionsByCourse).map(([courseCode, sections]) => {
          const isSelected = !!selectedSections[courseCode]
          const sectionCount = sections.length
          const isLimited = sectionCount <= 2
          
          return (
            <div key={courseCode} className="rounded-lg border bg-card">
              {/* Course Header */}
              <div className="flex items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{courseCode}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                    {sections[0].courseName}
                  </span>
                </div>
                <Badge 
                  variant={isLimited ? "destructive" : "secondary"} 
                  className="text-[9px] h-5"
                >
                  {sectionCount} section{sectionCount !== 1 ? "s" : ""}{isLimited && " !"}
                </Badge>
              </div>
              
              {/* Section List */}
              <div className="divide-y">
                {sections.map(section => {
                  const selected = selectedSections[courseCode]?.id === section.id
                  const { status, reason } = getSectionStatus(section)
                  const isOptimalPick = showExplanation && selectedSections[courseCode]?.id === section.id
                  
                  return (
                    <div
                      key={section.id}
                      onClick={() => status !== "blocked" && selectSection(section)}
                      className={`flex items-center gap-2 px-3 py-2 text-[11px] transition-all ${
                        selected 
                          ? "bg-emerald-50 border-l-2 border-l-emerald-500"
                          : status === "blocked"
                            ? "bg-red-50/50 opacity-60 cursor-not-allowed"
                            : status === "conflict"
                              ? "bg-red-50/30 cursor-pointer hover:bg-red-50"
                              : status === "notpreferred"
                                ? "opacity-60 cursor-pointer hover:bg-muted/50"
                                : "cursor-pointer hover:bg-muted/50"
                      }`}
                    >
                      {/* Selection indicator */}
                      <div className="w-4 flex-shrink-0">
                        {selected ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        ) : status === "blocked" || status === "conflict" ? (
                          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        ) : isOptimalPick ? (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full border-2 border-muted-foreground/30" />
                        )}
                      </div>
                      
                      {/* Section info */}
                      <span className="font-mono text-muted-foreground">{section.section}</span>
                      <span className="font-medium">{section.days}</span>
                      <span className="text-muted-foreground">{section.startTime}–{section.endTime}</span>
                      <span className="text-muted-foreground truncate flex-1">{section.instructor}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-[9px] h-4 ${section.cap < 40 ? "border-amber-300 bg-amber-50 text-amber-700" : ""}`}
                      >
                        {section.cap}
                      </Badge>
                      
                      {/* Status indicators */}
                      {status === "blocked" && (
                        <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* RIGHT COLUMN: Calendar Grid */}
      <div className="w-[45%] flex flex-col gap-3 overflow-hidden">
        {/* Calendar */}
        <div className="flex-1 rounded-lg border bg-card overflow-auto">
          <div className="min-w-[400px]">
            {/* Header */}
            <div className="grid grid-cols-[50px_repeat(5,1fr)] border-b bg-muted/30 sticky top-0 z-10">
              <div className="p-2 text-[10px] font-medium text-muted-foreground"></div>
              {days.map(day => (
                <div key={day} className="p-2 text-[10px] font-semibold text-center border-l">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Time Grid */}
            <div className="relative">
              {hours.map(hour => (
                <div key={hour} className="grid grid-cols-[50px_repeat(5,1fr)] h-12 border-b">
                  <div className="p-1 text-[9px] text-muted-foreground text-right pr-2">
                    {hour > 12 ? `${hour - 12}PM` : hour === 12 ? "12PM" : `${hour}AM`}
                  </div>
                  {days.map(day => (
                    <div key={day} className="border-l relative">
                      {/* Constraint blocks */}
                      {timeBlocks.map(block => {
                        if (!block.days.includes(day)) return null
                        const blockStart = parseTime(block.startTime)
                        const blockEnd = parseTime(block.endTime)
                        const hourStart = hour * 60
                        const hourEnd = (hour + 1) * 60
                        if (!timeOverlaps(blockStart, blockEnd, hourStart, hourEnd)) return null
                        
                        const top = Math.max(0, (blockStart - hourStart) / 60 * 48)
                        const bottom = Math.min(48, (blockEnd - hourStart) / 60 * 48)
                        const height = bottom - top
                        
                        return (
                          <div
                            key={block.id}
                            className="absolute inset-x-0 bg-gray-200 border border-gray-300"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)"
                            }}
                          >
                            {blockStart >= hourStart && blockStart < hourEnd && (
                              <span className="text-[8px] font-medium text-gray-600 px-1 truncate block">
                                {block.label}
                              </span>
                            )}
                          </div>
                        )
                      })}
                      
                      {/* Course blocks */}
                      {Object.values(selectedSections).map(section => {
                        const sectionDays = getDaysArray(section.days)
                        if (!sectionDays.includes(day)) return null
                        
                        const sectionStart = parseTime(section.startTime)
                        const sectionEnd = parseTime(section.endTime)
                        const hourStart = hour * 60
                        const hourEnd = (hour + 1) * 60
                        if (!timeOverlaps(sectionStart, sectionEnd, hourStart, hourEnd)) return null
                        
                        const top = Math.max(0, (sectionStart - hourStart) / 60 * 48)
                        const bottom = Math.min(48, (sectionEnd - hourStart) / 60 * 48)
                        const height = bottom - top
                        
                        const colorClass = getCourseColor(section.courseCode)
                        
                        return (
                          <div
                            key={section.id}
                            className={`absolute inset-x-0.5 rounded border ${colorClass} overflow-hidden`}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                            }}
                          >
                            {sectionStart >= hourStart && sectionStart < hourEnd && (
                              <div className="p-0.5 text-[8px] leading-tight">
                                <div className="font-bold truncate">{section.courseCode}</div>
                                <div className="truncate opacity-75">{section.section} · {section.instructor}</div>
                                {section.cap < 40 && (
                                  <div className="text-amber-700">Cap: {section.cap}</div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Summary Bar */}
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="font-medium">
                {Object.keys(selectedSections).length} courses
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="font-medium">{totalHrs} credit hours</span>
              <span className="text-muted-foreground">·</span>
              {conflictCount === 0 ? (
                <span className="text-emerald-600 font-medium">0 conflicts</span>
              ) : (
                <span className="text-red-600 font-medium">{conflictCount} conflicts</span>
              )}
            </div>
            {Object.keys(selectedSections).length === 0 && (
              <span className="text-muted-foreground text-[10px]">
                Select sections from the list, or click Optimize
              </span>
            )}
          </div>
          
          {/* Conflicts detail */}
          {getConflicts.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              {getConflicts.slice(0, 2).map((conflict, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  {selectedSections[Object.keys(selectedSections).find(k => 
                    selectedSections[k].id === conflict.sectionId
                  ) || ""]?.courseCode}{selectedSections[Object.keys(selectedSections).find(k => 
                    selectedSections[k].id === conflict.sectionId
                  ) || ""]?.section}: {conflict.reason}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Optimization Explanation */}
        {showExplanation && conflictCount === 0 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-800">Schedule Optimized</span>
            </div>
            <p className="text-[10px] text-emerald-700 mb-2">
              Done by 11:35 AM on M/W/F · Done by 12:15 PM on T/Th · 1 afternoon lab on Tuesday
            </p>
            <button 
              onClick={() => setShowExplanation(false)}
              className="text-[10px] text-emerald-600 hover:text-emerald-800 underline"
            >
              Why this schedule?
            </button>
            
            <div className="mt-2 pt-2 border-t border-emerald-200 space-y-1.5">
              <p className="text-[9px] text-emerald-700">
                <strong>FINN 30103 at 8:00 AM</strong> — The 11:00 AM section conflicts with ECON 47403, and 12:30 PM overlaps your Thursday work block.
              </p>
              <p className="text-[9px] text-emerald-700">
                <strong>Astronomy selected</strong> — ENSC lecture times conflict with your econ courses. Physics would create an 80-min gap.
              </p>
              <p className="text-[9px] text-emerald-700">
                <strong>ASTR lab on Tuesday</strong> — Thursday lab overlaps your work block.
              </p>
            </div>
            
            <div className="mt-2 pt-2 border-t border-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                ECON 47403-001: Cap 20 — small class, register early
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-amber-700">
                <AlertTriangle className="h-3 w-3" />
                ASTR 10001-001: Cap 24 — small lab, typical but fills fast
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
