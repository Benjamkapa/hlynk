import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth/AuthContext'

// Public
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyOtpPage from './pages/auth/VerifyOtpPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Layouts
import ProviderLayout from './components/shared/ProviderLayout'
import AdminLayout from './components/shared/AdminLayout'
import SubscriptionGuard from './components/shared/SubscriptionGuard'

// Dashboards
import DashboardPage from './pages/provider/DashboardPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'

// Admin Pages
import SystemPerformancePage from './pages/admin/SystemPerformancePage'
import FinancialsPage from './pages/admin/FinancialsPage'
import UserOperationsPage from './pages/admin/UserOperationsPage'
import AuditSecurityPage from './pages/admin/AuditSecurityPage'
import ReportsPageAdmin from './pages/admin/ReportsPage'
import ProvidersPage from './pages/admin/ProvidersPage'
import SubscriptionsPageAdmin from './pages/admin/SubscriptionsPage'
import PaymentsPageAdmin from './pages/admin/PaymentsPage'
import SupportPageAdmin from './pages/admin/SupportPage'
import SettingsPageAdmin from './pages/admin/SettingsPage'
import HelpPageAdmin from './pages/admin/HelpPage'

// Provider Pages
import RecordSalePage from './pages/provider/RecordSalePage'
import CustomersPage from './pages/provider/CustomersPage'
import ReportsPageProvider from './pages/provider/ReportsPage'
import SubscriptionPage from './pages/provider/SubscriptionPage'
import ProductsPage from './pages/provider/ProductsPage'
import ExpensesPage from './pages/provider/ExpensesPage'
import SalesHistoryPage from './pages/provider/SalesHistoryPage'
import SupportPageProvider from './pages/provider/SupportPage'
import SettingsPageProvider from './pages/provider/SettingsPage'
import HelpPageProvider from './pages/provider/HelpPage'

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
      <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGuard><ProviderLayout /></SubscriptionGuard></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="sales/new" element={<RecordSalePage />} />
        <Route path="sales" element={<SalesHistoryPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="reports" element={<ReportsPageProvider />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="support" element={<SupportPageProvider />} />
        <Route path="settings" element={<SettingsPageProvider />} />
        <Route path="help" element={<HelpPageProvider />} />
      </Route>

      {/* Admin Portal */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="system-performance" element={<SystemPerformancePage />} />
        <Route path="financials" element={<FinancialsPage />} />
        <Route path="businesses" element={<ProvidersPage />} />
        <Route path="user-operations" element={<UserOperationsPage />} />
        <Route path="subscriptions" element={<SubscriptionsPageAdmin />} />
        <Route path="payments" element={<PaymentsPageAdmin />} />
        <Route path="support" element={<SupportPageAdmin />} />
        <Route path="audit" element={<AuditSecurityPage />} />
        <Route path="reports" element={<ReportsPageAdmin />} />
        <Route path="settings" element={<SettingsPageAdmin />} />
        <Route path="help" element={<HelpPageAdmin />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
