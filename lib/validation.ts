/* ------------------------------------------------------------------ */
/*  QuickCheck Validation Engine                                       */
/*  Evaluates a student's planned courses against Walton College       */
/*  BSBA requirements, prerequisites, and credit-hour policies.        */
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
  badges: string[] // e.g. "conditional", "workload flag", "cannot register", "overload"
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
/*  Jordan's completed / in-progress course record                     */
/* ------------------------------------------------------------------ */

const completedCourses = new Set([
  "ENGL 10103", "ENGL 10203", "MATH 20503", "ECON 21003", "ECON 22003",
  "MATH 22003", "SPCH 10003", "ISYS 11203", "BUSI 11101", "BUSI 10303",
  "ISYS 20303", "ACCT 20103", "ACCT 20203", "GEOL 11103", "GEOL 11101",
  "PSYC 20003", "ARHS 10003", "COMM 12003", "BLAW 20003", "ISYS 21003",
  "SCMT 21003", "MGMT 21003", "FINN 20403",
])

const inProgressFall2026 = new Set([
  "MKTG 34303", "ECON 30303", "ECON 34303", "PHIL 21003", "HIST 20003",
])

/* ------------------------------------------------------------------ */
/*  Student profile constants                                          */
/* ------------------------------------------------------------------ */

const STUDENT = {
  gpa: 3.19,
  hoursCompleted: 65,
  expectedGrad: "Spring 2028",
  isSeniorFinalSemester: false, // Jordan is a junior heading into spring 2027
  classification: "Junior",
}

/* ------------------------------------------------------------------ */
/*  Credit-hour policy limits (Walton College)                         */
/* ------------------------------------------------------------------ */

const STANDARD_MIN = 15
const STANDARD_MAX = 17
const GPA_275_MAX = 18       // students w/ 2.75+ prev-semester GPA
const SENIOR_FINAL_MAX = 19  // seniors in final semester if needed for graduation
const SUMMER_MAX = 6

/* ------------------------------------------------------------------ */
/*  Per-course validation rules                                        */
/* ------------------------------------------------------------------ */

