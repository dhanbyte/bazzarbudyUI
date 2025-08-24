import { Navigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { JSX } from "react";

type ProtectedRouteProps = {
  allowedRoles: string;
  children: JSX.Element;
};

const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { user, role: userRole, loading } = useAuth();

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (userRole !== allowedRoles) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;