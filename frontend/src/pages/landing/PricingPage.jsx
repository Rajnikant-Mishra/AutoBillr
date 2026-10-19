
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";

import {
  showSuccessToast,
  showErrorToast,
} from "../../components/ui/CustomToast";

import { setAuthData } from "../../utils/auth";
import { formatAmount } from "../../utils/currency";

import "../../styles/theme.css";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    description:
      "Essential billing tools for individuals and small businesses.",
    monthlyPrice: 0,
    annualPrice: 0,
    featuresTitle: "Includes:",
    features: [
      "Up to 10 invoices",
      "Client management",
      "Basic billing tools",
      "14-day free trial",
    ],
    buttonText: "Start 14-day free trial",
  },
  {
    id: "professional",
    name: "Professional",
    description:
      "Advanced billing and analytics for growing businesses.",
    monthlyPrice: 999,
    annualPrice: 9990,
    featuresTitle: "Everything in Starter, plus:",
    features: [
      "Unlimited invoices",
      "Recurring billing",
      "Advanced analytics",
      "Project billing",
      "14-day free trial",
    ],
    buttonText: "Get Started with Professional",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description:
      "Complete billing, team management, and priority support for larger organizations.",
    monthlyPrice: 2499,
    annualPrice: 24990,
    featuresTitle: "Everything in Professional, plus:",
    features: [
      "Unlimited invoices",
      "Advanced controls",
      "Team management",
      "Priority support",
      "14-day free trial",
    ],
    buttonText: "Get Started with Enterprise",
  },
];

const FAQS = [
  {
    question: "Can I change my plan later?",
    answer:
      "Yes. You can change your subscription plan from your account, subject to your application's subscription rules.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "The Starter plan includes a 14-day free trial. Trial eligibility is validated by the server.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Plan selection currently does not require a payment step.",
  },
  {
    question: "Do you offer discounts for non-profits?",
    answer:
      "Contact the AutoBillr team to discuss available pricing options.",
  },
];

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

const INR_CURRENCY = {
  code: "INR",
  locale: "en-IN",
  symbol: "₹",
  decimalDigits: 0,
};

const EXPIRED_STATUSES = ["EXPIRED", "PAST_DUE", "CANCELED"];

