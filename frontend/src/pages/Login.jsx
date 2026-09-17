import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../components/ui/CustomToast";
import Button from "../components/ui/Button";
import FormInput from "../components/ui/FormInput";
import { setAuthData } from "../utils/auth";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    // Agar user registered nahi hai -> Toast dikha kar /register bhej do
    if (error === "account_not_found") {
      window.history.replaceState({}, document.title, window.location.pathname);
      showErrorToast("Account not found! Redirecting to registration...");
      setTimeout(() => {
        navigate("/register");
      }, 1200);
      return;
    }

    // Koi doosra OAuth failure error
    if (error) {
      window.history.replaceState({}, document.title, window.location.pathname);
      showErrorToast("Google login failed. Please try again.");
      return;
    }

    // Successful OAuth Login -> Session set karke dashboard redirect
    if (token) {
      window.history.replaceState({}, document.title, window.location.pathname);

      const userId = params.get("userId");
      const companyId = params.get("companyId");
      const firstName = params.get("firstName") || "Google";
      const lastName = params.get("lastName") || "User";
      const userEmail = params.get("email") || "";

      setAuthData({
        token,
        user: { id: userId, firstName, lastName, email: userEmail },
        company: { id: companyId },
        subscription: null,
      });

      showSuccessToast("Welcome Back", firstName);
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // =====================================================
  // MANUAL LOGIN
  // =====================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      showErrorToast("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const rawResponse = await response.text();

      if (!rawResponse.trim()) {
        showErrorToast(`Server returned an empty response (${response.status})`);
        return;
      }

      let data;
      try {
        data = JSON.parse(rawResponse);
      } catch {
        showErrorToast("Server returned an invalid response");
        return;
      }

      if (!response.ok) {
        showErrorToast(data?.message || `Login failed (${response.status})`);
        if (response.status === 401 || response.status === 404) {
          setTimeout(() => {
            navigate("/register");
          }, 800);
        }
        return;
      }

      if (!data?.token) {
        showErrorToast(data?.message || "Login succeeded but token was not returned");
        return;
      }

      setAuthData({
        token: data.token,
        user: data.user,
        company: data.company,
        subscription: data.subscription,
      });

      const userName =
        `${data.user?.firstName || ""} ${data.user?.lastName || ""}`.trim() ||
        data.user?.email?.split("@")[0] ||
        "User";

      showSuccessToast("Welcome Back", userName);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      showErrorToast(err?.message || "Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5faf8] font-[Inter] relative">
      <main className="flex flex-1 flex-col md:flex-row">
        {/* LEFT SECTION */}
        <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-teal-600 relative overflow-hidden items-center justify-center p-16">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(circle at 80% 20%, rgba(255,255,255,.5), transparent 60%), radial-gradient(circle at 20% 80%, rgba(20,184,166,.4), transparent 50%)",
            }}
          />

          <div className="relative z-10 max-w-lg text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-white/15 rounded-lg grid place-items-center">
                <span className="material-symbols-outlined text-white">bolt</span>
              </div>
              <span className="text-xl font-bold tracking-tight">AutoBillr</span>
            </div>

            <h1 className="text-5xl font-bold mb-6 leading-tight text-white">
              Automate your billing lifecycle.
            </h1>

            <p className="text-teal-50 leading-relaxed mb-10">
              Experience the precision of enterprise-grade financial automation. AutoBillr
              provides the institutional trust you need with the agility you want.
            </p>

            <div className="flex gap-8">
              <Stat value="99.9%" label="Uptime SLA" />
              <Stat value="256-bit" label="Encryption" />
              <Stat value="2,000+" label="Customers" />
            </div>
          </div>

          <div className="absolute bottom-[-10%] right-[-5%] w-64 h-64 bg-white rounded-full blur-3xl opacity-20" />
        </section>

        {/* RIGHT SECTION */}
        <section className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-8 md:p-16 bg-slate-50">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="md:hidden mb-10 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <span className="text-xl font-bold">AutoBillr</span>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
              <p className="text-slate-500 text-sm">Access your enterprise dashboard</p>
            </div>

            {/* Social Login */}
            <SocialLogin />

            <div className="flex items-center my-7 gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or continue with email
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-5">
              <FormInput
                label="Email Address"
                icon="mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11.5px] font-semibold text-slate-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11.5px] font-semibold text-teal-600 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <FormInput
                  icon="lock"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={showPassword ? "hgHk@#%123" : "••••••••••"}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? "visibility" : "visibility_off"}
                      </span>
                    </button>
                  }
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded accent-teal-600"
                />
                <span className="text-[12.5px] text-slate-600">
                  Remember this device for 30 days
                </span>
              </label>

              <Button type="submit" disabled={loading} fullWidth size="lg">
                {loading ? "Signing In..." : "Sign In to Dashboard"}
              </Button>

              <p className="text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-teal-600 font-semibold hover:underline"
                >
                  Create one
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-teal-600 font-semibold hover:underline ml-4"
                >
                  Contact sales
                </button>
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        initialEmail={email}
        onClose={() => setShowForgotModal(false)}
      />
    </div>
  );
}

