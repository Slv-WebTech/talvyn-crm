import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { AppLayout } from '../components/layout/AppLayout.jsx'
import { Loader } from '../components/common/Loader.jsx'

const LoginPage = lazy(() => import('../pages/LoginPage.jsx').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx').then((m) => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('../pages/DashboardPage.jsx').then((m) => ({ default: m.DashboardPage })))
const LeadsPage = lazy(() => import('../pages/LeadsPage.jsx').then((m) => ({ default: m.LeadsPage })))
const LeadDetailPage = lazy(() =>
  import('../pages/LeadDetailPage.jsx').then((m) => ({ default: m.LeadDetailPage })),
)
const CustomersPage = lazy(() => import('../pages/CustomersPage.jsx').then((m) => ({ default: m.CustomersPage })))
const CustomerDetailPage = lazy(() =>
  import('../pages/CustomerDetailPage.jsx').then((m) => ({ default: m.CustomerDetailPage })),
)
const PipelinePage = lazy(() => import('../pages/PipelinePage.jsx').then((m) => ({ default: m.PipelinePage })))
const FollowUpsPage = lazy(() => import('../pages/FollowUpsPage.jsx').then((m) => ({ default: m.FollowUpsPage })))
const TasksPage = lazy(() => import('../pages/TasksPage.jsx').then((m) => ({ default: m.TasksPage })))
const UsersPage = lazy(() => import('../pages/UsersPage.jsx').then((m) => ({ default: m.UsersPage })))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage.jsx').then((m) => ({ default: m.NotFoundPage })))

export function AppRoutes() {
  return (
    <Suspense fallback={<Loader label="Loading…" className="full-page-loader" />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="leads" element={<LeadsPage />} />
          <Route path="leads/:id" element={<LeadDetailPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="followups" element={<FollowUpsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
