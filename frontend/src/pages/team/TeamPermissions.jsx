// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import SectionHeader from "../../components/ui/SectionHeader";
// import StatCard from "../../components/ui/StatCard";
// import { showErrorToast } from "../../components/ui/CustomToast";

// import MemberInvitationDrawer from "../../components/team/MemberInvitationDrawer";
// import TeamMemberTable from "../../components/team/TeamMemberTable";
// import TeamRoles from "../../components/team/TeamRoles";
// import TeamAuditLog from "../../components/team/TeamAuditLog";

// /* =========================================================
//    API
// ========================================================= */

// const API_BASE = (
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:5000/api/v1"
// ).replace(/\/$/, "");

// const TEAM_API = `${API_BASE}/team`;

// /* =========================================================
//    MAIN
// ========================================================= */

// export default function TeamPermissions() {
//   /* =========================================================
//      STATE
//   ========================================================= */

//   const [members, setMembers] = useState([]);

//   // Custom roles created in Roles section
//   const [customRoles, setCustomRoles] = useState([]);

//   const [isLoading, setIsLoading] = useState(true);

//   const [activeTab, setActiveTab] = useState("Members");

//   const [inviteOpen, setInviteOpen] = useState(false);

//   /* =========================================================
//      LOAD MEMBERS
//   ========================================================= */

//   const loadMembers = useCallback(async () => {
//     try {
//       setIsLoading(true);

//       const res = await fetch(TEAM_API, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       const text = await res.text();

//       let result = {};

//       try {
//         result = text ? JSON.parse(text) : {};
//       } catch {
//         throw new Error(
//           "Invalid server response. Please check the backend."
//         );
//       }

//       if (!res.ok || !result?.success) {
//         throw new Error(
//           result?.message ||
//             `Failed to load team members (${res.status})`
//         );
//       }

//       setMembers(
//         Array.isArray(result.data)
//           ? result.data
//           : []
//       );
//     } catch (error) {
//       console.error("Load members error:", error);

//       setMembers([]);

//       showErrorToast(
//         error?.message ||
//           "Failed to load team members"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   /* =========================================================
//      LOAD CUSTOM ROLES
//   ========================================================= */

//   const loadCustomRoles = useCallback(async () => {
//     try {
//       const res = await fetch(
//         `${TEAM_API}/roles`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const text = await res.text();

//       let result = {};

//       try {
//         result = text ? JSON.parse(text) : {};
//       } catch {
//         throw new Error(
//           "Invalid server response while loading roles."
//         );
//       }

//       if (!res.ok || !result?.success) {
//         throw new Error(
//           result?.message ||
//             "Failed to load custom roles"
//         );
//       }

//       setCustomRoles(
//         Array.isArray(result.data)
//           ? result.data
//           : []
//       );
//     } catch (error) {
//       console.error(
//         "Load custom roles error:",
//         error
//       );

//       // Don't crash the page if roles fail
//       setCustomRoles([]);
//     }
//   }, []);

//   /* =========================================================
//      INITIAL LOAD
//   ========================================================= */

//   useEffect(() => {
//     loadMembers();
//     loadCustomRoles();
//   }, [
//     loadMembers,
//     loadCustomRoles,
//   ]);

//   /* =========================================================
//      ROLE CREATED
//   ========================================================= */

//   const handleRoleCreated = useCallback(
//     (newRole) => {
//       if (!newRole) return;

//       setCustomRoles((currentRoles) => {
//         const exists = currentRoles.some(
//           (role) => role.id === newRole.id
//         );

//         if (exists) {
//           return currentRoles;
//         }

//         return [
//           ...currentRoles,
//           newRole,
//         ];
//       });
//     },
//     []
//   );

//   /* =========================================================
//      ROLE UPDATED
//   ========================================================= */

//   const handleRoleUpdated = useCallback(
//     (updatedRole) => {
//       if (!updatedRole) return;

//       setCustomRoles((currentRoles) =>
//         currentRoles.map((role) =>
//           role.id === updatedRole.id
//             ? updatedRole
//             : role
//         )
//       );
//     },
//     []
//   );

//   /* =========================================================
//      ROLE DELETED
//   ========================================================= */

//   const handleRoleDeleted = useCallback(
//     (roleId) => {
//       if (!roleId) return;

//       setCustomRoles((currentRoles) =>
//         currentRoles.filter(
//           (role) => role.id !== roleId
//         )
//       );
//     },
//     []
//   );

//   /* =========================================================
//      STATS
//   ========================================================= */

//   const activeMembers = useMemo(
//     () =>
//       members.filter(
//         (member) =>
//           String(
//             member.status
//           ).toLowerCase() === "active"
//       ).length,
//     [members]
//   );

//   const pendingMembers = useMemo(
//     () =>
//       members.filter(
//         (member) =>
//           String(
//             member.status
//           ).toLowerCase() === "pending"
//       ).length,
//     [members]
//   );

//   /*
//     Five predefined roles:

//     Owner
//     Admin
//     Manager
//     Analyst
//     Viewer

//     + custom roles
//   */

//   const totalRoles =
//     5 + customRoles.length;

//   /* =========================================================
//      MEMBER INVITED
//   ========================================================= */

//   const handleMemberInvited = async (
//     payload
//   ) => {
//     try {
//       const invitedMember =
//         payload?.data ||
//         payload?.member;

