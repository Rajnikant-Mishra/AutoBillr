import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  showSuccessToast,
  showErrorToast,
} from "../components/ui/CustomToast";
import { setAuthData } from "../utils/auth";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

// =====================================================
// PLAN CONFIGURATION
// =====================================================
// IMPORTANT:
// Prices shown here are for UI only.
// The backend should determine the actual subscription
// price, trial period, and invoice limits.
// =====================================================

const PLANS = [
  {
    id: "starter",
    name: "Starter",

    monthly: {
      price: 0,
      period: "Free",
    },

    yearly: {
      price: 0,
      period: "Free",
    },

    trial: "14 days",
    invoiceLimit: "10 invoices",

   

    popular: false,

    features: [
      "Up to 10 invoices",
      "Client management",
      "Basic billing tools",
      "14-day free trial",
    ],
  },

  {
    id: "professional",
    name: "Professional",

    monthly: {
      price: 999,
      period: "/mo",
    },

    yearly: {
      price: 9990,
      period: "/year",
    },

    trial: "14 days",
    invoiceLimit: "Unlimited",

    

    popular: true,

    features: [
      "Unlimited invoices",
      "Recurring billing",
      "Advanced analytics",
      "Project billing",
      "14-day free trial",
    ],
  },

  {
    id: "enterprise",
    name: "Enterprise",

    monthly: {
      price: 2499,
      period: "/mo",
    },

    yearly: {
      price: 2499,
      period: "/year",
    },

    trial: "14 days",
    invoiceLimit: "Unlimited",

   

    popular: false,

    features: [
      "Unlimited invoices",
      "Advanced controls",
      "Team management",
      "Priority support",
      "14-day free trial",
    ],
  },
];

const VALID_PLAN_IDS = PLANS.map((plan) => plan.id);

const VALID_BILLING_INTERVALS = [
  "monthly",
  "yearly",
];

const REGISTRATION_STORAGE_KEY =
  "autobillr-registration-draft";

const REGISTRATION_EMAIL_KEY =
  "autobillr-registration-email";

const REGISTRATION_PLAN_KEY =
  "autobillr-registration-plan";

