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

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <MainLayout>
        {children}
      </MainLayout>
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

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

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
            FALLBACK
        ================================================== */}

<Route
  path="/verify-email"
  element={<VerifyEmail />}
/>
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

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