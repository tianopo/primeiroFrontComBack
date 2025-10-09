import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Spinner } from "src/components/Feedback/Spinner.views";
import { app } from "../app";
import { useAccessControl } from "./AccessControl";

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export const RoleProtectedRoute = ({ allowedRoles }: RoleProtectedRouteProps) => {
  const { acesso } = useAccessControl();
  const navigate = useNavigate();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (acesso === null) return; // Ainda carregando token

    const hasAccess = allowedRoles.includes(acesso);
    setUnauthorized(!hasAccess);
    setCheckingAccess(false);
  }, [acesso, allowedRoles, navigate]);

  if (checkingAccess) {
    return <Spinner />;
  }
  if (unauthorized) {
    return <Navigate to={app.unauthorized} replace />;
  }

  return <Outlet />;
};
