import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSchoolData } from "@/contexts/SchoolDataContext";
import { canAccessRoute, getDefaultRouteForRole, type AppRole } from "@/lib/access";

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: AppRole[] }) {
  const { session, loading } = useAuth();
  const { currentUserRole, status } = useSchoolData();

  if (loading || (session && status === "loading")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center">
            <i className="ri-school-line text-white text-lg"></i>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(currentUserRole as AppRole)) {
    return <Navigate to={getDefaultRouteForRole(currentUserRole as AppRole)} replace />;
  }
  if (!allowedRoles && !canAccessRoute(currentUserRole as AppRole, window.location.pathname)) {
    return <Navigate to={getDefaultRouteForRole(currentUserRole as AppRole)} replace />;
  }

  return <>{children}</>;
}
