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

// ============================================================
// PUBLIC PAGES
// ============================================================

import LandingPage from "./pages/landing/LandingPage";
import PricingPage from "./pages/landing/PricingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

// ============================================================
// PROTECTED PAGES
// ============================================================

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

// ============================================================
// SETTINGS
// ============================================================

import SettingsLayout from "./pages/adminSettings/SettingsLayout";
import AccountSettings from "./pages/adminSettings/AccountSettings";
import ProfileSettings from "./pages/adminSettings/ProfileSettings";
import SecuritySettings from "./pages/adminSettings/SecuritySettings";
import NotificationSettings from "./pages/adminSettings/NotificationSettings";

// ============================================================
// PROTECTED LAYOUT
// ============================================================

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ======================================================
            PUBLIC ROUTES
        ====================================================== */}

        {/* Landing */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* Public Pricing */}
        <Route
          path="/pricing"
          element={<PricingPage />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Email Verification */}
        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        {/* ======================================================
            PROTECTED ROUTES
        ====================================================== */}

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        {/* Projects */}
        <Route
          path="/projects"
          element={
            <ProtectedLayout>
              <Projects />
            </ProtectedLayout>
          }
        />

        {/* Clients */}
        <Route
          path="/clients"
          element={
            <ProtectedLayout>
              <Clients />
            </ProtectedLayout>
          }
        />

        {/* Invoice Composer - New */}
        <Route
          path="/composer"
          element={
            <ProtectedLayout>
              <Composer />
            </ProtectedLayout>
          }
        />

        {/* Invoice Composer - Edit */}
        <Route
          path="/composer/:id"
          element={
            <ProtectedLayout>
              <Composer />
            </ProtectedLayout>
          }
        />

        {/* Invoices */}
        <Route
          path="/invoices"
          element={
            <ProtectedLayout>
              <Invoices />
            </ProtectedLayout>
          }
        />

        {/* Invoice Preview */}
        <Route
          path="/invoice-preview"
          element={
            <ProtectedRoute>
              <InvoicePreview />
            </ProtectedRoute>
          }
        />

        {/* Analytics */}
        <Route
          path="/analytics"
          element={
            <ProtectedLayout>
              <AdvancedAnalytics />
            </ProtectedLayout>
          }
        />

        {/* Recurring Billing */}
        <Route
          path="/automation"
          element={
            <ProtectedLayout>
              <RecurringBilling />
            </ProtectedLayout>
          }
        />

        {/* Team & Permissions */}
        <Route
          path="/team"
          element={
            <ProtectedLayout>
              <TeamPermissions />
            </ProtectedLayout>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          }
        />

        {/* Help */}
        <Route
          path="/help"
          element={
            <ProtectedLayout>
              <Help />
            </ProtectedLayout>
          }
        />

        {/* Client Portal */}
        <Route
          path="/clientportal"
          element={
            <ProtectedRoute>
              <ClientPortal />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
            PROTECTED PRICING
        ====================================================== */}

        <Route
          path="/app/pricing"
          element={
            <ProtectedRoute>
              <PricingPage variant="app" />
            </ProtectedRoute>
          }
        />

        {/* ======================================================
            ADMIN SETTINGS
        ====================================================== */}

        <Route
          path="/adminsettings"
          element={
            <ProtectedLayout>
              <SettingsLayout />
            </ProtectedLayout>
          }
        >
          {/* /adminsettings */}
          <Route
            index
            element={<AccountSettings />}
          />

          {/* /adminsettings/profile */}
          <Route
            path="profile"
            element={<ProfileSettings />}
          />

          {/* /adminsettings/security */}
          <Route
            path="security"
            element={<SecuritySettings />}
          />

          {/* /adminsettings/notifications */}
          <Route
            path="notifications"
            element={<NotificationSettings />}
          />
        </Route>

        {/* ======================================================
            FALLBACK
        ====================================================== */}

        {/* Any unknown URL goes to login */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

      {/* ========================================================
          TOASTER
      ======================================================== */}

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