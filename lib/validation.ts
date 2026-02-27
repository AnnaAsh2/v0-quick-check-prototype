/* ------------------------------------------------------------------ */
/*  QuickCheck Validation Engine v2                                    */
/*  Comprehensive catalog-driven validation based on the Walton        */
/*  College 2025-2026 course catalog, BSBA degree requirements,        */
/*  and credit-hour load policies.                                     */
/* ------------------------------------------------------------------ */

export interface Course {
  code: string
  name: string
  hrs: number
  cat: string
}

export type CourseStatus = "pass" | "conditional" | "fail"
export type PrereqStatus = "met" | "conditional" | "notmet"

export interface CourseResult {
  code: string
  name: string
  status: CourseStatus
  countsToward: string
  prereqs: string
  prereqStatus: PrereqStatus
  note: string
  impact?: string
  badges: string[]
}

export interface LoadFlag {
  type: "info" | "warning" | "error"
  message: string
}

export interface DegreeCourseEntry {
  code: string
  name: string
  hrs: number
  status: "completed" | "in-progress" | "planned" | "remaining"
  grade?: string
  note?: string
}

export interface DegreeItem {
  label: string
  detail: string
  value: number
  total: number
  done?: boolean
  color?: string
  courses?: DegreeCourseEntry[]
}

export interface SemesterPlan {
  label: string
  courses: { code: string; name: string; hrs: number; note?: string }[]
  totalHrs: number
  flags: { type: "info" | "warning" | "error"; message: string }[]
}

export type SuggestionSeverity = "green" | "yellow" | "red"

export interface AdvisorFlag {
  severity: "red" | "yellow"
  message: string
}

export interface AdvisorIntelligence {
  /** 1-2 biggest flags for advisor to dig into */
  biggestFlags: { question: string; context: string }[]
  /** All collected issues */
  allIssues: AdvisorFlag[]
  /** Whether in-person meeting is suggested */
  inPersonSuggested: boolean
  /** Student summary sentence */
  studentSummary: string
  /** 3-5 talking points for meeting prep */
  talkingPoints: string[]
  /** 1-2 questions to ask the student */
  questionsForStudent: { question: string; reason: string }[]
}

export interface ValidationResult {
  courses: CourseResult[]
  loadFlags: LoadFlag[]
  degreeProgress: DegreeItem[]
  totalHrs: number
  passCount: number
  conditionalCount: number
  failCount: number
  suggestionCount: number
  suggestion: { title: string; body: string[]; severity: SuggestionSeverity } | null
  timeline: SemesterPlan[]
  advisorIntel: AdvisorIntelligence
}

/* ------------------------------------------------------------------ */
/*  Jordan's academic record                                           */
/*  Source: BSBA Econ 2025-2026 worksheet (filled out)                 */
/* ------------------------------------------------------------------ */

/** Courses completed with final grades. Key = code, value = grade */
export const completedRecord: Record<string, string> = {
  // Pre-Business Core
  "ENGL 10103": "A",
  "ENGL 10203": "B",
  "MATH 20503": "B",
  "ECON 21003": "A",
  "ECON 22003": "A",
  "MATH 22003": "C",
  "SPCH 10003": "A",
  "ISYS 11203": "A",
  "BUSI 11101": "P",
  "BUSI 10303": "B",
  "ISYS 20303": "B",
  "ACCT 20103": "B",
  "ACCT 20203": "B",
  // State Min Core
  "GEOL 11103": "B",
  "GEOL 11101": "B",
  "PSYC 20003": "B",
  "ARHS 10003": "A",
  // Business Core (completed)
  "BLAW 20003": "C",
  "ISYS 21003": "B",
  "SCMT 21003": "B",
  "MGMT 21003": "B",
  "FINN 20403": "B",
  // General Elective
  "COMM 12003": "B",
}

const completedCourses = new Set(Object.keys(completedRecord))

/** In-progress Fall 2026 courses */
export const inProgressFall2026 = new Set([
  "MKTG 34303", // Business Core
  "ECON 30303", // Econ Major - Intermediate Micro
  "ECON 34303", // Money & Banking (ECON elective / minor course)
  "PHIL 21003", // Humanities - State Min Core
  "HIST 20003", // US History - State Min Core
])

const allHad = new Set([...completedCourses, ...inProgressFall2026])

/* ------------------------------------------------------------------ */
/*  Student profile constants                                          */
/* ------------------------------------------------------------------ */

export const STUDENT = {
  gpa: 3.19,
  prevSemesterGpa: 3.19, // assume same for demo
  hoursCompleted: 65,
  hoursInProgress: 15, // Fall 2026 hours
  expectedGrad: "Spring 2028",
  isSeniorFinalSemester: false,
  classification: "Junior",
  major: "Business Economics",
  minor: "Finance",
}

/* ------------------------------------------------------------------ */
/*  Credit-hour policy limits (Walton College)                         */
/* ------------------------------------------------------------------ */

const STANDARD_MIN = 15
const STANDARD_MAX = 17
const GPA_275_MAX = 18
const SENIOR_FINAL_MAX = 19
// const SUMMER_MAX = 6 // referenced in load messages

/* ------------------------------------------------------------------ */
/*  Catalog prerequisite database                                      */
/*  Sourced from Walton College 2025-2026 catalog text                 */
/* ------------------------------------------------------------------ */

interface CatalogEntry {
  code: string
  name: string
  prereqs: string[]            // codes required with C or better
  coreqs?: string[]            // co-requisites (can be taken same semester)
  prereqGrade?: Record<string, string> // special grade requirements
  prereqNote?: string          // human-readable note
  countsToward: string[]       // what it counts toward
  additionalReqs?: string      // e.g. "junior standing"
  notForCredit?: boolean       // e.g. ECON 30503/30603 not for Econ major credit
}

const catalog: Record<string, CatalogEntry> = {
  // ====== ECONOMICS ======
  "ECON 21003": {
    code: "ECON 21003", name: "Principles of Macroeconomics",
    prereqs: [], prereqNote: "MATH 1203 or higher, or Math ACT 26+",
    countsToward: ["Pre-Business Core", "State Minimum Core (Social Science)"],
  },
  "ECON 22003": {
    code: "ECON 22003", name: "Principles of Microeconomics",
    prereqs: [], prereqNote: "MATH 1203 or higher, or Math ACT 26+",
    countsToward: ["Pre-Business Core", "State Minimum Core (Social Science)"],
  },
  "ECON 30303": {
    code: "ECON 30303", name: "Microeconomic Theory",
    prereqs: ["ECON 21003", "ECON 22003", "MATH 22003"],
    prereqNote: "Requires ECON 2013, ECON 2023, and MATH 2043 or MATH 2554",
    countsToward: ["Economics Major (Required)", "Business Economics Concentration"],
    additionalReqs: "Pre-business core completed",
  },
  "ECON 31303": {
    code: "ECON 31303", name: "Macroeconomic Theory",
    prereqs: ["ECON 21003", "ECON 22003", "MATH 22003"],
    prereqNote: "Requires ECON 2013, ECON 2023, and MATH 2043 or MATH 2554",
    countsToward: ["Economics Major (Required)", "Business Economics Concentration"],
    additionalReqs: "Pre-business core completed",
  },
  "ECON 34303": {
    code: "ECON 34303", name: "Money & Banking",
    prereqs: ["ECON 21003", "ECON 22003"],
    countsToward: ["Economics Major (ECON Elective)", "Jr/Sr Business Elective"],
  },
  "ECON 43303": {
    code: "ECON 43303", name: "Economics of Organizations",
    prereqs: ["ECON 30303"],
    prereqNote: "Requires ECON 3033 (Microeconomic Theory) with C or better",
    countsToward: ["Economics Major (Required)", "Business Economics Concentration"],
    additionalReqs: "Pre-business core completed",
  },
  "ECON 47403": {
    code: "ECON 47403", name: "Introduction to Econometrics",
    prereqs: ["MATH 22003", "BUSI 10303"],
    prereqNote: "Requires (MATH 2043 or MATH 2554) and (BUSI 1033 or STAT 2303)",
    countsToward: ["Economics Major (Required)", "Business Economics Concentration"],
    additionalReqs: "Pre-business core completed",
  },
  "ECON 47503": {
    code: "ECON 47503", name: "Forecasting",
    prereqs: ["MATH 22003", "BUSI 10303"],
    prereqNote: "Requires (MATH 2043 or MATH 2554) and (BUSI 1033 or STAT 2303)",
    countsToward: ["Economics Major (Required — alternative to ECON 4743)"],
    additionalReqs: "Pre-business core completed",
  },
  "ECON 47603": {
    code: "ECON 47603", name: "Economic Analytics",
    prereqs: [], coreqs: ["ECON 47403"],
    prereqNote: "Coreq: ECON 4743 or ISYS 4193",
    countsToward: ["Economics Major (ECON Elective)"],
  },
  "ECON 31403": {
    code: "ECON 31403", name: "Economics of Poverty and Inequality",
    prereqs: ["ECON 21003", "ECON 22003"],
    countsToward: ["Economics Major (ECON Elective)", "Jr/Sr Business Elective"],
  },
  "ECON 33303": {
    code: "ECON 33303", name: "Public Economics",
    prereqs: ["ECON 21003", "ECON 22003"],
    countsToward: ["Economics Major (ECON Elective)", "Jr/Sr Business Elective"],
  },
  "ECON 35303": {
    code: "ECON 35303", name: "Labor Economics",
    prereqs: ["ECON 21003", "ECON 22003"],
    countsToward: ["Economics Major (ECON Elective)", "Jr/Sr Business Elective", "Social Issues Requirement"],
  },
  "ECON 44203": {
    code: "ECON 44203", name: "Behavioral Economics",
    prereqs: ["ECON 30303"],
    prereqNote: "Requires ECON 3033",
    countsToward: ["Economics Major (ECON Elective)", "Jr/Sr Business Elective", "Behavioral Econ Minor"],
  },
  "ECON 44303": {
    code: "ECON 44303", name: "Experimental Economics",
    prereqs: ["ECON 22003"],
    countsToward: ["Economics Major (ECON Elective)", "Jr/Sr Business Elective", "Behavioral Econ Minor"],
  },
  "ECON 46303": {
    code: "ECON 46303", name: "International Trade",
    prereqs: ["ECON 21003", "ECON 22003"],
    countsToward: ["Economics Major (ECON Elective)", "Intl Econ Concentration (Required)"],
  },
  "ECON 46403": {
    code: "ECON 46403", name: "International Macroeconomics & Finance",
    prereqs: ["ECON 21003", "ECON 22003"],
    countsToward: ["Economics Major (ECON Elective)", "Intl Econ Concentration (Required)"],
  },
  "ECON 38403": {
    code: "ECON 38403", name: "Economics of the Developing World",
    prereqs: ["ECON 21003", "ECON 22003"],
    countsToward: ["Economics Major (ECON Elective)", "Social Issues Requirement"],
  },
  "ECON 38503": {
    code: "ECON 38503", name: "Emerging Markets",
    prereqs: ["ECON 21003", "ECON 22003"],
    countsToward: ["Economics Major (ECON Elective)", "Social Issues Requirement"],
  },

  // ====== FINANCE ======
  "FINN 20403": {
    code: "FINN 20403", name: "Principles of Finance",
    prereqs: ["ACCT 20103", "BUSI 10303"],
    prereqNote: "Requires ACCT 2013, (ECON 2013 or ECON 2023), and BUSI 1033 with C or better",
    countsToward: ["Business Core (Required)"],
  },
  "FINN 30103": {
    code: "FINN 30103", name: "Financial Analysis",
    prereqs: ["FINN 20403"],
    prereqNote: "Requires FINN 2043 with C or better",
    countsToward: ["Finance Minor (Required)", "Jr/Sr Business Elective"],
  },
  "FINN 30603": {
    code: "FINN 30603", name: "Investments",
    prereqs: ["FINN 20403"], coreqs: ["FINN 30103"],
    prereqNote: "Prereq: FINN 2043; Pre/Coreq: FINN 3013",
    countsToward: ["Finance Minor", "Jr/Sr Business Elective"],
  },
  "FINN 31003": {
    code: "FINN 31003", name: "Financial Modeling",
    prereqs: ["FINN 20403"],
    prereqNote: "Requires FINN 2043",
    countsToward: ["Finance Minor", "Jr/Sr Business Elective"],
  },
  "FINN 31303": {
    code: "FINN 31303", name: "Commercial Banking",
    prereqs: ["FINN 20403"],
    countsToward: ["Finance Minor (Banking)", "Jr/Sr Business Elective"],
  },
  "FINN 36003": {
    code: "FINN 36003", name: "Corporate Finance",
    prereqs: ["FINN 20403", "FINN 30103"],
    prereqNote: "Requires FINN 2043 and FINN 3013",
    countsToward: ["Finance Minor (Banking)", "Jr/Sr Business Elective"],
  },
  "FINN 30003": {
    code: "FINN 30003", name: "Personal Financial Management",
    prereqs: [],
    countsToward: ["Finance Minor (Insurance/RE)", "Jr/Sr Business Elective"],
  },
  "FINN 30503": {
    code: "FINN 30503", name: "Financial Markets & Institutions",
    prereqs: ["ECON 21003", "ECON 22003"],
    countsToward: ["Jr/Sr Business Elective"],
  },
  "FINN 37003": {
    code: "FINN 37003", name: "International Finance",
    prereqs: [],
    countsToward: ["Finance Minor", "Jr/Sr Business Elective", "Intl Econ Concentration"],
  },
  "FINN 36203": {
    code: "FINN 36203", name: "Risk Management",
    prereqs: [],
    countsToward: ["Finance Minor (Insurance/RE)", "Jr/Sr Business Elective"],
  },
  "FINN 43203": {
    code: "FINN 43203", name: "Financial Data Analytics I",
    prereqs: ["FINN 30103"],
    prereqNote: "Requires FINN 3013",
    countsToward: ["Jr/Sr Business Elective"],
  },

  // ====== BUSINESS CORE ======
  "BLAW 20003": {
    code: "BLAW 20003", name: "Legal Environment of Business",
    prereqs: [],
    countsToward: ["Business Core (Required)"],
  },
  "ISYS 21003": {
    code: "ISYS 21003", name: "Business Information Systems",
    prereqs: ["ECON 21003", "BUSI 10303", "ACCT 20103"],
    countsToward: ["Business Core (Required)"],
  },
  "SCMT 21003": {
    code: "SCMT 21003", name: "Integrated Supply Chain Management",
    prereqs: [], coreqs: ["MATH 20503"],
    countsToward: ["Business Core (Required)"],
  },
  "MGMT 21003": {
    code: "MGMT 21003", name: "Managing People & Organizations",
    prereqs: [], coreqs: ["MATH 20503"],
    countsToward: ["Business Core (Required)"],
  },
  "MKTG 34303": {
    code: "MKTG 34303", name: "Introduction to Marketing",
    prereqs: ["ECON 21003", "ECON 22003", "ACCT 20103", "BUSI 10303"],
    countsToward: ["Business Core (Required)"],
  },
  "SEVI 30103": {
    code: "SEVI 30103", name: "Strategic Management",
    prereqs: [],
    prereqNote: "All pre-business and business core courses with grades of C or better. WCOB majors ONLY.",
    countsToward: ["Business Core (Required, Capstone)"],
    additionalReqs: "All pre-business and business core completed with C or better",
  },

  // ====== ACCOUNTING ======
  "ACCT 20103": {
    code: "ACCT 20103", name: "Accounting Principles I",
    prereqs: ["ISYS 11203", "BUSI 11101", "MATH 20503"],
    countsToward: ["Pre-Business Core"],
  },
  "ACCT 20203": {
    code: "ACCT 20203", name: "Accounting Principles II",
    prereqs: ["ACCT 20103"],
    countsToward: ["Pre-Business Core"],
  },

  // ====== ISYS ======
  "ISYS 41903": {
    code: "ISYS 41903", name: "Business Analytics & Visualization",
    prereqs: ["BUSI 10303"],
    countsToward: ["Jr/Sr Business Elective"],
  },

  // ====== MANAGEMENT ======
  "MGMT 42503": {
    code: "MGMT 42503", name: "Leadership",
    prereqs: ["MGMT 21003"],
    countsToward: ["Management Minor", "Jr/Sr Business Elective"],
  },
  "MGMT 42603": {
    code: "MGMT 42603", name: "Organizational Change & Development",
    prereqs: ["MGMT 21003"],
    countsToward: ["Management Minor", "Jr/Sr Business Elective"],
  },
  "MGMT 49403": {
    code: "MGMT 49403", name: "Talent Acquisition & Management",
    prereqs: ["BUSI 10303"],
    countsToward: ["Management Minor", "Jr/Sr Business Elective"],
  },

  // ====== MARKETING ======
  "MKTG 35503": {
    code: "MKTG 35503", name: "Consumer Behavior",
    prereqs: ["MKTG 34303"],
    countsToward: ["Marketing Minor", "Jr/Sr Business Elective"],
  },
  "MKTG 36303": {
    code: "MKTG 36303", name: "Marketing Research",
    prereqs: ["MKTG 34303"],
    countsToward: ["Marketing Minor", "Jr/Sr Business Elective"],
  },
  "MKTG 38303": {
    code: "MKTG 38303", name: "Digital Marketing",
    prereqs: ["MKTG 34303"],
    countsToward: ["Jr/Sr Business Elective"],
  },

  // ====== SUPPLY CHAIN ======
  "SCMT 34403": {
    code: "SCMT 34403", name: "Transportation & Distribution Mgmt",
    prereqs: ["SCMT 21003", "ECON 21003", "ECON 22003"],
    countsToward: ["Supply Chain Minor", "Jr/Sr Business Elective"],
  },
  "SCMT 36103": {
    code: "SCMT 36103", name: "Procurement & Supply Mgmt",
    prereqs: ["SCMT 21003", "ECON 21003", "ECON 22003"],
    countsToward: ["Supply Chain Minor", "Jr/Sr Business Elective"],
  },

  // ====== SEVI ======
  "SEVI 39303": {
    code: "SEVI 39303", name: "Entrepreneurship & New Venture Dev",
    prereqs: [],
    additionalReqs: "Junior standing",
    countsToward: ["Innovation Minor", "Jr/Sr Business Elective"],
  },
  "SEVI 36703": {
    code: "SEVI 36703", name: "Social Entrepreneurship",
    prereqs: [],
    additionalReqs: "Junior standing",
    countsToward: ["Innovation Minor", "Jr/Sr Business Elective"],
  },

  // ====== BLAW ======
  "BLAW 30303": {
    code: "BLAW 30303", name: "Commercial Law",
    prereqs: [],
    countsToward: ["Jr/Sr Business Elective"],
  },
}

