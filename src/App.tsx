import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth/AuthContext'
import { Loader2 } from 'lucide-react'

// Layouts
import ProviderLayout from './components/shared/ProviderLayout'
import AdminLayout from './components/shared/AdminLayout'
import SubscriptionGuard from './components/shared/SubscriptionGuard'

// Public
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const VerifyOtpPage = lazy(() => import('./pages/auth/VerifyOtpPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))

const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsConditions = lazy(() => import('./pages/TermsConditions'))
const GooglePrivacyPolicy = lazy(() => import('./pages/GooglePrivacyPolicy'))
const GoogleTermsConditions = lazy(() => import('./pages/GoogleTermsConditions'))

// Dashboards
const DashboardPage = lazy(() => import('./pages/provider/DashboardPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))

// Admin Pages
const SystemPerformancePage = lazy(() => import('./pages/admin/SystemPerformancePage'))
const FinancialsPage = lazy(() => import('./pages/admin/FinancialsPage'))
const UserOperationsPage = lazy(() => import('./pages/admin/UserOperationsPage'))
const AuditSecurityPage = lazy(() => import('./pages/admin/AuditSecurityPage'))
const ReportsPageAdmin = lazy(() => import('./pages/admin/ReportsPage'))
const ProvidersPage = lazy(() => import('./pages/admin/ProvidersPage'))
const SubscriptionsPageAdmin = lazy(() => import('./pages/admin/SubscriptionsPage'))
const PaymentsPageAdmin = lazy(() => import('./pages/admin/PaymentsPage'))
const SupportPageAdmin = lazy(() => import('./pages/admin/SupportPage'))
const SettingsPageAdmin = lazy(() => import('./pages/admin/SettingsPage'))
const HelpPageAdmin = lazy(() => import('./pages/admin/HelpPage'))

// Provider Pages
const RecordSalePage = lazy(() => import('./pages/provider/RecordSalePage'))
const CustomersPage = lazy(() => import('./pages/provider/CustomersPage'))
const ReportsPageProvider = lazy(() => import('./pages/provider/ReportsPage'))
const SubscriptionPage = lazy(() => import('./pages/provider/SubscriptionPage'))
const StaffManagementPage = lazy(() => import('./pages/provider/StaffManagementPage'))
const ProductsPage = lazy(() => import('./pages/provider/ProductsPage'))
const ExpensesPage = lazy(() => import('./pages/provider/ExpensesPage'))
const SalesHistoryPage = lazy(() => import('./pages/provider/SalesHistoryPage'))
const SupportPageProvider = lazy(() => import('./pages/provider/SupportPage'))
const SettingsPageProvider = lazy(() => import('./pages/provider/SettingsPage'))
const HelpPageProvider = lazy(() => import('./pages/provider/HelpPage'))
const DeveloperPage = lazy(() => import('./pages/provider/DeveloperPage'))
const LogsPage = lazy(() => import('./pages/provider/MpesaLogsPage'))

function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingScreen />
  if (!user || user.role !== 'SUPER_ADMIN') return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route path="/verify" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Legal pages (public) */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/google/privacy" element={<GooglePrivacyPolicy />} />
        <Route path="/google/terms" element={<GoogleTermsConditions />} />

        {/* Provider Portal */}
        <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGuard><ProviderLayout /></SubscriptionGuard></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="sales/new" element={<RecordSalePage />} />
          <Route path="sales" element={<SalesHistoryPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="staff" element={<StaffManagementPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="reports" element={<ReportsPageProvider />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="support" element={<SupportPageProvider />} />
          <Route path="settings" element={<SettingsPageProvider />} />
          <Route path="developer" element={<DeveloperPage />} />
          <Route path="logs" element={<LogsPage />} />
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
          <Route path="forensic-audit" element={<LogsPage />} />
          <Route path="reports" element={<ReportsPageAdmin />} />
          <Route path="settings" element={<SettingsPageAdmin />} />
          <Route path="help" element={<HelpPageAdmin />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
