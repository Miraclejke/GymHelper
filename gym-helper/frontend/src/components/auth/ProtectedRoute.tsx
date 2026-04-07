import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { UserRole } from '../../store/types';
import { useAuth } from '../../context/AuthContext';
import StatusPanel from '../ui/StatusPanel';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
};

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="page center">
        <StatusPanel title="Проверяем сессию" description="Подождите пару секунд." variant="loading" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