/* ------------------------------------------------------------------ */
/*  Helper: Check if a prerequisite is met                             */
/* ------------------------------------------------------------------ */

function hasCompleted(code: string): boolean {
  return completedCourses.has(code)
}

function hasCompletedOrIP(code: string): boolean {
  return completedCourses.has(code) || inProgressFall2026.has(code)
}

function gradeOf(code: string): string {
  return completedRecord[code] || "IP"
}

function isGradeAtLeast(grade: string, min: string): boolean {
  const order = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "P", "IP"]
  const gIdx = order.indexOf(grade)
  const mIdx = order.indexOf(min)
  if (gIdx === -1 || mIdx === -1) return true // unknown grades pass
  return gIdx <= mIdx
}

/* ------------------------------------------------------------------ */
/*  Per-course validation                                              */
/* ------------------------------------------------------------------ */

function validateCourse(
  c: Course,
  plannedCodes: Set<string>,
): CourseResult {
  const entry = catalog[c.code]

  // ============================================================
  // SPECIFIC OVERRIDES for courses needing special logic
  // ============================================================

  // ----- SEVI 30103 (Strategic Management / Capstone) -----
  if (c.code === "SEVI 30103") {
    // Requires ALL business core with C or better. MKTG 34303 is in progress.
    const mktgIP = inProgressFall2026.has("MKTG 34303")
    return {
      code: c.code, name: c.name,
      status: mktgIP ? "conditional" : "pass",
      countsToward: "Business Core \u2014 Required (Capstone)",
      prereqs: mktgIP
        ? "Conditional \u2014 Requires C or better in ALL business core courses. MKTG 34303 is in progress this fall."
        : "Met \u2014 All business core courses completed with C or better.",
      prereqStatus: mktgIP ? "conditional" : "met",
      note: mktgIP
        ? "As long as you pass MKTG 34303 with a C or better this fall, you\u2019re cleared. This is the right time to take it \u2014 it\u2019s your last business core requirement."
        : "Business core capstone. Cleared to register.",
      badges: mktgIP ? ["conditional"] : [],
    }
  }

  // ----- ECON 43303 (Economics of Organizations) -----
  if (c.code === "ECON 43303") {
    const hasEcon30303 = hasCompleted("ECON 30303")
    const econ30303IP = inProgressFall2026.has("ECON 30303")
    const econCount = [...plannedCodes].filter(cd => cd.startsWith("ECON") && parseInt(cd.split(" ")[1]) >= 30000).length
    const heavyEcon = econCount >= 3
    const badges: string[] = []
    if (heavyEcon) badges.push("workload flag")

    if (hasEcon30303) {
      return {
        code: c.code, name: c.name, status: "pass",
        countsToward: "Economics Major \u2014 Required (Business Economics)",
        prereqs: "Met \u2014 ECON 30303 (\u2713 completed)",
        prereqStatus: "met",
        note: heavyEcon
          ? "Workload flag: you\u2019re planning " + econCount + " upper-level ECON courses. The 8-semester plan recommends deferring this to Fall 2027."
          : "Required for your concentration. On track.",
        badges,
      }
    }

    if (econ30303IP) {
      return {
        code: c.code, name: c.name, status: "conditional",
        countsToward: "Economics Major \u2014 Required (Business Economics)",
        prereqs: "Conditional \u2014 ECON 30303 (Microeconomic Theory) is in progress this fall. Must earn C or better.",
        prereqStatus: "conditional",
        note: heavyEcon
          ? "Workload flag: you\u2019re planning " + econCount + " upper-level ECON courses in one semester alongside Econometrics (4 hrs). The 8-semester plan recommends deferring ECON 43303 to Fall 2027."
          : "Required for your Economics major. On track if prerequisite is met.",
        badges: [...badges, "conditional"],
      }
    }

    return {
      code: c.code, name: c.name, status: "fail",
      countsToward: "Economics Major \u2014 Required",
      prereqs: "Not met \u2014 Requires ECON 30303 (Microeconomic Theory). Not taken or in progress.",
      prereqStatus: "notmet",
      note: "Cannot register without completing ECON 30303 first.",
      badges: ["cannot register"],
    }
  }

  // ----- FINN 30603 (Investments) -----
  if (c.code === "FINN 30603") {
    const hasFinn20403 = hasCompleted("FINN 20403")
    const hasFinn30103Completed = hasCompleted("FINN 30103")
    const hasFinn30103Planned = plannedCodes.has("FINN 30103")
    const hasFinn30103 = hasFinn30103Completed || hasFinn30103Planned

    if (hasFinn20403 && hasFinn30103) {
      return {
        code: c.code, name: c.name, status: "pass",
        countsToward: "Finance Minor + Jr/Sr Business Elective",
        prereqs: "Met \u2014 FINN 20403 (\u2713 completed), FINN 30103 (\u2713 " +
          (hasFinn30103Planned ? "co-enrolled this semester" : "completed") + ")",
        prereqStatus: "met",
        note: "Counts toward your Finance minor and Jr/Sr business elective hours. Good sequence.",
        badges: [],
      }
    }

    if (hasFinn20403 && !hasFinn30103) {
      return {
        code: c.code, name: c.name, status: "fail",
        countsToward: "Finance Minor + Jr/Sr Business Elective",
        prereqs: "Not met \u2014 FINN 30603 requires FINN 20403 (\u2713) AND FINN 30103 (Financial Analysis) as a pre/corequisite. FINN 30103 is not in your plan and has not been taken.",
        prereqStatus: "notmet",
        note: "You cannot register for this course without FINN 30103.",
        impact: "This blocks your Finance minor progress. FINN 30103 is required for the minor anyway and also unlocks FINN 36003 (Corporate Finance), FINN 31003 (Financial Modeling), and FINN 43203 (Financial Data Analytics I). Add FINN 30103 to this semester\u2019s plan or take FINN 30603 in a later semester.",
        badges: ["cannot register"],
      }
    }

    return {
      code: c.code, name: c.name, status: "fail",
      countsToward: "Finance Minor + Jr/Sr Business Elective",
      prereqs: "Not met \u2014 Requires FINN 20403 and FINN 30103.",
      prereqStatus: "notmet",
      note: "Missing prerequisites.",
      badges: ["cannot register"],
    }
  }

  // ----- FINN 30103 (Financial Analysis) \u2014 EXEMPT from flags -----
  if (c.code === "FINN 30103") {
    const hasFinn20403 = hasCompleted("FINN 20403")
    return {
      code: c.code, name: c.name,
      status: hasFinn20403 ? "pass" : "fail",
      countsToward: "Finance Minor (Required) + Jr/Sr Business Elective",
      prereqs: hasFinn20403
        ? "Met \u2014 FINN 20403 (\u2713 completed, grade: " + gradeOf("FINN 20403") + ")"
        : "Not met \u2014 Requires FINN 20403 (Principles of Finance).",
      prereqStatus: hasFinn20403 ? "met" : "notmet",
      note: hasFinn20403
        ? "Excellent choice. This is required for your Finance minor and unlocks FINN 30603 (Investments), FINN 36003 (Corporate Finance), FINN 31003 (Financial Modeling), and FINN 43203 (Financial Data Analytics I). Also counts toward your Jr/Sr business elective requirement."
        : "You need FINN 20403 first.",
      badges: [],
    }
  }

  // ----- FINN 36003 (Corporate Finance) -----
  if (c.code === "FINN 36003") {
    const hasFinn20403 = hasCompleted("FINN 20403")
    const hasFinn30103 = hasCompleted("FINN 30103") || plannedCodes.has("FINN 30103")
    if (hasFinn20403 && hasFinn30103) {
      return {
        code: c.code, name: c.name,
        status: plannedCodes.has("FINN 30103") ? "conditional" : "pass",
        countsToward: "Finance Minor (Banking) + Jr/Sr Business Elective",
        prereqs: plannedCodes.has("FINN 30103")
          ? "Conditional \u2014 FINN 30103 must be completed first (co-enrolled). Check if taken as pre or coreq."
          : "Met \u2014 FINN 20403 (\u2713), FINN 30103 (\u2713)",
        prereqStatus: plannedCodes.has("FINN 30103") ? "conditional" : "met",
        note: "Counts toward your Finance minor. Ensure FINN 30103 is completed before this course begins.",
        badges: plannedCodes.has("FINN 30103") ? ["conditional"] : [],
      }
    }
    return {
      code: c.code, name: c.name, status: "fail",
      countsToward: "Finance Minor (Banking) + Jr/Sr Business Elective",
      prereqs: "Not met \u2014 Requires FINN 20403 and FINN 30103.",
      prereqStatus: "notmet",
      note: "Take FINN 30103 first, then this course becomes available.",
      badges: ["cannot register"],
    }
  }

  // ----- ECON 47503 (Forecasting) -----
  if (c.code === "ECON 47503") {
    const hasMath = hasCompleted("MATH 22003")
    const hasBusi = hasCompleted("BUSI 10303")
    if (hasMath && hasBusi) {
      const hasEcon47403 = hasCompletedOrIP("ECON 47403") || plannedCodes.has("ECON 47403")
      return {
        code: c.code, name: c.name,
        status: "pass",
        countsToward: "Economics Major \u2014 Required (alternative to ECON 4743)",
        prereqs: "Met \u2014 MATH 22003 (\u2713, " + gradeOf("MATH 22003") + "), BUSI 10303 (\u2713, " + gradeOf("BUSI 10303") + ")",
        prereqStatus: "met",
        note: hasEcon47403
          ? "Note: You also have ECON 47403 (Econometrics) planned. Per the 4+1 plan, Fall take ECON 57403 (counts for ECON 47403) and Spring take ECON 57503 (counts for ECON 47503). Both are not typically needed in the same semester."
          : "Can substitute for ECON 4743 in the Business Economics concentration.",
        badges: [],
      }
    }
    return {
      code: c.code, name: c.name, status: "fail",
      countsToward: "Economics Major \u2014 Required (alternative to ECON 4743)",
      prereqs: "Not met \u2014 Requires MATH 22003 and BUSI 10303.",
      prereqStatus: "notmet",
      note: "Missing prerequisites.",
      badges: ["cannot register"],
    }
  }

  // ----- ECON 44203 (Behavioral Economics) -----
  if (c.code === "ECON 44203") {
    const hasEcon30303 = hasCompleted("ECON 30303") || inProgressFall2026.has("ECON 30303")
    return {
      code: c.code, name: c.name,
      status: hasEcon30303 ? (hasCompleted("ECON 30303") ? "pass" : "conditional") : "fail",
      countsToward: "Economics Major (ECON Elective) + Jr/Sr Business Elective + Behavioral Econ Minor",
      prereqs: hasCompleted("ECON 30303")
        ? "Met \u2014 ECON 30303 (\u2713)"
        : hasEcon30303
          ? "Conditional \u2014 ECON 30303 in progress Fall 2026. Must complete with C or better."
          : "Not met \u2014 Requires ECON 30303.",
      prereqStatus: hasCompleted("ECON 30303") ? "met" : hasEcon30303 ? "conditional" : "notmet",
      note: "Counts toward ECON elective hours and the Behavioral Economics minor if pursued.",
      badges: hasEcon30303 && !hasCompleted("ECON 30303") ? ["conditional"] : hasEcon30303 ? [] : ["cannot register"],
    }
  }

  // ----- FINN 43203 (Financial Data Analytics I) -----
  if (c.code === "FINN 43203") {
    const hasFinn30103 = hasCompleted("FINN 30103") || plannedCodes.has("FINN 30103")
    return {
      code: c.code, name: c.name,
      status: hasFinn30103 ? (plannedCodes.has("FINN 30103") ? "conditional" : "pass") : "fail",
      countsToward: "Jr/Sr Business Elective",
      prereqs: hasCompleted("FINN 30103")
        ? "Met \u2014 FINN 30103 (\u2713)"
        : hasFinn30103
          ? "Conditional \u2014 FINN 30103 co-enrolled. Must complete first."
          : "Not met \u2014 Requires FINN 30103 (Financial Analysis).",
      prereqStatus: hasCompleted("FINN 30103") ? "met" : hasFinn30103 ? "conditional" : "notmet",
      note: hasFinn30103 ? "Expands your analytics skillset." : "Take FINN 30103 first.",
      badges: !hasFinn30103 ? ["cannot register"] : plannedCodes.has("FINN 30103") ? ["conditional"] : [],
    }
  }

  // ============================================================
  // GENERIC CATALOG-DRIVEN VALIDATION
  // ============================================================
  if (entry) {
    const prereqResults: { code: string; met: boolean; grade: string; ip: boolean; planned: boolean }[] = []
    let allMet = true
    let anyConditional = false

    for (const pCode of entry.prereqs) {
      const completed = hasCompleted(pCode)
      const ip = inProgressFall2026.has(pCode)
      const planned = plannedCodes.has(pCode)
      const grade = completed ? gradeOf(pCode) : ip ? "IP" : ""
      const met = completed && isGradeAtLeast(grade, "C")
      prereqResults.push({ code: pCode, met, grade, ip, planned })
      if (!met && !ip && !planned) allMet = false
      if (ip || (planned && !completed)) anyConditional = true
    }

    // Check corequisites
    if (entry.coreqs) {
      for (const cCode of entry.coreqs) {
        const completed = hasCompleted(cCode)
        const ip = inProgressFall2026.has(cCode)
        const planned = plannedCodes.has(cCode)
        if (!completed && !ip && !planned) {
          allMet = false
          prereqResults.push({ code: cCode, met: false, grade: "", ip: false, planned: false })
        } else if (!completed) {
          anyConditional = true
        }
      }
    }

    // Check junior standing if required
    let standingMet = true
    if (entry.additionalReqs?.includes("Junior standing")) {
      standingMet = STUDENT.classification === "Junior" || STUDENT.classification === "Senior"
    }
    if (entry.additionalReqs?.includes("Senior standing")) {
      standingMet = STUDENT.classification === "Senior"
    }
    if (entry.additionalReqs?.includes("Pre-business core completed")) {
      standingMet = standingMet // Jordan has completed pre-business core
    }

    const prereqStr = prereqResults.map(p => {
      if (p.met) return `${p.code} (\u2713 ${p.grade})`
      if (p.ip) return `${p.code} (in progress)`
      if (p.planned) return `${p.code} (co-enrolled)`
      return `${p.code} (\u2717 not taken)`
    }).join(", ")

    const status: CourseStatus = !standingMet || !allMet ? (anyConditional && allMet !== false ? "conditional" : allMet ? (anyConditional ? "conditional" : "pass") : "fail") : anyConditional ? "conditional" : "pass"
    const prereqStatus: PrereqStatus = status === "pass" ? "met" : status === "conditional" ? "conditional" : "notmet"

    const badges: string[] = []
    if (status === "fail") badges.push("cannot register")
    if (status === "conditional") badges.push("conditional")
    if (!standingMet) badges.push("standing req")

    return {
      code: c.code, name: c.name, status,
      countsToward: entry.countsToward.join(" + "),
      prereqs: prereqResults.length > 0
        ? (status === "pass" ? "Met" : status === "conditional" ? "Conditional" : "Not met") + " \u2014 " + prereqStr + (entry.prereqNote ? ". " + entry.prereqNote : "")
        : entry.prereqNote || "No specific prerequisites.",
      prereqStatus,
      note: status === "pass"
        ? "On track. " + (entry.countsToward.length > 1 ? "Counts toward multiple requirements." : "")
        : status === "conditional"
          ? "Conditional on in-progress or co-enrolled courses completing with required grades."
          : "Prerequisite(s) not satisfied. Cannot register.",
      badges,
    }
  }

  // ============================================================
  // FALLBACK for courses not in catalog
  // ============================================================
  return {
    code: c.code, name: c.name, status: "pass",
    countsToward: c.cat,
    prereqs: "Not in detailed prerequisite database \u2014 assumed met.",
    prereqStatus: "met",
    note: "No issues detected. Verify with your advisor.",
    badges: [],
  }
}

