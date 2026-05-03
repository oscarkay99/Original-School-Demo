/* eslint-disable react-refresh/only-export-components */
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

function ProtectedPage({ path, children }: { path: string; children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={routeAccess[path]}>{children}</ProtectedRoute>;
}

const routes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/", element: <ProtectedPage path="/"><Home /></ProtectedPage> },
  { path: "/students", element: <ProtectedPage path="/students"><StudentsPage /></ProtectedPage> },
  { path: "/teachers", element: <ProtectedPage path="/teachers"><TeachersPage /></ProtectedPage> },
  { path: "/parents", element: <ProtectedPage path="/parents"><ParentsPage /></ProtectedPage> },
  { path: "/attendance", element: <ProtectedPage path="/attendance"><AttendancePage /></ProtectedPage> },
  { path: "/finance", element: <ProtectedPage path="/finance"><FinancePage /></ProtectedPage> },
  { path: "/events", element: <ProtectedPage path="/events"><EventsPage /></ProtectedPage> },
  { path: "/inventory", element: <ProtectedPage path="/inventory"><InventoryPage /></ProtectedPage> },
  { path: "/reports", element: <ProtectedPage path="/reports"><ReportsPage /></ProtectedPage> },
  { path: "/users", element: <ProtectedPage path="/users"><UsersPage /></ProtectedPage> },
  { path: "/settings", element: <ProtectedPage path="/settings"><SettingsPage /></ProtectedPage> },
  { path: "/statistics", element: <ProtectedPage path="/statistics"><StatisticsPage /></ProtectedPage> },
  { path: "/ai-assistant", element: <ProtectedPage path="/ai-assistant"><AIAssistantPage /></ProtectedPage> },
  { path: "/grades", element: <ProtectedPage path="/grades"><GradesPage /></ProtectedPage> },
  { path: "/timetable", element: <ProtectedPage path="/timetable"><TimetablePage /></ProtectedPage> },
  { path: "/homework", element: <ProtectedPage path="/homework"><HomeworkPage /></ProtectedPage> },
  { path: "/classes", element: <ProtectedPage path="/classes"><ClassesPage /></ProtectedPage> },
  { path: "/id-cards", element: <ProtectedPage path="/id-cards"><IDCardsPage /></ProtectedPage> },
  { path: "/notifications", element: <ProtectedPage path="/notifications"><NotificationsPage /></ProtectedPage> },
  { path: "/hr-payroll", element: <ProtectedPage path="/hr-payroll"><HRPayrollPage /></ProtectedPage> },
  { path: "/accounts", element: <ProtectedPage path="/accounts"><AccountsPage /></ProtectedPage> },
  { path: "/meetings", element: <ProtectedPage path="/meetings"><MeetingsPage /></ProtectedPage> },
  { path: "*", element: <NotFound /> },
];

export default routes;
