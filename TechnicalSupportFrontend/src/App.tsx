import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from 'contexts/AuthContext';
import { SignalRProvider } from 'contexts/SignalRContext';
import Layout from 'components/Layout';
import ProtectedRoute from 'components/ProtectedRoute';
import LoadingSpinner from 'components/LoadingSpinner';

// Public Routes
const LoginPage = lazy(() => import('features/auth/routes/LoginPage'));
const RegisterPage = lazy(() => import('features/auth/routes/RegisterPage'));
const UnauthorizedPage = lazy(() => import('features/auth/routes/UnauthorizedPage'));

// Common Protected Routes
const DashboardPage = lazy(() => import('features/tickets/routes/DashboardPage'));
const TicketDetailPage = lazy(() => import('features/tickets/routes/TicketDetailPage'));

// Client Routes
const MyTicketsPage = lazy(() => import('features/tickets/routes/MyTicketsPage'));
const CreateTicketPage = lazy(() => import('features/tickets/routes/CreateTicketPage'));

// Agent/Manager/Admin Routes
const TicketQueuePage = lazy(() => import('features/tickets/routes/TicketQueuePage'));

// Permission Routes
const RequestPermissionPage = lazy(() => import('features/permissions/routes/RequestPermissionPage'));
const ReviewPermissionPage = lazy(() => import('features/permissions/routes/ReviewPermissionPage'));

// Management Routes
const GroupManagementPage = lazy(() => import('features/groups/routes/GroupManagementPage'));
const ProblemTypeManagementPage = lazy(() => import('features/problem-types/routes/ProblemTypeManagementPage'));

// Admin Routes
const UserManagementPage = lazy(() => import('features/admin/routes/UserManagementPage'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SignalRProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="tickets/:id" element={<TicketDetailPage />} />

                {/* Client */}
                <Route path="my-tickets" element={<ProtectedRoute permissions={['tickets:read_own']}><MyTicketsPage /></ProtectedRoute>} />
                <Route path="tickets/new" element={<ProtectedRoute permissions={['tickets:create']}><CreateTicketPage /></ProtectedRoute>} />
                
                {/* Agent, Manager, Admin */}
                <Route path="tickets" element={<ProtectedRoute permissions={['tickets:read_queue']}><TicketQueuePage /></ProtectedRoute>} />
                <Route path="permissions/request" element={<ProtectedRoute permissions={['permissions:request']}><RequestPermissionPage /></ProtectedRoute>} />

                {/* Managers */}
                <Route path="admin/groups" element={<ProtectedRoute permissions={['groups:manage']}><GroupManagementPage /></ProtectedRoute>} />
                <Route path="admin/permissions" element={<ProtectedRoute permissions={['permissions:review']}><ReviewPermissionPage /></ProtectedRoute>} />
                <Route path="admin/problem-types" element={<ProtectedRoute permissions={['problemtypes:manage']}><ProblemTypeManagementPage /></ProtectedRoute>} />
                
                {/* Admin only */}
                <Route path="admin/users" element={<ProtectedRoute permissions={['users:read']}><UserManagementPage /></ProtectedRoute>} />
                
                <Route path="*" element={<div>404 - Page Not Found in Layout</div>} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </SignalRProvider>
    </AuthProvider>
  );
};

export default App;