/* ------------------------------------------------------------------ */
/*  Credit-hour load validation                                        */
/* ------------------------------------------------------------------ */

function evaluateLoad(totalHrs: number): LoadFlag[] {
  const flags: LoadFlag[] = []

  if (totalHrs < STANDARD_MIN) {
    flags.push({
      type: "info",
      message: `You are planning ${totalHrs} credit hours, below the standard full-time minimum of ${STANDARD_MIN} hours. This may affect financial aid eligibility or graduation timeline. Summer terms allow up to 6 credit hours.`,
    })
  } else if (totalHrs <= STANDARD_MAX) {
    flags.push({
      type: "info",
      message: `${totalHrs} credit hours is a standard semester load (${STANDARD_MIN}\u2013${STANDARD_MAX} hrs). You are within normal limits.`,
    })
  } else if (totalHrs === GPA_275_MAX) {
    if (STUDENT.prevSemesterGpa >= 2.75) {
      flags.push({
        type: "warning",
        message: `${totalHrs} credit hours exceeds the standard ${STANDARD_MAX}-hour limit. Because your previous semester GPA (${STUDENT.prevSemesterGpa}) is at or above 2.75, you are eligible for up to ${GPA_275_MAX} hours with advisor approval. This is the maximum for non-seniors.`,
      })
    } else {
      flags.push({
        type: "error",
        message: `${totalHrs} credit hours exceeds the standard ${STANDARD_MAX}-hour limit. Your previous semester GPA (${STUDENT.prevSemesterGpa}) is below 2.75, so the maximum is ${STANDARD_MAX} hours. You must remove a course or request a special exception from the dean.`,
      })
    }
  } else if (totalHrs > GPA_275_MAX && totalHrs <= SENIOR_FINAL_MAX) {
    if (STUDENT.isSeniorFinalSemester) {
      flags.push({
        type: "warning",
        message: `${totalHrs} credit hours exceeds the typical maximum. As a senior in your final semester, you may take up to ${SENIOR_FINAL_MAX} hours if necessary for graduation, subject to advisor and dean approval.`,
      })
    } else {
      flags.push({
        type: "error",
        message: `${totalHrs} credit hours exceeds the maximum allowed (${GPA_275_MAX} hrs for students with 2.75+ GPA). As a ${STUDENT.classification}, you are not eligible for the senior final-semester exception (18-19 hrs). Remove at least ${totalHrs - GPA_275_MAX} credit hour(s).`,
      })
    }
  } else if (totalHrs > SENIOR_FINAL_MAX) {
    flags.push({
      type: "error",
      message: `${totalHrs} credit hours far exceeds the absolute maximum of ${SENIOR_FINAL_MAX} hours (only available to graduating seniors in their final semester). You must reduce your course load by ${totalHrs - SENIOR_FINAL_MAX} hours.`,
    })
  }

  return flags
}

/**
 * Check for 3+ courses sharing the same prefix in a list.
 * Returns flags for every prefix that appears 3+ times.
 */
function checkPrefixConcentration(
  courses: { code: string }[],
  semLabel: string,
): LoadFlag[] {
  const counts = new Map<string, number>()
  for (const c of courses) {
    const prefix = c.code.split(" ")[0]
    if (!prefix || prefix.includes("Elective") || prefix === "Free" || prefix === "Additional" || prefix === "Gen" || prefix === "Jr/Sr") continue
    counts.set(prefix, (counts.get(prefix) || 0) + 1)
  }
  const flags: LoadFlag[] = []
  for (const [prefix, count] of counts) {
    if (count >= 3) {
      flags.push({
        type: "warning",
        message: `${count} ${prefix} courses in ${semLabel} is a heavy concentration. Consider spreading ${prefix} courses across semesters for a more balanced workload.`,
      })
    }
  }
  return flags
}

/* ------------------------------------------------------------------ */
/*  Degree progress calculator                                         */
/* ------------------------------------------------------------------ */

