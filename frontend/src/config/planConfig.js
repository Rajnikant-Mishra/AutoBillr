// src/config/planConfig.js

export const PLANS = {
  STARTER: "starter",
  PRO: "pro",
  ENTERPRISE: "enterprise",
};

export const PLAN_CONFIG = {
  starter: {
    name: "Starter",
    maxInvoices: 500,
    maxSeats: 2,
    canUseApiWebhooks: false,
    canUseAdvancedAnalytics: false,
    canUseSso: false,
  },
  pro: {
    name: "Pro",
    maxInvoices: Infinity, 
    maxSeats: 10,
    canUseApiWebhooks: true,
    canUseAdvancedAnalytics: true,
    canUseSso: false,
  },
  enterprise: {
    name: "Enterprise",
    maxInvoices: Infinity, 
    maxSeats: Infinity, 
    canUseApiWebhooks: true,
    canUseAdvancedAnalytics: true,
    canUseSso: true,
  },
};