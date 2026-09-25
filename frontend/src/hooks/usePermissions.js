import { PLAN_CONFIG } from "../config/planConfig";

export function usePermissions() {
  const planOverride = localStorage.getItem("autobillr-plan-override");
  const storedUser = JSON.parse(
    localStorage.getItem("autobillr-user") ||
    localStorage.getItem("user") ||
    "{}"
  );

  const activePlan = (
    planOverride ||
    storedUser?.company?.subscription?.planId ||
    storedUser?.plan ||
    "starter"
  ).toLowerCase();

  const rules = PLAN_CONFIG[activePlan] || PLAN_CONFIG.starter;

  return {
    plan: activePlan,
    planName: rules.name,
    maxInvoices: rules.maxInvoices,
    maxSeats: rules.maxSeats,

    canUseApiWebhooks: rules.canUseApiWebhooks,
    canUseAdvancedAnalytics: rules.canUseAdvancedAnalytics,
    canUseSso: rules.canUseSso,

    isStarter: activePlan === "starter",
    isPro: activePlan === "pro",
    isEnterprise: activePlan === "enterprise",
  };
}