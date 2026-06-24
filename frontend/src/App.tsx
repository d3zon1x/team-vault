import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Toaster } from 'sonner';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { CreateWorkspacePage } from './pages/CreateWorkspacePage';
import { WorkspaceDetailPage } from './pages/WorkspaceDetailPage';
import { WorkspaceSettingsPage } from './pages/WorkspaceSettingsPage';
import { WorkspaceMembersPage } from './pages/WorkspaceMembersPage';
import { PagesListPage } from './pages/PagesListPage';
import { CreatePagePage } from './pages/CreatePagePage';
import { PageEditorPage } from './pages/PageEditorPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workspaces/new" element={<CreateWorkspacePage />} />
              <Route path="/workspaces/:id" element={<WorkspaceDetailPage />} />
              <Route path="/workspaces/:id/pages" element={<PagesListPage />} />
              <Route
                path="/workspaces/:id/pages/new"
                element={<CreatePagePage />}
              />
              <Route
                path="/workspaces/:id/pages/:pageId"
                element={<PageEditorPage />}
              />
              <Route
                path="/workspaces/:id/settings"
                element={<WorkspaceSettingsPage />}
              />
              <Route
                path="/workspaces/:id/members"
                element={<WorkspaceMembersPage />}
              />
              <Route
                path="/workspaces/:id/audit-logs"
                element={<AuditLogsPage />}
              />
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
export default App;
