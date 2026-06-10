import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "src/components/Feedback/Spinner.views";
import { app } from "../app";
import { normalizeRole, useAccessControl } from "./AccessControl";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { acesso, hydrated, token } = useAccessControl();

  if (!hydrated) {
    return <Spinner />;
  }

  if (!token) {
    return <Navigate to={app.auth} replace />;
  }

  const normalizedAccess = normalizeRole(acesso);
  const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

  const hasAccess = normalizedAllowedRoles.includes(normalizedAccess);

  if (!hasAccess) {
    return <Navigate to={app.unauthorized} replace />;
  }

  return <Outlet />;
};
