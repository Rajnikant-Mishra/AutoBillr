// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { useNavigate } from "react-router-dom";

// import SectionHeader from "../../components/ui/SectionHeader";
// import StatCard from "../../components/ui/StatCard";
// import MemberInvitationDrawer from "../../components/team/MemberInvitationDrawer";
// import PermissionCheckbox from "../../components/team/PermissionCheckbox";
// import TeamAuditLog from "../../components/team/TeamAuditLog";
// import TeamMemberTable from "../../components/team/TeamMemberTable";
// import TeamRoles from "../../components/team/TeamRoles";

// import { showError, showSuccess } from "../../utils/toast";

// const API_BASE = (
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:5000/api/v1"
// ).replace(/\/$/, "");

// const TEAM_API = `${API_BASE}/team`;

// const getToken = () =>
//   localStorage.getItem("autobiller-auth") ||
//   localStorage.getItem("token") ||
//   "";

// const PERMISSION_GROUPS = [
//   {
//     key: "dashboard",
//     label: "Dashboard",
//     items: [
//       {
//         key: "dashboard:view",
//         label: "View dashboard",
//       },
//     ],
//   },

//   {
//     key: "invoices",
//     label: "Invoices",
//     items: [
//       {
//         key: "invoices:view",
//         label: "View invoices",
//       },
//       {
//         key: "invoices:create",
//         label: "Create invoices",
//       },
//       {
//         key: "invoices:edit",
//         label: "Edit invoices",
//       },
//       {
//         key: "invoices:delete",
//         label: "Delete invoices",
//       },
//       {
//         key: "invoices:send",
//         label: "Send invoices",
//       },
//       {
//         key: "invoices:remind",
//         label: "Send reminders",
//       },
//       {
//         key: "invoices:export",
//         label: "Export invoices",
//       },
//     ],
//   },

//   {
//     key: "clients",
//     label: "Clients",
//     items: [
//       {
//         key: "clients:view",
//         label: "View clients",
//       },
//       {
//         key: "clients:create",
//         label: "Create clients",
//       },
//       {
//         key: "clients:edit",
//         label: "Edit clients",
//       },
//       {
//         key: "clients:delete",
//         label: "Delete clients",
//       },
//     ],
//   },

//   {
//     key: "projects",
//     label: "Projects",
//     items: [
//       {
//         key: "projects:view",
//         label: "View projects",
//       },
//       {
//         key: "projects:create",
//         label: "Create projects",
//       },
//       {
//         key: "projects:edit",
//         label: "Edit projects",
//       },
//       {
//         key: "projects:delete",
//         label: "Delete projects",
//       },
//       {
//         key: "projects:milestones",
//         label: "Manage milestones",
//       },
//     ],
//   },

//   {
//     key: "analyticsAutomation",
//     label: "Analytics & Automation",
//     items: [
//       {
//         key: "analytics:view",
//         label: "View analytics",
//       },
//       {
//         key: "analytics:export",
//         label: "Export analytics",
//       },
//       {
//         key: "automation:view",
//         label: "View automation",
//       },
//       {
//         key: "automation:manage",
//         label: "Manage automation",
//       },
//     ],
//   },

//   {
//     key: "team",
//     label: "Team",
//     items: [
//       {
//         key: "team:view",
//         label: "View team",
//       },
//       {
//         key: "team:invite",
//         label: "Invite members",
//       },
//       {
//         key: "team:edit_member",
//         label: "Edit members",
//       },
//       {
//         key: "team:remove_member",
//         label: "Remove members",
//       },
//       {
//         key: "roles:manage",
//         label: "Manage roles",
//       },
//     ],
//   },

//   {
//     key: "settings",
//     label: "Settings",
//     items: [
//       {
//         key: "settings:view",
//         label: "View settings",
//       },
//       {
//         key: "settings:business",
//         label: "Manage business settings",
//       },
//       {
//         key: "settings:branding",
//         label: "Manage branding",
//       },
//       {
//         key: "settings:tax",
//         label: "Manage tax settings",
//       },
//       {
//         key: "settings:payments",
//         label: "Manage payment settings",
//       },
//       {
//         key: "settings:integrations",
//         label: "Manage integrations",
//       },
//       {
//         key: "settings:api",
//         label: "Manage API settings",
//       },
//     ],
//   },

//   {
//     key: "billing",
//     label: "Billing",
//     items: [
//       {
//         key: "billing:view",
//         label: "View billing",
//       },
//     ],
//   },

//   {
//     key: "clientPortal",
//     label: "Client Portal",
//     items: [
//       {
//         key: "clientportal:view",
//         label: "View client portal",
//       },
//     ],
//   },

//   {
//     key: "pricing",
//     label: "Pricing",
//     items: [
//       {
//         key: "pricing:view",
//         label: "View pricing",
//       },
//     ],
//   },
// ];

// const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((group) =>
//   group.items.map((item) => item.key)
// );

// const SYSTEM_ROLE_DEFAULTS = {
//   Owner: ALL_PERMISSION_KEYS,

//   Admin: ALL_PERMISSION_KEYS,

//   Manager: [
//     "dashboard:view",

//     "invoices:view",
//     "invoices:create",
//     "invoices:edit",
//     "invoices:send",
//     "invoices:remind",

//     "clients:view",
//     "clients:create",
//     "clients:edit",

//     "projects:view",
//     "projects:create",
//     "projects:edit",
//     "projects:milestones",

//     "analytics:view",
//     "automation:view",

