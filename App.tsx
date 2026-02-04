import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { AppProvider as AppContextProvider } from './contexts/AppContext.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Pages
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const Clients = lazy(() => import('./pages/Clients.tsx'));
const Finance = lazy(() => import('./pages/Finance.tsx'));
const Cases = lazy(() => import('./pages/Cases.tsx'));
const Schedule = lazy(() => import('./pages/Schedule.tsx'));
const Deadlines = lazy(() => import('./pages/Deadlines.tsx'));
const Reports = lazy(() => import('./pages/Reports.tsx'));
const Settings = lazy(() => import('./pages/Settings.tsx'));
const Team = lazy(() => import('./pages/Team.tsx'));
// const Tasks = lazy(() => import('./pages/Tasks.tsx'));
const Login = lazy(() => import('./pages/Login.tsx'));
const Signup = lazy(() => import('./pages/Signup.tsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.tsx'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-slate-50 dark:bg-slate-950">
    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.first_login && location.pathname !== '/settings') {
    return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <Suspense fallback={<PageLoader />}>
          <Login />
        </Suspense>
      } />
      <Route path="/auth/signup" element={
        <Suspense fallback={<PageLoader />}>
          <Signup />
        </Suspense>
      } />
      <Route path="/auth/reset" element={
        <Suspense fallback={<PageLoader />}>
          <ResetPassword />
        </Suspense>
      } />
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/clientes" element={<Clients />} />
                <Route path="/processos" element={<Cases />} />
                <Route path="/agenda" element={<Schedule />} />
                <Route path="/prazos" element={<Deadlines />} />
                <Route path="/financeiro" element={<Finance />} />
                <Route path="/relatorios" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/equipe" element={<Team />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppContextProvider>
            <Suspense fallback={<PageLoader />}>
              <Toaster richColors position="top-right" duration={3000} closeButton />
              <AppRoutes />
            </Suspense>
          </AppContextProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
};

export default App;