import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
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

const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/students", element: <StudentsPage /> },
  { path: "/teachers", element: <TeachersPage /> },
  { path: "/attendance", element: <AttendancePage /> },
  { path: "/finance", element: <FinancePage /> },
  { path: "/events", element: <EventsPage /> },
  { path: "/inventory", element: <InventoryPage /> },
  { path: "/reports", element: <ReportsPage /> },
  { path: "/users", element: <UsersPage /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "/statistics", element: <StatisticsPage /> },
  { path: "/ai-assistant", element: <AIAssistantPage /> },
  { path: "/grades", element: <GradesPage /> },
  { path: "/timetable", element: <TimetablePage /> },
  { path: "/homework", element: <HomeworkPage /> },
  { path: "/classes", element: <ClassesPage /> },
  { path: "/id-cards", element: <IDCardsPage /> },
  { path: "/notifications", element: <NotificationsPage /> },
  { path: "/hr-payroll", element: <HRPayrollPage /> },
  { path: "/accounts", element: <AccountsPage /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
