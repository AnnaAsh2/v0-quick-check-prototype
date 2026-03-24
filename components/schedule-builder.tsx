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
import { SECTIONS, COURSES, OPTIMAL_SECTIONS } from "@/lib/course-data"

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
/*  Section Data - Transform from course-data.ts                        */
/* ------------------------------------------------------------------ */

// Transform days string to internal format
function normalizeDays(days: string): string {
  if (days === "Mon/Wed/Fri") return "MWF"
  if (days === "Mon/Wed") return "MW"
  if (days === "Tue/Thu") return "T/Th"
  if (days === "Mon") return "Mon"
  if (days === "Tue") return "Tue"
  if (days === "Wed") return "Wed"
  if (days === "Thu") return "Thu"
  if (days === "Fri") return "Fri"
  return days
}

// Build sections from imported data
const allSections: Section[] = SECTIONS.map(s => {
  const courseInfo = COURSES.find(c => c.id === s.course)
  return {
    id: `${s.course}-${s.section}`,
    courseCode: s.course,
    courseName: s.name,
    section: `-${s.section}`,
    days: normalizeDays(s.days),
    startTime: s.startTime,
    endTime: s.endTime,
    instructor: s.instructor,
    cap: s.cap,
    room: s.location,
    hrs: courseInfo?.credits || 3
  }
})

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

// Type for external selected sections state
interface SelectedSectionData {
  id: string
  courseCode: string
  section: string
}

interface Props {
  planned: Course[]
  onRemove: (code: string) => void
  onRemoveCourse: (code: string) => void  // Remove course entirely from planned list
  selectedSections: Record<string, SelectedSectionData>
  setSelectedSections: React.Dispatch<React.SetStateAction<Record<string, SelectedSectionData>>>
}

