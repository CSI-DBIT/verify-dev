// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores";

interface ProtectedRouteProps {
  requiredRole?: 'MEMBER' | 'ORGANIZATION';
  children: JSX.Element,
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole, children }) => {
  const { isAuthenticated, userType } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check user role if required
  if (requiredRole && userType !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
