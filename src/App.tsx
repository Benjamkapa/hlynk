import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth/AuthContext'

// Public
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyOtpPage from './pages/auth/VerifyOtpPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Provider portal
import ProviderLayout from './components/shared/ProviderLayout'
import DashboardPage from './pages/provider/DashboardPage'
import ServicesPage from './pages/provider/ServicesPage'
import RequestsPage from './pages/provider/RequestsPage'
import SettingsPage from './pages/provider/SettingsPage'
import SubscriptionPage from './pages/provider/SubscriptionPage'

// Admin portal
import AdminLayout from './components/shared/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminTenantsPage from './pages/admin/AdminTenantsPage'
import AdminAddProviderPage from './pages/admin/AdminAddProviderPage'
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage'
import AdminRevenuePage from './pages/admin/AdminRevenuePage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import AdminSupportPage from './pages/admin/AdminSupportPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
  if (!user || user.role !== 'SUPER_ADMIN') return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Provider Portal */}
      <Route path="/dashboard" element={<ProtectedRoute><ProviderLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
      </Route>

      {/* Admin Portal */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboardPage />} />
        {/* Businesses */}
        <Route path="businesses" element={<AdminTenantsPage />} />
        <Route path="businesses/new" element={<AdminAddProviderPage />} />
        <Route path="businesses/activity" element={<AdminTenantsPage />} />
        
        {/* Subscriptions */}
        <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="subscriptions/active" element={<AdminSubscriptionsPage />} />
        <Route path="subscriptions/trials" element={<AdminSubscriptionsPage />} />
        <Route path="subscriptions/expired" element={<AdminSubscriptionsPage />} />
        
        {/* Revenue */}
        <Route path="revenue" element={<AdminRevenuePage />} />
        <Route path="revenue/payments" element={<AdminRevenuePage />} />
        <Route path="revenue/report" element={<AdminRevenuePage />} />
        
        {/* Others */}
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="support" element={<AdminSupportPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