const REGISTRATION_BILLING_KEY =
  "autobillr-registration-billing";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const verificationPollingRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // PLAN STATE
  // =====================================================

  const [selectedPlan, setSelectedPlan] =
    useState("professional");

  const [billingInterval, setBillingInterval] =
    useState("monthly");

  const [emailVerificationSent, setEmailVerificationSent] =
    useState(false);

  const [emailVerified, setEmailVerified] =
    useState(false);

  const [checkingVerification, setCheckingVerification] =
    useState(false);

  const [termsAccepted, setTermsAccepted] =
    useState(false);

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

  // =====================================================
  // GET CURRENT PLAN
  // =====================================================

  const selectedPlanData =
    PLANS.find(
      (plan) => plan.id === selectedPlan
    ) || PLANS[1];

  const selectedPricing =
    selectedPlanData[billingInterval];

  // =====================================================
  // AUTO SELECT PLAN / BILLING FROM URL
  //
  // Examples:
  // /register?plan=starter
  // /register?plan=professional&billing=yearly
  // =====================================================

  useEffect(() => {
    const planParam = searchParams
      .get("plan")
      ?.trim()
      .toLowerCase();

    const billingParam = searchParams
      .get("billing")
      ?.trim()
      .toLowerCase();

    const storedPlan =
      sessionStorage.getItem(
        REGISTRATION_PLAN_KEY
      );

    const storedBilling =
      sessionStorage.getItem(
        REGISTRATION_BILLING_KEY
      );

    if (
      planParam &&
      VALID_PLAN_IDS.includes(planParam)
    ) {
      setSelectedPlan(planParam);
      sessionStorage.setItem(
        REGISTRATION_PLAN_KEY,
        planParam
      );
    } else if (
      storedPlan &&
      VALID_PLAN_IDS.includes(storedPlan)
    ) {
      setSelectedPlan(storedPlan);
    }

    if (
      billingParam &&
      VALID_BILLING_INTERVALS.includes(
        billingParam
      )
    ) {
      setBillingInterval(billingParam);

      sessionStorage.setItem(
        REGISTRATION_BILLING_KEY,
        billingParam
      );
    } else if (
      storedBilling &&
      VALID_BILLING_INTERVALS.includes(
        storedBilling
      )
    ) {
      setBillingInterval(storedBilling);
    }
  }, [searchParams]);

  // =====================================================
  // SELECT PLAN
  // =====================================================

  const handlePlanChange = (planId) => {
    if (!VALID_PLAN_IDS.includes(planId)) {
      return;
    }

    setSelectedPlan(planId);

    sessionStorage.setItem(
      REGISTRATION_PLAN_KEY,
      planId
    );
  };

  // =====================================================
  // SELECT BILLING INTERVAL
  // =====================================================

  const handleBillingChange = (interval) => {
    if (
      !VALID_BILLING_INTERVALS.includes(interval)
    ) {
      return;
    }

    setBillingInterval(interval);

    sessionStorage.setItem(
      REGISTRATION_BILLING_KEY,
      interval
    );
  };

  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  const calculateStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    setPasswordStrength(
      Math.min(strength, 4)
    );
  };

  // =====================================================
  // SAVE REGISTRATION DRAFT
  // =====================================================

  const saveDraft = (data) => {
    sessionStorage.setItem(
      REGISTRATION_STORAGE_KEY,
      JSON.stringify(data)
    );
  };

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);
    saveDraft(updatedFormData);

    if (name === "password") {
      calculateStrength(value);
    }

    if (name === "email") {
      setEmailVerified(false);
      setEmailVerificationSent(false);

      const normalizedEmail =
        value.trim().toLowerCase();

      sessionStorage.setItem(
        REGISTRATION_EMAIL_KEY,
        normalizedEmail
      );
    }
  };

  // =====================================================
  // STOP VERIFICATION POLLING
  // =====================================================

  const stopVerificationPolling = useCallback(() => {
    if (verificationPollingRef.current) {
      clearInterval(
        verificationPollingRef.current
      );

      verificationPollingRef.current = null;
    }
  }, []);

  // =====================================================
  // CHECK EMAIL VERIFICATION
  // =====================================================

  const checkEmailVerification =
    useCallback(
      async (email) => {
        if (!email) return false;

        try {
          setCheckingVerification(true);

          const normalizedEmail =
            email.trim().toLowerCase();

          const response = await fetch(
            `${API_URL}/email-verification/status?email=${encodeURIComponent(
              normalizedEmail
            )}`,
            {
              method: "GET",
              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );

          const text =
            await response.text();

          let data = {};

          try {
            data = text
              ? JSON.parse(text)
              : {};
          } catch {
            throw new Error(
              "Invalid response from verification status API"
            );
          }

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Unable to check verification status"
            );
          }

          if (data.verified === true) {
            setEmailVerified(true);
            setEmailVerificationSent(false);

            stopVerificationPolling();

            return true;
          }

          setEmailVerified(false);

          return false;
        } catch (error) {
          console.error(
            "Verification status error:",
            error
          );

          return false;
        } finally {
          setCheckingVerification(false);
        }
      },
      [stopVerificationPolling]
    );

  // =====================================================
  // START VERIFICATION POLLING
  // =====================================================

  const startVerificationPolling =
    useCallback(
      (email) => {
        if (!email) return;

        stopVerificationPolling();

        const normalizedEmail =
          email.trim().toLowerCase();

        verificationPollingRef.current =
          setInterval(async () => {
            const verified =
              await checkEmailVerification(
                normalizedEmail
              );

            if (verified) {
              stopVerificationPolling();
            }
          }, 3000);
      },
      [
        checkEmailVerification,
        stopVerificationPolling,
      ]
    );

  // =====================================================
  // CLEANUP POLLING
  // =====================================================

  useEffect(() => {
    return () =>
      stopVerificationPolling();
  }, [stopVerificationPolling]);

  // =====================================================
  // RESTORE REGISTRATION STATE
  // =====================================================

  useEffect(() => {
    const verifiedFromUrl =
      searchParams.get("verified") === "true";

    const requestedStep =
      searchParams.get("step");

    const emailFromUrl =
      searchParams.get("email");

    let savedDraft = {};

    const storedDraft =
      sessionStorage.getItem(
        REGISTRATION_STORAGE_KEY
      );

    if (storedDraft) {
      try {
        savedDraft =
          JSON.parse(storedDraft);
      } catch (error) {
        console.error(
          "Unable to restore draft:",
          error
        );

        sessionStorage.removeItem(
          REGISTRATION_STORAGE_KEY
        );
      }
    }

    const storedEmail =
      sessionStorage.getItem(
        REGISTRATION_EMAIL_KEY
      );

    const registrationEmail = (
      emailFromUrl ||
      storedEmail ||
      savedDraft.email ||
      ""
    )
      .trim()
      .toLowerCase();

    if (
      Object.keys(savedDraft).length > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        ...savedDraft,
        email:
          registrationEmail ||
          savedDraft.email ||
          prev.email,
      }));
    }

    if (registrationEmail) {
      setFormData((prev) => ({
        ...prev,
        email: registrationEmail,
      }));

      sessionStorage.setItem(
        REGISTRATION_EMAIL_KEY,
        registrationEmail
      );
    }

    if (
      verifiedFromUrl &&
      requestedStep === "2" &&
      registrationEmail
    ) {
      setEmailVerified(true);
      setEmailVerificationSent(false);

      stopVerificationPolling();

      setStep(2);

      saveDraft({
        ...savedDraft,
        email: registrationEmail,
      });

      navigate("/register", {
        replace: true,
      });

      return;
    }

    if (
      registrationEmail &&
      !verifiedFromUrl
    ) {
      checkEmailVerification(
        registrationEmail
      );
    }
  }, [
    searchParams,
    navigate,
    checkEmailVerification,
    stopVerificationPolling,
  ]);

  // =====================================================
  // VALIDATE STEP 1
  // =====================================================

  const validateStep1 = () => {
    if (!formData.firstName.trim()) {
      showErrorToast(
        "First name is required"
      );
      return false;
    }

    if (!formData.lastName.trim()) {
      showErrorToast(
        "Last name is required"
      );
      return false;
    }

    if (!formData.email.trim()) {
      showErrorToast(
        "Email is required"
      );
      return false;
    }

    if (!formData.password) {
      showErrorToast(
        "Password is required"
      );
      return false;
    }

    if (
      formData.password.length < 12
    ) {
      showErrorToast(
        "Password must be at least 12 characters"
      );
      return false;
    }

    return true;
  };

  // =====================================================
  // VALIDATE STEP 2
  // =====================================================

  const validateStep2 = () => {
    if (!emailVerified) {
      showErrorToast(
        "Please verify your email before continuing"
      );

      setStep(1);

      return false;
    }

    if (!formData.companyName.trim()) {
      showErrorToast(
        "Please enter your company name"
      );

      return false;
    }

    return true;
  };

  // =====================================================
  // SEND EMAIL VERIFICATION
  // =====================================================

  const sendEmailVerification =
    async () => {
      if (!validateStep1()) return;

      const normalizedEmail =
        formData.email
          .trim()
          .toLowerCase();

      try {
        setLoading(true);

        const latestForm = {
          ...formData,
          email: normalizedEmail,
        };

        setFormData(latestForm);

        saveDraft(latestForm);

        sessionStorage.setItem(
          REGISTRATION_EMAIL_KEY,
          normalizedEmail
        );

        const response = await fetch(
          `${API_URL}/email-verification/check-email`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email: normalizedEmail,
              firstName:
                latestForm.firstName.trim(),
            }),
          }
        );

        const text =
          await response.text();

        let data = {};

        try {
          data = text
            ? JSON.parse(text)
            : {};
        } catch {
          throw new Error(
            "Invalid server response from verification API"
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to send verification email"
          );
        }

        setEmailVerificationSent(
          true
        );

        showSuccessToast(
          "Verification email sent",
          "Check your inbox and click the verification link"
        );

        startVerificationPolling(
          normalizedEmail
        );
      } catch (error) {
        console.error(
          "Email verification error:",
          error
        );

        showErrorToast(
          error.message ||
            "Unable to send verification email"
        );
      } finally {
        setLoading(false);
      }
    };

  // =====================================================
  // CONTINUE
  // =====================================================

  const handleContinue = async () => {
    if (step === 1) {
      if (!validateStep1()) {
        return;
      }

      if (emailVerified) {
        stopVerificationPolling();

        setStep(2);

        return;
      }

      if (emailVerificationSent) {
        showSuccessToast(
          "Verification email already sent",
          "Check your inbox and click the verification link."
        );

        return;
      }

      const alreadyVerified =
        await checkEmailVerification(
          formData.email
        );

      if (alreadyVerified) {
        stopVerificationPolling();

        setStep(2);

        return;
      }

      await sendEmailVerification();

      return;
    }

    if (step === 2) {
      if (!validateStep2()) {
        return;
      }

      setStep(3);
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }

    if (step === 3) {
      setStep(2);
    }
  };

  // =====================================================
  // REGISTER / SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      showErrorToast(
        "First name is required"
      );

      setStep(1);

      return;
    }

    if (!formData.lastName.trim()) {
      showErrorToast(
        "Last name is required"
      );

      setStep(1);

      return;
    }

    if (!formData.email.trim()) {
      showErrorToast(
        "Email is required"
      );

      setStep(1);

      return;
    }

    if (!formData.password) {
      showErrorToast(
        "Password is required"
      );

      setStep(1);

      return;
    }

    if (
      formData.password.length < 12
    ) {
      showErrorToast(
        "Password must be at least 12 characters"
      );

      setStep(1);

      return;
    }

    const backendVerified =
      await checkEmailVerification(
        formData.email
      );

    if (!backendVerified) {
      showErrorToast(
        "Please verify your email address before creating your account."
      );

      setStep(1);

      return;
    }

    if (!formData.companyName.trim()) {
      showErrorToast(
        "Company name is required"
      );

      setStep(2);

      return;
    }

    if (
      !VALID_PLAN_IDS.includes(
        selectedPlan
      )
    ) {
      showErrorToast(
        "Please select a valid plan"
      );

      setStep(3);

      return;
    }

    if (
      !VALID_BILLING_INTERVALS.includes(
        billingInterval
      )
    ) {
      showErrorToast(
        "Please select a valid billing cycle"
      );

      setStep(3);

      return;
    }

    if (!termsAccepted) {
      showErrorToast(
        "Please accept the Terms of Service and Privacy Policy"
      );

      return;
    }

    // ===================================================
    // PRODUCTION PAYLOAD
    // ===================================================
    // Do NOT send price from frontend.
    // Backend should determine:
    // - actual price
    // - 14-day trial
    // - invoice limit
    // - subscription status
    // ===================================================

    const payload = {
      firstName:
        formData.firstName.trim(),

      lastName:
        formData.lastName.trim(),

      email:
        formData.email
          .trim()
          .toLowerCase(),

      password:
        formData.password,

      companyName:
        formData.companyName.trim(),

      role:
        formData.role,

      companySize:
        formData.companySize,

      industry:
        formData.industry,

      planId:
        selectedPlan,

      billingCycle:
        billingInterval === "yearly"
          ? "YEARLY"
          : "MONTHLY",
    };

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const text =
        await response.text();

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Invalid server response from registration API"
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Registration failed"
        );
      }

      setAuthData({
        token: data.token,
        user: data.user,
        company: data.company,
        subscription:
          data.subscription,
      });

      stopVerificationPolling();

      sessionStorage.removeItem(
        REGISTRATION_STORAGE_KEY
      );

      sessionStorage.removeItem(
        REGISTRATION_EMAIL_KEY
      );

      sessionStorage.removeItem(
        REGISTRATION_PLAN_KEY
      );

      sessionStorage.removeItem(
        REGISTRATION_BILLING_KEY
      );

      showSuccessToast(
        "Account created successfully!",
        `${payload.firstName} ${payload.lastName}`
      );

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      showErrorToast(
        error.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // PASSWORD STRENGTH COLOR
  // =====================================================

  const getStrengthColor = () => {
    if (passwordStrength <= 1) {
      return "bg-danger";
    }

    if (passwordStrength === 2) {
      return "bg-warning";
    }

    return "bg-primary";
  };

  // =====================================================
  // INPUT CLASS
  // =====================================================

  const inputClass =
    "w-full px-3.5 py-3 border border-border bg-surface rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-primary/20 focus:border-primary";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <main className="flex flex-1 flex-col md:flex-row">

        {/* =================================================
            LEFT SECTION
        ================================================= */}

        <section className="hidden md:flex md:w-1/2 lg:w-2/5 bg-slate-900 relative overflow-hidden p-16 flex-col justify-between">

          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(circle at 20% 20%, rgba(15,157,148,.6), transparent 50%), radial-gradient(circle at 80% 80%, rgba(99,102,241,.4), transparent 50%)",
            }}
          />

          <div className="relative z-10 text-white">

            <div className="flex items-center gap-3 mb-12">

              <div className="w-10 h-10 bg-primary rounded-lg grid place-items-center">
                <span className="material-symbols-outlined text-white">
                  bolt
                </span>
              </div>

              <span className="text-xl font-bold">
                AutoBillr
              </span>

            </div>

            <h1 className="text-4xl font-bold leading-tight mb-6 text-white">
              Start automating billing in under 60 seconds.
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              No credit card required. 14-day free trial. Cancel anytime.
            </p>

          </div>

          <div className="relative z-10 space-y-4">

            {[
              {
                quote:
                  '"AutoBillr cut our DSO in half. The AI risk scoring alone paid for the year."',
                name: "Sarah Park",
                role: "CFO · Cloudscale",
                initial: "S",
              },
              {
                quote:
                  '"Going from QuickBooks to AutoBillr was the easiest migration I\'ve done."',
                name: "Marcus Chen",
                role: "Finance Lead · Atlas",
                initial: "M",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-white"
              >

                <p className="text-sm mb-3">
                  {t.quote}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-300">

                  <div className="w-6 h-6 bg-primary rounded-full grid place-items-center text-white text-[11px] font-bold">
                    {t.initial}
                  </div>

                  <span>
                    <b className="text-white">
                      {t.name}
                    </b>{" "}
                    · {t.role}
                  </span>

                </div>

              </div>
            ))}

          </div>

        </section>

        {/* =================================================
            RIGHT SECTION
        ================================================= */}

        <section className="w-full md:w-1/2 lg:w-3/5 flex items-center justify-center p-8 md:p-16 bg-surface-secondary">

          <div className="w-full max-w-xl">

            {/* =================================================
                PROGRESS BAR
            ================================================= */}

            <div className="flex items-center gap-2 mb-8">

              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 flex-1"
                >

                  <div
                    className={`
                      w-8 h-8 rounded-full grid place-items-center
                      font-bold text-xs transition
                      ${
                        step === s
                          ? "bg-primary text-white ring-4 ring-primary-soft"
                          : step > s
                          ? "bg-primary text-white"
                          : "bg-border text-text-light"
                      }
                    `}
                  >

                    {step > s ? (
                      <span className="material-symbols-outlined text-sm">
                        check
                      </span>
                    ) : (
                      s
                    )}

                  </div>

                  <span className="text-[12.5px] font-semibold text-text-secondary hidden sm:inline">

                    {s === 1 && "Account"}
                    {s === 2 && "Company"}
                    {s === 3 && "Plan"}

                  </span>

                  {s < 3 && (
                    <div
                      className={`flex-1 h-px ${
                        step > s
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  )}

                </div>
              ))}

            </div>

            {/* =================================================
                STEP 1
            ================================================= */}

            {step === 1 && (
              <div>

                <h2 className="text-2xl font-bold text-text mb-1">
                  Create your account
                </h2>

                <p className="text-text-muted text-sm mb-8">
                  You’ll be billing within minutes.
                </p>

                <div className="space-y-5">

                  <div className="grid grid-cols-2 gap-3">

                    <div>

                      <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
                        First name *
                      </label>

                      <input
                        name="firstName"
                        value={
                          formData.firstName
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Alex"
                        className={
                          inputClass
                        }
                      />

                    </div>

                    <div>

                      <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
                        Last name *
                      </label>

                      <input
                        name="lastName"
                        value={
                          formData.lastName
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Sterling"
                        className={
                          inputClass
                        }
                      />

                    </div>

                  </div>

                  <div>

                    <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
                      Work email *
                    </label>

                    <div className="relative">

                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light">
                        mail
                      </span>

                      <input
                        type="email"
                        name="email"
                        value={
                          formData.email
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="you@company.com"
                        className={`
                          ${inputClass}
                          pl-11
                          ${
                            emailVerified
                              ? "bg-green-50 border-green-400"
                              : ""
                          }
                        `}
                      />

                    </div>

                    {emailVerified && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-green-600">

                        <span className="material-symbols-outlined text-sm">
                          verified
                        </span>

                        Email verified

                      </div>
                    )}

                    {checkingVerification &&
                      !emailVerified &&
                      !emailVerificationSent && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">

                          <span className="material-symbols-outlined text-sm animate-spin">
                            progress_activity
                          </span>

                          Checking email verification...

                        </div>
                      )}

                    {emailVerificationSent &&
                      !emailVerified && (
                        <div className="mt-3 rounded-xl border border-primary/20 bg-primary-soft p-3">

                          <div className="flex items-start gap-2">

                            <span className="material-symbols-outlined text-primary text-lg">
                              mark_email_unread
                            </span>

                            <div>

                              <p className="text-sm font-semibold text-text">
                                Check your inbox
                              </p>

                              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                We sent a verification link to{" "}
                                <strong>
                                  {formData.email}
                                </strong>
                                . Click the link in the email.
                              </p>

                              <p className="text-xs text-primary font-semibold mt-2">
                                This page will automatically detect when your email is verified.
                              </p>

                            </div>

                          </div>

                        </div>
                      )}

                  </div>

                  <div>

                    <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
                      Password *
                    </label>

                    <div className="relative">

                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light">
                        lock
                      </span>

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        value={
                          formData.password
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="At least 12 characters"
                        className={`${inputClass} pl-11 pr-11`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-light hover:text-text"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {showPassword
                            ? "visibility_off"
                            : "visibility"}
                        </span>
                      </button>

                    </div>

                    <div className="mt-3 flex gap-1">

                      {[1, 2, 3, 4].map(
                        (i) => (
                          <div
                            key={i}
                            className={`
                              h-1 flex-1 rounded-full transition-all
                              ${
                                i <=
                                passwordStrength
                                  ? getStrengthColor()
                                  : "bg-border"
                              }
                            `}
                          />
                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                STEP 2
            ================================================= */}

            {step === 2 && (
              <div>

                <h2 className="text-2xl font-bold text-text mb-1">
                  Tell us about your company
                </h2>

                <p className="text-text-muted text-sm mb-8">
                  We’ll personalize your workspace based on this.
                </p>

                <div className="space-y-5">

                  <div>

                    <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
                      Company name *
                    </label>

                    <div className="relative">

                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-light">
                        business
                      </span>

                      <input
                        name="companyName"
                        value={
                          formData.companyName
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="Acme Dynamics Corp"
                        className={`${inputClass} pl-11`}
                      />

                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-3">

                    <div>

                      <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
                        Your role
                      </label>

                      <select
                        name="role"
                        value={
                          formData.role
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          inputClass
                        }
                      >
                        <option>
                          Owner
                        </option>
                        <option>
                          CFO / VP Finance
                        </option>
                        <option>
                          Controller
                        </option>
                        <option>
                          Finance Manager
                        </option>
                        <option>
                          Other
                        </option>
                      </select>

                    </div>

                    <div>

                      <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
                        Company size
                      </label>

                      <select
                        name="companySize"
                        value={
                          formData.companySize
                        }
                        onChange={
                          handleChange
                        }
                        className={
                          inputClass
                        }
                      >
                        <option>
                          1-10
                        </option>
                        <option>
                          11-50
                        </option>
                        <option>
                          51-250
                        </option>
                        <option>
                          251-1000
                        </option>
                        <option>
                          1000+
                        </option>
                      </select>

                    </div>

                  </div>

                  <div>

                    <label className="block text-[11.5px] font-semibold text-text-secondary mb-1.5">
                      Industry
                    </label>

                    <select
                      name="industry"
                      value={
                        formData.industry
                      }
                      onChange={
                        handleChange
                      }
                      className={
                        inputClass
                      }
                    >
                      <option>
                        SaaS / Software
                      </option>
                      <option>
                        Agency / Consulting
                      </option>
                      <option>
                        Professional Services
                      </option>
                      <option>
                        E-commerce
                      </option>
                      <option>
                        Finance & Banking
                      </option>
                      <option>
                        Healthcare
                      </option>
                      <option>
                        Other
                      </option>
                    </select>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                STEP 3 - PLAN
            ================================================= */}

            {step === 3 && (
              <div>

                <h2 className="text-2xl font-bold text-text mb-1">
                  Choose your plan
                </h2>

                <p className="text-text-muted text-sm mb-6">
                  Start with a 14-day free trial. No payment required today.
                </p>

                {/* ============================================
                    MONTHLY / YEARLY TOGGLE
                ============================================ */}

                <div className="flex justify-center mb-7">

                  <div
                    className="inline-flex items-center rounded-xl border border-border bg-surface-secondary p-1 shadow-sm"
                    role="group"
                    aria-label="Billing interval"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        handleBillingChange(
                          "monthly"
                        )
                      }
                      aria-pressed={
                        billingInterval ===
                        "monthly"
                      }
                      className={`
                        min-w-[110px]
                        rounded-lg
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        transition-all
                        ${
                          billingInterval ===
                          "monthly"
                            ? "bg-surface text-text shadow-sm"
                            : "text-text-muted hover:text-text"
                        }
                      `}
                    >
                      Monthly
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleBillingChange(
                          "yearly"
                        )
                      }
                      aria-pressed={
                        billingInterval ===
                        "yearly"
                      }
                      className={`
                        min-w-[110px]
                        rounded-lg
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        transition-all
                        flex items-center justify-center gap-2
                        ${
                          billingInterval ===
                          "yearly"
                            ? "bg-surface text-text shadow-sm"
                            : "text-text-muted hover:text-text"
                        }
                      `}
                    >
                      Yearly

                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                        Annual
                      </span>

                    </button>

                  </div>

                </div>

                {/* ============================================
                    PLAN CARDS
                ============================================ */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                  {PLANS.map((plan) => {

                    const pricing =
                      plan[
                        billingInterval
                      ];

                    const isSelected =
                      selectedPlan ===
                      plan.id;

                    const isFree =
                      pricing.price ===
                      0;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() =>
                          handlePlanChange(
                            plan.id
                          )
                        }
                        aria-pressed={
                          isSelected
                        }
                        className={`
                          text-left
                          p-5
                          rounded-xl
                          border-2
                          transition-all
                          relative
                          focus:outline-none
                          focus:ring-2
                          focus:ring-primary/30
                          ${
                            isSelected
                              ? "border-primary bg-primary-soft shadow-sm"
                              : "border-border bg-surface hover:border-primary/40"
                          }
                        `}
                      >

                        {/* POPULAR BADGE */}

                        {plan.popular && (
                          <span className="absolute -top-2 left-4 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider bg-primary text-white rounded">
                            Popular
                          </span>
                        )}

                        {/* PLAN NAME */}

                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                          {plan.name}
                        </div>

                        {/* DESCRIPTION */}

                        <div className="text-[11px] text-text-muted mb-4 min-h-[32px]">
                          {plan.description}
                        </div>

                        {/* PRICE */}

                        <div className="min-h-[42px] flex items-baseline gap-1">

                          <span className="text-2xl font-bold text-text">

                            {isFree
                              ? "Free"
                              : `₹${pricing.price.toLocaleString(
                                  "en-IN"
                                )}`}

                          </span>

                          {!isFree && (
                            <span className="text-xs text-text-light font-normal">
                              {pricing.period}
                            </span>
                          )}

                        </div>

                        {/* TRIAL */}

                        <div className="mt-4 pt-4 border-t border-border">

                          <div className="flex items-center justify-between gap-2 text-[11px]">

                            <span className="text-text-muted">
                              Free trial
                            </span>

                            <span className="font-bold text-text">
                              {plan.trial}
                            </span>

                          </div>

                          <div className="flex items-center justify-between gap-2 mt-2 text-[11px]">

                            <span className="text-text-muted">
                              Invoice limit
                            </span>

                            <span className="font-bold text-text">
                              {plan.invoiceLimit}
                            </span>

                          </div>

                        </div>

                        {/* FEATURES */}

                        <div className="mt-4 space-y-2">

                          {plan.features.map(
                            (feature) => (
                              <div
                                key={
                                  feature
                                }
                                className="flex items-start gap-1.5 text-[11px] text-text-muted"
                              >

                                <span className="material-symbols-outlined text-[15px] text-primary shrink-0">
                                  check_circle
                                </span>

                                <span>
                                  {feature}
                                </span>

                              </div>
                            )
                          )}

                        </div>

                        {/* SELECTED */}

                        {isSelected && (
                          <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-primary">

                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>

                            Selected

                          </div>
                        )}

                      </button>
                    );
                  })}

                </div>

               

                {/* ============================================
                    TERMS
                ============================================ */}

                <label className="flex items-start gap-2.5 pt-4 cursor-pointer">

                  <input
                    type="checkbox"
                    checked={
                      termsAccepted
                    }
                    onChange={(e) =>
                      setTermsAccepted(
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 rounded mt-0.5 accent-primary"
                  />

                  <span className="text-[12.5px] text-text-muted leading-relaxed">

                    I agree to AutoBillr’s{" "}

                    <a
                      href="/terms"
                      className="text-primary font-semibold hover:underline"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      Terms of Service
                    </a>{" "}

                    and{" "}

                    <a
                      href="/privacy"
                      className="text-primary font-semibold hover:underline"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >
                      Privacy Policy
                    </a>
                    .

                  </span>

                </label>

              </div>
            )}

            {/* =================================================
                NAVIGATION BUTTONS
            ================================================= */}

            <div className="flex justify-between items-center mt-8">

              {step > 1 && (
                <button
                  type="button"
                  onClick={
                    handleBack
                  }
                  disabled={loading}
                  className="text-sm font-semibold text-text-muted hover:text-text flex items-center gap-1 disabled:opacity-50"
                >

                  <span className="material-symbols-outlined text-sm">
                    arrow_back
                  </span>

                  Back

                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={
                    handleContinue
                  }
                  disabled={loading}
                  className="
                    ml-auto
                    px-6
                    py-3
                    bg-primary
                    hover:bg-primary-hover
                    text-white
                    rounded-xl
                    font-semibold
                    transition
                    active:scale-[0.98]
                    shadow-sm
                    shadow-primary/20
                    flex
                    items-center
                    gap-2
                    disabled:opacity-70
                    disabled:cursor-not-allowed
                  "
                >

                  {loading
                    ? "Sending…"
                    : "Continue"}

                  {!loading && (
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  )}

                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleSubmit
                  }
                  disabled={loading}
                  className="
                    ml-auto
                    px-6
                    py-3
                    bg-primary
                    hover:bg-primary-hover
                    text-white
                    rounded-xl
                    font-semibold
                    transition
                    active:scale-[0.98]
                    shadow-sm
                    shadow-primary/20
                    flex
                    items-center
                    gap-2
                    disabled:opacity-70
                    disabled:cursor-not-allowed
                  "
                >

                  {loading
                    ? "Creating workspace…"
                    : "Create workspace"}

                  {!loading && (
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  )}

                </button>
              )}

            </div>

            {/* =================================================
                LOGIN
            ================================================= */}

            <p className="mt-7 text-center text-sm text-text-muted">

              Already have an account?{" "}

              <button
                type="button"
                onClick={() =>
                  navigate("/login")
                }
                className="text-primary font-semibold hover:underline"
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