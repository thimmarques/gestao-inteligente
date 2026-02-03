import React, { Suspense, lazy, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout.tsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { AppProvider as AppContextProvider } from './contexts/AppContext.tsx';
import { seedLawyer } from './utils/seedLawyer.ts';
import { seedClients } from './utils/seedClients.ts';
import { seedCases } from './utils/seedCases.ts';
import { seedFinances } from './utils/seedFinances.ts';
import { seedDeadlines } from './utils/seedDeadlines.ts';
import { seedSchedules } from './utils/seedSchedules.ts';
import { seedAuditLogs } from './utils/seedAuditLogs.ts';

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
const Login = lazy(() => import('./pages/Login.tsx'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-slate-50 dark:bg-slate-950">
    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Added optional children type to resolve TS error when component is rendered within Route element prop
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  useEffect(() => {
    seedLawyer();
    seedClients();
    seedCases();
    seedFinances();
    seedDeadlines();
    seedSchedules();
    seedAuditLogs();
  }, []);

  return (
    <Routes>
      <Route path="/login" element={
        <Suspense fallback={<PageLoader />}>
          <Login />
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
                <Route path="/configuracoes" element={<Settings />} />
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
    <Router>
      <AuthProvider>
        <AppContextProvider>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </AppContextProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;