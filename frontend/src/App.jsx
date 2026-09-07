import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Projects from "./pages/projects/Projects";
import Clients from "./pages/clients/Clients";
import Composer from "./pages/composer/Composer";
import InvoicePreview from "./pages/composer/InvoicePreview";
import Invoices from "./pages/invoices/Invoices";
import RecurringBilling from "./pages/automation/RecurringBilling";
import VerifyEmail from "./pages/VerifyEmail";
import LandingPage from "./pages/landing/LandingPage";
import PricingPage from "./pages/landing/PricingPage";

// Settings pages
import SettingsLayout from "./pages/settings/SettingsLayout";
import ProfileSettings from "./pages/settings/ProfileSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import AccountSettings from "./pages/settings/AccountSettings";
import Help from "./pages/settings/Help";

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
        {/* ==================================================
            PUBLIC
        ================================================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* ==================================================
            PROTECTED
        ================================================== */}
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

        <Route
          path="/invoice"
          element={
            <ProtectedLayout>
              <Invoices />
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
          path="/invoice-preview"
          element={
            <ProtectedRoute>
              <InvoicePreview />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            SETTINGS (Protected)
        ================================================== */}
        <Route
          path="/settings"
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

        <Route
          path="/help"
          element={
            <ProtectedLayout>
              <Help />
            </ProtectedLayout>
          }
        />

        {/* ==================================================
            FALLBACK
        ================================================== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

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