//     "team:view",
//   ],

//   Analyst: [
//     "dashboard:view",

//     "invoices:view",

//     "clients:view",

//     "projects:view",

//     "analytics:view",
//     "analytics:export",

//     "team:view",
//   ],

//   Viewer: [
//     "dashboard:view",

//     "invoices:view",

//     "clients:view",

//     "projects:view",

//     "team:view",
//   ],
// };

// const normalizePermissions = (permissions) => {
//   if (!Array.isArray(permissions)) {
//     return [];
//   }

//   return [...new Set(permissions.filter(Boolean))].filter((permission) =>
//     ALL_PERMISSION_KEYS.includes(permission)
//   );
// };

// const getResponseMessage = async (response) => {
//   try {
//     const data = await response.json();

//     return (
//       data?.message ||
//       data?.error ||
//       data?.details ||
//       `Request failed with status ${response.status}`
//     );
//   } catch {
//     return `Request failed with status ${response.status}`;
//   }
// };

// const apiRequest = async (url, options = {}) => {
//   const token = getToken();

//   const headers = {
//     "Content-Type": "application/json",
//     ...(options.headers || {}),
//   };

//   if (token) {
//     headers.Authorization = `Bearer ${token}`;
//   }

//   let response;

//   try {
//     response = await fetch(url, {
//       ...options,
//       headers,
//     });
//   } catch (error) {
//     const networkError = new Error(
//       "Unable to connect to the server. Please check your API URL, backend server, CORS configuration, and network connection."
//     );

//     networkError.cause = error;
//     throw networkError;
//   }

//   if (!response.ok) {
//     const message = await getResponseMessage(response);

//     const error = new Error(message);
//     error.status = response.status;

//     throw error;
//   }

//   if (response.status === 204) {
//     return null;
//   }

//   return response.json();
// };

// export default function TeamPermissions() {
//   const navigate = useNavigate();

//   const [databaseRoles, setDatabaseRoles] = useState([]);
//   const [customRoles, setCustomRoles] = useState([]);
//   const [members, setMembers] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [permissionMode, setPermissionMode] = useState("role");

//   const [selectedRoleId, setSelectedRoleId] = useState("");
//   const [selectedMemberId, setSelectedMemberId] = useState("");

//   const [editingPermissions, setEditingPermissions] = useState([]);
//   const [permissionsDirty, setPermissionsDirty] = useState(false);

//   const [inviteOpen, setInviteOpen] = useState(false);

//   const selectedRoleMeta = useMemo(() => {
//     if (!selectedRoleId) {
//       return null;
//     }

//     return (
//       databaseRoles.find((role) => role.id === selectedRoleId) ||
//       customRoles.find((role) => role.id === selectedRoleId) ||
//       null
//     );
//   }, [selectedRoleId, databaseRoles, customRoles]);

//   const selectedMember = useMemo(() => {
//     if (!selectedMemberId) {
//       return null;
//     }

//     return (
//       members.find(
//         (member) =>
//           member.id === selectedMemberId ||
//           member.userId === selectedMemberId
//       ) || null
//     );
//   }, [selectedMemberId, members]);

//   const allRoleOptions = useMemo(() => {
//     const systemRoleNames = [
//       "Owner",
//       "Admin",
//       "Manager",
//       "Analyst",
//       "Viewer",
//     ];

//     const systemRoles = systemRoleNames.map((name) => {
//       const dbRole = databaseRoles.find(
//         (role) =>
//           String(role.name || "").toLowerCase() === name.toLowerCase()
//       );

//       return {
//         id: dbRole?.id || `system-${name.toLowerCase()}`,
//         name,
//         description:
//           dbRole?.description ||
//           `${name} system role`,
//         permissions: Array.isArray(dbRole?.permissions)
//           ? normalizePermissions(dbRole.permissions)
//           : normalizePermissions(SYSTEM_ROLE_DEFAULTS[name]),
//         isSystem: true,
//         dbRole,
//       };
//     });

//     const custom = customRoles
//       .filter(
//         (role) =>
//           !systemRoleNames.some(
//             (name) =>
//               String(role.name || "").toLowerCase() ===
//               name.toLowerCase()
//           )
//       )
//       .map((role) => ({
//         ...role,
//         permissions: normalizePermissions(role.permissions),
//         isSystem: false,
//       }));

//     return [...systemRoles, ...custom];
//   }, [databaseRoles, customRoles]);

//   const fetchTeamData = useCallback(async () => {
//     setLoading(true);

//     try {
//       const data = await apiRequest(TEAM_API);

//       const roles = Array.isArray(data?.roles)
//         ? data.roles
//         : Array.isArray(data?.data?.roles)
//         ? data.data.roles
//         : [];

//       const teamMembers = Array.isArray(data?.members)
//         ? data.members
//         : Array.isArray(data?.teamMembers)
//         ? data.teamMembers
//         : Array.isArray(data?.data?.members)
//         ? data.data.members
//         : [];

//       const systemRoleNames = [
//         "Owner",
//         "Admin",
//         "Manager",
//         "Analyst",
//         "Viewer",
//       ];

//       const normalizedRoles = roles.map((role) => ({
//         ...role,
//         permissions: normalizePermissions(role.permissions),
//       }));

//       setDatabaseRoles(
//         normalizedRoles.filter((role) =>
//           systemRoleNames.some(
//             (name) =>
//               String(role.name || "").toLowerCase() ===
//               name.toLowerCase()
//           )
//         )
//       );

