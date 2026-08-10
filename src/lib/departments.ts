export const DEPARTMENTS = [
  "CSE",
  "ISE",
  "AIML",
  "ECE",
  "ECS",
  "EEE",
  "ME",
  "Civil",
  "BT",
  "Automobile",
] as const;

export const DEPARTMENT_OPTIONS = [...DEPARTMENTS, "Other"] as const;

export const DEPARTMENT_HELP = "Select your department using the standard short code.";
export const DEPARTMENT_OTHER_HELP = "Enter your department using a short code.";

/**
 * Normalizes only formatting differences (extra spaces / capitalization).
 * Never maps one department onto a different one — unknown values are kept
 * as-is (just trimmed and space-collapsed) so existing records are preserved.
 */
export function normalizeDepartment(value: string | null | undefined): string {
  const cleaned = (value ?? "").trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  const match = DEPARTMENTS.find((d) => d.toLowerCase() === cleaned.toLowerCase());
  return match ?? cleaned;
}

/** True when the stored value is exactly one of the standard codes (ignoring case/spacing). */
export function isStandardDepartment(value: string | null | undefined): boolean {
  const cleaned = (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
  return DEPARTMENTS.some((d) => d.toLowerCase() === cleaned);
}