export function ScheduleBuilder({ planned, onRemove, onRemoveCourse, selectedSections: externalSelectedSections, setSelectedSections: setExternalSelectedSections }: Props) {
  // Constraints - empty by default for demo
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
  
  // Block creation mode
  const [isAddingBlock, setIsAddingBlock] = useState(false)
  const [newBlockStart, setNewBlockStart] = useState<{ day: string, hour: number } | null>(null)
  const [newBlockEnd, setNewBlockEnd] = useState<{ day: string, hour: number } | null>(null)
  const [newBlockLabel, setNewBlockLabel] = useState("")
  const [showBlockLabelInput, setShowBlockLabelInput] = useState(false)

  // Preferences - all disabled by default for demo
  const [preferences, setPreferences] = useState<Preference[]>([
    { id: "morning", label: "Prefer morning classes", icon: <Sun className="h-3.5 w-3.5" />, enabled: false },
    { id: "afternoon", label: "Prefer afternoon/evening", icon: <Moon className="h-3.5 w-3.5" />, enabled: false },
    { id: "tth", label: "Prefer T/Th schedule", icon: <Calendar className="h-3.5 w-3.5" />, enabled: false },
    { id: "mwf", label: "Prefer MWF schedule", icon: <Calendar className="h-3.5 w-3.5" />, enabled: false },
    { id: "nogaps", label: "Avoid gaps over 2 hours", icon: <Clock className="h-3.5 w-3.5" />, enabled: false },
    { id: "no9am", label: "No classes before 9 AM", icon: <Clock className="h-3.5 w-3.5" />, enabled: false },
  ])

  // Convert external selected sections to internal Section objects
  const selectedSections = useMemo(() => {
    const result: Record<string, Section> = {}
    Object.entries(externalSelectedSections).forEach(([courseCode, data]) => {
      const section = allSections.find(s => s.id === data.id)
      if (section) {
        result[courseCode] = section
      }
    })
    return result
  }, [externalSelectedSections])

  // Wrapper to update external state
  const setSelectedSections = (updater: Record<string, Section> | ((prev: Record<string, Section>) => Record<string, Section>)) => {
    if (typeof updater === 'function') {
      const newSections = updater(selectedSections)
      const externalData: Record<string, SelectedSectionData> = {}
      Object.entries(newSections).forEach(([courseCode, section]) => {
        externalData[courseCode] = {
          id: section.id,
          courseCode: section.courseCode,
          section: section.section
        }
      })
      setExternalSelectedSections(externalData)
    } else {
      const externalData: Record<string, SelectedSectionData> = {}
      Object.entries(updater).forEach(([courseCode, section]) => {
        externalData[courseCode] = {
          id: section.id,
          courseCode: section.courseCode,
          section: section.section
        }
      })
      setExternalSelectedSections(externalData)
    }
  }

  // Optimization state
  const [optimizing, setOptimizing] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  // Get planned course codes - only show courses selected in other tabs
  const plannedCodes = useMemo(() => {
    return new Set(planned.map(c => c.code))
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

  // Format hour to time string
  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:00 ${period}`
  }

  // Handle calendar cell click for block creation
  const handleCalendarClick = (day: string, hour: number) => {
    if (!isAddingBlock) return
    
    if (!newBlockStart) {
      // First click - set start
      setNewBlockStart({ day, hour })
      setNewBlockEnd({ day, hour: hour + 1 })
    } else if (newBlockStart.day === day) {
      // Second click on same day - set end and show label input
      const endHour = Math.max(newBlockStart.hour + 1, hour + 1)
      setNewBlockEnd({ day, hour: endHour })
      setShowBlockLabelInput(true)
    } else {
      // Click on different day - reset and start new
      setNewBlockStart({ day, hour })
      setNewBlockEnd({ day, hour: hour + 1 })
    }
  }

  // Handle drag to extend block
  const handleCalendarDrag = (day: string, hour: number) => {
    if (!isAddingBlock || !newBlockStart || newBlockStart.day !== day) return
    const endHour = Math.max(newBlockStart.hour + 1, hour + 1)
    setNewBlockEnd({ day, hour: endHour })
  }

  // Confirm block creation
  const confirmBlock = () => {
    if (!newBlockStart || !newBlockEnd) return
    
    const newBlock: TimeBlock = {
      id: `block-${Date.now()}`,
      days: [newBlockStart.day],
      startTime: formatHour(newBlockStart.hour),
      endTime: formatHour(newBlockEnd.hour),
      label: newBlockLabel || "Busy"
    }
    
    setTimeBlocks(prev => [...prev, newBlock])
    cancelBlockCreation()
  }

  // Cancel block creation
  const cancelBlockCreation = () => {
    setIsAddingBlock(false)
    setNewBlockStart(null)
    setNewBlockEnd(null)
    setNewBlockLabel("")
    setShowBlockLabelInput(false)
  }

  // Select or deselect a section
  const selectSection = (section: Section) => {
    setSelectedSections(prev => {
      const current = prev[section.courseCode]
      // If clicking the same section that's already selected, deselect it
      if (current?.id === section.id) {
        const newSelections = { ...prev }
        delete newSelections[section.courseCode]
        return newSelections
      }
      // Otherwise select the new section
      return {
        ...prev,
        [section.courseCode]: section
      }
    })
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

  // Optimize schedule - dynamically finds best sections for selected courses
  const optimizeSchedule = () => {
    setOptimizing(true)
    setTimeout(() => {
      const newSelections: Record<string, Section> = {}
      const scheduledSections: Section[] = []
      
      // Get sections for each planned course, sorted by preference score
      const courseOrder = Array.from(plannedCodes)
      
      for (const courseCode of courseOrder) {
        const sections = sectionsByCourse[courseCode] || []
        if (sections.length === 0) continue
        
        // Score each section based on preferences and conflicts
        const scoredSections = sections.map(section => {
          let score = 100
          
          // Check for conflicts with time blocks
          for (const block of timeBlocks) {
            const sectionStart = parseTime(section.startTime)
            const sectionEnd = parseTime(section.endTime)
            for (const blockDay of block.days) {
              const sectionDays = getDaysFromString(section.days)
              if (sectionDays.includes(blockDay)) {
                const blockStart = parseTime(block.startTime)
                const blockEnd = parseTime(block.endTime)
                if (timeOverlaps(sectionStart, sectionEnd, blockStart, blockEnd)) {
                  score -= 1000 // Major penalty for blocked time conflict
                }
              }
            }
          }
          
          // Check for conflicts with already scheduled sections
          for (const scheduled of scheduledSections) {
            const sectionStart = parseTime(section.startTime)
            const sectionEnd = parseTime(section.endTime)
            const scheduledStart = parseTime(scheduled.startTime)
            const scheduledEnd = parseTime(scheduled.endTime)
            
            const sectionDays = getDaysFromString(section.days)
            const scheduledDays = getDaysFromString(scheduled.days)
            
            const overlappingDays = sectionDays.filter(d => scheduledDays.includes(d))
            if (overlappingDays.length > 0 && timeOverlaps(sectionStart, sectionEnd, scheduledStart, scheduledEnd)) {
              score -= 500 // Penalty for course conflict
            }
          }
          
          // Prefer morning if enabled
          const morningPref = preferences.find(p => p.id === "morning")?.enabled
          if (morningPref) {
            const startTime = parseTime(section.startTime)
            if (startTime >= 480 && startTime < 720) { // 8 AM - 12 PM
              score += 20
            }
          }
          
          // Prefer afternoon if enabled
          const afternoonPref = preferences.find(p => p.id === "afternoon")?.enabled
          if (afternoonPref) {
            const startTime = parseTime(section.startTime)
            if (startTime >= 720 && startTime < 1080) { // 12 PM - 6 PM
              score += 20
            }
          }
          
          // Prefer larger capacity sections
          if (section.cap >= 50) score += 10
          else if (section.cap < 30) score -= 10
          
          // Check if this is an OPTIMAL_SECTIONS pick (bonus)
          const isOptimal = OPTIMAL_SECTIONS.some(
            opt => opt.course === section.courseCode && `-${opt.section}` === section.section
          )
          if (isOptimal) score += 15
          
          return { section, score }
        })
        
        // Sort by score and pick the best
        scoredSections.sort((a, b) => b.score - a.score)
        const bestSection = scoredSections[0]
        
        if (bestSection && bestSection.score > -500) { // Only add if not blocked
          newSelections[courseCode] = bestSection.section
          scheduledSections.push(bestSection.section)
        }
      }
      
      setSelectedSections(newSelections)
      setOptimizing(false)
      setShowExplanation(true)
    }, 1500)
  }
  
  // Helper to get days array from string
  const getDaysFromString = (daysStr: string): string[] => {
    if (daysStr === "MWF") return ["Mon", "Wed", "Fri"]
    if (daysStr === "MW") return ["Mon", "Wed"]
    if (daysStr === "T/Th") return ["Tue", "Thu"]
    if (daysStr === "Mon") return ["Mon"]
    if (daysStr === "Tue") return ["Tue"]
    if (daysStr === "Wed") return ["Wed"]
    if (daysStr === "Thu") return ["Thu"]
    if (daysStr === "Fri") return ["Fri"]
    return []
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
            {isAddingBlock ? (
              <div className="flex flex-col gap-2 rounded-md border border-amber-300 bg-amber-50 p-2">
                <span className="text-[10px] font-medium text-amber-700">
                  {!newBlockStart 
                    ? "Click on the calendar to set start time" 
                    : !showBlockLabelInput 
                      ? "Click again to set end time (or drag)" 
                      : "Name this time block"}
                </span>
                {showBlockLabelInput && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Work, Gym, Study..."
                      value={newBlockLabel}
                      onChange={(e) => setNewBlockLabel(e.target.value)}
                      className="w-full rounded border px-2 py-1 text-xs"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <Button size="sm" className="h-6 text-[10px] flex-1" onClick={confirmBlock}>
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={cancelBlockCreation}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                {!showBlockLabelInput && (
                  <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={cancelBlockCreation}>
                    Cancel
                  </Button>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingBlock(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                <Plus className="h-3 w-3" />
                Add block
              </button>
            )}
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

        {/* Empty State */}
        {planned.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/40" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-muted-foreground">No courses selected</p>
              <p className="text-xs text-muted-foreground/70 max-w-[200px]">
                Use the &quot;I Know What I Want&quot; or &quot;What Should I Take?&quot; tabs to add courses first
              </p>
            </div>
          </div>
        )}

        {/* Course Sections */}
        {Object.entries(sectionsByCourse).map(([courseCode, sections]) => {
          const isSelected = !!selectedSections[courseCode]
          const sectionCount = sections.length
          const isLimited = sectionCount <= 2
          const courseInfo = COURSES.find(c => c.id === courseCode)
          const hasPrereqIssue = courseInfo && !courseInfo.prereqMet
          
          return (
            <div key={courseCode} className="rounded-lg border bg-card">
              {/* Course Header */}
              <div className="flex items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">{courseCode}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                    {sections[0].courseName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasPrereqIssue && (
                    <Badge 
                      variant="outline" 
                      className="text-[9px] h-5 border-amber-300 bg-amber-50 text-amber-700"
                      title={courseInfo?.notes}
                    >
                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                      Prereq
                    </Badge>
                  )}
                  <Badge 
                    variant={isLimited ? "destructive" : "secondary"} 
                    className="text-[9px] h-5"
                  >
                    {sectionCount} section{sectionCount !== 1 ? "s" : ""}{isLimited && " !"}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Remove from selected sections
                      setSelectedSections(prev => {
                        const newSelections = { ...prev }
                        delete newSelections[courseCode]
                        return newSelections
                      })
                      // Remove from planned courses
                      onRemoveCourse(courseCode)
                    }}
                    className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                    title="Remove course"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
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
                      <span className={`truncate flex-1 ${section.instructor === "TBA" ? "text-amber-600 italic" : "text-muted-foreground"}`}>
                        {section.instructor}
                      </span>
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
                  {days.map(day => {
                    // Check if this cell is part of the new block being created
                    const isInNewBlock = isAddingBlock && newBlockStart && newBlockEnd && 
                      newBlockStart.day === day && 
                      hour >= newBlockStart.hour && 
                      hour < newBlockEnd.hour
                    
                    return (
                    <div 
                      key={day} 
                      className={`border-l relative ${isAddingBlock ? "cursor-crosshair" : ""} ${isInNewBlock ? "bg-amber-100" : ""}`}
                      onClick={() => handleCalendarClick(day, hour)}
                      onMouseEnter={(e) => {
                        if (e.buttons === 1) handleCalendarDrag(day, hour)
                      }}
                    >
                      {/* New block preview */}
                      {isInNewBlock && hour === newBlockStart.hour && (
                        <div className="absolute inset-x-0 bg-amber-200 border-2 border-amber-400 border-dashed z-10 pointer-events-none"
                          style={{
                            top: 0,
                            height: `${(newBlockEnd.hour - newBlockStart.hour) * 48}px`
                          }}
                        >
                          <span className="text-[9px] font-semibold text-amber-700 px-1">
                            {formatHour(newBlockStart.hour)} - {formatHour(newBlockEnd.hour)}
                          </span>
                        </div>
                      )}
                      
                      {/* Constraint blocks (RED - blocked times) */}
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
                            className="absolute inset-x-0 bg-red-100 border border-red-300"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(220,38,38,0.15) 3px, rgba(220,38,38,0.15) 6px)"
                            }}
                          >
                            {blockStart >= hourStart && blockStart < hourEnd && (
                              <span className="text-[8px] font-semibold text-red-700 px-1 truncate block">
                                {block.label}
                              </span>
                            )}
                          </div>
                        )
                      })}
                      
                      {/* Preferred time blocks (GREEN - based on preferences) */}
                      {(() => {
                        const morningPref = preferences.find(p => p.id === "morning")?.enabled
                        const afternoonPref = preferences.find(p => p.id === "afternoon")?.enabled
                        const hourStart = hour * 60
                        const hourEnd = (hour + 1) * 60
                        
                        // Morning preference: 8 AM - 12 PM (480-720 mins)
                        if (morningPref && hourStart >= 480 && hourEnd <= 720) {
                          // Check if there's a blocked time in this slot
                          const hasBlock = timeBlocks.some(block => 
                            block.days.includes(day) && 
                            timeOverlaps(parseTime(block.startTime), parseTime(block.endTime), hourStart, hourEnd)
                          )
                          if (!hasBlock) {
                            return (
                              <div
                                className="absolute inset-0 bg-emerald-50 border-l border-r border-emerald-100 pointer-events-none"
                                style={{ opacity: 0.7 }}
                              />
                            )
                          }
                        }
                        
                        // Afternoon preference: 12 PM - 6 PM (720-1080 mins)
                        if (afternoonPref && hourStart >= 720 && hourEnd <= 1080) {
                          const hasBlock = timeBlocks.some(block => 
                            block.days.includes(day) && 
                            timeOverlaps(parseTime(block.startTime), parseTime(block.endTime), hourStart, hourEnd)
                          )
                          if (!hasBlock) {
                            return (
                              <div
                                className="absolute inset-0 bg-emerald-50 border-l border-r border-emerald-100 pointer-events-none"
                                style={{ opacity: 0.7 }}
                              />
                            )
                          }
                        }
                        
                        return null
                      })()}
                      
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
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-300" style={{
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(220,38,38,0.15) 1px, rgba(220,38,38,0.15) 2px)"
            }} />
            <span>Blocked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
            <span>Preferred</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-sky-100 border border-sky-300" />
            <span>Scheduled</span>
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
