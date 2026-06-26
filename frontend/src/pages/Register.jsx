import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../components/ui/CustomToast";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    period: "/mo",
    description: "Up to 100 invoices/mo",
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 199,
    period: "/mo",
    description: "Unlimited invoices",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "/mo",
    description: "Everything + SSO + SLA",
    popular: false,
  },
];

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("professional"); // default

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    role: "Owner",
    companySize: "1-10",
    industry: "SaaS / Software",
  });

  // Password Strength Calculator
  const calculateStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(Math.min(strength, 4));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      calculateStrength(value);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        showErrorToast("Please fill all required fields");
        return false;
      }
      if (formData.password.length < 12) {
        showErrorToast("Password must be at least 12 characters");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.companyName) {
        showErrorToast("Please enter your company name");
        return false;
      }
    }
    return true;
  };

  const handleContinue = () => {
    if (validateStep() && step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.companyName) {
      showErrorToast("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        plan: selectedPlan,
      };

      const response = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : { message: "Invalid response" };

      if (!response.ok) throw new Error(data.message || "Registration failed");

      showSuccessToast("Account created successfully!", `${formData.firstName} ${formData.lastName}`);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      showErrorToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength === 2) return "bg-yellow-500";
    return "bg-teal-500";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5faf8] font-[Inter]">
      <main className="flex flex-1 flex-col md:flex-row">
        {/* Left Section - Branding */}
        <section className="hidden md:flex md:w-1/2 lg:w-2/5 bg-slate-900 relative overflow-hidden p-16 flex-col justify-between">
          {/* ... (your existing left section - unchanged) */}
          <div className="absolute inset-0 opacity-30" style={{
            background: "radial-gradient(circle at 20% 20%, rgba(13,148,136,.6), transparent 50%), radial-gradient(circle at 80% 80%, rgba(99,102,241,.4), transparent 50%)",
          }} />

          <div className="relative z-10 text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-teal-500 rounded-lg grid place-items-center">
                <span className="material-symbols-outlined text-white">bolt</span>
              </div>
              <span className="text-xl font-bold">AutoBillr</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-6">
              Start automating billing in under 60 seconds.
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              No credit card required. 14-day free trial. Cancel anytime.
            </p>
          </div>

          {/* Testimonials */}
             <div className="relative z-10 space-y-4">

     <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-white">
       <p className="text-sm mb-3">
         "AutoBillr cut our DSO in half. The AI risk scoring alone paid for the year."
       </p>

       <div className="flex items-center gap-2 text-xs text-slate-300">
         <div className="w-6 h-6 bg-teal-500 rounded-full grid place-items-center">
           S
         </div>

        <span>
          <b className="text-white">Sarah Park</b> · CFO · Cloudscale
         </span>
       </div>
     </div>

     <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-white">
       <p className="text-sm mb-3">
         "Going from QuickBooks to AutoBillr was the easiest migration I've done."
       </p>

       <div className="flex items-center gap-2 text-xs text-slate-300">
         <div className="w-6 h-6 bg-teal-500 rounded-full grid place-items-center">
           M
         </div>

        <span>
           <b className="text-white">Marcus Chen</b> · Finance Lead · Atlas
         </span>
      </div>
    </div>

   </div>
        </section>

        {/* Right Section - Form */}
        <section className="w-full md:w-1/2 lg:w-3/5 flex items-center justify-center p-8 md:p-16 bg-slate-50">
          <div className="w-full max-w-xl">
            {/* Logo (Mobile) */}
            <div className="md:hidden mb-10 flex items-center gap-2.5 cursor-pointer">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>bolt</span>
              </div>
              <span className="text-xl font-bold tracking-tight">AutoBillr</span>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full grid place-items-center font-bold text-xs transition
                    ${step === s ? 'bg-teal-600 text-white ring-4 ring-teal-100' : 
                      step > s ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {step > s ? <span className="material-symbols-outlined text-sm">check</span> : s}
                  </div>
                  <span className="text-[12.5px] font-semibold hidden sm:inline">
                    {s === 1 && "Account"}
                    {s === 2 && "Company"}
                    {s === 3 && "Plan"}
                  </span>
                  {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-teal-600' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Account */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-1">Create your account</h2>
                <p className="text-slate-500 text-sm mb-8">You'll be billing within minutes.</p>
            
             <div className="space-y-5">
               <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2.5 py-3 border border-slate-200 rounded-xl hover:bg-white transition font-semibold text-sm">
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
    </svg> Sign up with Google
                </button>
                <button className="flex-1 flex items-center justify-center gap-2.5 py-3 border border-slate-200 rounded-xl hover:bg-white transition font-semibold text-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#F25022" d="M2 2h10v10H2z" />
      <path fill="#7FBA00" d="M12 2h10v10H12z" />
      <path fill="#00A4EF" d="M2 12h10v10H2z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>Sign up with Microsoft
                </button>
              </div>

              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Or with email</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">First name *</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Alex"
                    className="w-full px-3.5 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Last name</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Sterling"
                    className="w-full px-3.5 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Work email *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '18px' }}>mail</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm"
                  />
                </div>
              </div>

                            <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Password *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '18px' }}>lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 12 characters"
                    className="w-full pl-11 pr-11 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>

                {/* ALWAYS VISIBLE Password Strength Bar */}
                <div className="mt-3 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i <= passwordStrength 
                          ? getStrengthColor() 
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

           
         
              </div>
              
            )}

            {/* Step 2: Company */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-1">Tell us about your company</h2>
             <p className="text-slate-500 text-sm mb-8">We'll personalize your workspace based on this.</p>
            
             {/* Company form fields (as per your second section) */}
             <div className="space-y-5">
               <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Company name *</label>
                 <div className="relative">
                   <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: '18px' }}>business</span>
                   <input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Acme Dynamics Corp"
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Role & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Your role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3.5 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm">
                    <option>Owner</option>
                    <option>CFO / VP Finance</option>
                    <option>Controller</option>
                    <option>Finance Manager</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Company size</label>
                  <select name="companySize" value={formData.companySize} onChange={handleChange} className="w-full px-3.5 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm">
                    <option>1-10</option>
                    <option>11-50</option>
                    <option>51-250</option>
                    <option>251-1000</option>
                    <option>1000+</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Industry</label>
                <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-3.5 py-3 border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-sm">
                  <option>SaaS / Software</option>
                  <option>Agency / Consulting</option>
                  <option>Professional Services</option>
                  <option>E-commerce</option>
                  <option>Finance & Banking</option>
                  <option>Healthcare</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

   
          
              </div>
            )}

            {/* Step 3: Plan Selection (Dynamic) */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-1">Choose your plan</h2>
                <p className="text-slate-500 text-sm mb-8">Start with a 14-day free trial. Change anytime.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`text-left p-5 rounded-xl border-2 transition-all relative ${
                        selectedPlan === plan.id
                          ? "border-teal-500 bg-teal-50"
                          : "border-slate-200 bg-white hover:border-teal-300"
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2 left-4 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider bg-teal-500 text-white rounded">
                          Popular
                        </span>
                      )}

                      <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">
                        {plan.name}
                      </div>

                      <div className="text-2xl font-bold text-slate-900 tabular">
                        {typeof plan.price === "number" ? `$${plan.price}` : plan.price}
                        <span className="text-xs text-slate-400 font-normal ml-1">{plan.period}</span>
                      </div>

                      <div className="text-[11.5px] text-slate-500 mt-2">{plan.description}</div>

                      {selectedPlan === plan.id && (
                        <div className="mt-3 text-[11px] font-bold text-teal-600 flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                            check_circle
                          </span>
                          Selected
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Free Trial Info */}
                <div className="bg-slate-100 rounded-xl p-4 flex gap-3 items-start mt-6">
                  <span className="material-symbols-outlined text-teal-600 flex-none mt-0.5" style={{ fontSize: "20px" }}>
                    card_giftcard
                  </span>
                  <div>
                    <div className="text-[13px] font-bold text-slate-900">14-day free trial included</div>
                    <div className="text-[11.5px] text-slate-600 mt-1 leading-relaxed">
                      No card required. Cancel anytime. Full access to all Enterprise features.
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-2.5 pt-4 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded mt-0.5 accent-teal-600" />
                  <span className="text-[12.5px] text-slate-600 leading-relaxed">
                    I agree to AutoBillr's{" "}
                    <a href="#" className="text-teal-600 font-semibold hover:underline">Terms of Service</a> and{" "}
                    <a href="#" className="text-teal-600 font-semibold hover:underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span> Back
                </button>
              )}

              {step < 3 ? (
                <button
                  onClick={handleContinue}
                  className="ml-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition active:scale-[0.98] shadow-sm shadow-teal-600/20 flex items-center gap-2"
                >
                  Continue <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="ml-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition active:scale-[0.98] shadow-sm shadow-teal-600/20 flex items-center gap-2 disabled:opacity-70"
                >
                  {loading ? "Creating workspace..." : "Create workspace"}
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
                </button>
              )}
            </div>

             <p className="mt-7 text-center text-sm text-slate-500">
  Already have an account?{" "}
  <button
    type="button"
    onClick={() => navigate("/login")}
    className="text-teal-600 font-semibold hover:underline cursor-pointer"
  >
    Sign in
  </button>
</p>
          </div>
        </section>
      </main>
    </div>
  );
}
