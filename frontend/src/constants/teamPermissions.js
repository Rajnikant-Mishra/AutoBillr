export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",

  INVOICES_VIEW: "invoices:view",
  INVOICES_CREATE: "invoices:create",
  INVOICES_EDIT: "invoices:edit",
  INVOICES_DELETE: "invoices:delete",
  INVOICES_SEND: "invoices:send",
  INVOICES_REMIND: "invoices:remind",
  INVOICES_EXPORT: "invoices:export",

  CLIENTS_VIEW: "clients:view",
  CLIENTS_CREATE: "clients:create",
  CLIENTS_EDIT: "clients:edit",
  CLIENTS_DELETE: "clients:delete",

  PROJECTS_VIEW: "projects:view",
  PROJECTS_CREATE: "projects:create",
  PROJECTS_EDIT: "projects:edit",
  PROJECTS_DELETE: "projects:delete",
  PROJECTS_MILESTONES: "projects:milestones",

  ANALYTICS_VIEW: "analytics:view",
  ANALYTICS_EXPORT: "analytics:export",

  AUTOMATION_VIEW: "automation:view",
  AUTOMATION_MANAGE: "automation:manage",

  TEAM_VIEW: "team:view",
  TEAM_INVITE: "team:invite",
  TEAM_EDIT_MEMBER: "team:edit_member",
  TEAM_REMOVE_MEMBER: "team:remove_member",
  ROLES_MANAGE: "roles:manage",

  SETTINGS_VIEW: "settings:view",
  SETTINGS_BUSINESS: "settings:business",
  SETTINGS_BRANDING: "settings:branding",
  SETTINGS_TAX: "settings:tax",
  SETTINGS_PAYMENTS: "settings:payments",
  SETTINGS_INTEGRATIONS: "settings:integrations",
  SETTINGS_API: "settings:api",

  BILLING_VIEW: "billing:view",
};

export const PERMISSION_GROUPS = [
  {
    title: "Dashboard",
    items: [
      {
        key: PERMISSIONS.DASHBOARD_VIEW,
        label: "View dashboard",
      },
    ],
  },

  {
    title: "Invoices",
    items: [
      {
        key: PERMISSIONS.INVOICES_VIEW,
        label: "View invoices",
      },
      {
        key: PERMISSIONS.INVOICES_CREATE,
        label: "Create invoice",
      },
      {
        key: PERMISSIONS.INVOICES_EDIT,
        label: "Edit invoice",
      },
      {
        key: PERMISSIONS.INVOICES_DELETE,
        label: "Delete invoice",
      },
      {
        key: PERMISSIONS.INVOICES_SEND,
        label: "Send invoice",
      },
      {
        key: PERMISSIONS.INVOICES_REMIND,
        label: "Send reminder",
      },
      {
        key: PERMISSIONS.INVOICES_EXPORT,
        label: "Export invoices",
      },
    ],
  },

  {
    title: "Clients",
    items: [
      {
        key: PERMISSIONS.CLIENTS_VIEW,
        label: "View clients",
      },
      {
        key: PERMISSIONS.CLIENTS_CREATE,
        label: "Add client",
      },
      {
        key: PERMISSIONS.CLIENTS_EDIT,
        label: "Edit client",
      },
      {
        key: PERMISSIONS.CLIENTS_DELETE,
        label: "Delete client",
      },
    ],
  },

  {
    title: "Projects",
    items: [
      {
        key: PERMISSIONS.PROJECTS_VIEW,
        label: "View projects",
      },
      {
        key: PERMISSIONS.PROJECTS_CREATE,
        label: "Create project",
      },
      {
        key: PERMISSIONS.PROJECTS_EDIT,
        label: "Edit project",
      },
      {
        key: PERMISSIONS.PROJECTS_DELETE,
        label: "Delete project",
      },
      {
        key: PERMISSIONS.PROJECTS_MILESTONES,
        label: "Manage milestones",
      },
    ],
  },

  {
    title: "Analytics & Automation",
    items: [
      {
        key: PERMISSIONS.ANALYTICS_VIEW,
        label: "View analytics",
      },
      {
        key: PERMISSIONS.ANALYTICS_EXPORT,
        label: "Export analytics",
      },
      {
        key: PERMISSIONS.AUTOMATION_VIEW,
        label: "View automation",
      },
      {
        key: PERMISSIONS.AUTOMATION_MANAGE,
        label: "Manage automation",
      },
    ],
  },

  {
    title: "Team",
    items: [
      {
        key: PERMISSIONS.TEAM_VIEW,
        label: "View team",
      },
      {
        key: PERMISSIONS.TEAM_INVITE,
        label: "Invite members",
      },
      {
        key: PERMISSIONS.TEAM_EDIT_MEMBER,
        label: "Change member role",
      },
      {
        key: PERMISSIONS.TEAM_REMOVE_MEMBER,
        label: "Remove member",
      },
      {
        key: PERMISSIONS.ROLES_MANAGE,
        label: "Manage roles & permissions",
      },
    ],
  },

  {
    title: "Settings",
    items: [
      {
        key: PERMISSIONS.SETTINGS_VIEW,
        label: "View settings",
      },
      {
        key: PERMISSIONS.SETTINGS_BUSINESS,
        label: "Edit business information",
      },
      {
        key: PERMISSIONS.SETTINGS_BRANDING,
        label: "Edit branding",
      },
      {
        key: PERMISSIONS.SETTINGS_TAX,
        label: "Manage tax settings",
      },
      {
        key: PERMISSIONS.SETTINGS_PAYMENTS,
        label: "Manage payment settings",
      },
      {
        key: PERMISSIONS.SETTINGS_INTEGRATIONS,
        label: "Manage integrations",
      },
      {
        key: PERMISSIONS.SETTINGS_API,
        label: "Manage API settings",
      },
    ],
  },

  {
    title: "Billing",
    items: [
      {
        key: PERMISSIONS.BILLING_VIEW,
        label: "View billing",
      },
    ],
  },
];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);