const formatPrice = (price) => {
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount < 0) {
    return "—";
  }

  if (amount === 0) {
    return "Free";
  }

  return formatAmount(amount, INR_CURRENCY, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

function getStoredAuth() {
  try {
    return JSON.parse(
      localStorage.getItem("autobiller-auth") || "{}"
    );
  } catch {
    return {};
  }
}

function getStoredToken() {
  const auth = getStoredAuth();

  return (
    auth.token ||
    auth.state?.token ||
    localStorage.getItem("token") ||
    ""
  );
}

export default function PricingPage({ variant = "landing" }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isLanding = variant === "landing";
  const isChangingPlan =
    searchParams.get("changePlan") === "true";

  const [isAnnual, setIsAnnual] = useState(
    searchParams.get("billing") === "yearly"
  );

  const [openFaq, setOpenFaq] = useState(0);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const handleSelectPlan = async (plan) => {
    if (loadingPlan) return;

    const billingCycle = isAnnual ? "YEARLY" : "MONTHLY";

    // New users continue to registration with their selected plan.
    if (!isChangingPlan) {
      navigate(
        `/register?plan=${encodeURIComponent(
          plan.id
        )}&billing=${isAnnual ? "yearly" : "monthly"}`
      );
      return;
    }

    // Existing users must be authenticated to change their plan.
    const token = getStoredToken();

    if (!token) {
      showErrorToast("Please sign in again to change your plan.");
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoadingPlan(true);

      const response = await fetch(`${API_URL}/auth/change-plan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Keep this exact message for expired Starter trials.
        if (result.code === "TRIAL_EXPIRED") {
          showErrorToast("Your 14-day free trial has ended.");
          return;
        }

        showErrorToast(
          result.message ||
            result.error ||
            "Unable to update your subscription."
        );
        return;
      }

      // Keep the existing authentication token and user information.
      const existingAuth = getStoredAuth();
      const existingUser =
        existingAuth.user ||
        existingAuth.state?.user ||
        null;
      const existingCompany =
        existingAuth.company ||
        existingAuth.state?.company ||
        null;

      setAuthData({
        token,
        user: result.user || existingUser,
        company: result.company || existingCompany,
        subscription:
          result.subscription ||
          existingAuth.subscription ||
          existingAuth.state?.subscription ||
          null,
      });

      showSuccessToast(
        result.message || "Plan selected successfully."
      );

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Subscription change failed:", error);

      showErrorToast(
        error.message || "Unable to update your subscription."
      );
    } finally {
      setLoadingPlan(false);
    }
  };

  return (
    <div className="landing-page min-h-screen bg-background font-body-md text-text antialiased">
      {isLanding && <LandingNavbar />}

      <main
        className={
          isLanding
            ? "px-6 pb-24 pt-32 md:px-8"
            : "px-6 pb-24 pt-10 md:px-8"
        }
      >
        <div className="mx-auto max-w-7xl">
          {/* Page heading */}
          <section className="mb-20 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-light px-3 py-1.5">
              <span className="material-symbols-outlined text-base text-primary">
                payments
              </span>
              <span className="text-xs font-semibold tracking-wide text-primary">
                SIMPLE &amp; TRANSPARENT PRICING
              </span>
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-text md:text-5xl lg:text-6xl">
              {isChangingPlan ? (
                "Choose Your Subscription Plan"
              ) : (
                <>
                  Predictable Pricing for
                  <br className="hidden sm:block" />
                  <span className="text-primary">
                    {" "}Modern Automation.
                  </span>
                </>
              )}
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-text-muted">
              {isChangingPlan
                ? "Choose the plan that best fits your business. No payment step is required to select a plan."
                : "Scale your billing infrastructure without the headache. Choose a plan that grows with your business."}
            </p>

            {/* Monthly / annual toggle */}
            <div className="mb-16 flex items-center justify-center gap-4">
              <span
                className={`text-sm font-medium ${
                  !isAnnual ? "text-text" : "text-text-muted"
                }`}
              >
                Monthly
              </span>

              <button
                type="button"
                onClick={() => setIsAnnual((previous) => !previous)}
                disabled={loadingPlan}
                aria-label="Toggle annual billing"
                aria-pressed={isAnnual}
                className="relative h-7 w-14 rounded-full bg-primary p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60"
              >
                <span
                  className={`absolute top-1 block h-5 w-5 rounded-full bg-surface shadow-sm transition-all duration-200 ${
                    isAnnual ? "right-1" : "left-1"
                  }`}
                />
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${
                    isAnnual ? "text-text" : "text-text-muted"
                  }`}
                >
                  Annual
                </span>

                <span className="rounded-full bg-success-light px-2.5 py-1 text-[10px] font-bold tracking-wider text-success">
                  SAVE 20%
                </span>
              </div>
            </div>
          </section>

          {/* Pricing cards */}
          <section className="mb-32 grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
            {PLANS.map((plan) => {
              const price = isAnnual
                ? plan.annualPrice
                : plan.monthlyPrice;

              return (
                <article
                  key={plan.id}
                  className={`relative flex h-full flex-col rounded-xl p-8 transition-all duration-200 md:p-10 ${
                    plan.popular
                      ? "z-10 border-2 border-primary bg-surface shadow-primary md:scale-105"
                      : "border border-border bg-surface-secondary shadow-sm hover:shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-text-inverse shadow-md">
                        <span className="material-symbols-outlined text-sm">
                          star
                        </span>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h2 className="mb-2 text-xl font-bold text-text">
                      {plan.name}
                    </h2>
                    <p className="text-sm text-text-muted">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8 min-h-[60px]">
                    <div className="flex flex-wrap items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tighter text-text md:text-5xl">
                        {formatPrice(price)}
                      </span>

                      {price !== 0 && (
                        <span className="font-medium text-text-muted">
                          {isAnnual ? "/year" : "/month"}
                        </span>
                      )}
                    </div>

                    {price === 0 && (
                      <p className="mt-1 text-xs text-text-muted">
                        No payment required to start
                      </p>
                    )}
                  </div>

                  {/* Select plan */}
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={loadingPlan}
                    className={`mb-10 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-center text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                      plan.popular
                        ? "bg-primary text-text-inverse shadow-primary hover:bg-primary-hover"
                        : plan.id === "enterprise"
                        ? "bg-text text-text-inverse hover:bg-text-secondary"
                        : "border border-border bg-surface-secondary text-primary hover:bg-primary-soft"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      rocket_launch
                    </span>

                    {loadingPlan
                      ? "Selecting plan..."
                      : isChangingPlan
                      ? `Select ${plan.name}`
                      : plan.buttonText}
                  </button>

                  {/* Features */}
                  <div className="flex-grow space-y-4">
                    <p className="text-sm font-bold text-text">
                      {plan.featuresTitle}
                    </p>

                    {plan.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-3"
                      >
                        <span
                          className="material-symbols-outlined shrink-0 text-lg text-primary"
                          style={{
                            fontVariationSettings: "'FILL' 1",
                          }}
                        >
                          check_circle
                        </span>

                        <span className="text-sm leading-6 text-text-muted">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>

          {/* Frequently asked questions */}
          <section className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
                <span className="material-symbols-outlined text-2xl">
                  help
                </span>
              </div>

              <h2 className="mb-4 text-2xl font-bold text-text md:text-3xl">
                Frequently Asked Questions
              </h2>

              <p className="text-text-muted">
                Everything you need to know about AutoBillr pricing and billing.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div
                    key={faq.question}
                    className={`cursor-pointer rounded-xl border bg-surface transition-all duration-200 ${
                      isOpen
                        ? "border-primary shadow-sm"
                        : "border-border hover:shadow-sm"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenFaq(isOpen ? null : index)
                      }
                      className="flex w-full items-center justify-between gap-4 p-6 text-left"
                    >
                      <span
                        className={`text-base font-semibold ${
                          isOpen ? "text-primary" : "text-text"
                        }`}
                      >
                        {faq.question}
                      </span>

                      <span
                        className={`material-symbols-outlined shrink-0 text-text-light transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6">
                        <div className="border-t border-border-light pt-4">
                          <p className="text-sm leading-relaxed text-text-muted">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {isLanding && <LandingFooter />}
    </div>
  );
}
