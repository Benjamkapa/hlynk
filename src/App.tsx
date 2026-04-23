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
        <Route path="tenants" element={<AdminTenantsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
