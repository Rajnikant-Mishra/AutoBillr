import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout / Auth
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public pages
import LandingPage from "./pages/landing/LandingPage";
import PricingPage from "./pages/landing/PricingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

// Protected pages
import Dashboard from "./pages/dashboard/Dashboard";
import Projects from "./pages/projects/Projects";
import Clients from "./pages/clients/Clients";
import Composer from "./pages/composer/Composer";
import InvoicePreview from "./pages/composer/InvoicePreview";
import Invoices from "./pages/invoices/Invoices";
import RecurringBilling from "./pages/automation/RecurringBilling";
import AdvancedAnalytics from "./pages/analytics/AdvancedAnalytics";
import TeamPermissions from "./pages/team/TeamPermissions";
import ClientPortal from "./pages/clients/ClientPortal";
import Settings from "./pages/setting/Settings";
import Help from "./pages/adminSettings/Help";

// Admin Settings pages
import SettingsLayout from "./pages/adminSettings/SettingsLayout";
import AccountSettings from "./pages/adminSettings/AccountSettings";
import ProfileSettings from "./pages/adminSettings/ProfileSettings";
import SecuritySettings from "./pages/adminSettings/SecuritySettings";
import NotificationSettings from "./pages/adminSettings/NotificationSettings";

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedLayout>
              <Projects />
            </ProtectedLayout>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedLayout>
              <Clients />
            </ProtectedLayout>
          }
        />

        <Route
          path="/composer"
          element={
            <ProtectedLayout>
              <Composer />
            </ProtectedLayout>
          }
        />

        <Route
          path="/composer/:id"
          element={
            <ProtectedLayout>
              <Composer />
            </ProtectedLayout>
          }
        />

        {/* Both singular and plural routes for invoices */}
        <Route
          path="/invoices"
          element={
            <ProtectedLayout>
              <Invoices />
            </ProtectedLayout>
          }
        />
        <Route
          path="/invoice"
          element={
            <ProtectedLayout>
              <Invoices />
            </ProtectedLayout>
          }
        />

        <Route
          path="/invoice-preview"
          element={
            <ProtectedRoute>
              <InvoicePreview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedLayout>
              <AdvancedAnalytics />
            </ProtectedLayout>
          }
        />

        <Route
          path="/automation"
          element={
            <ProtectedLayout>
              <RecurringBilling />
            </ProtectedLayout>
          }
        />

        <Route
          path="/team"
          element={
            <ProtectedLayout>
              <TeamPermissions />
            </ProtectedLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          }
        />

        <Route
          path="/clientportal"
          element={
            <ProtectedRoute>
              <ClientPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/help"
          element={
            <ProtectedLayout>
              <Help />
            </ProtectedLayout>
          }
        />

        {/* PROTECTED PRICING */}
        <Route
          path="/app/pricing"
          element={
            <ProtectedRoute>
              <PricingPage variant="app" />
            </ProtectedRoute>
          }
        />

        {/* ADMIN SETTINGS */}
        <Route
          path="/adminsettings"
          element={
            <ProtectedLayout>
              <SettingsLayout />
            </ProtectedLayout>
          }
        >
          <Route index element={<AccountSettings />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      {/* TOASTER */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 4000,
        }}
      />
    </BrowserRouter>
  );
}

export default App;