//       if (invitedMember?.id) {
//         setMembers((current) => {
//           const alreadyExists =
//             current.some(
//               (member) =>
//                 member.id ===
//                 invitedMember.id
//             );

//           if (alreadyExists) {
//             return current;
//           }

//           return [
//             invitedMember,
//             ...current,
//           ];
//         });
//       }

//       setInviteOpen(false);

//       await loadMembers();
//     } catch (error) {
//       console.error(
//         "Handle member invited error:",
//         error
//       );

//       showErrorToast(
//         error?.message ||
//           "Failed to refresh team members"
//       );
//     }
//   };

//   /* =========================================================
//      RENDER
//   ========================================================= */

//   return (
//     <main
//       className="
//         flex-1
//         pt-2
//         pb-12
//         max-w-[1600px]
//         mx-auto
//         w-full
//         scroll-host
//       "
//     >
//       <div
//         className="
//           page-in
//           w-full
//           min-w-0
//         "
//       >
//         {/* ===================================================
//             HEADER
//         =================================================== */}

//         <SectionHeader
//           title="Team & Permissions"
//           description="
//             Manage who has access to your AutoBillr
//             workspace and what they can do.
//           "
//           secondaryAction={{
//             label: "Audit log",
//             icon: "history",
//             variant: "secondary",
//             onClick: () =>
//               setActiveTab(
//                 "Audit log"
//               ),
//           }}
//           primaryAction={{
//             label: "Invite Member",
//             icon: "person_add",
//             onClick: () =>
//               setInviteOpen(true),
//           }}
//         />

//         {/* ===================================================
//             STAT CARDS
//         =================================================== */}

//         <div
//           className="
//             grid
//             grid-cols-2
//             lg:grid-cols-4
//             gap-4
//             mb-6
//             w-full
//           "
//         >
//           <StatCard
//             title="Team Members"
//             value={
//               isLoading
//                 ? "—"
//                 : members.length
//             }
//             sub={`${pendingMembers} pending invites`}
//             icon="group"
//             iconColor="text-primary"
//             variant="dashboard"
//           />

//           <StatCard
//             title="Active Sessions"
//             value={
//               isLoading
//                 ? "—"
//                 : activeMembers
//             }
//             badge="Live"
//             badgeColor="
//               bg-surface-secondary
//               text-text-muted
//             "
//             icon="online_prediction"
//             iconColor="text-info"
//             variant="dashboard"
//           />

//           <StatCard
//             title="Roles Configured"
//             value={totalRoles}
//             sub={
//               customRoles.length
//                 ? `${customRoles.length} custom role${
//                     customRoles.length ===
//                     1
//                       ? ""
//                       : "s"
//                   }`
//                 : "Default workspace roles"
//             }
//             icon="admin_panel_settings"
//             iconColor="text-warning"
//             variant="dashboard"
//           />

//           <StatCard
//             title="SSO Status"
//             value="Active"
//             badge="SAML 2.0"
//             badgeColor="
//               bg-surface-secondary
//               text-text-muted
//             "
//             icon="key"
//             iconColor="text-primary"
//             variant="dashboard"
//           />
//         </div>

//         {/* ===================================================
//             TABS
//         =================================================== */}

//         <div className="mb-5 overflow-x-auto">
//           <div
//             className="
//               inline-flex
//               p-1
//               bg-surface-secondary
//               rounded-lg
//               gap-1
//               min-w-max
//             "
//           >
//             {[
//               {
//                 label: "Members",
//                 count: members.length,
//               },
//               {
//                 label: "Roles",
//                 count: totalRoles,
//               },
//               {
//                 label: "Permissions",
//               },
//               {
//                 label: "Audit log",
//               },
//             ].map((tab) => {
//               const active =
//                 activeTab ===
//                 tab.label;

//               return (
//                 <button
//                   key={tab.label}
//                   type="button"
//                   onClick={() =>
//                     setActiveTab(
//                       tab.label
//                     )
//                   }
//                   className={`
//                     px-3.5
//                     py-1.5
//                     rounded-md
//                     text-[12.5px]
//                     font-semibold
//                     transition
//                     whitespace-nowrap
//                     ${
//                       active
//                         ? "bg-surface text-primary shadow-sm"
//                         : "text-text-muted hover:text-text-secondary"
//                     }
//                   `}
//                 >
//                   {tab.label}

//                   {tab.count !==
//                     undefined && (
//                     <span
//                       className={`
//                         ml-1.5
//                         text-[10px]
//                         tabular-nums
//                         px-1.5
//                         py-0.5
//                         rounded-full
//                         font-bold
//                         ${
//                           active
//                             ? "bg-primary-soft text-primary"
//                             : "bg-surface text-text-muted"
//                         }
//                       `}
//                     >
//                       {tab.count}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* ===================================================
//             MEMBERS
//         =================================================== */}

//         {activeTab ===
//           "Members" && (
//           <TeamMemberTable
//             members={members}
//             setMembers={setMembers}
//             customRoles={
//               customRoles
//             }
//           />
//         )}

//         {/* ===================================================
//             ROLES
//         =================================================== */}

//         {activeTab === "Roles" && (
//           <TeamRoles
//             members={members}
//             customRoles={
//               customRoles
//             }
//             setCustomRoles={
//               setCustomRoles
//             }
//             onRoleCreated={
//               handleRoleCreated
//             }
//             onRoleUpdated={
//               handleRoleUpdated
//             }
//             onRoleDeleted={
//               handleRoleDeleted
//             }
//           />
//         )}