function computeDegreeProgress(planned: Course[], courseResults: CourseResult[]): DegreeItem[] {
  const plannedCodes = new Set(planned.map(c => c.code))
  const totalPlannedHrs = planned.reduce((s, c) => s + c.hrs, 0)
  const hrsAfter = STUDENT.hoursCompleted + STUDENT.hoursInProgress + totalPlannedHrs

  /* helper to build course entry */
  const entry = (code: string, name: string, hrs: number, note?: string): DegreeCourseEntry => {
    if (completedCourses.has(code)) return { code, name, hrs, status: "completed", grade: completedRecord[code] }
    if (inProgressFall2026.has(code)) return { code, name, hrs, status: "in-progress", note: "Fall 2026" }
    if (plannedCodes.has(code)) return { code, name, hrs, status: "planned", note: "Spring 2027" }
    return { code, name, hrs, status: "remaining", note }
  }

  // ---- Pre-Business Core (34 hrs) ----
  const preBusinessCoreCourses: DegreeCourseEntry[] = [
    entry("ENGL 10103", "Composition I", 3),
    entry("ENGL 10203", "Composition II", 3),
    entry("MATH 20503", "Finite Mathematics", 3),
    entry("MATH 22003", "Survey of Calculus", 3),
    entry("ECON 21003", "Principles of Macroeconomics", 3),
    entry("ECON 22003", "Principles of Microeconomics", 3),
    entry("SPCH 10003", "Public Speaking", 3),
    entry("ISYS 11203", "Business Application Knowledge", 3),
    entry("BUSI 11101", "Freshman Business Connections", 1),
    entry("BUSI 10303", "Data Analysis & Interpretation", 3),
    entry("ISYS 20303", "Business Programming", 3),
    entry("ACCT 20103", "Accounting Principles I", 3),
    entry("ACCT 20203", "Accounting Principles II", 3),
  ]
  const pbcCompleted = preBusinessCoreCourses.filter(c => c.status === "completed").reduce((s, c) => s + c.hrs, 0)
  const pbcTotal = 37 // per worksheet
  const pbcAllDone = pbcCompleted >= pbcTotal

  // ---- Business Core ----
  const businessCoreCourses: DegreeCourseEntry[] = [
    entry("BLAW 20003", "Legal Environment of Business", 3),
    entry("ISYS 21003", "Business Information Systems", 3),
    entry("SCMT 21003", "Integrated Supply Chain Mgmt", 3),
    entry("MGMT 21003", "Managing People & Organizations", 3),
    entry("FINN 20403", "Principles of Finance", 3),
    entry("MKTG 34303", "Intro to Marketing", 3),
    entry("SEVI 30103", "Strategic Management", 3),
  ]
  const bcCompleted = businessCoreCourses.filter(c => c.status === "completed" || c.status === "in-progress").reduce((s, c) => s + c.hrs, 0)
  const bcPlanned = businessCoreCourses.filter(c => c.status === "planned").reduce((s, c) => s + c.hrs, 0)
  const bcAfter = bcCompleted + bcPlanned

  // ---- Economics Major ----
  const econRequiredCourses: DegreeCourseEntry[] = [
    entry("ECON 30303", "Microeconomic Theory", 3),
    entry("ECON 31303", "Macroeconomic Theory", 3),
    entry("ECON 43303", "Economics of Organizations", 3),
    entry("ECON 47403", "Intro to Econometrics", 4, "or ECON 47503 Forecasting"),
  ]
  const econElecAllOptions = [
    { code: "ECON 34303", name: "Money & Banking", hrs: 3 },
    { code: "ECON 47603", name: "Economic Analytics", hrs: 3 },
    { code: "ECON 44203", name: "Behavioral Economics", hrs: 3 },
    { code: "ECON 44303", name: "Experimental Economics", hrs: 3 },
    { code: "ECON 35303", name: "Labor Economics", hrs: 3 },
    { code: "ECON 31403", name: "Econ of Poverty & Inequality", hrs: 3 },
    { code: "ECON 33303", name: "Public Economics", hrs: 3 },
    { code: "ECON 46303", name: "International Trade", hrs: 3 },
    { code: "ECON 46403", name: "Intl Macro & Finance", hrs: 3 },
    { code: "ECON 38403", name: "Econ of Developing World", hrs: 3 },
    { code: "ECON 38503", name: "Emerging Markets", hrs: 3 },
    { code: "ECON 47503", name: "Forecasting", hrs: 3 },
  ]
  const econElecCourses: DegreeCourseEntry[] = econElecAllOptions
    .filter(c => completedCourses.has(c.code) || inProgressFall2026.has(c.code) || plannedCodes.has(c.code))
    .map(c => entry(c.code, c.name, c.hrs))
  // add placeholders for remaining elective slots
  const econElecHrsDone = econElecCourses.reduce((s, c) => s + c.hrs, 0)
  const econElecNeeded = Math.max(0, 9 - econElecHrsDone)
  for (let i = 0; i < Math.ceil(econElecNeeded / 3); i++) {
    econElecCourses.push({ code: `ECON Elective ${i + 1}`, name: "ECON 3000/4000-level", hrs: 3, status: "remaining", note: "Choose from ECON elective options" })
  }

  const econAllCourses = [...econRequiredCourses, ...econElecCourses]
  const econDone = econAllCourses.filter(c => c.status === "completed" || c.status === "in-progress").reduce((s, c) => s + c.hrs, 0)
  const econPlanned = econAllCourses.filter(c => c.status === "planned").reduce((s, c) => s + c.hrs, 0)

  // ---- Finance Minor ----
  const finRequiredCodes = [
    { code: "FINN 30103", name: "Financial Analysis", hrs: 3 },
  ]
  const finElecOptions = [
    { code: "FINN 30603", name: "Investments", hrs: 3 },
    { code: "FINN 31003", name: "Financial Modeling", hrs: 3 },
    { code: "FINN 36003", name: "Corporate Finance", hrs: 3 },
    { code: "FINN 31303", name: "Commercial Banking", hrs: 3 },
    { code: "FINN 37003", name: "International Finance", hrs: 3 },
    { code: "FINN 30003", name: "Personal Financial Mgmt", hrs: 3 },
    { code: "FINN 36203", name: "Risk Management", hrs: 3 },
  ]
  const finCourses: DegreeCourseEntry[] = [
    ...finRequiredCodes.map(c => entry(c.code, c.name, c.hrs)),
    ...finElecOptions
      .filter(c => completedCourses.has(c.code) || inProgressFall2026.has(c.code) || plannedCodes.has(c.code))
      .map(c => entry(c.code, c.name, c.hrs)),
  ]
  const finDone = finCourses.filter(c => c.status === "completed" || c.status === "in-progress" || c.status === "planned").reduce((s, c) => s + c.hrs, 0)
  const finSlotsNeeded = Math.max(0, Math.ceil((15 - finDone) / 3))
  for (let i = 0; i < finSlotsNeeded; i++) {
    finCourses.push({ code: `FINN Elective ${i + 1}`, name: "Finance minor elective", hrs: 3, status: "remaining", note: "Choose from FINN options" })
  }
  const finMinorHrs = finCourses.filter(c => c.status === "completed" || c.status === "in-progress" || c.status === "planned").reduce((s, c) => s + c.hrs, 0)

  // ---- Jr/Sr Business Electives ----
  const majorOrCoreCodes = new Set([
    "ECON 30303", "ECON 31303", "ECON 47403", "ECON 43303", "ECON 47503",
    "SEVI 30103", "MKTG 34303",
  ])
  const jrSrPrefixes = ["ACCT", "BLAW", "ECON", "FINN", "ISYS", "MGMT", "MKTG", "SCMT", "SEVI", "BUSI"]
  const jrSrExcluded = new Set(["ECON 30503", "ECON 30603", "MGMT 35603"])
  const jrSrCourses: DegreeCourseEntry[] = planned
    .filter(c => {
      const num = parseInt(c.code.split(" ")[1])
      const prefix = c.code.split(" ")[0]
      return num >= 30000 && jrSrPrefixes.includes(prefix) &&
        !majorOrCoreCodes.has(c.code) && !jrSrExcluded.has(c.code)
    })
    .map(c => entry(c.code, c.name, c.hrs))
  const jrSrHrs = jrSrCourses.reduce((s, c) => s + c.hrs, 0)
  const jrSrSlotsNeeded = Math.max(0, Math.ceil((12 - jrSrHrs) / 3))
  for (let i = 0; i < jrSrSlotsNeeded; i++) {
    jrSrCourses.push({ code: `Jr/Sr Elective ${i + 1}`, name: "3000/4000-level business course", hrs: 3, status: "remaining", note: "Finance minor courses count here" })
  }

  // ---- State Minimum Core ----
  const stateMinCourses: DegreeCourseEntry[] = [
    entry("GEOL 11103", "Physical Geology", 3),
    entry("GEOL 11101", "Physical Geology Lab", 1),
    entry("PSYC 20003", "General Psychology", 3),
    entry("ARHS 10003", "Art History Survey", 3),
    entry("PHIL 21003", "Intro to Philosophy", 3),
    entry("HIST 20003", "US History", 3),
  ]
  // Science pair
  const sciCodes = ["ASTR 10003", "ASTR 10001", "ENSC 10003", "ENSC 10001", "PHYS 10103", "PHYS 10101"]
  const sciNames: Record<string, string> = {
    "ASTR 10003": "Survey of Astronomy", "ASTR 10001": "Astronomy Lab",
    "ENSC 10003": "Intro to Environmental Science", "ENSC 10001": "Environmental Science Lab",
    "PHYS 10103": "Physics in the Modern World", "PHYS 10101": "Physics Modern World Lab",
  }
  const sciHrs: Record<string, number> = {
    "ASTR 10003": 3, "ASTR 10001": 1, "ENSC 10003": 3, "ENSC 10001": 1, "PHYS 10103": 3, "PHYS 10101": 1,
  }
  let sciPlanned = false
  for (const sc of sciCodes) {
    if (plannedCodes.has(sc)) {
      stateMinCourses.push(entry(sc, sciNames[sc], sciHrs[sc]))
      sciPlanned = true
    }
  }
  if (!sciPlanned) {
    stateMinCourses.push({ code: "Science Lecture", name: "Natural Science lecture", hrs: 3, status: "remaining", note: "Choose: Astronomy, Enviro Sci, or Physics" })
    stateMinCourses.push({ code: "Science Lab", name: "Natural Science lab", hrs: 1, status: "remaining", note: "Matching lab for lecture" })
  }
  const stateMinDone = stateMinCourses.filter(c => c.status === "completed" || c.status === "in-progress").reduce((s, c) => s + c.hrs, 0)
  const stateMinPlanned = stateMinCourses.filter(c => c.status === "planned").reduce((s, c) => s + c.hrs, 0)

  // ---- General Electives ----
  const genElecCourses: DegreeCourseEntry[] = [
    entry("COMM 12003", "Intro to Communication", 3),
  ]
  const genElecAllOptions = [
    { code: "COMM 13003", name: "Interpersonal Communication", hrs: 3 },
    { code: "PSYC 21003", name: "Abnormal Psychology", hrs: 3 },
    { code: "SOCI 20003", name: "Intro to Sociology", hrs: 3 },
    { code: "PHIL 32003", name: "Business Ethics", hrs: 3 },
    { code: "GEOS 10003", name: "World Regional Geography", hrs: 3 },
    { code: "ANTH 10003", name: "Intro to Anthropology", hrs: 3 },
  ]
  for (const c of genElecAllOptions) {
    if (plannedCodes.has(c.code)) genElecCourses.push(entry(c.code, c.name, c.hrs))
  }
  const genDone = genElecCourses.filter(c => c.status === "completed" || c.status === "in-progress" || c.status === "planned").reduce((s, c) => s + c.hrs, 0)
  if (genDone < 6) {
    genElecCourses.push({ code: "Gen Elective", name: "General elective", hrs: 3, status: "remaining", note: "Any elective course" })
  }

  return [
    {
      label: "Total Credit Hours",
      detail: `Completed: ${STUDENT.hoursCompleted} + In Progress: ${STUDENT.hoursInProgress} + Planned: ${totalPlannedHrs} = ${hrsAfter} of 120 hours`,
      value: hrsAfter, total: 120, color: "bg-primary",
    },
    {
      label: "Pre-Business Core (37 hrs)",
      detail: pbcAllDone
        ? "Complete -- all pre-business courses finished with C or better. GPA requirement met."
        : `${pbcCompleted} of ${pbcTotal} hrs -- must complete all with C or better and 2.50 pre-business GPA`,
      value: pbcCompleted, total: pbcTotal,
      done: pbcAllDone, color: pbcAllDone ? "bg-emerald-500" : "bg-red-400",
      courses: preBusinessCoreCourses,
    },
    {
      label: "Business Core (21 hrs)",
      detail: bcAfter >= 21
        ? "Complete after this semester -- SEVI 30103 is the final course."
        : `${bcCompleted} of 21 hrs -- SEVI 30103 (Strategic Management) still needed`,
      value: bcAfter, total: 21,
      done: bcAfter >= 21, color: bcAfter >= 21 ? "bg-emerald-500" : "bg-amber-500",
      courses: businessCoreCourses,
    },
    {
      label: "Economics Major (24 hrs)",
      detail: `In Progress: ${econDone} hrs + Planned: ${econPlanned} hrs = ${econDone + econPlanned} of 24 required`,
      value: econDone + econPlanned, total: 24,
      color: (econDone + econPlanned) >= 18 ? "bg-primary" : "bg-amber-500",
      courses: econAllCourses,
    },
    {
      label: "Finance Minor (15 hrs)",
      detail: finMinorHrs > 0
        ? `${finMinorHrs} hrs planned -- getting started`
        : "0 of 15 hrs -- not started. FINN 30103 (required) is not in your plan.",
      value: finMinorHrs, total: 15,
      color: finMinorHrs > 0 ? "bg-amber-500" : "bg-red-400",
      courses: finCourses,
    },
    {
      label: "Jr/Sr Business Electives (12 hrs)",
      detail: jrSrHrs > 0
        ? `${jrSrHrs} hrs this semester -- finance minor courses count here too`
        : "0 of 12 hrs -- finance minor courses can count toward this",
      value: jrSrHrs, total: 12,
      color: jrSrHrs > 0 ? "bg-amber-500" : "bg-red-400",
      courses: jrSrCourses,
    },
    {
      label: "State Minimum Core (20 hrs)",
      detail: `${stateMinDone + stateMinPlanned} of 20 hrs${stateMinPlanned === 0 ? " -- still need Natural Science lecture + lab (4 hrs)" : ""}`,
      value: stateMinDone + stateMinPlanned, total: 20,
      color: (stateMinDone + stateMinPlanned) >= 20 ? "bg-emerald-500" : "bg-amber-500",
      courses: stateMinCourses,
    },
    {
      label: "General Electives (6 hrs)",
      detail: `${genDone} of 6 hrs. ${Math.max(0, 6 - genDone)} remaining.`,
      value: genDone, total: 6,
      color: genDone >= 6 ? "bg-emerald-500" : "bg-amber-500",
      courses: genElecCourses,
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Suggestion generator                                               */
/* ------------------------------------------------------------------ */

function generateSuggestion(
  planned: Course[],
  courseResults: CourseResult[],
  degreeProgress: DegreeItem[],
  timeline: SemesterPlan[],
  loadFlags: LoadFlag[],
): { title: string; body: string[]; severity: SuggestionSeverity } | null {
  const plannedCodes = new Set(planned.map(c => c.code))
  const hasFinn30603 = plannedCodes.has("FINN 30603")
  const hasFinn30103 = plannedCodes.has("FINN 30103")
  const finn30603Fail = courseResults.find(r => r.code === "FINN 30603" && r.status === "fail")
  const hasEcon43303 = plannedCodes.has("ECON 43303")
  const hasEcon47403 = plannedCodes.has("ECON 47403")
  // Only flag ECON 43303 + ECON 47403 concurrency if BOTH are in the same Spring 2027 plan
  const econ43303Concurrent47403 = hasEcon43303 && hasEcon47403
  const totalHrs = planned.reduce((s, c) => s + c.hrs, 0)
  const failCount = courseResults.filter(r => r.status === "fail").length
  const conditionalCount = courseResults.filter(r => r.status === "conditional").length

  // Gather issues from all sections
  const issues: { severity: SuggestionSeverity; message: string }[] = []

  // From Course-by-Course
  if (failCount > 0) {
    issues.push({ severity: "red", message: `${failCount} course(s) have unmet prerequisites and cannot be registered for.` })
  }
  if (conditionalCount > 0) {
    issues.push({ severity: "yellow", message: `${conditionalCount} course(s) have conditional prerequisites (depends on completing in-progress courses with C or better).` })
  }

  // From Load Assessment
  for (const flag of loadFlags) {
    if (flag.type === "error") issues.push({ severity: "red", message: flag.message })
    if (flag.type === "warning") issues.push({ severity: "yellow", message: `Course load: ${flag.message}` })
  }

  // From Degree Progress
  const finProgress = degreeProgress.find(d => d.label.includes("Finance Minor"))
  if (finProgress && finProgress.value === 0) {
    issues.push({ severity: "red", message: "Finance minor has 0 hours -- you have not started. With only 3 semesters remaining, you must begin FINN 30103 immediately to have any chance of completing the minor on time." })
  } else if (finProgress && finProgress.value <= 3 && !hasFinn30103) {
    issues.push({ severity: "yellow", message: "Finance minor progress is minimal. FINN 30103 is the gateway course -- without it, most upper-level finance courses are locked." })
  }

  const sciProgress = degreeProgress.find(d => d.label.includes("State Minimum"))
  if (sciProgress && sciProgress.value < 20) {
    const sciRemaining = 20 - sciProgress.value
    if (sciRemaining > 0) {
      issues.push({ severity: "yellow", message: `Still need ${sciRemaining} hours of State Minimum Core (Natural Science). Pushing this to senior year limits scheduling flexibility.` })
    }
  }

  // From Timeline
  for (const sem of timeline) {
    for (const flag of sem.flags) {
      if (flag.type === "error" && !issues.some(i => i.message === flag.message)) {
        issues.push({ severity: "red", message: `${sem.label}: ${flag.message}` })
      }
      if (flag.type === "warning" && !issues.some(i => i.message === `${sem.label}: ${flag.message}`)) {
        issues.push({ severity: "yellow", message: `${sem.label}: ${flag.message}` })
      }
    }
  }

  // From Load Assessment (includes prefix concentration for Spring 2027)
  for (const flag of loadFlags) {
    if (flag.type === "warning" && flag.message.includes("concentration") && !issues.some(i => i.message === flag.message)) {
      issues.push({ severity: "yellow", message: flag.message })
    }
  }

  // Check for bottleneck: pushing FINN 30103 creates a cascading problem
  if (!hasFinn30103 && !completedCourses.has("FINN 30103") && !inProgressFall2026.has("FINN 30103")) {
    if (hasFinn30603) {
      issues.push({ severity: "red", message: "FINN 30603 requires FINN 30103 as a co-requisite. You cannot register for Investments without Financial Analysis." })
    }
  }

  // Determine overall severity
  const overallSeverity: SuggestionSeverity = issues.some(i => i.severity === "red")
    ? "red"
    : issues.some(i => i.severity === "yellow")
      ? "yellow"
      : "green"

  // ---- Build the suggestion ----
  if (failCount > 0 && hasFinn30603 && !hasFinn30103 && finn30603Fail) {
    const body = [
      "FINN 30103 (Financial Analysis) is required for your Finance minor and is the prerequisite/co-requisite for FINN 30603 (Investments). Replace FINN 30603 with FINN 30103 this semester.",
      "FINN 30103 only requires FINN 20403 (completed with a B) and unlocks FINN 30603, FINN 36003, FINN 31003, and FINN 43203 for future semesters.",
      "You haven\u2019t started your 15-hour Finance minor yet -- with 3 semesters left, you need to begin now to complete it on time.",
    ]
    if (econ43303Concurrent47403) {
      body.push("Consider deferring ECON 43303 to Fall 2027 -- taking it alongside ECON 47403 (4 hrs) is a heavy analytical load. That frees a slot for Natural Science (4 hrs, State Min Core), which gets harder to schedule in senior year.")
    }
    return { title: "Critical: Replace FINN 30603 with FINN 30103 this semester.", body, severity: "red" }
  }

  if (failCount > 0) {
    const body = [
      `${failCount} course(s) have unmet prerequisites. You will not be able to register for these until the issues are resolved.`,
      "Review each flagged course above and swap it for one where all prerequisites are met.",
    ]
    if (!hasFinn30103 && !completedCourses.has("FINN 30103")) {
      body.push("Prioritize adding FINN 30103 to start your Finance minor -- it\u2019s the gateway that unlocks all upper-level finance courses.")
    }
    return { title: "Action Required: Prerequisite issues must be resolved before registering.", body, severity: "red" }
  }

  // Yellow scenarios
  if (overallSeverity === "yellow") {
    const body: string[] = []
    if (hasFinn30103 && !hasFinn30603) {
      body.push("FINN 30103 unlocks FINN 30603, FINN 36003, FINN 31003, and FINN 43203 for Fall 2027. You still need 12 more Finance minor hours across 2 semesters -- plan on 2 FINN courses per semester.")
    }
    if (econ43303Concurrent47403) {
      body.push("ECON 43303 and ECON 47403 (4 hrs) are both in your Spring 2027 plan -- that\u2019s a heavy analytical load. The 8-semester plan places ECON 43303 in Fall Year 4. Consider deferring one to balance semesters.")
    }
    if (sciProgress && sciProgress.value < 20) {
      body.push("Don\u2019t forget: Natural Science lecture + lab (4 hrs) is still needed for State Minimum Core. Scheduling this sooner gives you more flexibility later.")
    }
    if (totalHrs > STANDARD_MAX) {
      body.push(`Your ${totalHrs}-hour plan exceeds the standard 17-hour limit. Make sure you have advisor approval.`)
    }
    if (body.length === 0) {
      body.push("Your plan has some minor concerns (see conditional flags above) but can proceed if in-progress courses are completed successfully.")
    }
    return { title: "Caution: A few items need attention, but you can move forward.", body, severity: "yellow" }
  }

  // Green -- all clear
  if (planned.length > 0) {
    const body = [
      "All prerequisites are met and your course load is within normal limits. Your plan advances your Economics major, Business Core, and degree requirements effectively.",
    ]
    if (hasFinn30103) {
      body.push("Starting FINN 30103 this semester puts your Finance minor on a solid trajectory. Plan on 2 finance courses per semester for the next 2 semesters to complete it.")
    }
    if (hasFinn30103 && hasFinn30603) {
      body.push("Both FINN 30103 and FINN 30603 count toward your Finance minor and Jr/Sr business elective hours -- that\u2019s efficient double-duty progress.")
    }
    const remaining = 120 - (STUDENT.hoursCompleted + STUDENT.hoursInProgress + totalHrs)
    if (remaining > 0) {
      body.push(`After this semester, you\u2019ll have ${remaining} credit hours remaining across Fall 2027 and Spring 2028 (~${Math.ceil(remaining / 2)} hrs/semester). Very manageable.`)
    }
    return { title: "Looks good -- this plan keeps you on track for Spring 2028 graduation.", body, severity: "green" }
  }

  return null
}

/* ------------------------------------------------------------------ */
/*  Graduation timeline                                                */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Timeline helper types                                               */
/* ------------------------------------------------------------------ */

interface TimelineCourse {
  code: string
  name: string
  hrs: number
  note?: string
  /** prerequisite codes that must be completed before this course */
  prereqsNeeded: string[]
  /** co-requisite codes that can be taken same semester */
  coreqCodes: string[]
  /** which requirement bucket this satisfies */
  bucket: string
}

/**
 * Build the best-case semester-by-semester path to graduation.
 *
 * Strategy:
 * 1. Gather every remaining course the student still needs (after completed + IP + planned Spring 2027).
 * 2. Model two future semesters (Fall 2027, Spring 2028).
 * 3. Try multiple scheduling permutations -- shift courses between semesters,
 *    then score each arrangement by counting errors/warnings (overloads,
 *    concentration imbalances, prerequisite violations).
 * 4. Return the arrangement with the lowest penalty score.
 */
function computeTimeline(planned: Course[]): SemesterPlan[] {
  const plannedCodes = new Set(planned.map(c => c.code))

  /* --- Spring 2027 (locked -- this is the student's current plan) --- */
  const spring27: SemesterPlan = {
    label: "Spring 2027 (Your Current Plan)",
    courses: planned.map(c => ({ code: c.code, name: c.name, hrs: c.hrs })),
    totalHrs: planned.reduce((s, c) => s + c.hrs, 0),
    flags: [],
  }
  if (spring27.totalHrs > 17) {
    spring27.flags.push({ type: "warning", message: `${spring27.totalHrs} hours exceeds the standard 17-hour limit. Requires GPA 2.75+ and advisor approval.` })
  } else if (spring27.totalHrs > 0 && spring27.totalHrs < 12) {
    spring27.flags.push({ type: "info", message: `Only ${spring27.totalHrs} hours -- below full-time (12 hrs). May affect financial aid.` })
  }
  // Prefix concentration check for current plan
  const spring27PrefixCounts = new Map<string, number>()
  for (const c of planned) {
    const prefix = c.code.split(" ")[0]
    spring27PrefixCounts.set(prefix, (spring27PrefixCounts.get(prefix) || 0) + 1)
  }
  for (const [prefix, count] of spring27PrefixCounts) {
    if (count >= 3) {
      spring27.flags.push({ type: "warning", message: `${count} ${prefix} courses this semester is a heavy concentration. Consider spreading ${prefix} courses across semesters for better balance.` })
    }
  }

  /* --- Build "done after Spring 2027" set (assumes all pass) --- */
  const doneAfterSpring27 = new Set([...completedCourses, ...inProgressFall2026, ...plannedCodes])

  /* --- Collect every remaining course needed for all degree requirements --- */
  const remaining: TimelineCourse[] = []
  const alreadyAdded = new Set<string>()

  function addIfNeeded(code: string, name: string, hrs: number, bucket: string, note?: string) {
    if (doneAfterSpring27.has(code) || alreadyAdded.has(code)) return
    const cat = catalog[code]
    remaining.push({
      code, name, hrs,
      prereqsNeeded: cat?.prereqs?.filter(p => !doneAfterSpring27.has(p)) || [],
      coreqCodes: cat?.coreqs || [],
      bucket,
      note,
    })
    alreadyAdded.add(code)
  }

  // Business Core
  addIfNeeded("SEVI 30103", "Strategic Management", 3, "Business Core", "Capstone -- requires all business core courses completed")

  // Economics Major Required
  addIfNeeded("ECON 31303", "Macroeconomic Theory", 3, "Econ Required", "Core macro theory")
  addIfNeeded("ECON 43303", "Economics of Organizations", 3, "Econ Required", "Requires ECON 30303")
  addIfNeeded("ECON 47403", "Intro to Econometrics", 4, "Econ Required", "Core quantitative methods (4 hrs)")

  // Economics Electives -- need ~6 more hrs after ECON 34303 IP (3 hrs)
  const econElecIpHrs = inProgressFall2026.has("ECON 34303") ? 3 : 0
  const econElecFromPlanned = planned.filter(c => c.code.startsWith("ECON") && parseInt(c.code.split(" ")[1]) >= 30000 &&
    !["ECON 30303", "ECON 31303", "ECON 43303", "ECON 47403"].includes(c.code)).reduce((s, c) => s + c.hrs, 0)
  const econElecStillNeeded = Math.max(0, 9 - econElecIpHrs - econElecFromPlanned) // need 9 total, have IP + planned
  const econElecPool = ["ECON 46303", "ECON 35303", "ECON 44203", "ECON 33303", "ECON 38403", "ECON 46403"]
  let econElecAdded = 0
  for (const ec of econElecPool) {
    if (econElecAdded * 3 >= econElecStillNeeded) break
    addIfNeeded(ec, catalog[ec]?.name || ec, 3, "Econ Elective")
    econElecAdded++
  }

  // Finance Minor -- 15 hrs needed, see what's been planned this semester
  const finSpring27Hrs = planned.filter(c => c.code.startsWith("FINN") && parseInt(c.code.split(" ")[1]) >= 30000).reduce((s, c) => s + c.hrs, 0)
  const finStillNeeded = Math.max(0, 15 - finSpring27Hrs)
  if (finStillNeeded > 0) {
    addIfNeeded("FINN 30103", "Financial Analysis", 3, "Finance Minor", "Gateway -- unlocks upper-level FINN")
    const finPool = ["FINN 30603", "FINN 36003", "FINN 31003", "FINN 31303", "FINN 37003", "FINN 30003", "FINN 36203"]
    let finAdded = (alreadyAdded.has("FINN 30103") ? 1 : 0)
    for (const fc of finPool) {
      if (finAdded * 3 >= finStillNeeded) break
      addIfNeeded(fc, catalog[fc]?.name || fc, 3, "Finance Minor")
      finAdded++
    }
  }

  // State Min Core -- Natural Science (4 hrs: lecture + lab)
  const sciInPlan = ["ASTR 10003", "ENSC 10003", "PHYS 10103"].some(c => plannedCodes.has(c))
  if (!sciInPlan) {
    remaining.push({ code: "ASTR 10003", name: "Survey of Astronomy", hrs: 3, prereqsNeeded: [], coreqCodes: ["ASTR 10001"], bucket: "State Min Core", note: "Natural Science lecture" })
    remaining.push({ code: "ASTR 10001", name: "Astronomy Lab", hrs: 1, prereqsNeeded: [], coreqCodes: ["ASTR 10003"], bucket: "State Min Core", note: "Matching lab" })
    alreadyAdded.add("ASTR 10003")
    alreadyAdded.add("ASTR 10001")
  }

  // General Electives -- need 3 more hrs (COMM 12003 already done = 3 of 6)
  const genElecPlanned = ["COMM 13003", "PSYC 21003", "SOCI 20003", "PHIL 32003", "GEOS 10003", "ANTH 10003"].some(c => plannedCodes.has(c))
  if (!genElecPlanned) {
    addIfNeeded("COMM 13003", "Interpersonal Communication", 3, "Gen Elective", "Builds on COMM 12003 (completed)")
  }

  // Jr/Sr Business Electives -- 12 hrs required. Finance minor courses count.
  // Count how many Jr/Sr hrs we already have from planned + the remaining finance courses we just added.
  const majorOrCoreCodes = new Set(["ECON 30303", "ECON 31303", "ECON 47403", "ECON 43303", "ECON 47503", "SEVI 30103", "MKTG 34303"])
  const jrSrPrefixes = new Set(["ACCT", "BLAW", "ECON", "FINN", "ISYS", "MGMT", "MKTG", "SCMT", "SEVI", "BUSI"])
  const jrSrExcluded = new Set(["ECON 30503", "ECON 30603", "MGMT 35603"])

  function isJrSr(code: string, hrs: number): boolean {
    const [prefix, numStr] = code.split(" ")
    const num = parseInt(numStr)
    return num >= 30000 && jrSrPrefixes.has(prefix) && !majorOrCoreCodes.has(code) && !jrSrExcluded.has(code)
  }

  const jrSrFromPlanned = planned.filter(c => isJrSr(c.code, c.hrs)).reduce((s, c) => s + c.hrs, 0)
  const jrSrFromRemaining = remaining.filter(c => isJrSr(c.code, c.hrs)).reduce((s, c) => s + c.hrs, 0)
  const jrSrTotalProjected = jrSrFromPlanned + jrSrFromRemaining
  const jrSrGap = Math.max(0, 12 - jrSrTotalProjected)

  // If there's a gap, add additional Jr/Sr courses
  if (jrSrGap > 0) {
    const extraJrSr = ["MGMT 42503", "ISYS 41903", "BLAW 30303", "MKTG 38303"]
    let jrSrFilled = 0
    for (const jc of extraJrSr) {
      if (jrSrFilled >= jrSrGap) break
      addIfNeeded(jc, catalog[jc]?.name || jc, 3, "Jr/Sr Elective")
      jrSrFilled += 3
    }
  }

  // Check total hours to reach 120 -- assume electives are 3-hr courses
  const hrsAfterSpring27 = STUDENT.hoursCompleted + STUDENT.hoursInProgress + spring27.totalHrs
  const remainingTotalHrs = remaining.reduce((s, c) => s + c.hrs, 0)
  const projectedTotal = hrsAfterSpring27 + remainingTotalHrs
  const totalGap = Math.max(0, 120 - projectedTotal)
  if (totalGap > 0) {
    const electiveCount = Math.ceil(totalGap / 3)
    for (let i = 0; i < electiveCount; i++) {
      remaining.push({ code: `Free Elective${electiveCount > 1 ? ` ${i + 1}` : ""}`, name: "Additional elective", hrs: 3, prereqsNeeded: [], coreqCodes: [], bucket: "Total Hours", note: "3-hr elective to reach 120 total hours" })
    }
  }

  /* --------------------------------------------------------------- */
  /*  Schedule optimizer: try permutations and pick best arrangement  */
  /* --------------------------------------------------------------- */

  type Slot = { code: string; name: string; hrs: number; note?: string }

  /** Can a course be placed in a semester given which courses will be done before it? */
  function canPlace(course: TimelineCourse, doneBeforeSem: Set<string>, sameSem: Set<string>): boolean {
    for (const p of course.prereqsNeeded) {
      if (!doneBeforeSem.has(p)) return false
    }
    for (const co of course.coreqCodes) {
      if (!doneBeforeSem.has(co) && !sameSem.has(co) && !alreadyAdded.has(co)) { /* ok if co isn't needed */ }
    }
    return true
  }

  /** Score a 2-semester arrangement: lower is better */
  function scorePlan(fall: Slot[], spring: Slot[]): { score: number; flags: { sem: number; type: "info" | "warning" | "error"; message: string }[] } {
    const flags: { sem: number; type: "info" | "warning" | "error"; message: string }[] = []
    let score = 0

    const fallHrs = fall.reduce((s, c) => s + c.hrs, 0)
    const springHrs = spring.reduce((s, c) => s + c.hrs, 0)

    // Overload checks -- PROPORTIONAL penalty so moving one course always helps
    if (fallHrs > 19) { score += 50 + (fallHrs - 19) * 10; flags.push({ sem: 0, type: "error", message: `${fallHrs} hours exceeds the absolute 19-hour maximum. This schedule is not feasible.` }) }
    else if (fallHrs > 17) { score += 10 + (fallHrs - 17) * 3; flags.push({ sem: 0, type: "warning", message: `${fallHrs} hours is above the standard 17-hour limit. Requires GPA 2.75+ and advisor approval.` }) }

    if (springHrs > 19) { score += 50 + (springHrs - 19) * 10; flags.push({ sem: 1, type: "error", message: `${springHrs} hours exceeds the absolute 19-hour maximum. This schedule is not feasible.` }) }
    else if (springHrs > 17) { score += 5 + (springHrs - 17) * 2; flags.push({ sem: 1, type: "warning", message: `${springHrs} hours in final semester is above standard limit. Seniors may take up to 19 hrs with dean approval.` }) }

    // Underload checks
    if (fallHrs > 0 && fallHrs < 12) { score += 3 + (12 - fallHrs); flags.push({ sem: 0, type: "info", message: `Only ${fallHrs} hours -- below full-time (12 hrs). May affect financial aid.` }) }
    if (springHrs > 0 && springHrs < 12) { score += 3 + (12 - springHrs); flags.push({ sem: 1, type: "info", message: `Only ${springHrs} hours -- below full-time (12 hrs). May affect financial aid.` }) }

    // Balance penalty -- proportional to imbalance
    const diff = Math.abs(fallHrs - springHrs)
    score += diff  // every hour of imbalance costs 1 point
    if (diff > 4) { flags.push({ sem: fallHrs > springHrs ? 0 : 1, type: "info", message: `Semesters are unbalanced (${fallHrs} vs ${springHrs} hrs). Consider evening out the load.` }) }

    // Prefix concentration: flag 3+ courses of same type in either semester
    for (const [semIdx, semCourses] of [[0, fall], [1, spring]] as [number, Slot[]][]) {
      const prefixCounts = new Map<string, number>()
      for (const c of semCourses) {
        const prefix = c.code.split(" ")[0]
        if (!prefix || prefix.includes("Elective") || prefix === "Free" || prefix === "Additional" || prefix === "Gen" || prefix === "Jr/Sr") continue
        prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1)
      }
      for (const [prefix, count] of prefixCounts) {
        if (count >= 3) {
          score += 7
          const semName = semIdx === 0 ? "Fall 2027" : "Spring 2028"
          flags.push({ sem: semIdx, type: "warning", message: `${count} ${prefix} courses in ${semName} is a heavy concentration. Try to spread ${prefix} courses across semesters for better balance.` })
        }
      }
    }

    // FINN 30103 not taken until Spring 2028 creates cascading problem
    const finn30103InSpring = spring.some(c => c.code === "FINN 30103")
    if (finn30103InSpring) {
      score += 20
      flags.push({ sem: 1, type: "error", message: "FINN 30103 in your final semester means courses requiring it (FINN 30603, FINN 36003) cannot be completed. The Finance minor will not be finishable on time." })
    }

    return { score, flags }
  }

  /* -------------------------------------------------------------- */
  /*  Two-phase scheduling: assign then rebalance                   */
  /* -------------------------------------------------------------- */

  /**
   * Check if moving `code` from Fall to Spring would break any prerequisite chain.
   * Returns true if some Spring course needs `code` as a prereq AND `code`
   * wouldn't be done in time (i.e. code must stay in Fall so Spring can use it).
   *
   * Since moving `code` to Spring means it's taken SAME semester as those Spring
   * courses, it wouldn't be a completed prereq. So if any Spring course lists
   * `code` in prereqsNeeded, we can't move it.
   */
  function springDependsOn(code: string, _fallCodes: Set<string>, springList: Slot[]): boolean {
    for (const rc of remaining) {
      if (springList.some(s => s.code === rc.code) && rc.prereqsNeeded.includes(code)) return true
    }
    return false
  }

  function buildAndRebalance(): { fall: Slot[]; spring: Slot[] } {
    const fall: Slot[] = []
    const spring: Slot[] = []
    const fallCodes = new Set<string>()
    const springCodes = new Set<string>()
    const doneAfterFall = new Set(doneAfterSpring27)

    // Sort: courses with no prereqs first, then by bucket priority
    const bucketPriority: Record<string, number> = {
      "Business Core": 1, "Econ Required": 2, "Finance Minor": 3,
      "Econ Elective": 4, "Jr/Sr Elective": 5, "State Min Core": 6,
      "Gen Elective": 7, "Total Hours": 8,
    }
    const sorted = [...remaining].sort((a, b) => {
      const pa = bucketPriority[a.bucket] || 9
      const pb = bucketPriority[b.bucket] || 9
      if (a.prereqsNeeded.length !== b.prereqsNeeded.length) return a.prereqsNeeded.length - b.prereqsNeeded.length
      return pa - pb
    })

    // Phase 1: Initial assignment -- everything that CAN go to Fall goes to Fall,
    // everything else goes to Spring.
    const mustDefer: TimelineCourse[] = []
    for (const course of sorted) {
      if (canPlace(course, doneAfterSpring27, fallCodes)) {
        fall.push({ code: course.code, name: course.name, hrs: course.hrs, note: course.note })
        fallCodes.add(course.code)
        doneAfterFall.add(course.code)
      } else {
        mustDefer.push(course)
      }
    }
    for (const course of mustDefer) {
      if (canPlace(course, doneAfterFall, springCodes)) {
        spring.push({ code: course.code, name: course.name, hrs: course.hrs, note: course.note })
        springCodes.add(course.code)
      } else {
        // Truly unplaceable -- add to Spring with warning
        spring.push({ code: course.code, name: course.name, hrs: course.hrs, note: `${course.note || ""} (prereq may not be met)`.trim() })
        springCodes.add(course.code)
      }
    }

    // Enforce co-requisite pairs in same semester
    const coReqPairs: [string, string][] = [["ASTR 10003", "ASTR 10001"], ["ENSC 10003", "ENSC 10001"], ["PHYS 10103", "PHYS 10101"]]
    for (const [a, b] of coReqPairs) {
      const aFall = fall.some(c => c.code === a)
      const bSpring = spring.some(c => c.code === b)
      if (aFall && bSpring) {
        const idx = spring.findIndex(c => c.code === b)
        if (idx >= 0) { fall.push(spring[idx]); spring.splice(idx, 1); fallCodes.add(b); springCodes.delete(b) }
      }
      const aSpring = spring.some(c => c.code === a)
      const bFall = fall.some(c => c.code === b)
      if (aSpring && bFall) {
        const idx = fall.findIndex(c => c.code === b)
        if (idx >= 0) { spring.push(fall[idx]); fall.splice(idx, 1); springCodes.add(b); fallCodes.delete(b) }
      }
    }

    // Phase 2: Rebalance -- move courses from Fall to Spring to even out hours
    // and reduce prefix concentration.

    // Build co-req partner lookup: if a course has a co-req in the same semester,
    // they must move together.
    const coReqPartner = new Map<string, string>()
    for (const [a, b] of coReqPairs) {
      if (fallCodes.has(a) && fallCodes.has(b)) { coReqPartner.set(a, b); coReqPartner.set(b, a) }
    }

    // Never move FINN 30103 to Spring -- it's the gateway that must happen ASAP
    const neverMove = new Set(["FINN 30103"])

    // Iteratively move courses (or co-req pairs) from Fall -> Spring while it improves the score
    let improved = true
    while (improved) {
      improved = false
      const fallHrs = fall.reduce((s, c) => s + c.hrs, 0)
      const springHrs = spring.reduce((s, c) => s + c.hrs, 0)

      // Only rebalance if Fall is heavier
      if (fallHrs <= springHrs + 2) break

      // Find the best move: single course or co-req pair
      type Move = { indices: number[]; codes: string[] }
      let bestMove: Move | null = null
      let bestMoveScore = scorePlan(fall, spring).score
      const tried = new Set<string>() // avoid testing co-req pair twice

      for (let i = 0; i < fall.length; i++) {
        const candidate = fall[i]
        if (tried.has(candidate.code)) continue
        if (neverMove.has(candidate.code)) continue
        if (springDependsOn(candidate.code, fallCodes, spring)) continue

        // Check if this course has a co-req partner in Fall -- if so, move both
        const partner = coReqPartner.get(candidate.code)
        const moveIndices = [i]
        const moveCodes = [candidate.code]

        if (partner) {
          const partnerIdx = fall.findIndex(c => c.code === partner)
          if (partnerIdx >= 0) {
            if (neverMove.has(partner)) continue
            if (springDependsOn(partner, fallCodes, spring)) continue
            moveIndices.push(partnerIdx)
            moveCodes.push(partner)
            tried.add(partner)
          }
        }
        tried.add(candidate.code)

        // Simulate the move
        const testFall = fall.filter((_, idx) => !moveIndices.includes(idx))
        const testSpring = [...spring, ...moveIndices.map(idx => fall[idx])]
        const { score } = scorePlan(testFall, testSpring)
        if (score < bestMoveScore) {
          bestMoveScore = score
          bestMove = { indices: moveIndices, codes: moveCodes }
        }
      }

      if (bestMove) {
        // Remove from Fall in reverse index order to preserve indices
        const sorted = [...bestMove.indices].sort((a, b) => b - a)
        for (const idx of sorted) {
          const moved = fall.splice(idx, 1)[0]
          spring.push(moved)
          fallCodes.delete(moved.code)
          springCodes.add(moved.code)
        }
        improved = true
      }
    }

    return { fall, spring }
  }

  const { fall: bestFall, spring: bestSpring } = buildAndRebalance()
  const { flags: bestFlags } = scorePlan(bestFall, bestSpring)

  /* --- Build semester plans from best arrangement --- */
  const fall27Flags = bestFlags.filter(f => f.sem === 0).map(f => ({ type: f.type, message: f.message }))
  const spring28Flags = bestFlags.filter(f => f.sem === 1).map(f => ({ type: f.type, message: f.message }))

  const fall27Total = bestFall.reduce((s, c) => s + c.hrs, 0)
  const spring28Total = bestSpring.reduce((s, c) => s + c.hrs, 0)

  // Overall hours check
  const totalHrsAfterAll = hrsAfterSpring27 + fall27Total + spring28Total
  if (totalHrsAfterAll < 120) {
    const gap = 120 - totalHrsAfterAll
    spring28Flags.push({ type: "error", message: `Still ${gap} credit hours short of the 120-hour graduation requirement. May need additional courses or a summer session.` })
  }

  // Info flag on final semester
  spring28Flags.push({ type: "info", message: "This is the target graduation semester (Spring 2028). All degree requirements must be completed." })

  const fall27: SemesterPlan = { label: "Fall 2027 (Best Case)", courses: bestFall, totalHrs: fall27Total, flags: fall27Flags }
  const spring28: SemesterPlan = { label: "Spring 2028 (Final Semester)", courses: bestSpring, totalHrs: spring28Total, flags: spring28Flags }

  return [spring27, fall27, spring28]
}

/* ------------------------------------------------------------------ */
/*  Recommendation engine                                              */
/*  Groups remaining requirements and suggests eligible courses        */
/*  based on what Jordan has completed, what's in progress, and the    */
/*  recommended 8-semester BSBA Business Economics sequence.           */
/* ------------------------------------------------------------------ */

export interface RecommendedCourse {
  code: string
  name: string
  hrs: number
  eligible: boolean            // prereqs met?
  reason?: string              // why not eligible
  priority: "critical" | "recommended" | "option"
  note?: string                // rationale explaining why this course matters
  linkedLab?: string           // if this is a lecture, code of matching lab
  linkedLecture?: string       // if this is a lab, code of matching lecture
}

export interface SciencePair {
  lecture: RecommendedCourse
  lab: RecommendedCourse
}

export interface RequirementGroup {
  id: string
  label: string
  hoursNeeded: number
  hoursCompleted: number
  type: "single" | "choose"    // single = one specific course, choose = pick from list
  courses: RecommendedCourse[]
  description?: string
  sciencePairs?: SciencePair[]  // for auto-linking lecture/lab
}

/**
 * Build the guided recommendation groups for Spring 2027 (Jordan's situation).
 * Already-planned courses (in `planned`) are excluded from suggestions.
 */
export function buildRecommendations(planned: Course[]): RequirementGroup[] {
  const plannedCodes = new Set(planned.map(c => c.code))
  const groups: RequirementGroup[] = []

  // Helper: is a course already completed or in-progress? (NOT planned -- planned courses stay visible in section)
  const taken = (code: string) => completedCourses.has(code) || inProgressFall2026.has(code)
  const eligible = (code: string): { ok: boolean; reason?: string } => {
    const entry = catalog[code]
    if (!entry) return { ok: true }
    for (const p of entry.prereqs) {
      if (!hasCompletedOrIP(p) && !plannedCodes.has(p)) {
        return { ok: false, reason: `Requires ${p} (not completed)` }
      }
    }
    if (entry.coreqs) {
      for (const c of entry.coreqs) {
        if (!hasCompletedOrIP(c) && !plannedCodes.has(c)) {
          return { ok: false, reason: `Co-requisite ${c} not in plan` }
        }
      }
    }
    return { ok: true }
  }

  // ================================================================
  // 1. BUSINESS CORE - SEVI 30103 is the only remaining course
  // ================================================================
  if (!taken("SEVI 30103")) {
    const e = eligible("SEVI 30103")
    const bcPlannedHrs = plannedCodes.has("SEVI 30103") ? 3 : 0
    groups.push({
      id: "business-core",
      label: "Business Core",
      hoursNeeded: 3 - bcPlannedHrs,
      hoursCompleted: 18 + bcPlannedHrs,
      type: "single",
      description: "SEVI 30103 is the capstone course and your last remaining Business Core requirement. The 8-semester plan places it in Spring Year 3.",
      courses: [{
        code: "SEVI 30103", name: "Strategic Management", hrs: 3,
        eligible: e.ok, reason: e.reason,
        priority: "critical",
        note: "This is your Business Core capstone -- it integrates everything you've learned. It requires all business core courses completed with a C or better. MKTG 34303 is your last remaining prereq (in progress Fall 2026). Taking it this spring keeps you on the 8-semester plan.",
      }],
    })
  }

  // ================================================================
  // 2. ECONOMICS MAJOR - Required courses not yet taken
  // ================================================================
  const econRequired: { code: string; name: string; hrs: number; note: string }[] = [
    { code: "ECON 31303", name: "Intermediate Macroeconomics", hrs: 3, note: "Critical: The macro counterpart to ECON 30303. The 8-semester plan places this in Spring Year 3 alongside Econometrics. Taking it now builds the theory foundation for upper-level ECON electives in Years 3-4." },
    { code: "ECON 43303", name: "Economics of Organizations", hrs: 3, note: "Requires ECON 30303 (in progress Fall 2026). The 8-semester plan places this in Fall Year 4. Taking it earlier is possible if prerequisites are met." },
    { code: "ECON 47403", name: "Introduction to Econometrics", hrs: 4, note: "Core quantitative methods course (4 credit hours). Essential for economic analysis careers. The 8-semester plan places this in Spring Year 3. Note: 4+1 students can take ECON 57403 instead." },
  ]
  const econRequiredRemaining = econRequired.filter(c => !taken(c.code))
  const econReqPlannedHrs = econRequired.filter(c => plannedCodes.has(c.code)).reduce((s, c) => s + c.hrs, 0)
  if (econRequiredRemaining.length > 0) {
    groups.push({
      id: "econ-major-required",
      label: "Economics Major (Required)",
      hoursNeeded: econRequiredRemaining.reduce((s, c) => s + c.hrs, 0) - econReqPlannedHrs,
      hoursCompleted: 6 + econReqPlannedHrs,
      type: econRequiredRemaining.length === 1 ? "single" : "choose",
      description: "Business Economics concentration requires 24 hours. ECON 30303 and ECON 34303 are in progress. The 8-semester plan recommends 2 upper-level ECON courses per semester for Years 3-4.",
      courses: econRequiredRemaining.map(c => {
        const e = eligible(c.code)
        return {
          code: c.code, name: c.name, hrs: c.hrs,
          eligible: e.ok, reason: e.reason,
          priority: c.code === "ECON 31303" ? "critical" as const : "recommended" as const,
          note: c.note,
        }
      }),
    })
  }

  // ================================================================
  // 3. ECONOMICS MAJOR - Elective courses (need ~6-9 hrs depending)
  // ================================================================
  const econElectiveOptions: { code: string; name: string; hrs: number; note?: string }[] = [
    { code: "ECON 47503", name: "Forecasting", hrs: 3, note: "Alternative to ECON 47403. 4+1 plan: Spring take ECON 57503." },
    { code: "ECON 47603", name: "Economic Analytics", hrs: 3, note: "Coreq with ECON 47403. Good pairing if taking Econometrics." },
    { code: "ECON 44203", name: "Behavioral Economics", hrs: 3, note: "Requires ECON 30303 (in progress). Interesting elective." },
    { code: "ECON 44303", name: "Experimental Economics", hrs: 3 },
    { code: "ECON 35303", name: "Labor Economics", hrs: 3, note: "Also counts toward Social Issues requirement." },
    { code: "ECON 31403", name: "Economics of Poverty & Inequality", hrs: 3 },
    { code: "ECON 33303", name: "Public Economics", hrs: 3 },
    { code: "ECON 46303", name: "International Trade", hrs: 3, note: "Required if pursuing Intl Econ concentration." },
    { code: "ECON 46403", name: "Intl Macroeconomics & Finance", hrs: 3, note: "Required if pursuing Intl Econ concentration." },
    { code: "ECON 38403", name: "Economics of the Developing World", hrs: 3 },
    { code: "ECON 38503", name: "Emerging Markets", hrs: 3 },
  ]
  const econElecRemaining = econElectiveOptions.filter(c => !taken(c.code))
  const econElecPlannedHrs = econElectiveOptions.filter(c => plannedCodes.has(c.code)).reduce((s, c) => s + c.hrs, 0)
  if (econElecRemaining.length > 0) {
    groups.push({
      id: "econ-major-elective",
      label: "Economics Major (Electives)",
      hoursNeeded: 9 - econElecPlannedHrs,
      hoursCompleted: 3 + econElecPlannedHrs,
      type: "choose",
      description: "Choose from ECON 3000/4000-level courses. ECON 34303 (Money & Banking, in progress) counts toward this. Need approximately 6 more hours across remaining semesters.",
      courses: econElecRemaining.map(c => {
        const e = eligible(c.code)
        return {
          code: c.code, name: c.name, hrs: c.hrs,
          eligible: e.ok, reason: e.reason,
          priority: "option" as const,
          note: c.note,
        }
      }),
    })
  }

  // ================================================================
  // 4. FINANCE MINOR (15 hours required, 0 completed)
  // ================================================================
  const finMinorCourses: { code: string; name: string; hrs: number; note?: string }[] = [
    { code: "FINN 30103", name: "Financial Analysis", hrs: 3, note: "Gateway course for the Finance minor. You MUST take this first -- it unlocks Investments, Corporate Finance, Financial Modeling, and Financial Data Analytics. You have FINN 20403 completed (B), so you are eligible right now. Without this, your minor cannot progress." },
    { code: "FINN 30603", name: "Investments", hrs: 3, note: "Can be co-enrolled with FINN 30103. Covers portfolio theory, valuation, and securities analysis. A core Finance minor course that also counts toward Jr/Sr business elective hours." },
    { code: "FINN 31003", name: "Financial Modeling", hrs: 3, note: "Only requires FINN 20403 (completed). Teaches Excel-based financial modeling -- highly practical for finance careers. Can take without FINN 30103." },
    { code: "FINN 36003", name: "Corporate Finance", hrs: 3, note: "Requires both FINN 20403 and FINN 30103. Part of the Banking concentration track. Take after completing FINN 30103." },
    { code: "FINN 31303", name: "Commercial Banking", hrs: 3, note: "Only requires FINN 20403 (completed). Banking track option. Can take now without FINN 30103." },
    { code: "FINN 37003", name: "International Finance", hrs: 3, note: "No specific prerequisites. Also counts toward the International Economics concentration if you pursue that path." },
    { code: "FINN 30003", name: "Personal Financial Management", hrs: 3, note: "No prerequisites. Insurance/Real Estate track. Lighter option if you need to balance a heavy ECON semester." },
    { code: "FINN 36203", name: "Risk Management", hrs: 3, note: "Insurance/Real Estate track. Good complement to Personal Financial Management." },
  ]
  const finMinorRemaining = finMinorCourses.filter(c => !taken(c.code))
  const finPlannedHrs = finMinorCourses.filter(c => plannedCodes.has(c.code)).reduce((s, c) => s + c.hrs, 0)
  if (finMinorRemaining.length > 0) {
    groups.push({
      id: "finance-minor",
      label: "Finance Minor",
      hoursNeeded: 15 - finPlannedHrs,
      hoursCompleted: 0 + finPlannedHrs,
      type: "choose",
      description: "Requires 15 hours. FINN 30103 is required and must be taken first. You have 3 semesters remaining -- start now. The 8-semester plan recommends 2 FINN courses per semester starting Spring Year 3.",
      courses: finMinorRemaining.map(c => {
        const e = eligible(c.code)
        return {
          code: c.code, name: c.name, hrs: c.hrs,
          eligible: e.ok, reason: e.reason,
          priority: c.code === "FINN 30103" ? "critical" as const : "recommended" as const,
          note: c.note,
        }
      }),
    })
  }

  // ================================================================
  // 5. JR/SR BUSINESS ELECTIVES (12 hours needed, 0 completed)
  // ================================================================
  const jrSrOptions: { code: string; name: string; hrs: number; note?: string }[] = [
    { code: "FINN 30503", name: "Financial Markets & Institutions", hrs: 3 },
    { code: "FINN 43203", name: "Financial Data Analytics I", hrs: 3, note: "Requires FINN 30103." },
    { code: "ISYS 41903", name: "Business Analytics & Visualization", hrs: 3 },
    { code: "MKTG 38303", name: "Digital Marketing", hrs: 3, note: "Requires MKTG 34303 (in progress)." },
    { code: "BLAW 30303", name: "Commercial Law", hrs: 3 },
    { code: "MGMT 42503", name: "Leadership", hrs: 3, note: "Requires MGMT 21003 (completed)." },
    { code: "SEVI 39303", name: "Entrepreneurship & New Venture Dev", hrs: 3 },
    { code: "SCMT 34403", name: "Transportation & Distribution Mgmt", hrs: 3 },
  ]
  const jrSrRemaining = jrSrOptions.filter(c => !taken(c.code))
  const jrSrPlannedHrs = jrSrOptions.filter(c => plannedCodes.has(c.code)).reduce((s, c) => s + c.hrs, 0)
  if (jrSrRemaining.length > 0) {
    groups.push({
      id: "jrsr-electives",
      label: "Jr/Sr Business Electives",
      hoursNeeded: 12 - jrSrPlannedHrs,
      hoursCompleted: 0 + jrSrPlannedHrs,
      type: "choose",
      description: "Any 3000 or 4000-level business course (ACCT, BLAW, ECON, FINN, ISYS, MGMT, MKTG, SCMT, SEVI, BUSI) except ECON 30503, ECON 30603, and MGMT 35603. Finance minor courses also count here.",
      courses: jrSrRemaining.map(c => {
        const e = eligible(c.code)
        return {
          code: c.code, name: c.name, hrs: c.hrs,
          eligible: e.ok, reason: e.reason,
          priority: "option" as const,
          note: c.note,
        }
      }),
    })
  }

  // ================================================================
  // 6. STATE MINIMUM CORE - Remaining (Natural Science lecture+lab)
  // ================================================================
  {
    // Jordan already has GEOL 11103 + GEOL 11101. Needs a 2nd science pair.
    // Science pairs: lecture + matching lab auto-link together.
    const sciencePairs: { lecture: RecommendedCourse; lab: RecommendedCourse }[] = [
      {
        lecture: {
          code: "ASTR 10003", name: "Survey of Astronomy", hrs: 3,
          eligible: true, priority: "recommended",
          note: "Most popular science choice for business students. Conceptual and accessible -- no advanced math required. Covers the solar system, stars, and galaxies in a highly engaging format.",
          linkedLab: "ASTR 10001",
        },
        lab: {
          code: "ASTR 10001", name: "Survey of Astronomy Lab", hrs: 1,
          eligible: true, priority: "recommended",
          note: "Hands-on lab paired with ASTR 10003. Observational exercises and sky mapping. Selected automatically with the lecture.",
          linkedLecture: "ASTR 10003",
        },
      },
      {
        lecture: {
          code: "ENSC 10003", name: "Intro to Environmental Science", hrs: 3,
          eligible: true, priority: "recommended",
          note: "Covers ecosystems, sustainability, and environmental policy. Relevant to business ethics and corporate responsibility. Straightforward coursework with no prerequisites.",
          linkedLab: "ENSC 10001",
        },
        lab: {
          code: "ENSC 10001", name: "Environmental Science Lab", hrs: 1,
          eligible: true, priority: "recommended",
          note: "Field-based lab paired with ENSC 10003. Practical environmental sampling exercises. Selected automatically with the lecture.",
          linkedLecture: "ENSC 10003",
        },
      },
      {
        lecture: {
          code: "PHYS 10103", name: "Physics in the Modern World", hrs: 3,
          eligible: true, priority: "option",
          note: "Conceptual physics designed for non-science majors. Covers everyday phenomena (energy, waves, electronics) without calculus. Lighter than Intro to Physics.",
          linkedLab: "PHYS 10101",
        },
        lab: {
          code: "PHYS 10101", name: "Physics in the Modern World Lab", hrs: 1,
          eligible: true, priority: "option",
          note: "Demonstration-based lab paired with PHYS 10103. Interactive experiments on mechanics and optics. Selected automatically with the lecture.",
          linkedLecture: "PHYS 10103",
        },
      },
    ]

    // Flatten out pairs, only include those not already taken/planned
    const courses: RecommendedCourse[] = []
    for (const pair of sciencePairs) {
      if (!taken(pair.lecture.code) && !taken(pair.lab.code)) {
        courses.push(pair.lecture)
        courses.push(pair.lab)
      }
    }

    const sciPlannedHrs = courses.filter(c => plannedCodes.has(c.code)).reduce((s, c) => s + c.hrs, 0)
    if (courses.length > 0) {
      groups.push({
        id: "state-min-core",
        label: "State Minimum Core",
        hoursNeeded: 4 - sciPlannedHrs,
        hoursCompleted: 16 + sciPlannedHrs,
        type: "choose",
        description: "16 of 20 hours completed (GEOL 11103/11101, PSYC 20003, ARHS 10003, PHIL 21003 IP, HIST 20003 IP). You still need a Natural Science lecture + matching lab (4 hrs total). Selecting a lecture automatically adds the matching lab.",
        courses,
        sciencePairs, // attach for UI auto-linking
      })
    }
  }

  // ================================================================
  // 7. GENERAL ELECTIVES (6 hours needed, 3 completed)
  // ================================================================
  {
    const genElecOptions: { code: string; name: string; hrs: number; note?: string }[] = [
      { code: "COMM 13003", name: "Interpersonal Communication", hrs: 3, note: "Builds on COMM 12003 (completed). Practical communication skills directly useful in business settings." },
      { code: "PSYC 21003", name: "Abnormal Psychology", hrs: 3, note: "Popular elective with manageable workload. Interesting content on mental health and behavioral patterns." },
      { code: "SOCI 20003", name: "Intro to Sociology", hrs: 3, note: "Broad social science elective. Covers group dynamics and institutions -- complements economics well." },
      { code: "PHIL 32003", name: "Business Ethics", hrs: 3, note: "Directly relevant to your business degree. Covers ethical frameworks for corporate decision-making." },
      { code: "GEOS 10003", name: "World Regional Geography", hrs: 3, note: "Covers global economic regions and cultural geography. Complements international economics coursework." },
      { code: "ANTH 10003", name: "Intro to Anthropology", hrs: 3, note: "Explores human cultures and societies. Light workload, interesting perspective for business students." },
    ]
    const remaining = genElecOptions.filter(c => !taken(c.code))
    const genPlannedHrs = genElecOptions.filter(c => plannedCodes.has(c.code)).reduce((s, c) => s + c.hrs, 0)
    if (remaining.length > 0) {
      groups.push({
        id: "gen-electives",
        label: "General Electives",
        hoursNeeded: 3 - genPlannedHrs,
        hoursCompleted: 3 + genPlannedHrs,
        type: "choose",
        description: "3 of 6 hours completed (COMM 12003). Max 6 hours of business courses and 3 hours of PEAC or DANC courses. Can schedule for a lighter semester.",
        courses: remaining.map(c => ({
          code: c.code, name: c.name, hrs: c.hrs,
          eligible: true, priority: "option" as const, note: c.note,
        })),
      })
    }
  }

  return groups
}

/* ------------------------------------------------------------------ */
/*  Advisor Intelligence Generator                                     */
/* ------------------------------------------------------------------ */

function generateAdvisorIntelligence(
  planned: Course[],
  courses: CourseResult[],
  degreeProgress: DegreeItem[],
  timeline: SemesterPlan[],
  loadFlags: LoadFlag[],
  suggestion: { title: string; body: string[]; severity: SuggestionSeverity } | null,
  totalHrs: number,
): AdvisorIntelligence {
  const plannedCodes = new Set(planned.map(c => c.code))

  // Collect all issues (reuse suggestion logic pattern)
  const allIssues: AdvisorFlag[] = []
  const failCount = courses.filter(c => c.status === "fail").length
  const conditionalCount = courses.filter(c => c.status === "conditional").length

  if (failCount > 0) {
    for (const c of courses.filter(c => c.status === "fail")) {
      allIssues.push({ severity: "red", message: `${c.code} (${c.name}): ${c.note}` })
    }
  }
  if (conditionalCount > 0) {
    for (const c of courses.filter(c => c.status === "conditional")) {
      allIssues.push({ severity: "yellow", message: `${c.code}: Conditional -- depends on completing in-progress course with C or better` })
    }
  }
  for (const flag of loadFlags) {
    if (flag.type === "error") allIssues.push({ severity: "red", message: flag.message })
    if (flag.type === "warning" && !allIssues.some(i => i.message === flag.message)) {
      allIssues.push({ severity: "yellow", message: flag.message })
    }
  }
  for (const sem of timeline) {
    for (const flag of sem.flags) {
      if (flag.type === "error" && !allIssues.some(i => i.message.includes(flag.message))) {
        allIssues.push({ severity: "red", message: `${sem.label}: ${flag.message}` })
      }
      if (flag.type === "warning" && !allIssues.some(i => i.message.includes(flag.message))) {
        allIssues.push({ severity: "yellow", message: `${sem.label}: ${flag.message}` })
      }
    }
  }

  const hasRed = allIssues.some(i => i.severity === "red")
  const inPersonSuggested = hasRed

  // Student summary
  const remaining = 120 - (STUDENT.hoursCompleted + STUDENT.hoursInProgress + totalHrs)
  const studentSummary = `Jordan Martinez is a ${STUDENT.classification} (${STUDENT.gpa} GPA) pursuing a BSBA in ${STUDENT.major} with a ${STUDENT.minor} minor. ${STUDENT.hoursCompleted} hours completed, ${STUDENT.hoursInProgress} in progress this Fall, planning ${totalHrs} for Spring 2027. ${remaining > 0 ? remaining + " hours remain" : "On track"} toward the 120-hour graduation target (Spring 2028).`

  // Biggest flags: pick the 1-2 most important things for the advisor
  const biggestFlags: { question: string; context: string }[] = []

  // Check for Finance minor timing
  const finProgress = degreeProgress.find(d => d.label.includes("Finance Minor"))
  const finn30103Planned = plannedCodes.has("FINN 30103")
  if (finProgress && finProgress.value < 6) {
    if (!finn30103Planned && !completedCourses.has("FINN 30103")) {
      biggestFlags.push({
        question: "Can Jordan realistically complete the Finance minor by Spring 2028?",
        context: `Only ${finProgress.value} of 15 Finance minor hours done. FINN 30103 (the gateway course) hasn't been taken yet. With 3 semesters left, completing 15 hours of finance requires starting immediately and taking 2 FINN courses per semester.`,
      })
    } else if (finn30103Planned) {
      biggestFlags.push({
        question: "Is the Finance minor sequence mapped out through graduation?",
        context: `Jordan is starting FINN 30103 this semester (good), but still needs 12 more Finance hours across Fall 2027 and Spring 2028. Confirm which specific FINN courses Jordan plans to take and that they're offered in those semesters.`,
      })
    }
  }

  // Check for prerequisite failures
  if (failCount > 0) {
    const failCodes = courses.filter(c => c.status === "fail").map(c => c.code)
    biggestFlags.push({
      question: `Does Jordan understand why ${failCodes.join(", ")} can't be registered for?`,
      context: `${failCount} course(s) have unmet prerequisites. Jordan may have misread the catalog or assumed in-progress courses count. Verify they know which specific prerequisite is missing and what alternative course to take instead.`,
    })
  }

  // Check overload
  if (totalHrs > 17 && biggestFlags.length < 2) {
    biggestFlags.push({
      question: `Is ${totalHrs} credit hours manageable given Jordan's ${STUDENT.gpa} GPA?`,
      context: `The plan exceeds the standard 17-hour limit. Jordan's GPA meets the 2.75 threshold for overload approval, but consider work schedule, extracurriculars, and how the ${conditionalCount > 0 ? "conditional courses" : "course mix"} might affect workload.`,
    })
  }

  // Check if natural science is still outstanding
  const sciProgress = degreeProgress.find(d => d.label.includes("State Minimum"))
  if (sciProgress && sciProgress.courses?.some(c => c.code.includes("Science") && c.status === "remaining") && biggestFlags.length < 2) {
    biggestFlags.push({
      question: "When is Jordan planning to take the Natural Science requirement?",
      context: "The 4-hour Natural Science lecture + lab is still outstanding. Pushing it to senior year limits scheduling flexibility since labs have fixed time slots. Consider whether it should be prioritized for Fall 2027.",
    })
  }

  // Talking points for meeting prep (relationship + substance)
  const talkingPoints: string[] = [
    "How's the semester going so far? Anything from your Fall courses that's been particularly challenging or interesting?",
    "Are you working or involved in anything outside of class this semester? I want to make sure your course load is realistic.",
  ]

  if (finn30103Planned || completedCourses.has("FINN 30103")) {
    talkingPoints.push("Tell me about your interest in Finance -- what drew you to the minor, and do you see it connecting to a career path?")
  }

  if (failCount > 0) {
    talkingPoints.push(`Let's walk through the ${failCount > 1 ? "courses" : "course"} with prerequisite issues -- I want to make sure we find the right replacement${failCount > 1 ? "s" : ""} and you understand what's needed.`)
  }

  if (finProgress && finProgress.value < 15) {
    talkingPoints.push(`Let's map out your Finance minor semester-by-semester -- you need ${15 - finProgress.value} more hours, and we should make sure the courses you want are actually offered when you need them.`)
  }

  if (totalHrs > 17) {
    talkingPoints.push(`Your plan is ${totalHrs} hours, which is above the standard max. Let's talk about whether that's realistic given everything else on your plate, or if we should trim one course.`)
  }

  if (remaining > 0 && remaining < 30) {
    talkingPoints.push(`You have ${remaining} hours left to graduate -- let's make sure your remaining semesters are balanced and you're not scrambling at the end.`)
  }

  // Limit to 5
  if (talkingPoints.length > 5) talkingPoints.length = 5

  // Questions for "Ask a Question" email
  const questionsForStudent: { question: string; reason: string }[] = []

  if (failCount > 0) {
    const failCodes = courses.filter(c => c.status === "fail").map(c => c.code)
    questionsForStudent.push({
      question: `I noticed ${failCodes.join(" and ")} on your plan, but the prerequisite${failCount > 1 ? "s aren't" : " isn't"} met yet. Were you aware of this, and do you have an alternative course in mind?`,
      reason: "Prerequisite issue needs to be resolved before registration opens",
    })
  }

  if (finProgress && finProgress.value < 6 && !finn30103Planned) {
    questionsForStudent.push({
      question: "I see the Finance minor on your degree plan, but FINN 30103 isn't in your Spring schedule. Are you planning to start the minor in Fall 2027 instead, or would you like to swap a course to begin it this spring?",
      reason: "Finance minor timing is tight with 3 semesters remaining",
    })
  }

  if (totalHrs > 17) {
    questionsForStudent.push({
      question: `Your plan is at ${totalHrs} credit hours, which is above the standard 17-hour limit. Do you have a work schedule or other commitments I should know about? I want to make sure this load is sustainable.`,
      reason: "Overload requires GPA 2.75+ and advisor approval",
    })
  }

  if (questionsForStudent.length === 0) {
    // Gentle check-in question
    questionsForStudent.push({
      question: "Your plan looks solid overall. Before I approve it, is there anything about your Spring schedule you're uncertain about or would like to discuss?",
      reason: "General check-in -- no major issues detected",
    })
  }

  // Limit to 2
  if (questionsForStudent.length > 2) questionsForStudent.length = 2

  return {
    biggestFlags: biggestFlags.slice(0, 2),
    allIssues,
    inPersonSuggested,
    studentSummary,
    talkingPoints,
    questionsForStudent,
  }
}

/* ------------------------------------------------------------------ */
/*  Main validation entry point                                        */
/* ------------------------------------------------------------------ */

export function validatePlan(planned: Course[]): ValidationResult {
  const plannedCodes = new Set(planned.map(c => c.code))
  const totalHrs = planned.reduce((s, c) => s + c.hrs, 0)

  const courses = planned.map(c => validateCourse(c, plannedCodes))
  const loadFlags = [
    ...evaluateLoad(totalHrs),
    ...checkPrefixConcentration(planned, "Spring 2027"),
  ]
  const degreeProgress = computeDegreeProgress(planned, courses)
  const timeline = computeTimeline(planned)
  const suggestion = generateSuggestion(planned, courses, degreeProgress, timeline, loadFlags)
  const advisorIntel = generateAdvisorIntelligence(planned, courses, degreeProgress, timeline, loadFlags, suggestion, totalHrs)

  const passCount = courses.filter(c => c.status === "pass").length
  const conditionalCount = courses.filter(c => c.status === "conditional").length
  const failCount = courses.filter(c => c.status === "fail").length
  const suggestionCount = suggestion ? 1 : 0

  return {
    courses, loadFlags, degreeProgress, totalHrs,
    passCount, conditionalCount, failCount, suggestionCount,
    suggestion, timeline, advisorIntel,
  }
}
