import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "../components/feature/ProtectedRoute";
import { routeAccess } from "@/lib/access";
import NotFound from "../pages/NotFound";
import LoginPage from "../pages/login/page";
import Home from "../pages/home/page";
import StudentsPage from "../pages/students/page";
import TeachersPage from "../pages/teachers/page";
import AttendancePage from "../pages/attendance/page";
import FinancePage from "../pages/finance/page";
import EventsPage from "../pages/events/page";
import InventoryPage from "../pages/inventory/page";
import ReportsPage from "../pages/reports/page";
import UsersPage from "../pages/users/page";
import SettingsPage from "../pages/settings/page";
import StatisticsPage from "../pages/statistics/page";
import AIAssistantPage from "../pages/ai-assistant/page";
import GradesPage from "../pages/grades/page";
import TimetablePage from "../pages/timetable/page";
import HomeworkPage from "../pages/homework/page";
import ClassesPage from "../pages/classes/page";
import IDCardsPage from "../pages/id-cards/page";
import NotificationsPage from "../pages/notifications/page";
import HRPayrollPage from "../pages/hr-payroll/page";
import AccountsPage from "../pages/accounts/page";
import ParentsPage from "../pages/parents/page";
import MeetingsPage from "../pages/meetings/page";

function protect(path: string, element: React.ReactNode) {
  return <ProtectedRoute allowedRoles={routeAccess[path]}>{element}</ProtectedRoute>;
}

const routes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/", element: protect("/", <Home />) },
  { path: "/students", element: protect("/students", <StudentsPage />) },
  { path: "/teachers", element: protect("/teachers", <TeachersPage />) },
  { path: "/parents", element: protect("/parents", <ParentsPage />) },
  { path: "/attendance", element: protect("/attendance", <AttendancePage />) },
  { path: "/finance", element: protect("/finance", <FinancePage />) },
  { path: "/events", element: protect("/events", <EventsPage />) },
  { path: "/inventory", element: protect("/inventory", <InventoryPage />) },
  { path: "/reports", element: protect("/reports", <ReportsPage />) },
  { path: "/users", element: protect("/users", <UsersPage />) },
  { path: "/settings", element: protect("/settings", <SettingsPage />) },
  { path: "/statistics", element: protect("/statistics", <StatisticsPage />) },
  { path: "/ai-assistant", element: protect("/ai-assistant", <AIAssistantPage />) },
  { path: "/grades", element: protect("/grades", <GradesPage />) },
  { path: "/timetable", element: protect("/timetable", <TimetablePage />) },
  { path: "/homework", element: protect("/homework", <HomeworkPage />) },
  { path: "/classes", element: protect("/classes", <ClassesPage />) },
  { path: "/id-cards", element: protect("/id-cards", <IDCardsPage />) },
  { path: "/notifications", element: protect("/notifications", <NotificationsPage />) },
  { path: "/hr-payroll", element: protect("/hr-payroll", <HRPayrollPage />) },
  { path: "/accounts", element: protect("/accounts", <AccountsPage />) },
  { path: "/meetings", element: protect("/meetings", <MeetingsPage />) },
  { path: "*", element: <NotFound /> },
];

export default routes;