/* ================== Forgot Password Modal ================== */

function ForgotPasswordModal({ isOpen, initialEmail = "", onClose }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [modalEmail, setModalEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (initialEmail) {
      setModalEmail(initialEmail);
    }
  }, [initialEmail]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!modalEmail.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: modalEmail.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset code.");

      showSuccessToast("OTP Sent", "Check your email for the 6-digit code.");
      setStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/v1/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: modalEmail.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid verification code.");

      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Update Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: modalEmail.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password.");

      showSuccessToast("Password Updated", "You can now log in with your new password.");
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8 relative border border-slate-100">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="mb-6">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3">
            <span className="material-symbols-outlined">
              {step === 1 && "mail"}
              {step === 2 && "dialpad"}
              {step === 3 && "key"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {step === 1 && "Reset your password"}
            {step === 2 && "Enter verification code"}
            {step === 3 && "Set new password"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {step === 1 && "Enter your registered email address to receive a 6-digit OTP code."}
            {step === 2 && `Enter the 6-digit code sent to ${modalEmail}.`}
            {step === 3 && "Enter a new secure password (at least 12 characters)."}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition"
              />
            </div>

            <Button type="submit" disabled={loading} fullWidth size="md">
              {loading ? "Sending OTP..." : "Send Verification Code"}
            </Button>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 focus:bg-white transition"
              />
            </div>

            <Button type="submit" disabled={loading || otp.length !== 6} fullWidth size="md">
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-800"
              >
                Change Email
              </button>

              <button
                type="button"
                disabled={resendTimer > 0}
                onClick={handleSendOtp}
                className="text-teal-600 font-semibold hover:underline disabled:text-slate-400 disabled:no-underline"
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                New Password (min 12 characters)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600 focus:bg-white transition"
              />
            </div>

            <Button type="submit" disabled={loading} fullWidth size="md">
              {loading ? "Updating Password..." : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ================== Small Components ================== */

function Stat({ value, label }) {
  return (
    <div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-[11px] uppercase tracking-widest opacity-80 mt-1">{label}</div>
    </div>
  );
}

function SocialLogin() {
  const handleGoogleClick = () => {
    window.location.href = "http://localhost:5000/api/v1/auth/google";
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Google Button */}
      <button
        type="button"
        onClick={handleGoogleClick}
        className="flex-1 flex items-center justify-center gap-2.5 py-3 border border-slate-200 rounded-xl hover:bg-white transition font-semibold text-sm cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.5 12.3c0-.9-.1-1.7-.2-2.5H12v4.7h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-1.9 3.2-4.8 3.2-8.4z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.8c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8C4.1 20.4 7.8 23 12 23z"
          />
          <path
            fill="#FBBC04"
            d="M6 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V7H2.3C1.5 8.5 1 10.2 1 12s.5 3.5 1.3 5l3.7-2.8z"
          />
          <path
            fill="#EA4335"
            d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2 14.9 1 12 1 7.8 1 4.1 3.6 2.3 7L6 9.8c.9-2.5 3.2-4.4 6-4.4z"
          />
        </svg>
        Google
      </button>

      <button
        type="button"
        className="flex-1 flex items-center justify-center gap-2.5 py-3 border border-slate-200 rounded-xl hover:bg-white transition font-semibold text-sm opacity-50 cursor-not-allowed"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#F25022" d="M2 2h10v10H2z" />
          <path fill="#7FBA00" d="M12 2h10v10H12z" />
          <path fill="#00A4EF" d="M2 12h10v10H2z" />
          <path fill="#FFB900" d="M12 12h10v10H12z" />
        </svg>
        Microsoft
      </button>
    </div>
  );
}
