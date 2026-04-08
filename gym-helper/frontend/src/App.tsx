import { Navigate, Route, Routes } from 'react-router-dom';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NutritionPage from './pages/NutritionPage';
import NotFoundPage from './pages/NotFoundPage';
import PlanPage from './pages/PlanPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import RestPage from './pages/RestPage';
import WorkoutPage from './pages/WorkoutPage';
import { getTodayISO } from './utils/date';

export default function App() {
  const today = getTodayISO();

  return (
    <AppShell>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plan"
          element={
            <ProtectedRoute>
              <PlanPage />
            </ProtectedRoute>
          }
        />
        <Route path="/workout" element={<Navigate to={`/workout/${today}`} replace />} />
        <Route
          path="/workout/:date"
          element={
            <ProtectedRoute>
              <WorkoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/nutrition" element={<Navigate to={`/nutrition/${today}`} replace />} />
        <Route
          path="/nutrition/:date"
          element={
            <ProtectedRoute>
              <NutritionPage />
            </ProtectedRoute>
          }
        />
        <Route path="/rest" element={<Navigate to={`/rest/${today}`} replace />} />
        <Route
          path="/rest/:date"
          element={
            <ProtectedRoute>
              <RestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AppShell>
  );
}