//         {/* ===================================================
//             PERMISSIONS
//         =================================================== */}

//         {activeTab ===
//           "Permissions" && (
//           <div
//             className="
//               bg-surface
//               rounded-xl
//               shadow-sm
//               border border-border-light
//               p-6
//             "
//           >
//             <h2
//               className="
//                 text-lg
//                 font-bold
//                 text-text
//               "
//             >
//               Permissions
//             </h2>

//             <p
//               className="
//                 text-sm
//                 text-text-muted
//                 mt-1
//               "
//             >
//               Configure what each role
//               can access inside your
//               AutoBillr workspace.
//             </p>

//             <div
//               className="
//                 mt-6
//                 grid
//                 grid-cols-1
//                 md:grid-cols-2
//                 gap-4
//               "
//             >
//               {[
//                 "Manage invoices",
//                 "Manage clients",
//                 "Manage projects",
//                 "View analytics",
//                 "Manage billing",
//                 "Manage team members",
//                 "Edit workspace settings",
//                 "View audit logs",
//               ].map(
//                 (permission) => (
//                   <div
//                     key={permission}
//                     className="
//                       flex
//                       items-center
//                       justify-between
//                       p-4
//                       rounded-lg
//                       bg-surface-secondary
//                       border border-border-light
//                     "
//                   >
//                     <span
//                       className="
//                         text-sm
//                         font-medium
//                         text-text-secondary
//                       "
//                     >
//                       {permission}
//                     </span>

//                     <span
//                       className="
//                         material-symbols-outlined
//                         text-primary
//                       "
//                       style={{
//                         fontSize: 20,
//                       }}
//                     >
//                       check_circle
//                     </span>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         )}

//         {/* ===================================================
//             AUDIT LOG
//         =================================================== */}

//         {activeTab ===
//           "Audit log" && (
//           <TeamAuditLog />
//         )}
//       </div>

//       {/* =====================================================
//           INVITATION DRAWER
//       ===================================================== */}

//       <MemberInvitationDrawer
//         isOpen={inviteOpen}
//         onClose={() =>
//           setInviteOpen(false)
//         }
//         onInvited={
//           handleMemberInvited
//         }
//         roles={customRoles}
//       />
//     </main>
//   );
// }



















import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";

import {
  showErrorToast,
  showSuccessToast,
} from "../../components/ui/CustomToast";

import MemberInvitationDrawer from "../../components/team/MemberInvitationDrawer";
import TeamMemberTable from "../../components/team/TeamMemberTable";
import TeamRoles from "../../components/team/TeamRoles";
import TeamAuditLog from "../../components/team/TeamAuditLog";

/* =========================================================
   API
========================================================= */

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const TEAM_API = `${API_BASE}/team`;

/* =========================================================
   AUTH TOKEN
========================================================= */

const getAuthToken = () => {
  const plain = localStorage.getItem("token");

  if (plain && plain.startsWith("ey")) {
    return plain;
  }

  const auth = localStorage.getItem("autobiller-auth");

  if (!auth) {
    return null;
  }

  if (auth.startsWith("ey")) {
    return auth;
  }

  try {
    const parsed = JSON.parse(auth);

    return (
      parsed?.state?.token ||
      parsed?.token ||
      null
    );
  } catch {
    return null;
  }
};

/* =========================================================
   PERMISSION CATALOG
========================================================= */

