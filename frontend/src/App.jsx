import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

<<<<<<< HEAD
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected pages
=======
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

>>>>>>> origin/main
import Dashboard from "./pages/dashboard/Dashboard";
import Projects from "./pages/projects/Projects";
import Clients from "./pages/clients/Clients";
import Composer from "./pages/composer/Composer";
import InvoicePreview from "./pages/composer/InvoicePreview";
import Invoices from "./pages/invoices/Invoices";
import RecurringBilling from "./pages/automation/RecurringBilling";
<<<<<<< HEAD
import VerifyEmail from "./pages/VerifyEmail";
import LandingPage from "./pages/landing/LandingPage";
import PricingPage from "./pages/landing/PricingPage";
import AdvancedAnalytics from "./pages/analytics/AdvancedAnalytics";

// Settings pages

import ProfileSettings from "./pages/adminSettings/ProfileSettings";
import SecuritySettings from "./pages/adminSettings/SecuritySettings";
import NotificationSettings from "./pages/adminSettings/NotificationSettings";
import AccountSettings from "./pages/adminSettings/AccountSettings";
import Help from "./pages/adminSettings/Help";
import TeamPermissions from "./pages/team/TeamPermissions";
import Settings from "./pages/setting/Settings";
import SettingsLayout from "./pages/adminSettings/SettingsLayout";
import ClientPortal from "./pages/clients/ClientPortal";


=======
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
>>>>>>> origin/main

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

<<<<<<< HEAD
=======
// ============================================================
// APP
// ============================================================

>>>>>>> origin/main
function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        {/* ==================================================
            PUBLIC
        ================================================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route
  path="/app/pricing"
  element={
    <ProtectedRoute>
      <PricingPage variant="app" />
    </ProtectedRoute>
  }
/>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ==================================================
            PROTECTED
        ================================================== */}
=======

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
>>>>>>> origin/main
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

<<<<<<< HEAD
=======
        {/* Projects */}
>>>>>>> origin/main
        <Route
          path="/projects"
          element={
            <ProtectedLayout>
              <Projects />
            </ProtectedLayout>
          }
        />

<<<<<<< HEAD
=======
        {/* Clients */}
>>>>>>> origin/main
        <Route
          path="/clients"
          element={
            <ProtectedLayout>
              <Clients />
            </ProtectedLayout>
          }
        />

<<<<<<< HEAD
=======
        {/* Invoice Composer - New */}
>>>>>>> origin/main
        <Route
          path="/composer"
          element={
            <ProtectedLayout>
              <Composer />
            </ProtectedLayout>
          }
        />

<<<<<<< HEAD
=======
        {/* Invoice Composer - Edit */}
>>>>>>> origin/main
        <Route
          path="/composer/:id"
          element={
            <ProtectedLayout>
              <Composer />
            </ProtectedLayout>
          }
        />

<<<<<<< HEAD
=======
        {/* Invoices */}
>>>>>>> origin/main
        <Route
          path="/invoice"
          element={
            <ProtectedLayout>
              <Invoices />
            </ProtectedLayout>
          }
        />
<<<<<<< HEAD
         <Route
          path="/analytics"
          element={
            <ProtectedLayout>
              <AdvancedAnalytics />
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
        ></Route>
        <Route
  path="/clientportal"
  element={
    <ProtectedRoute>
      <ClientPortal />
    </ProtectedRoute>
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
  element={ <ProtectedLayout><TeamPermissions /></ProtectedLayout>}
/>
=======

        {/* Invoice Preview */}
>>>>>>> origin/main
        <Route
          path="/invoice-preview"
          element={
            <ProtectedRoute>
              <InvoicePreview />
            </ProtectedRoute>
          }
        />

<<<<<<< HEAD
        {/* ==================================================
            SETTINGS (Protected)
        ================================================== */}
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

=======
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
>>>>>>> origin/main
        <Route
          path="/help"
          element={
            <ProtectedLayout>
              <Help />
            </ProtectedLayout>
          }
        />

<<<<<<< HEAD
        {/* ==================================================
            FALLBACK
        ================================================== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

=======
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

>>>>>>> origin/main
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