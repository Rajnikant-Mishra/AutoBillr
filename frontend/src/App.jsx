import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import { Toaster } from "react-hot-toast";

// Layout / Auth
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AcceptInvitation from "./pages/auth/AcceptInvitation";

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


function TrialExpiredModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    onClose();
    navigate("/app/pricing");
  };

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-center transform transition-all scale-100">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-slate-900">Your Free Trial Has Ended</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Your 14-day trial period has expired. Upgrade your plan to continue creating invoices, managing clients, and accessing analytics.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleUpgrade}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-[0.98] transition cursor-pointer"
          >
            Upgrade Plan Now
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// AXIOS INTERCEPTOR (DISPATCH CUSTOM EVENT INSTEAD OF ALERT)
// ============================================================
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "TRIAL_EXPIRED"
    ) {
      // Custom event dispatch karke React modal trigger karega
      window.dispatchEvent(new CustomEvent("trial-expired"));
    }
    return Promise.reject(error);
  }
);

// ============================================================
// APP
// ============================================================
function App() {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);

  useEffect(() => {
    const handleTrialExpired = () => {
      setIsTrialModalOpen(true);
    };

    window.addEventListener("trial-expired", handleTrialExpired);
    return () => {
      window.removeEventListener("trial-expired", handleTrialExpired);
    };
  }, []);

  return (
    <BrowserRouter>
      {/* Modern Trial Expired Popup */}
      <TrialExpiredModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
      />

      <Routes>
        {/* ======================================================
            PUBLIC ROUTES
        ====================================================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/accept-invitation" element={<AcceptInvitation />} />

        {/* ======================================================
            PROTECTED ROUTES
        ====================================================== */}
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
          path="/invoices"
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
          path="/help"
          element={
            <ProtectedLayout>
              <Help />
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
          <Route index element={<AccountSettings />} />
          <Route path="profile" element={<ProfileSettings />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
        </Route>

        {/* ======================================================
            FALLBACK
        ====================================================== */}
        <Route path="*" element={<Navigate to="/login" replace />} />
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