function validateCourse(
  c: Course,
  plannedCodes: Set<string>,
): CourseResult {
  switch (c.code) {

    /* ----- ECON 31303 ----- */
    case "ECON 31303":
      return {
        code: c.code, name: c.name, status: "pass",
        countsToward: "Economics Major \u2014 Required (Business Economics concentration)",
        prereqs: "Met \u2014 MATH 22003 (C+), ECON 21003 (A), ECON 22003 (A\u2212)",
        prereqStatus: "met",
        note: "Required for your concentration. On track.",
        badges: [],
      }

    /* ----- ECON 47403 ----- */
    case "ECON 47403":
      return {
        code: c.code, name: c.name, status: "pass",
        countsToward: "Economics Major \u2014 Required (4 credit hours)",
        prereqs: "Met \u2014 MATH 22003 (C+), BUSI 10303 (B)",
        prereqStatus: "met",
        note: "This is a 4-credit course. Plan for the heavier credit load.",
        badges: [],
      }

    /* ----- SEVI 30103 ----- */
    case "SEVI 30103":
      return {
        code: c.code, name: c.name, status: "pass",
        countsToward: "Business Core \u2014 Required (capstone)",
        prereqs: "Conditional \u2014 Requires a \u201CC\u201D or better in ALL other business core courses. You are currently enrolled in MKTG 34303, which must be completed with a C or better this fall.",
        prereqStatus: "conditional",
        note: "As long as you pass MKTG 34303, you\u2019re clear. This is the right time to take it \u2014 it\u2019s your last business core requirement.",
        badges: ["conditional"],
      }

    /* ----- ECON 43303 ----- */
    case "ECON 43303": {
      // Count total planned ECON courses
      const econCount = [...plannedCodes].filter(cd => cd.startsWith("ECON")).length
      const hasEcon30303IP = inProgressFall2026.has("ECON 30303")
      const heavyLoad = econCount >= 3
      const badges: string[] = []
      if (heavyLoad) badges.push("workload flag")
      return {
        code: c.code, name: c.name,
        status: hasEcon30303IP ? "conditional" : "fail",
        countsToward: "Economics Major \u2014 Required",
        prereqs: hasEcon30303IP
          ? "Conditional \u2014 Requires ECON 30303 (Intermediate Microeconomics), which you are taking this fall. Must complete with a \u201CC\u201D or better."
          : "Not met \u2014 Requires ECON 30303 (Intermediate Microeconomics). You have not taken or enrolled in this course.",
        prereqStatus: hasEcon30303IP ? "conditional" : "notmet",
        note: heavyLoad
          ? "Workload flag \u2014 you\u2019re planning multiple required economics courses in one semester with a heavy quantitative load. The 8-semester plan recommends deferring ECON 43303 to Fall 2027. Consider this carefully."
          : "Required for your Economics major. On track if prerequisite is met.",
        badges,
      }
    }

    /* ----- FINN 30603 (Investments) ----- */
    case "FINN 30603": {
      const hasFinn30103 = completedCourses.has("FINN 30103") || plannedCodes.has("FINN 30103")
      const hasFinn20403 = completedCourses.has("FINN 20403")
      if (hasFinn20403 && hasFinn30103) {
        return {
          code: c.code, name: c.name, status: "pass",
          countsToward: "Finance Minor requirement + Junior/Senior Business Elective",
          prereqs: "Met \u2014 FINN 20403 (\u2713 completed) and FINN 30103 (\u2713 " +
            (plannedCodes.has("FINN 30103") ? "co-enrolled this semester" : "completed") + ")",
          prereqStatus: "met",
          note: "Counts toward your Finance minor and Jr/Sr business elective hours.",
          badges: [],
        }
      }
      return {
        code: c.code, name: c.name, status: "fail",
        countsToward: "Finance Minor requirement + Junior/Senior Business Elective",
        prereqs: "Not met. FINN 30603 requires FINN 20403 (\u2713 you have it) AND FINN 30103 Financial Analysis as a prerequisite or corequisite. You have not taken FINN 30103 and it is not in your plan.",
        prereqStatus: "notmet",
        note: "You cannot register for this course.",
        impact: "This also blocks your Finance minor \u2014 FINN 30103 is required for the minor anyway, so you need it regardless. If you want Investments in Fall 2027, take FINN 30103 this spring.",
        badges: ["cannot register"],
      }
    }

    /* ----- FINN 30103 (Financial Analysis) — EXEMPT from flags ----- */
    case "FINN 30103": {
      const hasFinn20403 = completedCourses.has("FINN 20403")
      return {
        code: c.code, name: c.name,
        status: hasFinn20403 ? "pass" : "fail",
        countsToward: "Finance Minor \u2014 Required + Junior/Senior Business Elective",
        prereqs: hasFinn20403
          ? "Met \u2014 FINN 20403 (\u2713 completed)"
          : "Not met \u2014 Requires FINN 20403 (Principles of Finance).",
        prereqStatus: hasFinn20403 ? "met" : "notmet",
        note: hasFinn20403
          ? "Great choice. Unlocks FINN 30603 (Investments), FINN 36003 (Corporate Finance), and FINN 31003 (Financial Modeling) for future semesters. Also counts toward your Jr/Sr business elective requirement."
          : "You need FINN 20403 first.",
        badges: [],
      }
    }

    /* ----- ECON 47503 (Forecasting) ----- */
    case "ECON 47503":
      return {
        code: c.code, name: c.name, status: "conditional",
        countsToward: "Economics Major \u2014 Required",
        prereqs: "Conditional \u2014 Requires ECON 47403 (Econometrics) as a prerequisite or corequisite.",
        prereqStatus: plannedCodes.has("ECON 47403") ? "conditional" : "notmet",
        note: plannedCodes.has("ECON 47403")
          ? "You are co-enrolling in ECON 47403 this semester. Must pass it for this to count."
          : "ECON 47403 is not in your plan and has not been completed.",
        badges: ["conditional"],
      }

    /* ----- ECON 30303 (Intermediate Micro) ----- */
    case "ECON 30303": {
      const hasPrereqs = completedCourses.has("ECON 22003") && completedCourses.has("MATH 22003")
      return {
        code: c.code, name: c.name,
        status: hasPrereqs ? "pass" : "fail",
        countsToward: "Economics Major \u2014 Required",
        prereqs: hasPrereqs
          ? "Met \u2014 ECON 22003 (\u2713), MATH 22003 (\u2713)"
          : "Not met.",
        prereqStatus: hasPrereqs ? "met" : "notmet",
        note: "Required for the Economics major.",
        badges: [],
      }
    }

    /* ----- FINN 20403 ----- */
    case "FINN 20403":
      return {
        code: c.code, name: c.name, status: "pass",
        countsToward: "Business Core \u2014 Required",
        prereqs: "Met \u2014 ACCT 20103 (\u2713), ACCT 20203 (\u2713)",
        prereqStatus: "met",
        note: "Part of Business Core. On track.",
        badges: [],
      }

    /* ----- MKTG 34303 ----- */
    case "MKTG 34303":
      return {
        code: c.code, name: c.name, status: "pass",
        countsToward: "Business Core \u2014 Required",
        prereqs: "Met",
        prereqStatus: "met",
        note: "Business Core course. On track.",
        badges: [],
      }

    /* ----- Generic fallback for any other courses ----- */
    default:
      return {
        code: c.code, name: c.name, status: "pass",
        countsToward: c.cat,
        prereqs: "Assumed met (not in detailed prerequisite database)",
        prereqStatus: "met",
        note: "No issues detected.",
        badges: [],
      }
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
      message: `You are planning ${totalHrs} credit hours, which is below the standard full-time minimum of ${STANDARD_MIN} hours. You may need more courses to maintain full-time status or stay on track for graduation.`,
    })
  } else if (totalHrs >= STANDARD_MIN && totalHrs <= STANDARD_MAX) {
    flags.push({
      type: "info",
      message: `${totalHrs} credit hours is a standard semester load (${STANDARD_MIN}\u2013${STANDARD_MAX} hrs). You are within normal limits.`,
    })
  } else if (totalHrs === GPA_275_MAX) {
    if (STUDENT.gpa >= 2.75) {
      flags.push({
        type: "warning",
        message: `${totalHrs} credit hours exceeds the standard ${STANDARD_MAX}-hour limit. Because your GPA (${STUDENT.gpa}) is above 2.75, you are eligible for up to ${GPA_275_MAX} hours with advisor approval.`,
      })
    } else {
      flags.push({
        type: "error",
        message: `${totalHrs} credit hours exceeds the standard ${STANDARD_MAX}-hour limit. Your GPA (${STUDENT.gpa}) is below 2.75, so the maximum is ${STANDARD_MAX} hours. You must remove a course or get a special exception.`,
      })
    }
  } else if (totalHrs > GPA_275_MAX && totalHrs <= SENIOR_FINAL_MAX) {
    if (STUDENT.isSeniorFinalSemester) {
      flags.push({
        type: "warning",
        message: `${totalHrs} credit hours exceeds the typical maximum. As a senior in your final semester, you may take up to ${SENIOR_FINAL_MAX} hours if necessary for graduation, subject to advisor approval.`,
      })
    } else {
      flags.push({
        type: "error",
        message: `${totalHrs} credit hours exceeds the maximum allowed (${GPA_275_MAX} hrs for students with a 2.75+ GPA). As a ${STUDENT.classification}, you are not eligible for the senior final-semester exception. Remove at least ${totalHrs - GPA_275_MAX} credit hour(s).`,
      })
    }
  } else if (totalHrs > SENIOR_FINAL_MAX) {
    flags.push({
      type: "error",
      message: `${totalHrs} credit hours far exceeds the absolute maximum of ${SENIOR_FINAL_MAX} hours (only available to seniors in their final semester). You must reduce your course load.`,
    })
  }

  return flags
}