//       setCustomRoles(
//         normalizedRoles.filter(
//           (role) =>
//             !systemRoleNames.some(
//               (name) =>
//                 String(role.name || "").toLowerCase() ===
//                 name.toLowerCase()
//             )
//         )
//       );

//       setMembers(teamMembers);

//       if (!selectedRoleId && normalizedRoles.length > 0) {
//         const owner = normalizedRoles.find(
//           (role) =>
//             String(role.name || "").toLowerCase() === "owner"
//         );

//         if (owner?.id) {
//           setSelectedRoleId(owner.id);
//         }
//       }
//     } catch (error) {
//       console.error("Failed to load team permissions:", error);

//       showError(
//         error.message ||
//           "Failed to load team permissions."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedRoleId]);

//   useEffect(() => {
//     fetchTeamData();
//   }, [fetchTeamData]);

//   useEffect(() => {
//     if (permissionMode !== "role") {
//       return;
//     }

//     if (!selectedRoleId) {
//       setEditingPermissions([]);
//       setPermissionsDirty(false);
//       return;
//     }

//     const role = allRoleOptions.find(
//       (item) => item.id === selectedRoleId
//     );

//     if (!role) {
//       setEditingPermissions([]);
//       setPermissionsDirty(false);
//       return;
//     }

//     setEditingPermissions(
//       normalizePermissions(role.permissions)
//     );
//     setPermissionsDirty(false);
//   }, [selectedRoleId, permissionMode, allRoleOptions]);

//   useEffect(() => {
//     if (permissionMode !== "member") {
//       return;
//     }

//     if (!selectedMember) {
//       setEditingPermissions([]);
//       setPermissionsDirty(false);
//       return;
//     }

//     const extraPermissions = normalizePermissions(
//       selectedMember.extraPermissions ||
//         selectedMember.permissions ||
//         []
//     );

//     setEditingPermissions(extraPermissions);
//     setPermissionsDirty(false);
//   }, [selectedMember, permissionMode]);

//   const togglePermission = useCallback((permissionKey) => {
//     setEditingPermissions((current) => {
//       const exists = current.includes(permissionKey);

//       const next = exists
//         ? current.filter((permission) => permission !== permissionKey)
//         : [...current, permissionKey];

//       return normalizePermissions(next);
//     });

//     setPermissionsDirty(true);
//   }, []);

//   const selectAllPermissions = () => {
//     setEditingPermissions([...ALL_PERMISSION_KEYS]);
//     setPermissionsDirty(true);
//   };

//   const clearAllPermissions = () => {
//     setEditingPermissions([]);
//     setPermissionsDirty(true);
//   };

//   const saveRolePermissions = async () => {
//     if (!selectedRoleMeta?.id) {
//       showError("Please select a role.");
//       return;
//     }

//     setSaving(true);

//     try {
//       await apiRequest(
//         `${TEAM_API}/roles/${selectedRoleMeta.id}`,
//         {
//           method: "PATCH",
//           body: JSON.stringify({
//             permissions: normalizePermissions(
//               editingPermissions
//             ),
//           }),
//         }
//       );

//       showSuccess("Role permissions updated successfully.");

//       setPermissionsDirty(false);

//       await fetchTeamData();
//     } catch (error) {
//       console.error(
//         "Save role permissions error:",
//         error
//       );

//       showError(
//         error.message ||
//           "Failed to save role permissions."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const saveMemberPermissions = async () => {
//     if (!selectedMemberId) {
//       showError("Please select a team member.");
//       return;
//     }

//     setSaving(true);

//     try {
//       await apiRequest(
//         `${TEAM_API}/${selectedMemberId}/permissions`,
//         {
//           method: "PATCH",
//           body: JSON.stringify({
//             extraPermissions: normalizePermissions(
//               editingPermissions
//             ),
//           }),
//         }
//       );

//       showSuccess(
//         "Member permissions updated successfully."
//       );

//       setPermissionsDirty(false);

//       await fetchTeamData();
//     } catch (error) {
//       console.error(
//         "Save member permissions error:",
//         error
//       );

//       showError(
//         error.message ||
//           "Failed to save member permissions."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   const savePermissions = async () => {
//     if (permissionMode === "role") {
//       await saveRolePermissions();
//     } else {
//       await saveMemberPermissions();
//     }
//   };

//   const handleRoleCreated = async (createdRole) => {
//     await fetchTeamData();

//     if (createdRole?.id) {
//       setSelectedRoleId(createdRole.id);
//       setPermissionMode("role");
//     }
//   };

//   const handleRoleUpdated = async (updatedRole) => {
//     await fetchTeamData();

//     if (updatedRole?.id) {
//       setSelectedRoleId(updatedRole.id);
//       setPermissionMode("role");
//     }
//   };

//   const canEditCheckboxes =
//     permissionMode === "role"
//       ? Boolean(selectedRoleMeta)
//       : Boolean(selectedMemberId);

//   const selectedCount = editingPermissions.length;

//   const totalPermissions = ALL_PERMISSION_KEYS.length;

//   const permissionStats = [
//     {
//       label: "Total permissions",
//       value: totalPermissions,
//       icon: "lock",
//     },
//     {
//       label: "Selected",
//       value: selectedCount,
//       icon: "check_circle",
//     },
//     {
//       label: "Roles",
//       value: allRoleOptions.length,
//       icon: "badge",
//     },
//     {
//       label: "Team members",
//       value: members.length,
//       icon: "groups",
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <SectionHeader
//           title="Team & Permissions"
//           description="Manage team members, roles, and permissions."
//         />