const PERMISSION_GROUPS = [
  {
    title: "Invoices",
    items: [
      {
        key: "invoices:view",
        label: "View invoices",
      },
      {
        key: "invoices:create",
        label: "Create invoice",
      },
      {
        key: "invoices:edit",
        label: "Edit invoice",
      },
      {
        key: "invoices:delete",
        label: "Delete invoice",
      },
      {
        key: "invoices:send",
        label: "Send invoice",
      },
      {
        key: "invoices:remind",
        label: "Send reminder",
      },
      {
        key: "invoices:export",
        label: "Export invoices",
      },
    ],
  },

  {
    title: "Clients",
    items: [
      {
        key: "clients:view",
        label: "View clients",
      },
      {
        key: "clients:create",
        label: "Add client",
      },
      {
        key: "clients:edit",
        label: "Edit client",
      },
      {
        key: "clients:delete",
        label: "Delete client",
      },
    ],
  },

  {
    title: "Projects",
    items: [
      {
        key: "projects:view",
        label: "View projects",
      },
      {
        key: "projects:create",
        label: "Create project",
      },
      {
        key: "projects:edit",
        label: "Edit project",
      },
      {
        key: "projects:delete",
        label: "Delete project",
      },
      {
        key: "projects:milestones",
        label: "Manage milestones",
      },
    ],
  },

  {
    title: "Analytics & Automation",
    items: [
      {
        key: "analytics:view",
        label: "View analytics",
      },
      {
        key: "analytics:export",
        label: "Export analytics",
      },
      {
        key: "automation:view",
        label: "View automation",
      },
      {
        key: "automation:manage",
        label: "Manage automation",
      },
    ],
  },

  {
    title: "Team & Settings",
    items: [
      {
        key: "team:view",
        label: "View team",
      },
      {
        key: "team:invite",
        label: "Invite members",
      },
      {
        key: "team:edit_member",
        label: "Change member role",
      },
      {
        key: "team:remove_member",
        label: "Remove member",
      },
      {
        key: "roles:manage",
        label: "Manage roles & permissions",
      },
      {
        key: "settings:view",
        label: "View settings",
      },
      {
        key: "settings:business",
        label: "Edit business info",
      },
      {
        key: "settings:branding",
        label: "Edit branding",
      },
      {
        key: "dashboard:view",
        label: "View dashboard",
      },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap(
  (group) => group.items.map((item) => item.key)
);

/* =========================================================
   DEFAULT SYSTEM ROLE PERMISSIONS
========================================================= */

const SYSTEM_ROLE_DEFAULTS = {
  Owner: ALL_PERMISSION_KEYS,

  Admin: ALL_PERMISSION_KEYS,

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

const SYSTEM_ROLE_NAMES = Object.keys(
  SYSTEM_ROLE_DEFAULTS
);

/* =========================================================
   NORMALIZE ROLE
========================================================= */

const normalizeRole = (role) => {
  if (!role) {
    return null;
  }

  return {
    ...role,

    id: role.id || role._id || null,

    name: role.name || "",

    permissions: Array.isArray(role.permissions)
      ? [...new Set(role.permissions)]
      : [],
  };
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TeamPermissions() {
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================= */

  const [members, setMembers] = useState([]);

  const [customRoles, setCustomRoles] = useState([]);

  /*
   * Database roles returned by backend.
   *
   * This includes both system roles and custom roles
   * when the backend supports persisted system roles.
   */
  const [databaseRoles, setDatabaseRoles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] =
    useState("Members");

  const [inviteOpen, setInviteOpen] =
    useState(false);

  /* =========================================================
     PERMISSIONS TAB STATE
  ========================================================= */

  const [permMode, setPermMode] =
    useState("role");

  const [selectedRoleName, setSelectedRoleName] =
    useState("Manager");

  const [selectedMemberId, setSelectedMemberId] =
    useState("");

  const [editingPermissions, setEditingPermissions] =
    useState([]);

  const [savingPerms, setSavingPerms] =
    useState(false);

  /* =========================================================
     LOAD MEMBERS
  ========================================================= */

  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = getAuthToken();

      if (!token) {
        showErrorToast(
          "Session expired. Please login again."
        );

        navigate("/login");

        return;
      }

      const res = await fetch(TEAM_API, {
        method: "GET",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();

      let result = {};

      try {
        result = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Invalid server response. Please check the backend."
        );
      }

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.message ||
            `Failed to load team members (${res.status})`
        );
      }

      setMembers(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "Load members error:",
        error
      );

      setMembers([]);

      showErrorToast(
        error?.message ||
          "Failed to load team members"
      );
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /* =========================================================
     LOAD ROLES
  ========================================================= */

  const loadCustomRoles = useCallback(async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        return;
      }

      const res = await fetch(
        `${TEAM_API}/roles`,
        {
          method: "GET",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text = await res.text();

      let result = {};

      try {
        result = text
          ? JSON.parse(text)
          : {};
      } catch {
        setCustomRoles([]);
        setDatabaseRoles([]);

        return;
      }

      if (!res.ok || !result?.success) {
        setCustomRoles([]);
        setDatabaseRoles([]);

        return;
      }

      const roles = Array.isArray(result.data)
        ? result.data.map(normalizeRole)
        : [];

      /*
       * Store every database role.
       */
      setDatabaseRoles(roles);

      /*
       * Custom roles are roles that are not
       * one of the five system role names.
       */
      const custom = roles.filter(
        (role) =>
          !SYSTEM_ROLE_NAMES.includes(
            role.name
          )
      );

      setCustomRoles(custom);
    } catch (error) {
      console.error(
        "Load roles error:",
        error
      );

      setCustomRoles([]);

      setDatabaseRoles([]);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadMembers();
    loadCustomRoles();
  }, [
    loadMembers,
    loadCustomRoles,
  ]);

  /* =========================================================
     ROLE CALLBACKS
  ========================================================= */

  const handleRoleCreated = useCallback(
    (newRole) => {
      if (!newRole) {
        return;
      }

      const normalized =
        normalizeRole(newRole);

      setCustomRoles((current) => {
        if (
          current.some(
            (role) =>
              String(role.id) ===
              String(normalized.id)
          )
        ) {
          return current;
        }

        return [
          ...current,
          normalized,
        ];
      });

      setDatabaseRoles((current) => {
        if (
          current.some(
            (role) =>
              String(role.id) ===
              String(normalized.id)
          )
        ) {
          return current;
        }

        return [
          ...current,
          normalized,
        ];
      });
    },
    []
  );

  const handleRoleUpdated = useCallback(
    (updatedRole) => {
      if (!updatedRole) {
        return;
      }

      const normalized =
        normalizeRole(updatedRole);

      setCustomRoles((current) =>
        current.map((role) =>
          String(role.id) ===
          String(normalized.id)
            ? normalized
            : role
        )
      );

      setDatabaseRoles((current) =>
        current.map((role) =>
          String(role.id) ===
          String(normalized.id)
            ? normalized
            : role
        )
      );
    },
    []
  );

  const handleRoleDeleted = useCallback(
    (roleId) => {
      if (!roleId) {
        return;
      }

      setCustomRoles((current) =>
        current.filter(
          (role) =>
            String(role.id) !==
            String(roleId)
        )
      );

      setDatabaseRoles((current) =>
        current.filter(
          (role) =>
            String(role.id) !==
            String(roleId)
        )
      );
    },
    []
  );

  /* =========================================================
     MEMBER INVITED
  ========================================================= */

  const handleMemberInvited =
    async (payload) => {
      try {
        const invitedMember =
          payload?.data ||
          payload?.member;

        if (invitedMember?.id) {
          setMembers((current) => {
            if (
              current.some(
                (member) =>
                  String(member.id) ===
                  String(invitedMember.id)
              )
            ) {
              return current;
            }

            return [
              invitedMember,
              ...current,
            ];
          });
        }

        setInviteOpen(false);

        await loadMembers();
      } catch (error) {
        showErrorToast(
          error?.message ||
            "Failed to refresh team members"
        );
      }
    };

  /* =========================================================
     STATS
  ========================================================= */

  const activeMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          String(member.status)
            .toLowerCase() ===
          "active"
      ).length,
    [members]
  );

  const pendingMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          String(member.status)
            .toLowerCase() ===
          "pending"
      ).length,
    [members]
  );

  const totalRoles = useMemo(
    () =>
      SYSTEM_ROLE_NAMES.length +
      customRoles.length,
    [customRoles.length]
  );

  /* =========================================================
     ALL ROLE OPTIONS
  ========================================================= */

  const allRoleOptions = useMemo(() => {
    /*
     * Create system roles from defaults.
     */
    const systemRoles =
      SYSTEM_ROLE_NAMES.map(
        (name) => {
          /*
           * Try to find the actual database
           * role returned by the backend.
           */
          const databaseRole =
            databaseRoles.find(
              (role) =>
                String(role.name)
                  .toLowerCase() ===
                String(name)
                  .toLowerCase()
            );

          return {
            id:
              databaseRole?.id ||
              null,

            name,

            isSystem: true,

            permissions:
              Array.isArray(
                databaseRole?.permissions
              ) &&
              databaseRole.permissions
                .length > 0
                ? databaseRole.permissions
                : SYSTEM_ROLE_DEFAULTS[
                    name
                  ],
          };
        }
      );

    /*
     * Add custom roles.
     */
    const custom =
      customRoles.map((role) => ({
        id: role.id,

        name: role.name,

        isSystem: false,

        permissions:
          Array.isArray(
            role.permissions
          )
            ? role.permissions
            : [],
      }));

    return [
      ...systemRoles,
      ...custom,
    ];
  }, [
    databaseRoles,
    customRoles,
  ]);

  /* =========================================================
     SELECTED MEMBER
  ========================================================= */

  const selectedMember = useMemo(
    () =>
      members.find(
        (member) =>
          String(member.id) ===
          String(selectedMemberId)
      ),
    [
      members,
      selectedMemberId,
    ]
  );

  /* =========================================================
     SELECTED ROLE
  ========================================================= */

  const selectedRoleMeta = useMemo(
    () =>
      allRoleOptions.find(
        (role) =>
          String(role.name) ===
          String(selectedRoleName)
      ),
    [
      allRoleOptions,
      selectedRoleName,
    ]
  );

  /* =========================================================
     LOAD EDITING PERMISSIONS
  ========================================================= */

  useEffect(() => {
    /*
     * ROLE MODE
     */
    if (permMode === "role") {
      const role =
        allRoleOptions.find(
          (item) =>
            item.name ===
            selectedRoleName
        );

      const permissions =
        role?.permissions ||
        SYSTEM_ROLE_DEFAULTS[
          selectedRoleName
        ] ||
        [];

      setEditingPermissions([
        ...new Set(permissions),
      ]);

      return;
    }

    /*
     * MEMBER MODE
     */
    if (!selectedMember) {
      setEditingPermissions([]);

      return;
    }

    const roleName =
      selectedMember.role ||
      "Viewer";

    const role =
      allRoleOptions.find(
        (item) =>
          String(item.name)
            .toLowerCase() ===
          String(roleName)
            .toLowerCase()
      );

    const basePermissions =
      role?.permissions ||
      SYSTEM_ROLE_DEFAULTS[
        roleName
      ] ||
      [];

    const extraPermissions =
      Array.isArray(
        selectedMember.extraPermissions
      )
        ? selectedMember.extraPermissions
        : [];

    /*
     * Member sees role permissions +
     * member-specific permissions.
     */
    setEditingPermissions([
      ...new Set([
        ...basePermissions,
        ...extraPermissions,
      ]),
    ]);
  }, [
    permMode,
    selectedRoleName,
    selectedMemberId,
    allRoleOptions,
    selectedMember,
  ]);

  /* =========================================================
     PERMISSION TOGGLE
  ========================================================= */

  const togglePermission = (
    permissionKey
  ) => {
    setEditingPermissions(
      (previous) => {
        if (
          previous.includes(
            permissionKey
          )
        ) {
          return previous.filter(
            (permission) =>
              permission !==
              permissionKey
          );
        }

        return [
          ...previous,
          permissionKey,
        ];
      }
    );
  };

  /* =========================================================
     SELECT ALL GROUP
  ========================================================= */

  const selectAllInGroup = (
    group
  ) => {
    const keys =
      group.items.map(
        (item) => item.key
      );

    setEditingPermissions(
      (previous) => [
        ...new Set([
          ...previous,
          ...keys,
        ]),
      ]
    );
  };

  /* =========================================================
     CLEAR GROUP
  ========================================================= */

  const clearGroup = (group) => {
    const keys = new Set(
      group.items.map(
        (item) => item.key
      )
    );

    setEditingPermissions(
      (previous) =>
        previous.filter(
          (permission) =>
            !keys.has(permission)
        )
    );
  };

  /* =========================================================
     EDIT PERMISSION CHECKBOXES
  ========================================================= */

  /*
   * IMPORTANT:
   *
   * System roles are now editable.
   *
   * Previously this was:
   *
   * !isSystemRoleSelected
   *
   * which disabled Manager/Admin/etc.
   */
  const canEditCheckboxes =
    permMode === "role"
      ? Boolean(selectedRoleMeta)
      : Boolean(selectedMemberId);

  /* =========================================================
     SAVE ROLE PERMISSIONS
  ========================================================= */

  const saveRolePermissions =
    async () => {
      if (!selectedRoleMeta) {
        showErrorToast(
          "Please select a role."
        );

        return;
      }

      /*
       * System and custom roles both need
       * a database ID to be persisted.
       */
      if (!selectedRoleMeta.id) {
        showErrorToast(
          `${selectedRoleMeta.name} does not have a database role ID. Make sure /team/roles returns the role ID.`
        );

        return;
      }

      const token =
        getAuthToken();

      if (!token) {
        showErrorToast(
          "Session expired. Please login again."
        );

        navigate("/login");

        return;
      }

      try {
        setSavingPerms(true);

        const res =
          await fetch(
            `${TEAM_API}/roles/${selectedRoleMeta.id}`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                permissions:
                  editingPermissions,
              }),
            }
          );

        const data =
          await res
            .json()
            .catch(
              () => ({})
            );

        if (
          !res.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.message ||
              "Failed to save role permissions"
          );
        }

        const updatedRole =
          normalizeRole(
            data?.data || {
              ...selectedRoleMeta,

              permissions:
                editingPermissions,
            }
          );

        /*
         * Update database roles.
         */
        setDatabaseRoles(
          (previous) =>
            previous.map(
              (role) =>
                String(role.id) ===
                String(
                  selectedRoleMeta.id
                )
                  ? {
                      ...role,

                      permissions:
                        editingPermissions,
                    }
                  : role
            )
        );

        /*
         * Update custom roles if
         * this is a custom role.
         */
        if (
          !selectedRoleMeta.isSystem
        ) {
          setCustomRoles(
            (previous) =>
              previous.map(
                (role) =>
                  String(role.id) ===
                  String(
                    selectedRoleMeta.id
                  )
                    ? {
                        ...role,

                        permissions:
                          editingPermissions,
                      }
                    : role
              )
          );
        }

        /*
         * Make sure selected role's
         * current state is reflected.
         */
        if (
          updatedRole?.permissions
        ) {
          setEditingPermissions([
            ...new Set(
              updatedRole.permissions
            ),
          ]);
        }

        showSuccessToast(
          "Permissions saved",
          `${selectedRoleName} permissions updated successfully.`
        );
      } catch (error) {
        console.error(
          "Save role permissions error:",
          error
        );

        showErrorToast(
          error?.message ||
            "Failed to save role permissions"
        );
      } finally {
        setSavingPerms(false);
      }
    };

  /* =========================================================
     SAVE MEMBER EXTRA PERMISSIONS
  ========================================================= */

  const saveMemberExtraPermissions =
    async () => {
      if (!selectedMember?.id) {
        showErrorToast(
          "Please select a member first."
        );

        return;
      }

      const roleName =
        selectedMember.role ||
        "Viewer";

      const role =
        allRoleOptions.find(
          (item) =>
            String(item.name)
              .toLowerCase() ===
            String(roleName)
              .toLowerCase()
        );

      const basePermissions =
        role?.permissions ||
        SYSTEM_ROLE_DEFAULTS[
          roleName
        ] ||
        [];

      const baseSet = new Set(
        basePermissions
      );

      /*
       * Store only permissions that are
       * additional to the member's role.
       */
      const extraPermissions =
        editingPermissions.filter(
          (permission) =>
            !baseSet.has(
              permission
            )
        );

      const token =
        getAuthToken();

      if (!token) {
        showErrorToast(
          "Session expired. Please login again."
        );

        navigate("/login");

        return;
      }

      try {
        setSavingPerms(true);

        const res =
          await fetch(
            `${TEAM_API}/${selectedMember.id}/permissions`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                extraPermissions,
              }),
            }
          );

        const data =
          await res
            .json()
            .catch(
              () => ({})
            );

        if (
          !res.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.message ||
              "Failed to save member permissions"
          );
        }

        setMembers(
          (previous) =>
            previous.map(
              (member) =>
                String(member.id) ===
                String(
                  selectedMember.id
                )
                  ? {
                      ...member,

                      extraPermissions,
                    }
                  : member
            )
        );

        showSuccessToast(
          "Permissions saved",
          `Extra access updated for ${
            selectedMember.name ||
            selectedMember.email ||
            "member"
          }.`
        );
      } catch (error) {
        console.error(
          "Save member permissions error:",
          error
        );

        showErrorToast(
          error?.message ||
            "Failed to save member permissions"
        );
      } finally {
        setSavingPerms(false);
      }
    };

  /* =========================================================
     SAVE HANDLER
  ========================================================= */

  const handleSavePermissions =
    () => {
      if (permMode === "role") {
        saveRolePermissions();

        return;
      }

      saveMemberExtraPermissions();
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in w-full min-w-0">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <SectionHeader
          title="Team & Permissions"
          description="Manage who has access to your AutoBillr workspace and what they can do."
          secondaryAction={{
            label: "Audit log",
            icon: "history",
            variant: "secondary",
            onClick: () =>
              setActiveTab(
                "Audit log"
              ),
          }}
          primaryAction={{
            label: "Invite Member",
            icon: "person_add",
            onClick: () =>
              setInviteOpen(true),
          }}
        />

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">

          <StatCard
            title="Team Members"
            value={
              isLoading
                ? "—"
                : members.length
            }
            sub={`${pendingMembers} pending invites`}
            icon="group"
            iconColor="text-primary"
            variant="dashboard"
          />

          <StatCard
            title="Active Sessions"
            value={
              isLoading
                ? "—"
                : activeMembers
            }
            badge="Live"
            badgeColor="bg-surface-secondary text-text-muted"
            icon="online_prediction"
            iconColor="text-info"
            variant="dashboard"
          />

          <StatCard
            title="Roles Configured"
            value={totalRoles}
            sub={
              customRoles.length
                ? `${customRoles.length} custom role${
                    customRoles.length ===
                    1
                      ? ""
                      : "s"
                  }`
                : "Default workspace roles"
            }
            icon="admin_panel_settings"
            iconColor="text-warning"
            variant="dashboard"
          />

          <StatCard
            title="SSO Status"
            value="Active"
            badge="SAML 2.0"
            badgeColor="bg-surface-secondary text-text-muted"
            icon="key"
            iconColor="text-primary"
            variant="dashboard"
          />

        </div>

        {/* =====================================================
            TABS
        ===================================================== */}

        <div className="mb-5 overflow-x-auto">
          <div className="inline-flex p-1 bg-surface-secondary rounded-lg gap-1 min-w-max">

            {[
              {
                label: "Members",
                count:
                  members.length,
              },
              {
                label: "Roles",
                count:
                  totalRoles,
              },
              {
                label:
                  "Permissions",
              },
              {
                label:
                  "Audit log",
              },
            ].map((tab) => {
              const active =
                activeTab ===
                tab.label;

              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.label
                    )
                  }
                  className={`
                    px-3.5 py-1.5 rounded-md
                    text-[12.5px] font-semibold
                    transition whitespace-nowrap
                    ${
                      active
                        ? "bg-surface text-primary shadow-sm"
                        : "text-text-muted hover:text-text-secondary"
                    }
                  `}
                >
                  {tab.label}

                  {tab.count !==
                    undefined && (
                    <span
                      className={`
                        ml-1.5 text-[10px]
                        tabular-nums px-1.5
                        py-0.5 rounded-full
                        font-bold
                        ${
                          active
                            ? "bg-primary-soft text-primary"
                            : "bg-surface text-text-muted"
                        }
                      `}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}

          </div>
        </div>

        {/* =====================================================
            MEMBERS
        ===================================================== */}

        {activeTab ===
          "Members" && (
          <TeamMemberTable
            members={members}
            setMembers={
              setMembers
            }
            customRoles={
              customRoles
            }
          />
        )}

        {/* =====================================================
            ROLES
        ===================================================== */}

        {activeTab ===
          "Roles" && (
          <TeamRoles
            members={members}
            customRoles={
              customRoles
            }
            setCustomRoles={
              setCustomRoles
            }
            onRoleCreated={
              handleRoleCreated
            }
            onRoleUpdated={
              handleRoleUpdated
            }
            onRoleDeleted={
              handleRoleDeleted
            }
          />
        )}

        {/* =====================================================
            PERMISSIONS
        ===================================================== */}

        {activeTab ===
          "Permissions" && (
          <div className="bg-surface rounded-xl shadow-sm border border-border-light overflow-hidden">

            {/* HEADER */}

            <div className="p-6 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">

              <div>
                <h2 className="text-lg font-bold text-text">
                  Permissions
                </h2>

                <p className="text-sm text-text-muted mt-1">
                  Assign access by role,
                  or grant extra
                  permissions to one
                  member.
                </p>
              </div>

              <div className="inline-flex p-1 bg-surface-secondary rounded-lg">

                <button
                  type="button"
                  onClick={() =>
                    setPermMode(
                      "role"
                    )
                  }
                  className={`
                    px-3.5 py-1.5
                    rounded-md text-xs
                    font-semibold
                    transition
                    ${
                      permMode ===
                      "role"
                        ? "bg-surface text-primary shadow-sm"
                        : "text-text-muted"
                    }
                  `}
                >
                  By role
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPermMode(
                      "member"
                    )
                  }
                  className={`
                    px-3.5 py-1.5
                    rounded-md text-xs
                    font-semibold
                    transition
                    ${
                      permMode ===
                      "member"
                        ? "bg-surface text-primary shadow-sm"
                        : "text-text-muted"
                    }
                  `}
                >
                  By member
                </button>

              </div>
            </div>

            {/* CONTENT */}

            <div className="p-6 space-y-6">

              {/* =================================================
                  SELECTOR
              ================================================= */}

              {permMode ===
              "role" ? (
                <div>

                  <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                    Select role
                  </label>

                  <select
                    value={
                      selectedRoleName
                    }
                    onChange={(event) =>
                      setSelectedRoleName(
                        event.target
                          .value
                      )
                    }
                    className="w-full max-w-sm h-11 px-3 rounded-lg border border-border bg-surface text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >

                    {allRoleOptions.map(
                      (role) => (
                        <option
                          key={
                            role.id ||
                            role.name
                          }
                          value={
                            role.name
                          }
                        >
                          {role.name}{" "}
                          {role.isSystem
                            ? "(system)"
                            : "(custom)"}
                        </option>
                      )
                    )}

                  </select>

                  {selectedRoleMeta && (
                    <p className="text-xs text-text-muted mt-2">

                      {selectedRoleMeta.isSystem
                        ? "This is a default workspace role. Its permissions can be customized."
                        : "This is a custom role. Configure the permissions that members with this role should receive."}

                    </p>
                  )}

                  {!selectedRoleMeta?.id &&
                    selectedRoleMeta && (
                      <p className="text-xs text-warning mt-2">
                        This role is not
                        persisted in the
                        database yet.
                        The backend must
                        return its role ID
                        from
                        /team/roles before
                        it can be saved.
                      </p>
                    )}

                </div>
              ) : (
                <div>

                  <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                    Select member
                  </label>

                  <select
                    value={
                      selectedMemberId
                    }
                    onChange={(event) =>
                      setSelectedMemberId(
                        event.target
                          .value
                      )
                    }
                    className="w-full max-w-sm h-11 px-3 rounded-lg border border-border bg-surface text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >

                    <option value="">
                      Choose a member…
                    </option>

                    {members.map(
                      (member) => (
                        <option
                          key={
                            member.id
                          }
                          value={
                            member.id
                          }
                        >
                          {member.name ||
                            member.email ||
                            "Unnamed"}{" "}
                          ·{" "}
                          {member.role ||
                            "Viewer"}
                        </option>
                      )
                    )}

                  </select>

                  {selectedMember && (
                    <p className="text-xs text-text-muted mt-2">

                      Base access comes
                      from role{" "}

                      <strong className="text-text">
                        {selectedMember.role ||
                          "Viewer"}
                      </strong>

                      . Extra checked
                      items below are
                      additional
                      permissions for
                      this person only.

                    </p>
                  )}

                </div>
              )}

              {/* =================================================
                  PERMISSION GROUPS
              ================================================= */}

              <div className="space-y-5">

                {PERMISSION_GROUPS.map(
                  (group) => (
                    <div
                      key={
                        group.title
                      }
                      className="rounded-xl border border-border-light p-4"
                    >

                      {/* GROUP HEADER */}

                      <div className="flex items-center justify-between mb-3">

                        <h3 className="text-sm font-bold text-text">
                          {
                            group.title
                          }
                        </h3>

                        {canEditCheckboxes && (
                          <div className="flex gap-3">

                            <button
                              type="button"
                              onClick={() =>
                                selectAllInGroup(
                                  group
                                )
                              }
                              className="text-[11px] font-semibold text-primary hover:underline"
                            >
                              Select all
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                clearGroup(
                                  group
                                )
                              }
                              className="text-[11px] font-semibold text-text-muted hover:underline"
                            >
                              Clear
                            </button>

                          </div>
                        )}

                      </div>

                      {/* PERMISSIONS */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">

                        {group.items.map(
                          (item) => {
                            const checked =
                              editingPermissions.includes(
                                item.key
                              );

                            return (
                              <label
                                key={
                                  item.key
                                }
                                className={`
                                  flex items-center
                                  gap-2.5 rounded-lg
                                  border px-3 py-2.5
                                  text-sm transition
                                  ${
                                    checked
                                      ? "border-primary/30 bg-primary-soft text-primary-dark"
                                      : "border-border bg-surface text-text-secondary"
                                  }
                                  ${
                                    canEditCheckboxes
                                      ? "cursor-pointer hover:border-border-dark"
                                      : "opacity-60 cursor-not-allowed"
                                  }
                                `}
                              >

                                <input
                                  type="checkbox"
                                  checked={
                                    checked
                                  }
                                  disabled={
                                    !canEditCheckboxes
                                  }
                                  onChange={() =>
                                    togglePermission(
                                      item.key
                                    )
                                  }
                                  className="accent-primary shrink-0"
                                />

                                <span>
                                  {
                                    item.label
                                  }
                                </span>

                              </label>
                            );
                          }
                        )}

                      </div>

                    </div>
                  )
                )}

              </div>

              {/* =================================================
                  SAVE
              ================================================= */}

              <div className="flex justify-end gap-3 pt-4 border-t border-border-light">

                <button
                  type="button"
                  disabled={
                    savingPerms ||
                    (permMode ===
                      "role" &&
                      (!selectedRoleMeta ||
                        !selectedRoleMeta.id)) ||
                    (permMode ===
                      "member" &&
                      !selectedMemberId)
                  }
                  onClick={
                    handleSavePermissions
                  }
                  className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingPerms
                    ? "Saving…"
                    : "Save permissions"}
                </button>

              </div>

            </div>
          </div>
        )}

        {/* =====================================================
            AUDIT LOG
        ===================================================== */}

        {activeTab ===
          "Audit log" && (
          <TeamAuditLog />
        )}

      </div>

      {/* =======================================================
          INVITATION DRAWER
      ======================================================= */}

      <MemberInvitationDrawer
        isOpen={inviteOpen}
        onClose={() =>
          setInviteOpen(false)
        }
        onInvited={
          handleMemberInvited
        }
        roles={customRoles}
      />

    </main>
  );
}

