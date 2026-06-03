import { Navigate } from "react-router-dom";
import { useAuth, AppRole } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children, role }: { children: JSX.Element; role?: AppRole }) => {
  const { user, role: userRole, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth/login" replace />;
  if (role === "admin" && userRole !== "admin") {
    return <Navigate to="/" replace />;
  }
  if (role && userRole !== role && userRole !== "admin") {
    return <Navigate to={userRole === "owner" ? "/owner/dashboard" : "/user/dashboard"} replace />;
  }
  return children;
};
