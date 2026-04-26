export type AppRole = "Admin" | "Teacher" | "Parent" | "Accountant" | "User";

export function normalizeRole(role?: string | null): AppRole {
  const normalized = (role ?? "").trim().toLowerCase();

  if (normalized === "admin" || normalized === "administrator") return "Admin";
  if (normalized.includes("teacher")) return "Teacher";
  if (normalized.includes("parent")) return "Parent";
  if (normalized.includes("account")) return "Accountant";

  return "User";
}

const adminOnly: AppRole[] = ["Admin"];
const adminAndTeacher: AppRole[] = ["Admin", "Teacher"];
const adminAndAccountant: AppRole[] = ["Admin", "Accountant"];
const staffRoles: AppRole[] = ["Admin", "Teacher", "Accountant"];
const everyoneExceptUser: AppRole[] = ["Admin", "Teacher", "Parent", "Accountant"];

export const routeAccess: Record<string, AppRole[]> = {
  "/": everyoneExceptUser,
  "/statistics": adminOnly,
  "/ai-assistant": everyoneExceptUser,
  "/students": adminAndTeacher,
  "/teachers": adminOnly,
  "/parents": adminOnly,
  "/classes": adminAndTeacher,
  "/timetable": adminAndTeacher,
  "/homework": adminAndTeacher,
  "/grades": adminAndTeacher,
  "/attendance": adminAndTeacher,
  "/id-cards": adminOnly,
  "/users": adminOnly,
  "/events": everyoneExceptUser,
  "/notifications": everyoneExceptUser,
  "/reports": ["Admin", "Teacher", "Accountant"],
  "/finance": adminAndAccountant,
  "/accounts": adminAndAccountant,
  "/hr-payroll": adminAndAccountant,
  "/inventory": adminAndAccountant,
  "/settings": adminOnly,
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
    case "Admin":
      return "/";
    default:
      return "/login";
  }
}
