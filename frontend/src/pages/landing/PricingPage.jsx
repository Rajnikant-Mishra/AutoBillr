import React, { useState } from "react";
import { Link } from "react-router-dom";
import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";
import "../../styles/theme.css";
import "../../styles/landing.css";

const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "For small teams getting started.",
    monthlyPrice: 49,
    annualPrice: 39,
    cta: "Start 14-day free trial",
    ctaStyle: "bg-surface-container text-primary hover:bg-primary-fixed",
    featuresTitle: "Includes:",
    features: [
      "Up to 500 invoices/mo",
      "2 Team seats",
      "Basic Reporting",
      "Standard Email Support",
    ],
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Perfect for growing organizations.",
    monthlyPrice: 129,
    annualPrice: 103,
    cta: "Get Started with Pro",
    ctaStyle:
      "bg-primary text-on-primary hover:opacity-90 shadow-lg shadow-primary/20",
    featuresTitle: "Everything in Starter, plus:",
    features: [
      { text: "Unlimited Invoices", highlight: true },
      "10 Team seats",
      "Advanced Analytics",
      "API Access & Webhooks",
      "Priority Chat Support",
    ],
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Custom solutions for big scale.",
    monthlyPrice: null,
    annualPrice: null,
    cta: "Contact Sales",
    ctaStyle: "bg-slate-900 text-white hover:opacity-90",
    featuresTitle: "Everything in Pro, plus:",
    features: [
      "Unlimited seats",
      "Single Sign-On (SSO)",
      "Custom Integrations",
      "Dedicated Account Manager",
      "99.9% Uptime SLA",
    ],
    highlighted: false,
  },
];

const faqs = [
  {
    q: "Can I change my plan later?",
    a: "Yes, you can upgrade or downgrade your plan at any time from your account settings. If you upgrade, the change will take effect immediately. If you downgrade, the change will take effect at the end of your current billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. Starter and Pro plans include a 14-day free trial. No credit card is required to start.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, American Express) and can arrange invoicing for annual Enterprise plans.",
  },
  {
    q: "Do you offer discounts for non-profits?",
    a: "Yes. Qualified non-profits and educational institutions can receive up to 30% off. Contact sales for details.",
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="landing-page bg-surface font-body-md text-on-surface antialiased">
      <LandingNavbar />

      <main className="pt-32 pb-24 px-6 md:px-8 max-w-7xl mx-auto">
        {/* ========== HERO ========== */}
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
            Predictable Pricing for{" "}
            <br className="hidden sm:block" />
            <span className="text-primary">Modern Automation.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Scale your billing infrastructure without the headache. Choose a
            plan that grows with your transaction volume and team size.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <span
              className={`text-sm font-medium ${
                !isAnnual ? "text-slate-900" : "text-slate-500"
              }`}
            >
              Monthly
            </span>

            <button
              type="button"
              onClick={() => setIsAnnual((v) => !v)}
              className="w-14 h-7 bg-primary rounded-full relative p-1 transition-colors"
              aria-label="Toggle annual pricing"
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm transition-all duration-200 ${
                  isAnnual ? "right-1" : "left-1"
                }`}
              />
            </button>

            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${
                  isAnnual ? "text-slate-900" : "text-slate-500"
                }`}
              >
                Annual
              </span>
              <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
                SAVE 20%
              </span>
            </div>
          </div>
        </section>

        {/* ========== PRICING GRID ========== */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-10 rounded-xl flex flex-col h-full border ${
                plan.highlighted
                  ? "bg-white border-2 border-primary shadow-[0px_20px_25px_-5px_rgba(15,23,42,0.1)] scale-105 z-10"
                  : "bg-slate-50 border-slate-100 shadow-[0px_4px_6px_-1px_rgba(15,23,42,0.05)]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-slate-500">{plan.description}</p>
              </div>

              <div className="mb-8">
                {plan.monthlyPrice === null ? (
                  <span className="text-5xl font-extrabold text-slate-900 tracking-tighter">
                    Custom
                  </span>
                ) : (
                  <>
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tighter">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-slate-500 font-medium">/mo</span>
                  </>
                )}
              </div>

              <Link
                to={plan.id === "enterprise" ? "/contact" : "/register"}
                className={`w-full py-4 rounded-lg font-semibold text-sm text-center transition-all mb-10 block ${plan.ctaStyle}`}
              >
                {plan.cta}
              </Link>

              <div className="space-y-4 flex-grow">
                <p className="text-sm font-bold text-slate-900">
                  {plan.featuresTitle}
                </p>
                {plan.features.map((f, i) => {
                  const text = typeof f === "string" ? f : f.text;
                  const highlight = typeof f === "object" && f.highlight;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span
                        className="material-symbols-outlined text-primary text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <span
                        className={`text-sm ${
                          highlight
                            ? "text-primary font-medium"
                            : "text-slate-500"
                        }`}
                      >
                        {text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* ========== FAQ ========== */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500">
              Everything you need to know about AutoBillr pricing and billing.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 cursor-pointer transition-all hover:shadow-md"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                >
                  <div className="flex justify-between items-center gap-4">
                    <h4 className="text-base font-semibold text-slate-900">
                      {faq.q}
                    </h4>
                    <span
                      className={`material-symbols-outlined text-slate-400 transition-colors ${
                        isOpen ? "text-primary rotate-180" : ""
                      }`}
                    >
                      expand_more
                    </span>
                  </div>
                  {isOpen && (
                    <p className="mt-4 text-slate-500 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}