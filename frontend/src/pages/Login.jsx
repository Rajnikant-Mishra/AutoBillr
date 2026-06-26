import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../components/ui/CustomToast";
import Button from "../components/ui/Button";
import FormInput from "../components/ui/FormInput";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showErrorToast("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        showErrorToast(data.message || "Login failed");

        if (response.status === 401 || response.status === 404) {
          setTimeout(() => navigate("/register"), 800);
        }
        return;
      }

      // Success
      localStorage.setItem("autobiller-auth", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const userName = data.user?.name || data.user?.email?.split("@")[0] || "User";

      showSuccessToast("Signed in", userName);
      navigate("/dashboard");
    } catch (err) {
      showErrorToast(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5faf8] font-[Inter]">
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

            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Automate your billing lifecycle.
            </h1>

            <p className="text-teal-50 leading-relaxed mb-10">
              Experience the precision of enterprise-grade financial automation.
              AutoBillr provides the institutional trust you need with the agility you want.
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
                    className="text-[11.5px] font-semibold text-teal-600 hover:underline"
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
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        type="button"
        className="flex-1 flex items-center justify-center gap-2.5 py-3 border border-slate-200 rounded-xl hover:bg-white transition font-semibold text-sm"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.5 12.3c0-.9-.1-1.7-.2-2.5H12v4.7h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-1.9 3.2-4.8 3.2-8.4z" />
          <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.8c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8C4.1 20.4 7.8 23 12 23z" />
          <path fill="#FBBC04" d="M6 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V7H2.3C1.5 8.5 1 10.2 1 12s.5 3.5 1.3 5l3.7-2.8z" />
          <path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2 14.9 1 12 1 7.8 1 4.1 3.6 2.3 7L6 9.8c.9-2.5 3.2-4.4 6-4.4z" />
        </svg>
        Google
      </button>

      <button
        type="button"
        className="flex-1 flex items-center justify-center gap-2.5 py-3 border border-slate-200 rounded-xl hover:bg-white transition font-semibold text-sm"
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