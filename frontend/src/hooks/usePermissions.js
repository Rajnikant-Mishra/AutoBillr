import { useMemo } from "react";

/*
|--------------------------------------------------------------------------
| PLAN CONFIGURATION (Default Fallback)
|--------------------------------------------------------------------------
*/
const PLAN_CONFIG = {
  starter: {
    name: "Starter",
    maxInvoices: 5,
    maxSeats: 1,
    canUseApiWebhooks: false,
    canUseAdvancedAnalytics: false,
    canUseSso: false,
  },
  pro: {
    name: "Pro",
    maxInvoices: 100,
    maxSeats: 5,
    canUseApiWebhooks: true,
    canUseAdvancedAnalytics: true,
    canUseSso: false,
  },
  enterprise: {
    name: "Enterprise",
    maxInvoices: 999999,
    maxSeats: 50,
    canUseApiWebhooks: true,
    canUseAdvancedAnalytics: true,
    canUseSso: true,
  },
};

/*
|--------------------------------------------------------------------------
| SYSTEM ROLE DEFAULTS
|--------------------------------------------------------------------------
*/
const SYSTEM_ROLE_DEFAULTS = {
  Owner: ["*"],
  Admin: ["*"],
  Manager: [
    "dashboard:view",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:send",
    "invoices:remind",
    "clients:view",
    "clients:create",
    "clients:edit",
    "projects:view",
    "projects:create",
    "projects:edit",
    "projects:milestones",
    "analytics:view",
    "automation:view",
    "team:view",
  ],
  Analyst: ["dashboard:view"],
  Viewer: [
    "dashboard:view",
    "invoices:view",
    "clients:view",
    "projects:view",
  ],
};

/*
|--------------------------------------------------------------------------
| SAFE JSON PARSER
|--------------------------------------------------------------------------
*/
function safeParse(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

/*
|--------------------------------------------------------------------------
| NORMALIZE ROLE
|--------------------------------------------------------------------------
*/
function normalizeRole(role) {
  const value = String(role || "").trim();
  const normalized = value.toLowerCase();

  switch (normalized) {
    case "owner":
    case "owner_role":
      return "Owner";

    case "admin":
    case "administrator":
      return "Admin";

    case "manager":
      return "Manager";

    case "analyst":
      return "Analyst";

    case "viewer":
      return "Viewer";

    default:
      // Preserve custom roles (e.g. Helper) instead of converting them to Viewer
      return value || "Viewer";
  }
}

/*
|--------------------------------------------------------------------------
| GET STORED USER
|--------------------------------------------------------------------------
*/
function getStoredUser() {
  const auth = safeParse(localStorage.getItem("autobiller-auth"));
  const autobillrUser = safeParse(localStorage.getItem("autobillr-user"));
  const user = safeParse(localStorage.getItem("user"));

  if (auth?.user) {
    return {
      ...auth,
      ...auth.user,
      user: auth.user,
      company: auth.company || auth.user.company,
      subscription:
        auth.subscription ||
        auth.user.subscription ||
        auth.user.company?.subscription,
    };
  }

  if (autobillrUser?.user) {
    return {
      ...autobillrUser,
      ...autobillrUser.user,
      user: autobillrUser.user,
      company: autobillrUser.company || autobillrUser.user.company,
      subscription:
        autobillrUser.subscription ||
        autobillrUser.user.subscription ||
        autobillrUser.user.company?.subscription,
    };
  }

  if (Object.keys(autobillrUser).length > 0) {
    return autobillrUser;
  }

  return user;
}

/*
|--------------------------------------------------------------------------
| MAIN HOOK
|--------------------------------------------------------------------------
*/
export function usePermissions() {
  const storedUser = getStoredUser();

  const planOverride = localStorage.getItem("autobillr-plan-override");

  const activePlan = String(
    planOverride ||
      storedUser?.subscription?.planId ||
      storedUser?.company?.subscription?.planId ||
      storedUser?.company?.subscription?.plan ||
      storedUser?.plan ||
      storedUser?.state?.user?.plan ||
      "starter"
  )
    .trim()
    .toLowerCase();

  const rules =
    PLAN_CONFIG?.[activePlan] ||
    PLAN_CONFIG?.starter ||
    {};

  const rawRole =
    storedUser?.role ||
    storedUser?.user?.role ||
    storedUser?.member?.role ||
    storedUser?.teamMember?.role ||
    storedUser?.state?.user?.role ||
    storedUser?.state?.role ||
    storedUser?.userRole ||
    "Viewer";

  const roleName = normalizeRole(rawRole);

  const extraPermissions = Array.isArray(storedUser?.extraPermissions)
    ? storedUser.extraPermissions
    : Array.isArray(storedUser?.member?.extraPermissions)
    ? storedUser.member.extraPermissions
    : Array.isArray(storedUser?.teamMember?.extraPermissions)
    ? storedUser.teamMember.extraPermissions
    : Array.isArray(storedUser?.user?.extraPermissions)
    ? storedUser.user.extraPermissions
    : [];

  const storedPermissions = Array.isArray(storedUser?.permissions)
    ? storedUser.permissions
    : Array.isArray(storedUser?.member?.permissions)
    ? storedUser.member.permissions
    : Array.isArray(storedUser?.teamMember?.permissions)
    ? storedUser.teamMember.permissions
    : Array.isArray(storedUser?.user?.permissions)
    ? storedUser.user.permissions
    : null;

  const effectivePermissions = useMemo(() => {
    // 1. Prefer backend permissions if provided
    if (Array.isArray(storedPermissions)) {
      return [...new Set([...storedPermissions, ...extraPermissions])];
    }

    // 2. Owner & Admin get all access
    if (roleName === "Owner" || roleName === "Admin") {
      return ["*"];
    }

    // 3. System roles fallback; custom roles (e.g., Helper) default to empty
    const system = SYSTEM_ROLE_DEFAULTS[roleName] || [];
    return [...new Set([...system, ...extraPermissions])];
  }, [roleName, storedPermissions, extraPermissions]);

  const can = useMemo(() => {
    const permissionSet = new Set(effectivePermissions);

    return (permission) => {
      if (
        permission === null ||
        permission === undefined ||
        permission === ""
      ) {
        return true;
      }

      if (roleName === "Owner" || roleName === "Admin") {
        return true;
      }

      if (permissionSet.has("*")) {
        return true;
      }

      return permissionSet.has(permission);
    };
  }, [effectivePermissions, roleName]);

  return {
    plan: activePlan,
    planName: rules.name || activePlan,
    maxInvoices: rules.maxInvoices ?? 0,
    maxSeats: rules.maxSeats ?? 1,
    canUseApiWebhooks: Boolean(rules.canUseApiWebhooks),
    canUseAdvancedAnalytics: Boolean(rules.canUseAdvancedAnalytics),
    canUseSso: Boolean(rules.canUseSso),
    isStarter: activePlan === "starter",
    isPro: activePlan === "pro",
    isEnterprise: activePlan === "enterprise",
    role: roleName,
    permissions: effectivePermissions,
    can,
  };
}