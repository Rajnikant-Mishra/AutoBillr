import React, { useState } from "react";
import { Link } from "react-router-dom";

import LandingNavbar from "../../components/landing/LandingNavbar";
import LandingFooter from "../../components/landing/LandingFooter";

import "../../styles/theme.css";

/* =========================================================
   PRICING PLANS
========================================================= */
const plans = [
  {
    id: "starter",
    name: "Starter",
    description: "For small teams getting started.",
    monthlyPrice: 49,
    annualPrice: 39,
    cta: "Start 14-day free trial",
    ctaClass:
      "bg-surface-secondary text-primary border border-border hover:bg-primary-soft",
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
    ctaClass:
      "bg-primary text-text-inverse hover:bg-primary-hover shadow-primary",
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
    ctaClass: "bg-text text-text-inverse hover:bg-text-secondary",
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

/* =========================================================
   FAQS
========================================================= */
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

/* =========================================================
   PRICING PAGE
   variant="landing" → navbar + footer (public)
   variant="app"     → content only (from dashboard, no chrome)
========================================================= */
export default function PricingPage({ variant = "landing" }) {
  const isLanding = variant === "landing";
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="landing-page min-h-screen bg-background font-body-md text-text antialiased">
      {isLanding && <LandingNavbar />}

      <main
        className={
          isLanding
            ? "pt-32 pb-24 px-6 md:px-8"
            : "pt-10 pb-24 px-6 md:px-8"
        }
      >
        <div className="max-w-7xl mx-auto">
          {/* HERO */}
          <section className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-primary-light border border-primary/20">
              <span className="material-symbols-outlined text-primary text-base">
                payments
              </span>
              <span className="text-xs font-semibold text-primary tracking-wide">
                SIMPLE & TRANSPARENT PRICING
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-text mb-6 leading-tight tracking-tight">
              Predictable Pricing for{" "}
              <br className="hidden sm:block" />
              <span className="text-primary">Modern Automation.</span>
            </h1>

            <p className="text-lg text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Scale your billing infrastructure without the headache. Choose a
              plan that grows with your transaction volume and team size.
            </p>

            {/* BILLING TOGGLE */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <span
                className={`text-sm font-medium transition-colors ${
                  !isAnnual ? "text-text" : "text-text-muted"
                }`}
              >
                Monthly
              </span>

              <button
                type="button"
                onClick={() => setIsAnnual((v) => !v)}
                className="w-14 h-7 bg-primary rounded-full relative p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                aria-label="Toggle annual pricing"
                aria-pressed={isAnnual}
              >
                <span
                  className={`block w-5 h-5 bg-surface rounded-full absolute top-1 shadow-sm transition-all duration-200 ${
                    isAnnual ? "right-1" : "left-1"
                  }`}
                />
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold transition-colors ${
                    isAnnual ? "text-text" : "text-text-muted"
                  }`}
                >
                  Annual
                </span>
                <span className="bg-success-light text-success px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider">
                  SAVE 20%
                </span>
              </div>
            </div>
          </section>

          {/* PRICING GRID */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`
                  relative p-8 md:p-10 rounded-xl flex flex-col h-full border transition-all duration-200
                  ${
                    plan.highlighted
                      ? "bg-surface border-2 border-primary shadow-primary md:scale-105 z-10"
                      : "bg-surface-secondary border-border shadow-sm hover:shadow-md"
                  }
                `}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-primary text-text-inverse px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest whitespace-nowrap shadow-md">
                      <span className="material-symbols-outlined text-sm">
                        star
                      </span>
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-text mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-text-muted">{plan.description}</p>
                </div>

                <div className="mb-8 min-h-[60px] flex items-end">
                  {plan.monthlyPrice === null ? (
                    <span className="text-4xl md:text-5xl font-extrabold text-text tracking-tighter">
                      Custom
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-5xl font-extrabold text-text tracking-tighter">
                        ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-text-muted font-medium">/mo</span>
                    </div>
                  )}
                </div>

                <Link
                  to={plan.id === "enterprise" ? "/contact" : "/register"}
                  className={`
                    w-full min-h-[48px] px-5 py-3 rounded-lg font-semibold text-sm
                    text-center inline-flex items-center justify-center gap-2
                    transition-all duration-200 mb-10
                    ${plan.ctaClass}
                  `}
                >
                  <span className="material-symbols-outlined text-lg">
                    {plan.id === "enterprise" ? "contact_page" : "rocket_launch"}
                  </span>
                  {plan.cta}
                </Link>

                <div className="space-y-4 flex-grow">
                  <p className="text-sm font-bold text-text">
                    {plan.featuresTitle}
                  </p>
                  {plan.features.map((feature, index) => {
                    const text =
                      typeof feature === "string" ? feature : feature.text;
                    const highlight =
                      typeof feature === "object" && feature.highlight;

                    return (
                      <div
                        key={`${plan.id}-feature-${index}`}
                        className="flex items-start gap-3"
                      >
                        <span
                          className="material-symbols-outlined text-primary text-lg shrink-0"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        <span
                          className={`text-sm leading-6 ${
                            highlight
                              ? "text-primary font-semibold"
                              : "text-text-muted"
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

          {/* FAQ */}
          <section className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-light text-primary mb-5">
                <span className="material-symbols-outlined text-2xl">help</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-text mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-text-muted">
                Everything you need to know about AutoBillr pricing and billing.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className={`
                      bg-surface rounded-xl border cursor-pointer transition-all duration-200
                      ${
                        isOpen
                          ? "border-primary shadow-sm"
                          : "border-border hover:border-border-dark hover:shadow-sm"
                      }
                    `}
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                  >
                    <div className="flex justify-between items-center gap-4 p-6">
                      <h4
                        className={`text-base font-semibold transition-colors ${
                          isOpen ? "text-primary" : "text-text"
                        }`}
                      >
                        {faq.q}
                      </h4>
                      <span
                        className={`
                          material-symbols-outlined shrink-0 transition-all duration-200
                          ${isOpen ? "text-primary rotate-180" : "text-text-light"}
                        `}
                      >
                        expand_more
                      </span>
                    </div>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <div className="pt-4 border-t border-border-light">
                          <p className="text-sm text-text-muted leading-relaxed">
                            {faq.a}
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