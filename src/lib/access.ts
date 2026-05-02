export type AppRole = "Admin" | "Teacher" | "Parent" | "Accountant" | "Secretary" | "User";

export function normalizeRole(role?: string | null): AppRole {
  const normalized = (role ?? "").trim().toLowerCase();

  if (normalized === "admin" || normalized === "administrator") return "Admin";
  if (normalized.includes("teacher")) return "Teacher";
  if (normalized.includes("parent")) return "Parent";
  if (normalized.includes("account")) return "Accountant";
  if (
    normalized.includes("secretary") ||
    normalized.includes("reception") ||
    normalized.includes("front desk") ||
    normalized.includes("admin assistant")
  ) {
    return "Secretary";
  }

  return "User";
}

const adminOnly: AppRole[] = ["Admin"];
const adminAndTeacher: AppRole[] = ["Admin", "Teacher"];
const adminAndAccountant: AppRole[] = ["Admin", "Accountant"];
const adminAndSecretary: AppRole[] = ["Admin", "Secretary"];
const adminTeacherAndSecretary: AppRole[] = ["Admin", "Teacher", "Secretary"];
const staffRoles: AppRole[] = ["Admin", "Teacher", "Accountant", "Secretary"];
const everyoneExceptUser: AppRole[] = ["Admin", "Teacher", "Parent", "Accountant", "Secretary"];
const everyoneExceptTeacherAndUser: AppRole[] = ["Admin", "Parent", "Accountant", "Secretary"];

export const routeAccess: Record<string, AppRole[]> = {
  "/": everyoneExceptUser,
  "/statistics": adminOnly,
  "/ai-assistant": everyoneExceptUser,
  "/students": adminTeacherAndSecretary,
  "/teachers": adminOnly,
  "/parents": adminAndSecretary,
  "/classes": adminTeacherAndSecretary,
  "/timetable": adminTeacherAndSecretary,
  "/homework": adminAndTeacher,
  "/grades": adminAndTeacher,
  "/attendance": adminTeacherAndSecretary,
  "/id-cards": adminAndSecretary,
  "/users": adminOnly,
  "/events": everyoneExceptTeacherAndUser,
  "/notifications": everyoneExceptUser,
  "/reports": ["Admin", "Teacher", "Accountant", "Secretary"],
  "/finance": adminAndAccountant,
  "/accounts": adminAndAccountant,
  "/hr-payroll": adminAndAccountant,
  "/inventory": ["Admin", "Accountant", "Secretary"],
  "/settings": adminOnly,
  "/meetings": everyoneExceptUser,
};

export function canAccessRoute(role: AppRole, path: string) {
  const allowedRoles = routeAccess[path];
  if (!allowedRoles) return role === "Admin";
  return allowedRoles.includes(role);
}

export function getDefaultRouteForRole(role: AppRole) {
  switch (role) {
    case "Teacher":
      return "/homework";
    case "Parent":
      return "/events";
    case "Accountant":
      return "/finance";
    case "Secretary":
      return "/events";
    case "Admin":
      return "/";
    default:
      return "/login";
  }
}
