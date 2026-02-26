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

export interface DegreeItem {
  label: string
  detail: string
  value: number
  total: number
  done?: boolean
  color?: string
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
  suggestion: { title: string; body: string[] } | null
  timeline: string
}

/* ------------------------------------------------------------------ */
/*  Jordan's academic record                                           */
/*  Source: BSBA Econ 2025-2026 worksheet (filled out)                 */
/* ------------------------------------------------------------------ */

/** Courses completed with final grades. Key = code, value = grade */
const completedRecord: Record<string, string> = {
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
const inProgressFall2026 = new Set([
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

const STUDENT = {
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

  // Additional contextual flags
  const econUpper = (codes: Set<string>) => [...codes].filter(cd => cd.startsWith("ECON") && parseInt(cd.split(" ")[1]) >= 30000).length
  return flags
}

/* ------------------------------------------------------------------ */
/*  Degree progress calculator                                         */
/* ------------------------------------------------------------------ */

function computeDegreeProgress(planned: Course[], courseResults: CourseResult[]): DegreeItem[] {
  const plannedCodes = new Set(planned.map(c => c.code))
  const totalPlannedHrs = planned.reduce((s, c) => s + c.hrs, 0)
  const hrsAfter = STUDENT.hoursCompleted + STUDENT.hoursInProgress + totalPlannedHrs

  // ECON major: completed IP (ECON 30303 = 3, ECON 34303 = 3) + planned upper ECON
  const econMajorIPHrs = 6 // ECON 30303 + ECON 34303 in progress
  const econMajorRequiredCodes = ["ECON 30303", "ECON 31303", "ECON 43303", "ECON 47403", "ECON 47503"]
  const econElectivePrefixes = ["ECON"]
  const econMajorPlannedHrs = planned.filter(c =>
    c.code.startsWith("ECON") && parseInt(c.code.split(" ")[1]) >= 30000
  ).reduce((s, c) => s + c.hrs, 0)
  const econMajorTotalAfter = econMajorIPHrs + econMajorPlannedHrs

  // Business core: 5 done (BLAW, ISYS, SCMT, MGMT, FINN) = 15 hrs + MKTG IP = 3 hrs = 18
  const businessCoreDone = 18 // completed + in-progress
  const hasSevi = plannedCodes.has("SEVI 30103")
  const businessCoreAfter = hasSevi ? 21 : businessCoreDone

  // Finance minor: FINN 30103 required + 4 more courses (15 hrs total)
  const finMinorAllCodes = ["FINN 30103", "FINN 30603", "FINN 31003", "FINN 36003", "FINN 31303", "FINN 37003", "FINN 30003", "FINN 30503", "FINN 36203", "FINN 43203"]
  const finMinorPlanned = planned.filter(c => finMinorAllCodes.includes(c.code)).reduce((s, c) => s + c.hrs, 0)

  // Jr/Sr business electives
  const majorOrCoreCodes = new Set([
    "ECON 30303", "ECON 31303", "ECON 47403", "ECON 43303", "ECON 47503",
    "SEVI 30103", "MKTG 34303",
  ])
  const jrSrPrefixes = ["ACCT", "BLAW", "ECON", "FINN", "ISYS", "MGMT", "MKTG", "SCMT", "SEVI", "BUSI"]
  const jrSrElectiveHrs = planned.filter(c => {
    const num = parseInt(c.code.split(" ")[1])
    const prefix = c.code.split(" ")[0]
    return num >= 30000 && jrSrPrefixes.includes(prefix) &&
      !majorOrCoreCodes.has(c.code) &&
      !["ECON 30503", "ECON 30603", "MGMT 35603"].includes(c.code)
  }).reduce((s, c) => s + c.hrs, 0)

  // State min core: 16 of 20 done (need natural science 4 hrs)
  const stateMinAfter = 16

  // General electives: 3 of 6 done (COMM 12003)
  const genElectivesDone = 3

  return [
    {
      label: "Total Credit Hours",
      detail: `Completed: ${STUDENT.hoursCompleted} + In Progress: ${STUDENT.hoursInProgress} + Planned: ${totalPlannedHrs} = ${hrsAfter} of 120 hours`,
      value: hrsAfter, total: 120, color: "bg-primary",
    },
    {
      label: "Economics Major (24 hrs)",
      detail: `IP: ${econMajorIPHrs} hrs + Planned: ${econMajorPlannedHrs} hrs = ${econMajorTotalAfter} of 24 required`,
      value: econMajorTotalAfter, total: 24, color: econMajorTotalAfter >= 18 ? "bg-primary" : "bg-amber-500",
    },
    {
      label: "Business Core (21 hrs)",
      detail: hasSevi
        ? "Complete after this semester \u2014 SEVI 30103 is the final course."
        : `${businessCoreDone} of 21 hrs \u2014 SEVI 30103 (Strategic Management) still needed`,
      value: businessCoreAfter, total: 21,
      done: businessCoreAfter >= 21, color: businessCoreAfter >= 21 ? "bg-emerald-500" : "bg-amber-500",
    },
    {
      label: "Finance Minor (15 hrs)",
      detail: finMinorPlanned > 0
        ? `${finMinorPlanned} hrs planned this semester \u2014 getting started`
        : "0 of 15 hrs \u2014 not started. FINN 30103 (required) is not in your plan.",
      value: finMinorPlanned, total: 15,
      color: finMinorPlanned > 0 ? "bg-amber-500" : "bg-red-400",
    },
    {
      label: "Jr/Sr Business Electives (12 hrs)",
      detail: jrSrElectiveHrs > 0
        ? `${jrSrElectiveHrs} hrs this semester \u2014 finance minor courses count here too`
        : "0 of 12 hrs \u2014 finance minor courses can count toward this",
      value: jrSrElectiveHrs, total: 12,
      color: jrSrElectiveHrs > 0 ? "bg-amber-500" : "bg-red-400",
    },
    {
      label: "State Minimum Core (20 hrs)",
      detail: `${stateMinAfter} of 20 hrs \u2014 still need Natural Science lecture + lab (4 hrs)`,
      value: stateMinAfter, total: 20, color: "bg-amber-500",
    },
    {
      label: "General Electives (6 hrs)",
      detail: `${genElectivesDone} of 6 hrs completed (COMM 12003). ${6 - genElectivesDone} remaining.`,
      value: genElectivesDone, total: 6, color: "bg-amber-500",
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Suggestion generator                                               */
/* ------------------------------------------------------------------ */

function generateSuggestion(
  planned: Course[],
  courseResults: CourseResult[],
): { title: string; body: string[] } | null {
  const plannedCodes = new Set(planned.map(c => c.code))
  const hasFinn30603 = plannedCodes.has("FINN 30603")
  const hasFinn30103 = plannedCodes.has("FINN 30103")
  const finn30603Fail = courseResults.find(r => r.code === "FINN 30603" && r.status === "fail")
  const hasEcon43303 = plannedCodes.has("ECON 43303")
  const econ43303Cond = courseResults.find(r => r.code === "ECON 43303" && (r.status === "conditional" || r.badges.includes("workload flag")))
  const totalHrs = planned.reduce((s, c) => s + c.hrs, 0)

  // Primary: FINN 30603 fail -> swap to FINN 30103
  if (hasFinn30603 && !hasFinn30103 && finn30603Fail) {
    const body = [
      "FINN 30103 is required for your Finance minor, only requires FINN 20403 (which you\u2019ve completed with a B), and unlocks FINN 30603 (Investments), FINN 36003 (Corporate Finance), FINN 31003 (Financial Modeling), and FINN 43203 (Financial Data Analytics I) for future semesters.",
      "You haven\u2019t started your 15-hour Finance minor yet \u2014 with 3 semesters left (including this one), you need to begin now to complete it on time.",
      "FINN 30103 also counts toward your Jr/Sr business elective requirement (0 of 12 hrs completed), so it pulls double duty.",
    ]
    if (hasEcon43303 && econ43303Cond) {
      body.push("Additionally, consider deferring ECON 43303 to Fall 2027 to lighten your load this semester. That frees a slot for a Natural Science lab (4 hrs for State Minimum Core), which gets harder to fit into senior year.")
    }
    return { title: "Replace FINN 30603 with FINN 30103 (Financial Analysis) this semester.", body }
  }

  // FINN 30103 already added, no FINN 30603
  if (hasFinn30103 && !hasFinn30603) {
    const body = [
      "FINN 30103 unlocks FINN 30603 (Investments), FINN 36003 (Corporate Finance), FINN 31003 (Financial Modeling), and FINN 43203 (Financial Data Analytics I) for Fall 2027 and beyond. You still need 12 more minor hours across 2 remaining semesters.",
    ]
    if (hasEcon43303 && econ43303Cond) {
      body.push("Consider whether ECON 43303 this semester is too heavy alongside Econometrics (4 hrs). The 8-semester plan places it in Fall Year 4.")
    }
    body.push("Don\u2019t forget: you still need a Natural Science lecture + lab (4 hrs) for State Minimum Core and 3 more hours of General Electives.")
    return { title: "Good move adding FINN 30103 \u2014 your Finance minor is now on track.", body }
  }

  // Both FINN courses planned
  if (hasFinn30103 && hasFinn30603) {
    return {
      title: "Strong plan \u2014 FINN 30103 serves as the corequisite for FINN 30603.",
      body: [
        "Both courses count toward your Finance minor and Jr/Sr business elective requirements \u2014 that\u2019s 6 hours of double-duty progress.",
        "Make sure you can handle " + totalHrs + " total credit hours. " + (totalHrs > STANDARD_MAX ? "That\u2019s above the standard 17-hour limit." : ""),
        "Still needed: Natural Science lecture + lab (4 hrs, State Min Core) and 3 hrs General Electives.",
      ],
    }
  }

  // Generic
  const failCount = courseResults.filter(r => r.status === "fail").length
  if (failCount > 0) {
    return {
      title: "Address the prerequisite issues above before registering.",
      body: [
        `${failCount} course(s) have unmet prerequisites. You won\u2019t be able to register for these until the issues are resolved.`,
        "Review each flagged course and consider swapping it for one where prerequisites are met.",
        "Remember: you still need Natural Science lecture + lab (4 hrs) and 3 hrs of General Electives.",
      ],
    }
  }

  // All clear
  if (planned.length > 0) {
    return {
      title: "No critical issues detected \u2014 this plan looks solid.",
      body: [
        "All prerequisites appear to be met. Verify with your advisor before registering.",
        "Remaining degree requirements to plan for: Natural Science lecture + lab (4 hrs, State Min Core), " + (plannedCodes.has("FINN 30103") ? "12" : "15") + " hrs Finance minor, and 3 hrs General Electives.",
      ],
    }
  }

  return null
}

/* ------------------------------------------------------------------ */
/*  Graduation timeline                                                */
/* ------------------------------------------------------------------ */

function computeTimeline(planned: Course[]): string {
  const totalPlannedHrs = planned.reduce((s, c) => s + c.hrs, 0)
  const hrsAfter = STUDENT.hoursCompleted + STUDENT.hoursInProgress + totalPlannedHrs
  const remaining = 120 - hrsAfter
  const plannedCodes = new Set(planned.map(c => c.code))
  const hasFinn30103 = plannedCodes.has("FINN 30103")

  if (remaining <= 0) {
    return "With this semester\u2019s courses, you will reach 120 hours. Verify all category requirements (Finance minor, State Min Core, General Electives) are fully satisfied for graduation."
  }

  const semestersLeft = remaining <= 19 ? 1 : remaining <= 36 ? 2 : 3
  const avgPerSem = Math.ceil(remaining / semestersLeft)
  const semesterNames = semestersLeft === 1
    ? "Fall 2027"
    : semestersLeft === 2
      ? "Fall 2027 and Spring 2028"
      : "Fall 2027, Spring 2028, and Summer 2028"

  const minorNote = hasFinn30103
    ? "You\u2019ve started the Finance minor \u2014 plan to take 2-3 FINN courses per remaining semester to complete the 15-hour requirement."
    : "You still need all 15 hours of Finance minor courses. Starting FINN 30103 this spring is critical to staying on track for both the degree and the minor by Spring 2028."

  return `You have ${remaining} credit hours remaining across ${semesterNames} (~${avgPerSem} hrs/semester). ${avgPerSem <= 15 ? "Very manageable." : avgPerSem <= 17 ? "Tight but doable." : "That\u2019s a heavy load \u2014 consider summer courses."} ${minorNote}`
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
  note?: string
}

export interface RequirementGroup {
  id: string
  label: string
  hoursNeeded: number
  hoursCompleted: number
  type: "single" | "choose"    // single = one specific course, choose = pick from list
  courses: RecommendedCourse[]
  description?: string
}

/**
 * Build the guided recommendation groups for Spring 2027 (Jordan's situation).
 * Already-planned courses (in `planned`) are excluded from suggestions.
 */
export function buildRecommendations(planned: Course[]): RequirementGroup[] {
  const plannedCodes = new Set(planned.map(c => c.code))
  const groups: RequirementGroup[] = []

  // Helper: is a course already completed, IP, or planned?
  const taken = (code: string) => completedCourses.has(code) || inProgressFall2026.has(code) || plannedCodes.has(code)
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
    groups.push({
      id: "business-core",
      label: "Business Core",
      hoursNeeded: 3,
      hoursCompleted: 18,
      type: "single",
      description: "SEVI 30103 is the capstone course and your last remaining Business Core requirement. The 8-semester plan places it in Spring Year 3.",
      courses: [{
        code: "SEVI 30103", name: "Strategic Management", hrs: 3,
        eligible: e.ok, reason: e.reason,
        priority: "critical",
        note: "Capstone. Must complete all business core with C or better first. MKTG 34303 is in progress Fall 2026.",
      }],
    })
  }

  // ================================================================
  // 2. ECONOMICS MAJOR - Required courses not yet taken
  // ================================================================
  const econRequired: { code: string; name: string; hrs: number; note: string }[] = [
    { code: "ECON 31303", name: "Intermediate Macroeconomics", hrs: 3, note: "8-semester plan: Spring Year 3. Pairs well with ECON 30303 (in progress)." },
    { code: "ECON 43303", name: "Economics of Organizations", hrs: 3, note: "8-semester plan: Fall Year 4. Requires ECON 30303 (in progress Fall 2026)." },
    { code: "ECON 47403", name: "Introduction to Econometrics", hrs: 4, note: "8-semester plan: Spring Year 3. 4+1 option: take ECON 57403 Fall to count for this." },
  ]
  const econRequiredRemaining = econRequired.filter(c => !taken(c.code))
  if (econRequiredRemaining.length > 0) {
    groups.push({
      id: "econ-major-required",
      label: "Economics Major (Required)",
      hoursNeeded: econRequiredRemaining.reduce((s, c) => s + c.hrs, 0),
      hoursCompleted: 6, // ECON 30303 (3, IP) + ECON 34303 (3, IP)
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
  if (econElecRemaining.length > 0) {
    groups.push({
      id: "econ-major-elective",
      label: "Economics Major (Electives)",
      hoursNeeded: 9,
      hoursCompleted: 3, // ECON 34303 IP counts
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
    { code: "FINN 30103", name: "Financial Analysis", hrs: 3, note: "REQUIRED for Finance minor. Unlocks Investments, Corporate Finance, Financial Modeling, and Financial Data Analytics." },
    { code: "FINN 30603", name: "Investments", hrs: 3, note: "Requires FINN 30103 as co-requisite. Key Finance minor course." },
    { code: "FINN 31003", name: "Financial Modeling", hrs: 3, note: "Requires FINN 20403 only. Good early choice." },
    { code: "FINN 36003", name: "Corporate Finance", hrs: 3, note: "Requires FINN 20403 + FINN 30103. Banking track." },
    { code: "FINN 31303", name: "Commercial Banking", hrs: 3, note: "Requires FINN 20403 only. Banking track." },
    { code: "FINN 37003", name: "International Finance", hrs: 3, note: "Also counts toward Intl Econ concentration." },
    { code: "FINN 30003", name: "Personal Financial Management", hrs: 3, note: "No prerequisites. Insurance/RE track." },
    { code: "FINN 36203", name: "Risk Management", hrs: 3, note: "Insurance/RE track." },
  ]
  const finMinorRemaining = finMinorCourses.filter(c => !taken(c.code))
  if (finMinorRemaining.length > 0) {
    groups.push({
      id: "finance-minor",
      label: "Finance Minor",
      hoursNeeded: 15,
      hoursCompleted: 0,
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
  if (jrSrRemaining.length > 0) {
    groups.push({
      id: "jrsr-electives",
      label: "Jr/Sr Business Electives",
      hoursNeeded: 12,
      hoursCompleted: 0,
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
  // 6. STATE MINIMUM CORE - Remaining (Humanities, Natural Science)
  // ================================================================
  {
    const stateMinOptions: { code: string; name: string; hrs: number; note?: string }[] = [
      { code: "PHIL 21003", name: "Intro to Ethics", hrs: 3, note: "In progress Fall 2026. Fulfills Humanities." },
      { code: "HIST 20003", name: "US History to 1877", hrs: 3, note: "In progress Fall 2026. Fulfills US History/Gov." },
    ]
    const remaining = stateMinOptions.filter(c => !taken(c.code))
    // Natural science is the big remaining gap
    const needsNatSci = true // Jordan still needs 2nd science lecture + lab
    if (needsNatSci || remaining.length > 0) {
      const courses: RecommendedCourse[] = []
      if (needsNatSci) {
        courses.push({
          code: "SCI XXXX3", name: "Natural Science Lecture", hrs: 3,
          eligible: true, priority: "recommended",
          note: "Need 2nd science lecture. Options: BIOL, CHEM, PHYS, or GEOL (already took GEOL 11103).",
        })
        courses.push({
          code: "SCI XXXX1", name: "Matching Science Lab", hrs: 1,
          eligible: true, priority: "recommended",
          note: "Must match the lecture. Total: 4 credit hours for lecture + lab.",
        })
      }
      remaining.forEach(c => {
        courses.push({
          code: c.code, name: c.name, hrs: c.hrs,
          eligible: true, priority: "option", note: c.note,
        })
      })
      groups.push({
        id: "state-min-core",
        label: "State Minimum Core",
        hoursNeeded: 4,
        hoursCompleted: 16,
        type: "choose",
        description: "16 of 20 hours completed. Need Natural Science lecture + matching lab (4 hrs). PHIL 21003 and HIST 20003 are in progress Fall 2026.",
        courses,
      })
    }
  }

  // ================================================================
  // 7. GENERAL ELECTIVES (6 hours needed, 3 completed)
  // ================================================================
  {
    const genElecOptions: { code: string; name: string; hrs: number; note?: string }[] = [
      { code: "COMM 13003", name: "Interpersonal Communication", hrs: 3 },
      { code: "PSYC 21003", name: "Abnormal Psychology", hrs: 3 },
      { code: "SOCI 20003", name: "Intro to Sociology", hrs: 3 },
    ]
    const remaining = genElecOptions.filter(c => !taken(c.code))
    if (remaining.length > 0) {
      groups.push({
        id: "gen-electives",
        label: "General Electives",
        hoursNeeded: 3,
        hoursCompleted: 3,
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
/*  Main validation entry point                                        */
/* ------------------------------------------------------------------ */

export function validatePlan(planned: Course[]): ValidationResult {
  const plannedCodes = new Set(planned.map(c => c.code))
  const totalHrs = planned.reduce((s, c) => s + c.hrs, 0)

  const courses = planned.map(c => validateCourse(c, plannedCodes))
  const loadFlags = evaluateLoad(totalHrs)
  const degreeProgress = computeDegreeProgress(planned, courses)
  const suggestion = generateSuggestion(planned, courses)
  const timeline = computeTimeline(planned)

  const passCount = courses.filter(c => c.status === "pass").length
  const conditionalCount = courses.filter(c => c.status === "conditional").length
  const failCount = courses.filter(c => c.status === "fail").length
  const suggestionCount = suggestion ? 1 : 0

  return {
    courses, loadFlags, degreeProgress, totalHrs,
    passCount, conditionalCount, failCount, suggestionCount,
    suggestion, timeline,
  }
}