/* ------------------------------------------------------------------ */
/*  Degree progress calculator                                         */
/* ------------------------------------------------------------------ */

function computeDegreeProgress(planned: Course[], courseResults: CourseResult[]): DegreeItem[] {
  const plannedCodes = new Set(planned.map(c => c.code))
  const totalHrs = planned.reduce((s, c) => s + c.hrs, 0)
  const hrsAfter = STUDENT.hoursCompleted + totalHrs

  // How many econ major hours are planned
  const econMajorPlanned = planned.filter(c =>
    c.code.startsWith("ECON") && parseInt(c.code.split(" ")[1]) >= 30000
  ).reduce((s, c) => s + c.hrs, 0)
  const econMajorIP = 0 // ECON 30303 and ECON 34303 in-progress count separately
  const econMajorAfter = econMajorIP + econMajorPlanned // from planned spring courses

  // Business core
  const hasSevi = plannedCodes.has("SEVI 30103")
  const businessCoreAfter = hasSevi ? 21 : 18

  // Finance minor progress
  const finMinorCodes = ["FINN 30103", "FINN 30603", "FINN 36003", "FINN 31003", "FINN 34303"]
  const finMinorHrs = planned.filter(c => finMinorCodes.includes(c.code)).reduce((s, c) => s + c.hrs, 0)

  // Jr/Sr business electives
  const jrSrCodes = planned.filter(c => {
    const num = parseInt(c.code.split(" ")[1])
    const prefix = c.code.split(" ")[0]
    const jrSrPrefixes = ["ACCT", "BLAW", "ECON", "FINN", "ISYS", "MGMT", "MKTG", "SCMT", "SEVI", "BUSI"]
    return num >= 30000 && jrSrPrefixes.includes(prefix) &&
      !["ECON 30503", "ECON 30603", "MGMT 35603"].includes(c.code)
  })
  // Subtract courses that count toward major or business core
  const majorOrCoreCodes = new Set([
    "ECON 31303", "ECON 47403", "ECON 43303", "ECON 30303", "ECON 47503",
    "SEVI 30103", "MKTG 34303", "FINN 20403",
  ])
  const jrSrElectiveHrs = jrSrCodes.filter(c => !majorOrCoreCodes.has(c.code)).reduce((s, c) => s + c.hrs, 0)

  // State min core
  const stateMinAfter = 16 // still need natural science lecture + lab (4 hrs)

  // Gen electives
  const genElectiveCodes = ["COMM 12003"]
  const genElectiveHrs = planned.filter(c => genElectiveCodes.includes(c.code)).reduce((s, c) => s + c.hrs, 0)

  return [
    {
      label: "Credit Hours",
      detail: `After this semester: ${STUDENT.hoursCompleted} \u2192 ${hrsAfter} of 120 hours (${Math.round(hrsAfter / 120 * 100)}%)`,
      value: hrsAfter, total: 120, color: "bg-primary",
    },
    {
      label: "Economics Major",
      detail: `After this semester: ${econMajorAfter} of 24 required major hours`,
      value: econMajorAfter, total: 24, color: econMajorAfter >= 12 ? "bg-primary" : "bg-amber-500",
    },
    {
      label: "Business Core",
      detail: hasSevi
        ? "Complete after this semester (SEVI 30103 finishes it)"
        : `${businessCoreAfter} of 21 hours \u2014 SEVI 30103 (Strategic Management) still needed`,
      value: businessCoreAfter, total: 21,
      done: businessCoreAfter >= 21, color: businessCoreAfter >= 21 ? "bg-emerald-500" : "bg-amber-500",
    },
    {
      label: "Finance Minor",
      detail: finMinorHrs > 0
        ? `${finMinorHrs} of 15 hours this semester \u2014 getting started`
        : "0 of 15 hours \u2014 not started. FINN 30103 (required) is not in your plan.",
      value: finMinorHrs, total: 15,
      color: finMinorHrs > 0 ? "bg-amber-500" : "bg-red-400",
    },
    {
      label: "Jr/Sr Business Electives",
      detail: jrSrElectiveHrs > 0
        ? `${jrSrElectiveHrs} of 12 hours \u2014 finance minor courses can count toward this`
        : "0 of 12 hours \u2014 finance minor courses can count toward this",
      value: jrSrElectiveHrs, total: 12,
      color: jrSrElectiveHrs > 0 ? "bg-amber-500" : "bg-red-400",
    },
    {
      label: "State Minimum Core",
      detail: `${stateMinAfter} of 20 hours \u2014 still need 1 Natural Science lecture + lab (4 hrs)`,
      value: stateMinAfter, total: 20, color: "bg-amber-500",
    },
    {
      label: "General Electives",
      detail: genElectiveHrs > 0
        ? `${genElectiveHrs} of 6 hours \u2014 ${6 - genElectiveHrs} remaining`
        : "0 of 6 hours remaining",
      value: genElectiveHrs, total: 6,
      color: genElectiveHrs > 0 ? "bg-amber-500" : "bg-red-400",
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

  // Primary suggestion: FINN 30603 → FINN 30103 swap
  if (hasFinn30603 && !hasFinn30103 && finn30603Fail) {
    return {
      title: "Replace FINN 30603 with FINN 30103 (Financial Analysis) this semester.",
      body: [
        "This is a no-brainer: FINN 30103 is required for your Finance minor, it only requires FINN 20403 (which you\u2019ve completed), and it unlocks FINN 30603 (Investments), FINN 36003 (Corporate Finance), and FINN 31003 (Financial Modeling) for Fall 2027. You haven\u2019t started your minor yet \u2014 15 hours across 3 remaining semesters means you need to begin now.",
        "FINN 30103 also counts toward your Jr/Sr business elective requirement (0 of 12 hrs), so it pulls double duty.",
        "Separately, don\u2019t forget you still need a Natural Science lecture + lab (4 hrs) for State Minimum Core. Fitting a lab into senior year is harder \u2014 consider taking it over the summer or in Fall 2027.",
      ],
    }
  }

  // If FINN 30103 is already in the plan, suggest something else
  if (hasFinn30103 && !hasFinn30603) {
    return {
      title: "Good move adding FINN 30103 \u2014 your Finance minor is now on track.",
      body: [
        "FINN 30103 unlocks FINN 30603 (Investments), FINN 36003 (Corporate Finance), and FINN 31003 (Financial Modeling) for Fall 2027 and beyond. You still need 12 more hours across 2 semesters \u2014 tight but doable.",
        "Don\u2019t forget you still need a Natural Science lecture + lab (4 hrs) for State Minimum Core. Consider taking it over the summer or in Fall 2027.",
      ],
    }
  }

  // If both FINN 30103 and 30603 are planned
  if (hasFinn30103 && hasFinn30603) {
    return {
      title: "Strong plan \u2014 FINN 30103 serves as the corequisite for FINN 30603.",
      body: [
        "Both courses count toward your Finance minor and Jr/Sr business elective requirements. That\u2019s 6 hours of double-duty progress.",
        "Make sure you can handle the total credit load. Don\u2019t forget your Natural Science lecture + lab requirement for State Minimum Core.",
      ],
    }
  }

  // Generic fallback
  const failCount = courseResults.filter(r => r.status === "fail").length
  if (failCount > 0) {
    return {
      title: "Address the prerequisite issues above before registering.",
      body: [
        `${failCount} course(s) have unmet prerequisites. You won\u2019t be able to register for these until the issues are resolved.`,
        "Don\u2019t forget you still need a Natural Science lecture + lab (4 hrs) for State Minimum Core.",
      ],
    }
  }

  return null
}

/* ------------------------------------------------------------------ */
/*  Graduation timeline                                                */
/* ------------------------------------------------------------------ */

function computeTimeline(planned: Course[]): string {
  const totalHrs = planned.reduce((s, c) => s + c.hrs, 0)
  const hrsAfter = STUDENT.hoursCompleted + totalHrs
  const remaining = 120 - hrsAfter
  const plannedCodes = new Set(planned.map(c => c.code))
  const hasFinn30103 = plannedCodes.has("FINN 30103")

  if (remaining <= 0) {
    return "With this semester\u2019s courses, you will reach 120 hours. Verify all category requirements are satisfied for graduation."
  }

  const semestersLeft = remaining <= 18 ? 1 : remaining <= 36 ? 2 : 3
  const avgPerSem = Math.ceil(remaining / semestersLeft)
  const minorNote = hasFinn30103
    ? "You\u2019ve started the Finance minor \u2014 stay focused on completing 12 more hours across the remaining semesters."
    : "You still need 15 hours of Finance minor courses and haven\u2019t started. Resolving the FINN 30103 issue this spring is critical to staying on track for both the degree and the minor."

  return `You have ${remaining} credit hours remaining after this semester across ${semestersLeft === 1 ? "1 semester" : `${semestersLeft} semesters`} (Fall 2027${semestersLeft > 1 ? ", Spring 2028" : ""}). That\u2019s ~${avgPerSem} hrs/semester \u2014 ${avgPerSem <= 15 ? "very manageable" : avgPerSem <= 17 ? "tight but doable" : "a heavy load"}. ${minorNote}`
}

/* ------------------------------------------------------------------ */
/*  Main validation entry point                                        */
/* ------------------------------------------------------------------ */

export function validatePlan(planned: Course[]): ValidationResult {
  const plannedCodes = new Set(planned.map(c => c.code))
  const totalHrs = planned.reduce((s, c) => s + c.hrs, 0)

  // Validate each course
  const courses = planned.map(c => validateCourse(c, plannedCodes))

  // Credit-hour load flags
  const loadFlags = evaluateLoad(totalHrs)

  // Degree progress
  const degreeProgress = computeDegreeProgress(planned, courses)

  // Suggestion
  const suggestion = generateSuggestion(planned, courses)

  // Timeline
  const timeline = computeTimeline(planned)

  // Summary counts
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
