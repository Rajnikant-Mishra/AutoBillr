import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import MainLayout from "./components/layout/MainLayout";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import Projects from "./pages/projects/Projects";
import Clients from "./pages/clients/Clients";
import Composer from "./pages/composer/Composer";
import InvoicePreview from "./pages/composer/InvoicePreview";
import Invoices from "./pages/invoices/Invoices";
import RecurringBilling from "./pages/automation/RecurringBilling";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("autobiller-auth");
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* FIRST PAGE */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Projects />
              </MainLayout>
            </ProtectedRoute>
          }
        />
 <Route
  path="/clients"
  element={
    <ProtectedRoute>
      <MainLayout>
        <Clients />
      </MainLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/composer"
  element={
    <ProtectedRoute>
      <MainLayout>
        <Composer />
      </MainLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/composer/:id"
  element={
    <ProtectedRoute>
      <MainLayout>
        <Composer />
      </MainLayout>
    </ProtectedRoute>
  }
/>

<Route
  path="/invoice"
  element={
    <ProtectedRoute>
      <MainLayout>
        <Invoices />
      </MainLayout>
    </ProtectedRoute>
  }
/>
<Route
  path="/automation"
  element={
    <ProtectedRoute>
      <MainLayout>
        <RecurringBilling />
      </MainLayout>
    </ProtectedRoute>
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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

  <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "#f8faf9",
            borderRadius: "12px",
            border: "1px solid #e5e9e7",
            padding: "14px 20px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
    </Router>
  );
}

export default App;