//         <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border-light bg-white">
//           <div className="flex items-center gap-3 text-sm text-text-secondary">
//             <span className="material-symbols-outlined animate-spin text-lg">
//               progress_activity
//             </span>
//             Loading team permissions...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <SectionHeader
//         title="Team & Permissions"
//         description="Manage team members, roles, and permissions."
//         action={
//           <button
//             type="button"
//             onClick={() => setInviteOpen(true)}
//             className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
//           >
//             <span className="material-symbols-outlined text-[18px]">
//               person_add
//             </span>
//             Invite member
//           </button>
//         }
//       />

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         {permissionStats.map((stat) => (
//           <StatCard
//             key={stat.label}
//             title={stat.label}
//             value={stat.value}
//             icon={stat.icon}
//           />
//         ))}
//       </div>

//       <div className="rounded-xl border border-border-light bg-white">
//         <div className="border-b border-border-light px-5 py-4">
//           <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//             <div>
//               <h2 className="text-base font-semibold text-text-primary">
//                 Permission Management
//               </h2>

//               <p className="mt-1 text-sm text-text-secondary">
//                 Configure permissions for a role or individual
//                 team member.
//               </p>
//             </div>

//             <div className="inline-flex rounded-lg border border-border-light bg-gray-50 p-1">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setPermissionMode("role");
//                   setPermissionsDirty(false);
//                 }}
//                 className={`rounded-md px-4 py-2 text-sm font-medium transition ${
//                   permissionMode === "role"
//                     ? "bg-white text-primary shadow-sm"
//                     : "text-text-secondary hover:text-text-primary"
//                 }`}
//               >
//                 Role permissions
//               </button>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setPermissionMode("member");
//                   setPermissionsDirty(false);
//                 }}
//                 className={`rounded-md px-4 py-2 text-sm font-medium transition ${
//                   permissionMode === "member"
//                     ? "bg-white text-primary shadow-sm"
//                     : "text-text-secondary hover:text-text-primary"
//                 }`}
//               >
//                 Member permissions
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="border-b border-border-light px-5 py-4">
//           {permissionMode === "role" ? (
//             <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
//               <div className="w-full lg:max-w-sm">
//                 <label className="mb-2 block text-sm font-medium text-text-primary">
//                   Select role
//                 </label>

//                 <select
//                   value={selectedRoleId}
//                   onChange={(event) => {
//                     setSelectedRoleId(event.target.value);
//                     setPermissionsDirty(false);
//                   }}
//                   className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
//                 >
//                   <option value="">
//                     Select a role
//                   </option>

//                   {allRoleOptions.map((role) => (
//                     <option
//                       key={role.id}
//                       value={role.id}
//                     >
//                       {role.name}
//                       {role.isSystem
//                         ? " (System)"
//                         : " (Custom)"}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {selectedRoleMeta && (
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-text-primary">
//                     {selectedRoleMeta.name}
//                   </p>

//                   <p className="mt-1 text-xs text-text-secondary">
//                     {selectedRoleMeta.description ||
//                       "Configure permissions for this role."}
//                   </p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="w-full lg:max-w-sm">
//               <label className="mb-2 block text-sm font-medium text-text-primary">
//                 Select team member
//               </label>

//               <select
//                 value={selectedMemberId}
//                 onChange={(event) => {
//                   setSelectedMemberId(event.target.value);
//                   setPermissionsDirty(false);
//                 }}
//                 className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
//               >
//                 <option value="">
//                   Select a team member
//                 </option>

//                 {members.map((member) => {
//                   const id =
//                     member.id || member.userId;

//                   const name =
//                     member.name ||
//                     member.user?.name ||
//                     member.email ||
//                     "Unnamed member";

//                   const role =
//                     member.role?.name ||
//                     member.roleName ||
//                     member.role ||
//                     "";

//                   return (
//                     <option
//                       key={id}
//                       value={id}
//                     >
//                       {name}
//                       {role ? ` — ${role}` : ""}
//                     </option>
//                   );
//                 })}
//               </select>
//             </div>
//           )}
//         </div>

//         <div className="px-5 py-5">
//           <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <p className="text-sm font-medium text-text-primary">
//                 Permissions
//               </p>

//               <p className="mt-1 text-xs text-text-secondary">
//                 {selectedCount} of {totalPermissions}{" "}
//                 permissions selected.
//               </p>
//             </div>

//             <div className="flex flex-wrap items-center gap-2">
//               <button
//                 type="button"
//                 disabled={!canEditCheckboxes || saving}
//                 onClick={selectAllPermissions}
//                 className="rounded-lg border border-border-light bg-white px-3 py-2 text-xs font-medium text-text-primary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 Select all
//               </button>

//               <button
//                 type="button"
//                 disabled={!canEditCheckboxes || saving}
//                 onClick={clearAllPermissions}
//                 className="rounded-lg border border-border-light bg-white px-3 py-2 text-xs font-medium text-text-primary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 Clear all
//               </button>
//             </div>
//           </div>

//           {!canEditCheckboxes ? (
//             <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border-light bg-gray-50">
//               <div className="text-center">
//                 <span className="material-symbols-outlined text-3xl text-text-muted">
//                   lock
//                 </span>

//                 <p className="mt-2 text-sm font-medium text-text-primary">
//                   Select a role or member
//                 </p>

//                 <p className="mt-1 text-xs text-text-secondary">
//                   Choose an item above to manage permissions.
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
//               {PERMISSION_GROUPS.map((group) => (
//                 <div
//                   key={group.key}
//                   className="rounded-xl border border-border-light bg-white p-4"
//                 >
//                   <div className="mb-3 flex items-center justify-between">
//                     <h3 className="text-sm font-semibold text-text-primary">
//                       {group.label}
//                     </h3>

//                     <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-text-secondary">
//                       {
//                         group.items.filter((item) =>
//                           editingPermissions.includes(
//                             item.key
//                           )
//                         ).length
//                       }
//                       /{group.items.length}
//                     </span>
//                   </div>

//                   <div className="space-y-2">
//                     {group.items.map((item) => {
//                       const checked =
//                         editingPermissions.includes(
//                           item.key
//                         );

//                       return (
//                         <PermissionCheckbox
//                           key={item.key}
//                           checked={checked}
//                           disabled={saving}
//                           label={item.label}
//                           onChange={() =>
//                             togglePermission(item.key)
//                           }
//                         />
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="mt-6 flex flex-col gap-3 border-t border-border-light pt-5 sm:flex-row sm:items-center sm:justify-between">
//             <div className="text-xs text-text-secondary">
//               {permissionsDirty
//                 ? "You have unsaved permission changes."
//                 : "All changes are saved."}
//             </div>

//             <button
//               type="button"
//               onClick={savePermissions}
//               disabled={
//                 saving ||
//                 !permissionsDirty ||
//                 !canEditCheckboxes
//               }
//               className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               {saving ? (
//                 <>
//                   <span className="material-symbols-outlined animate-spin text-[18px]">
//                     progress_activity
//                   </span>
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <span className="material-symbols-outlined text-[18px]">
//                     save
//                   </span>
//                   Save permissions
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       <TeamRoles
//         roles={allRoleOptions}
//         onCreated={handleRoleCreated}
//         onUpdated={handleRoleUpdated}
//       />

//       <TeamMemberTable
//         members={members}
//         onInvite={() => setInviteOpen(true)}
//         onRefresh={fetchTeamData}
//       />

//       <TeamAuditLog />

//       <MemberInvitationDrawer
//         isOpen={inviteOpen}
//         onClose={() => setInviteOpen(false)}
//         onSuccess={async () => {
//           setInviteOpen(false);
//           await fetchTeamData();
//         }}
//       />
//     </div>
//   );
// }









import { useCallback, useEffect, useMemo, useState } from "react";
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
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
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
  if (!auth) return null;

  if (auth.startsWith("ey")) {
    return auth;
  }

  try {
    const parsed = JSON.parse(auth);
    return parsed?.state?.token || parsed?.token || null;
  } catch {
    return null;
  }
};

/* =========================================================
   PERMISSION CATALOG
========================================================= */
const PERMISSION_GROUPS = [
  {
    title: "Dashboard",
    items: [{ key: "dashboard:view", label: "View dashboard" }],
  },
  {
    title: "Invoices",
    items: [
      { key: "invoices:view", label: "View invoices" },
      { key: "invoices:create", label: "Create invoice" },
      { key: "invoices:edit", label: "Edit invoice" },
      { key: "invoices:delete", label: "Delete invoice" },
      { key: "invoices:send", label: "Send invoice" },
      { key: "invoices:remind", label: "Send reminder" },
      { key: "invoices:export", label: "Export invoices" },
    ],
  },
  {
    title: "Clients",
    items: [
      { key: "clients:view", label: "View clients" },
      { key: "clients:create", label: "Add client" },
      { key: "clients:edit", label: "Edit client" },
      { key: "clients:delete", label: "Delete client" },
    ],
  },
  {
    title: "Projects",
    items: [
      { key: "projects:view", label: "View projects" },
      { key: "projects:create", label: "Create project" },
      { key: "projects:edit", label: "Edit project" },
      { key: "projects:delete", label: "Delete project" },
      { key: "projects:milestones", label: "Manage milestones" },
    ],
  },
  {
    title: "Analytics & Automation",
    items: [
      { key: "analytics:view", label: "View analytics" },
      { key: "analytics:export", label: "Export analytics" },
      { key: "automation:view", label: "View automation" },
      { key: "automation:manage", label: "Manage automation" },
    ],
  },
  {
    title: "Team",
    items: [
      { key: "team:view", label: "View team" },
      { key: "team:invite", label: "Invite members" },
      { key: "team:edit_member", label: "Change member role" },
      { key: "team:remove_member", label: "Remove member" },
      { key: "roles:manage", label: "Manage roles & permissions" },
    ],
  },
  {
    title: "Settings",
    items: [
      { key: "settings:view", label: "View settings" },
      { key: "settings:business", label: "Edit business info" },
      { key: "settings:branding", label: "Edit branding" },
    ],
  },
  {
    title: "Client Portal",
    items: [{ key: "clientportal:view", label: "View client portal" }],
  },
  {
    title: "Pricing",
    items: [{ key: "pricing:view", label: "View pricing" }],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((group) =>
  group.items.map((item) => item.key)
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

const SYSTEM_ROLE_NAMES = Object.keys(SYSTEM_ROLE_DEFAULTS);

/* =========================================================
   NORMALIZE ROLE
========================================================= */
const normalizeRole = (role) => {
  if (!role) return null;

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
  const [databaseRoles, setDatabaseRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Members");
  const [inviteOpen, setInviteOpen] = useState(false);

  /* Permissions tab state */
  const [permMode, setPermMode] = useState("role");
  const [selectedRoleName, setSelectedRoleName] = useState("Manager");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [editingPermissions, setEditingPermissions] = useState([]);
  const [savingPerms, setSavingPerms] = useState(false);
  const [permissionsDirty, setPermissionsDirty] = useState(false);

  /* =========================================================
     LOAD MEMBERS
  ========================================================= */
  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = getAuthToken();
      if (!token) {
        showErrorToast("Session expired. Please login again.");
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
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Invalid server response. Please check the backend.");
      }

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.message || `Failed to load team members (${res.status})`
        );
      }

      setMembers(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Load members error:", error);
      setMembers([]);
      showErrorToast(error?.message || "Failed to load team members");
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
      if (!token) return;

      const res = await fetch(`${TEAM_API}/roles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
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

      setDatabaseRoles(roles);

      const custom = roles.filter(
        (role) => !SYSTEM_ROLE_NAMES.includes(role.name)
      );
      setCustomRoles(custom);
    } catch (error) {
      console.error("Load roles error:", error);
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
  }, [loadMembers, loadCustomRoles]);

  /* =========================================================
     ROLE CALLBACKS
  ========================================================= */
  const handleRoleCreated = useCallback((newRole) => {
    if (!newRole) return;

    const normalized = normalizeRole(newRole);

    setCustomRoles((current) => {
      if (current.some((role) => String(role.id) === String(normalized.id))) {
        return current;
      }
      return [...current, normalized];
    });

    setDatabaseRoles((current) => {
      if (current.some((role) => String(role.id) === String(normalized.id))) {
        return current;
      }
      return [...current, normalized];
    });
  }, []);

  const handleRoleUpdated = useCallback((updatedRole) => {
    if (!updatedRole) return;

    const normalized = normalizeRole(updatedRole);

    setCustomRoles((current) =>
      current.map((role) =>
        String(role.id) === String(normalized.id) ? normalized : role
      )
    );

    setDatabaseRoles((current) =>
      current.map((role) =>
        String(role.id) === String(normalized.id) ? normalized : role
      )
    );
  }, []);

  const handleRoleDeleted = useCallback((roleId) => {
    if (!roleId) return;

    setCustomRoles((current) =>
      current.filter((role) => String(role.id) !== String(roleId))
    );

    setDatabaseRoles((current) =>
      current.filter((role) => String(role.id) !== String(roleId))
    );
  }, []);

  /* =========================================================
     MEMBER INVITED
  ========================================================= */
  const handleMemberInvited = async (payload) => {
    try {
      const invitedMember = payload?.data || payload?.member;

      if (invitedMember?.id) {
        setMembers((current) => {
          if (
            current.some(
              (member) => String(member.id) === String(invitedMember.id)
            )
          ) {
            return current;
          }
          return [invitedMember, ...current];
        });
      }

      setInviteOpen(false);
      await loadMembers();
    } catch (error) {
      showErrorToast(error?.message || "Failed to refresh team members");
    }
  };

  /* =========================================================
     STATS
  ========================================================= */
  const activeMembers = useMemo(
    () =>
      members.filter(
        (member) => String(member.status).toLowerCase() === "active"
      ).length,
    [members]
  );

  const pendingMembers = useMemo(
    () =>
      members.filter(
        (member) => String(member.status).toLowerCase() === "pending"
      ).length,
    [members]
  );

  const totalRoles = useMemo(
    () => SYSTEM_ROLE_NAMES.length + customRoles.length,
    [customRoles.length]
  );

  /* =========================================================
     ALL ROLE OPTIONS
  ========================================================= */
  const allRoleOptions = useMemo(() => {
    const systemRoles = SYSTEM_ROLE_NAMES.map((name) => {
      const databaseRole = databaseRoles.find(
        (role) =>
          String(role.name).toLowerCase() === String(name).toLowerCase()
      );

      return {
        id: databaseRole?.id || null,
        name,
        isSystem: true,
        permissions: Array.isArray(databaseRole?.permissions)
          ? databaseRole.permissions
          : SYSTEM_ROLE_DEFAULTS[name],
      };
    });

    const custom = customRoles.map((role) => ({
      id: role.id,
      name: role.name,
      isSystem: false,
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
    }));

    return [...systemRoles, ...custom];
  }, [databaseRoles, customRoles]);

  /* =========================================================
     SELECTED MEMBER / ROLE
  ========================================================= */
  const selectedMember = useMemo(
    () =>
      members.find((member) => String(member.id) === String(selectedMemberId)),
    [members, selectedMemberId]
  );

  const selectedRoleMeta = useMemo(
    () =>
      allRoleOptions.find(
        (role) => String(role.name) === String(selectedRoleName)
      ),
    [allRoleOptions, selectedRoleName]
  );

  /* =========================================================
     LOAD EDITING PERMISSIONS
  ========================================================= */
  useEffect(() => {
    // ROLE MODE
    if (permMode === "role") {
      const role = allRoleOptions.find(
        (item) => item.name === selectedRoleName
      );

      const permissions =
        role?.permissions || SYSTEM_ROLE_DEFAULTS[selectedRoleName] || [];

      setEditingPermissions([...new Set(permissions)]);
      setPermissionsDirty(false);
      return;
    }

    // MEMBER MODE
    if (!selectedMember) {
      setEditingPermissions([]);
      setPermissionsDirty(false);
      return;
    }

    const roleName = selectedMember.role || "Viewer";
    const role = allRoleOptions.find(
      (item) =>
        String(item.name).toLowerCase() === String(roleName).toLowerCase()
    );

    const basePermissions =
      role?.permissions || SYSTEM_ROLE_DEFAULTS[roleName] || [];

    const extraPermissions = Array.isArray(selectedMember.extraPermissions)
      ? selectedMember.extraPermissions
      : [];

    setEditingPermissions([
      ...new Set([...basePermissions, ...extraPermissions]),
    ]);
    setPermissionsDirty(false);
  }, [
    permMode,
    selectedRoleName,
    selectedMemberId,
    allRoleOptions,
    selectedMember,
  ]);

  /* =========================================================
     PERMISSION HELPERS
  ========================================================= */
  const togglePermission = (permissionKey) => {
    setEditingPermissions((previous) => {
      const next = previous.includes(permissionKey)
        ? previous.filter((permission) => permission !== permissionKey)
        : [...previous, permissionKey];

      return [...new Set(next)];
    });
    setPermissionsDirty(true);
  };

  const selectAllInGroup = (group) => {
    const keys = group.items.map((item) => item.key);
    setEditingPermissions((previous) => [...new Set([...previous, ...keys])]);
    setPermissionsDirty(true);
  };

  const clearGroup = (group) => {
    const keys = new Set(group.items.map((item) => item.key));
    setEditingPermissions((previous) =>
      previous.filter((permission) => !keys.has(permission))
    );
    setPermissionsDirty(true);
  };

  const canEditCheckboxes =
    permMode === "role" ? Boolean(selectedRoleMeta) : Boolean(selectedMemberId);

  /* =========================================================
     SAVE ROLE PERMISSIONS
  ========================================================= */
  const saveRolePermissions = async () => {
    if (!selectedRoleMeta) {
      showErrorToast("Please select a role.");
      return;
    }

    if (!selectedRoleMeta.id) {
      showErrorToast(
        `${selectedRoleMeta.name} does not have a database role ID. Make sure /team/roles returns the role ID.`
      );
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showErrorToast("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setSavingPerms(true);

      const res = await fetch(`${TEAM_API}/roles/${selectedRoleMeta.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          permissions: editingPermissions,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to save role permissions");
      }

      const updatedRole = normalizeRole(
        data?.data || {
          ...selectedRoleMeta,
          permissions: editingPermissions,
        }
      );

      setDatabaseRoles((previous) =>
        previous.map((role) =>
          String(role.id) === String(selectedRoleMeta.id)
            ? { ...role, permissions: editingPermissions }
            : role
        )
      );

      if (!selectedRoleMeta.isSystem) {
        setCustomRoles((previous) =>
          previous.map((role) =>
            String(role.id) === String(selectedRoleMeta.id)
              ? { ...role, permissions: editingPermissions }
              : role
          )
        );
      }

      if (updatedRole?.permissions) {
        setEditingPermissions([...new Set(updatedRole.permissions)]);
      }

      setPermissionsDirty(false);
      showSuccessToast(
        "Permissions saved",
        `${selectedRoleName} permissions updated successfully.`
      );
    } catch (error) {
      console.error("Save role permissions error:", error);
      showErrorToast(error?.message || "Failed to save role permissions");
    } finally {
      setSavingPerms(false);
    }
  };

  /* =========================================================
     SAVE MEMBER EXTRA PERMISSIONS
  ========================================================= */
  const saveMemberExtraPermissions = async () => {
    if (!selectedMember?.id) {
      showErrorToast("Please select a member first.");
      return;
    }

    const roleName = selectedMember.role || "Viewer";
    const role = allRoleOptions.find(
      (item) =>
        String(item.name).toLowerCase() === String(roleName).toLowerCase()
    );

    const basePermissions =
      role?.permissions || SYSTEM_ROLE_DEFAULTS[roleName] || [];
    const baseSet = new Set(basePermissions);

    const extraPermissions = editingPermissions.filter(
      (permission) => !baseSet.has(permission)
    );

    const token = getAuthToken();
    if (!token) {
      showErrorToast("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    try {
      setSavingPerms(true);

      const res = await fetch(`${TEAM_API}/${selectedMember.id}/permissions`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          extraPermissions,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to save member permissions");
      }

      setMembers((previous) =>
        previous.map((member) =>
          String(member.id) === String(selectedMember.id)
            ? { ...member, extraPermissions }
            : member
        )
      );

      setPermissionsDirty(false);
      showSuccessToast(
        "Permissions saved",
        `Extra access updated for ${
          selectedMember.name || selectedMember.email || "member"
        }.`
      );
    } catch (error) {
      console.error("Save member permissions error:", error);
      showErrorToast(error?.message || "Failed to save member permissions");
    } finally {
      setSavingPerms(false);
    }
  };

  /* =========================================================
     SAVE HANDLER
  ========================================================= */
  const handleSavePermissions = () => {
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
        {/* HEADER */}
        <SectionHeader
          title="Team & Permissions"
          description="Manage who has access to your AutoBillr workspace and what they can do."
          secondaryAction={{
            label: "Audit log",
            icon: "history",
            variant: "secondary",
            onClick: () => setActiveTab("Audit log"),
          }}
          primaryAction={{
            label: "Invite Member",
            icon: "person_add",
            onClick: () => setInviteOpen(true),
          }}
        />

        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
          <StatCard
            title="Team Members"
            value={isLoading ? "—" : members.length}
            sub={`${pendingMembers} pending invites`}
            icon="group"
            iconColor="text-primary"
            variant="dashboard"
          />
          <StatCard
            title="Active Sessions"
            value={isLoading ? "—" : activeMembers}
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
                    customRoles.length === 1 ? "" : "s"
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

        {/* TABS */}
        <div className="mb-5 overflow-x-auto">
          <div className="inline-flex p-1 bg-surface-secondary rounded-lg gap-1 min-w-max">
            {[
              { label: "Members", count: members.length },
              { label: "Roles", count: totalRoles },
              { label: "Permissions" },
              { label: "Audit log" },
            ].map((tab) => {
              const active = activeTab === tab.label;

              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setActiveTab(tab.label)}
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
                  {tab.count !== undefined && (
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

        {/* MEMBERS TAB */}
        {activeTab === "Members" && (
          <TeamMemberTable
            members={members}
            setMembers={setMembers}
            customRoles={customRoles}
          />
        )}

        {/* ROLES TAB */}
        {activeTab === "Roles" && (
          <TeamRoles
            members={members}
            customRoles={customRoles}
            setCustomRoles={setCustomRoles}
            onRoleCreated={handleRoleCreated}
            onRoleUpdated={handleRoleUpdated}
            onRoleDeleted={handleRoleDeleted}
          />
        )}

        {/* PERMISSIONS TAB */}
        {activeTab === "Permissions" && (
          <div className="bg-surface rounded-xl shadow-sm border border-border-light overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-text">Permissions</h2>
                <p className="text-sm text-text-muted mt-1">
                  Assign access by role, or grant extra permissions to one
                  member.
                </p>
              </div>

              <div className="inline-flex p-1 bg-surface-secondary rounded-lg">
                <button
                  type="button"
                  onClick={() => setPermMode("role")}
                  className={`
                    px-3.5 py-1.5 rounded-md text-xs font-semibold transition
                    ${
                      permMode === "role"
                        ? "bg-surface text-primary shadow-sm"
                        : "text-text-muted"
                    }
                  `}
                >
                  By role
                </button>
                <button
                  type="button"
                  onClick={() => setPermMode("member")}
                  className={`
                    px-3.5 py-1.5 rounded-md text-xs font-semibold transition
                    ${
                      permMode === "member"
                        ? "bg-surface text-primary shadow-sm"
                        : "text-text-muted"
                    }
                  `}
                >
                  By member
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Selector */}
              {permMode === "role" ? (
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                    Select role
                  </label>
                  <select
                    value={selectedRoleName}
                    onChange={(e) => setSelectedRoleName(e.target.value)}
                    className="w-full max-w-sm h-11 px-3 rounded-lg border border-border bg-surface text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    {allRoleOptions.map((role) => (
                      <option key={role.id || role.name} value={role.name}>
                        {role.name} {role.isSystem ? "(system)" : "(custom)"}
                      </option>
                    ))}
                  </select>

                  {selectedRoleMeta && (
                    <p className="text-xs text-text-muted mt-2">
                      {selectedRoleMeta.isSystem
                        ? "This is a default workspace role. Its permissions can be customized."
                        : "This is a custom role. Configure the permissions that members with this role should receive."}
                    </p>
                  )}

                  {!selectedRoleMeta?.id && selectedRoleMeta && (
                    <p className="text-xs text-warning mt-2">
                      This role is not persisted in the database yet. The
                      backend must return its role ID from /team/roles before it
                      can be saved.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">
                    Select member
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full max-w-sm h-11 px-3 rounded-lg border border-border bg-surface text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  >
                    <option value="">Choose a member…</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name || member.email || "Unnamed"} ·{" "}
                        {member.role || "Viewer"}
                      </option>
                    ))}
                  </select>

                  {selectedMember && (
                    <p className="text-xs text-text-muted mt-2">
                      Base access comes from role{" "}
                      <strong className="text-text">
                        {selectedMember.role || "Viewer"}
                      </strong>
                      . Extra checked items below are additional permissions for
                      this person only.
                    </p>
                  )}
                </div>
              )}

              {/* Permission groups */}
              <div className="space-y-5">
                {PERMISSION_GROUPS.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-xl border border-border-light p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-text">
                        {group.title}
                      </h3>

                      {canEditCheckboxes && (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => selectAllInGroup(group)}
                            className="text-[11px] font-semibold text-primary hover:underline"
                          >
                            Select all
                          </button>
                          <button
                            type="button"
                            onClick={() => clearGroup(group)}
                            className="text-[11px] font-semibold text-text-muted hover:underline"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {group.items.map((item) => {
                        const checked = editingPermissions.includes(item.key);

                        return (
                          <label
                            key={item.key}
                            className={`
                              flex items-center gap-2.5 rounded-lg
                              border px-3 py-2.5 text-sm transition
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
                              checked={checked}
                              disabled={!canEditCheckboxes}
                              onChange={() => togglePermission(item.key)}
                              className="accent-primary shrink-0"
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border-light">
                <button
                  type="button"
                  disabled={
                    savingPerms ||
                    !permissionsDirty ||
                    (permMode === "role" && !selectedRoleMeta) ||
                    (permMode === "member" && !selectedMemberId)
                  }
                  onClick={handleSavePermissions}
                  className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingPerms ? "Saving…" : "Save permissions"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === "Audit log" && <TeamAuditLog />}
      </div>

      {/* Invitation Drawer */}
      <MemberInvitationDrawer
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={handleMemberInvited}
        roles={customRoles}
      />
    </main>
  );
}