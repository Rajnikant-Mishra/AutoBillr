// import { PLAN_CONFIG } from "../config/planConfig";

// export function usePermissions() {
//   const planOverride = localStorage.getItem("autobillr-plan-override");
//   const storedUser = JSON.parse(
//     localStorage.getItem("autobillr-user") ||
//     localStorage.getItem("user") ||
//     "{}"
//   );

//   const activePlan = (
//     planOverride ||
//     storedUser?.company?.subscription?.planId ||
//     storedUser?.plan ||
//     "starter"
//   ).toLowerCase();

//   const rules = PLAN_CONFIG[activePlan] || PLAN_CONFIG.starter;

//   return {
//     plan: activePlan,
//     planName: rules.name,
//     maxInvoices: rules.maxInvoices,
//     maxSeats: rules.maxSeats,

//     canUseApiWebhooks: rules.canUseApiWebhooks,
//     canUseAdvancedAnalytics: rules.canUseAdvancedAnalytics,
//     canUseSso: rules.canUseSso,

//     isStarter: activePlan === "starter",
//     isPro: activePlan === "pro",
//     isEnterprise: activePlan === "enterprise",
//   };
// }




import { useMemo } from "react";
import { PLAN_CONFIG } from "../config/planConfig";

// ---------------------------------------------------------
// System role defaults
// ---------------------------------------------------------
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

  Analyst: [
    "dashboard:view",

    "invoices:view",

    "clients:view",

    "projects:view",

    "analytics:view",
    "analytics:export",

    "team:view",
  ],

  Viewer: [
    "dashboard:view",

    "invoices:view",

    "clients:view",

    "projects:view",

    "team:view",
  ],
};

// ---------------------------------------------------------
// Safe JSON parser
// ---------------------------------------------------------
function safeParse(value) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

// ---------------------------------------------------------
// Normalize role
//
// Supports:
// OWNER
// owner
// Owner
// ADMIN
// admin
// Admin
// etc.
// ---------------------------------------------------------
function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  switch (value) {
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
      return "Viewer";
  }
}

// ---------------------------------------------------------
// Get stored authentication/user object
// ---------------------------------------------------------
function getStoredUser() {
  const auth = safeParse(
    localStorage.getItem("autobiller-auth")
  );

  const autobillrUser = safeParse(
    localStorage.getItem("autobillr-user")
  );

  const user = safeParse(
    localStorage.getItem("user")
  );

  /*
   * autobiller-auth normally contains something like:
   *
   * {
   *   token,
   *   user,
   *   company,
   *   subscription
   * }
   *
   * Therefore prefer the nested user object.
   */

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
      company:
        autobillrUser.company ||
        autobillrUser.user.company,
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

// ---------------------------------------------------------
// Main hook
// ---------------------------------------------------------
export function usePermissions() {
  // -------------------------------------------------------
  // Read user
  // -------------------------------------------------------
  const storedUser = getStoredUser();

  // -------------------------------------------------------
  // Plan / Subscription
  // -------------------------------------------------------
  const planOverride = localStorage.getItem(
    "autobillr-plan-override"
  );

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

  // -------------------------------------------------------
  // Detect role
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // Extra permissions
  // -------------------------------------------------------
  const extraPermissions = Array.isArray(
    storedUser?.extraPermissions
  )
    ? storedUser.extraPermissions
    : Array.isArray(
        storedUser?.member?.extraPermissions
      )
    ? storedUser.member.extraPermissions
    : Array.isArray(
        storedUser?.teamMember?.extraPermissions
      )
    ? storedUser.teamMember.extraPermissions
    : Array.isArray(
        storedUser?.user?.extraPermissions
      )
    ? storedUser.user.extraPermissions
    : [];

  // -------------------------------------------------------
  // Backend permissions
  // -------------------------------------------------------
  const storedPermissions = Array.isArray(
    storedUser?.permissions
  )
    ? storedUser.permissions
    : Array.isArray(
        storedUser?.member?.permissions
      )
    ? storedUser.member.permissions
    : Array.isArray(
        storedUser?.teamMember?.permissions
      )
    ? storedUser.teamMember.permissions
    : Array.isArray(
        storedUser?.user?.permissions
      )
    ? storedUser.user.permissions
    : null;

  // -------------------------------------------------------
  // Effective permissions
  // -------------------------------------------------------
  const effectivePermissions = useMemo(() => {
    // -----------------------------------------------------
    // OWNER / ADMIN = FULL ACCESS
    // -----------------------------------------------------
    if (
      roleName === "Owner" ||
      roleName === "Admin"
    ) {
      return ["*"];
    }

    // -----------------------------------------------------
    // Backend permissions
    // -----------------------------------------------------
    if (
      Array.isArray(storedPermissions) &&
      storedPermissions.length > 0
    ) {
      return [
        ...new Set([
          ...storedPermissions,
          ...extraPermissions,
        ]),
      ];
    }

    // -----------------------------------------------------
    // System defaults
    // -----------------------------------------------------
    const base =
      SYSTEM_ROLE_DEFAULTS[roleName] ||
      SYSTEM_ROLE_DEFAULTS.Viewer;

    return [
      ...new Set([
        ...base,
        ...extraPermissions,
      ]),
    ];
  }, [
    roleName,
    storedPermissions,
    extraPermissions,
  ]);

  // -------------------------------------------------------
  // Permission checker
  // -------------------------------------------------------
  const can = useMemo(() => {
    const permissionSet = new Set(
      effectivePermissions
    );

    return (permission) => {
      // No permission restriction
      if (
        permission === null ||
        permission === undefined ||
        permission === ""
      ) {
        return true;
      }

      // Owner/Admin always allowed
      if (
        roleName === "Owner" ||
        roleName === "Admin"
      ) {
        return true;
      }

      // Wildcard
      if (permissionSet.has("*")) {
        return true;
      }

      // Exact permission
      return permissionSet.has(permission);
    };
  }, [
    effectivePermissions,
    roleName,
  ]);

  // -------------------------------------------------------
  // Return
  // -------------------------------------------------------
  return {
    // Plan
    plan: activePlan,

    planName:
      rules.name ||
      activePlan,

    maxInvoices:
      rules.maxInvoices ?? 0,

    maxSeats:
      rules.maxSeats ?? 1,

    canUseApiWebhooks:
      Boolean(rules.canUseApiWebhooks),

    canUseAdvancedAnalytics:
      Boolean(rules.canUseAdvancedAnalytics),

    canUseSso:
      Boolean(rules.canUseSso),

    isStarter:
      activePlan === "starter",

    isPro:
      activePlan === "pro",

    isEnterprise:
      activePlan === "enterprise",

    // Role
    role: roleName,

    // Permissions
    permissions: effectivePermissions,

    can,
  };
}