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





import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import MemberInvitationDrawer from "../../components/team/MemberInvitationDrawer";
import PermissionCheckbox from "../../components/team/PermissionCheckbox";
import TeamAuditLog from "../../components/team/TeamAuditLog";
import TeamMemberTable from "../../components/team/TeamMemberTable";
import TeamRoles from "../../components/team/TeamRoles";

import { showError, showSuccess } from "../../utils/toast";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const TEAM_API = `${API_BASE}/team`;

const getToken = () =>
  localStorage.getItem("autobiller-auth") ||
  localStorage.getItem("token") ||
  "";

const PERMISSION_GROUPS = [
  {
    key: "dashboard",
    label: "Dashboard",
    items: [{ key: "dashboard:view", label: "View dashboard" }],
  },
  {
    key: "invoices",
    label: "Invoices",
    items: [
      { key: "invoices:view", label: "View invoices" },
      { key: "invoices:create", label: "Create invoices" },
      { key: "invoices:edit", label: "Edit invoices" },
      { key: "invoices:delete", label: "Delete invoices" },
      { key: "invoices:send", label: "Send invoices" },
      { key: "invoices:remind", label: "Send reminders" },
      { key: "invoices:export", label: "Export invoices" },
    ],
  },
  {
    key: "clients",
    label: "Clients",
    items: [
      { key: "clients:view", label: "View clients" },
      { key: "clients:create", label: "Create clients" },
      { key: "clients:edit", label: "Edit clients" },
      { key: "clients:delete", label: "Delete clients" },
    ],
  },
  {
    key: "projects",
    label: "Projects",
    items: [
      { key: "projects:view", label: "View projects" },
      { key: "projects:create", label: "Create projects" },
      { key: "projects:edit", label: "Edit projects" },
      { key: "projects:delete", label: "Delete projects" },
      { key: "projects:milestones", label: "Manage milestones" },
    ],
  },
  {
    key: "analyticsAutomation",
    label: "Analytics & Automation",
    items: [
      { key: "analytics:view", label: "View analytics" },
      { key: "analytics:export", label: "Export analytics" },
      { key: "automation:view", label: "View automation" },
      { key: "automation:manage", label: "Manage automation" },
    ],
  },
  {
    key: "team",
    label: "Team",
    items: [
      { key: "team:view", label: "View team" },
      { key: "team:invite", label: "Invite members" },
      { key: "team:edit_member", label: "Edit members" },
      { key: "team:remove_member", label: "Remove members" },
      { key: "roles:manage", label: "Manage roles" },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    items: [
      { key: "settings:view", label: "View settings" },
      { key: "settings:business", label: "Manage business settings" },
      { key: "settings:branding", label: "Manage branding" },
      { key: "settings:tax", label: "Manage tax settings" },
      { key: "settings:payments", label: "Manage payment settings" },
      { key: "settings:integrations", label: "Manage integrations" },
      { key: "settings:api", label: "Manage API settings" },
    ],
  },
  {
    key: "billing",
    label: "Billing",
    items: [{ key: "billing:view", label: "View billing" }],
  },
  {
    key: "clientPortal",
    label: "Client Portal",
    items: [{ key: "clientportal:view", label: "View client portal" }],
  },
  {
    key: "pricing",
    label: "Pricing",
    items: [{ key: "pricing:view", label: "View pricing" }],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((group) =>
  group.items.map((item) => item.key)
);

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

const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  return [...new Set(permissions.filter(Boolean))].filter((permission) =>
    ALL_PERMISSION_KEYS.includes(permission)
  );
};

const getResponseMessage = async (response) => {
  try {
    const data = await response.json();
    return (
      data?.message ||
      data?.error ||
      data?.details ||
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

const apiRequest = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    const networkError = new Error(
      "Unable to connect to the server. Please check your API URL, backend server, CORS configuration, and network connection."
    );
    networkError.cause = error;
    throw networkError;
  }

  if (!response.ok) {
    const message = await getResponseMessage(response);
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
};

export default function TeamPermissions() {
  const navigate = useNavigate();

  const [databaseRoles, setDatabaseRoles] = useState([]);
  const [customRoles, setCustomRoles] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [permissionMode, setPermissionMode] = useState("role");

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const [editingPermissions, setEditingPermissions] = useState([]);
  const [permissionsDirty, setPermissionsDirty] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);

  const selectedRoleMeta = useMemo(() => {
    if (!selectedRoleId) return null;

    return (
      databaseRoles.find((role) => role.id === selectedRoleId) ||
      customRoles.find((role) => role.id === selectedRoleId) ||
      null
    );
  }, [selectedRoleId, databaseRoles, customRoles]);

  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return null;

    return (
      members.find(
        (member) =>
          member.id === selectedMemberId ||
          member.userId === selectedMemberId
      ) || null
    );
  }, [selectedMemberId, members]);

  const allRoleOptions = useMemo(() => {
    const systemRoleNames = ["Owner", "Admin", "Manager", "Analyst", "Viewer"];

    const systemRoles = systemRoleNames.map((name) => {
      const dbRole = databaseRoles.find(
        (role) =>
          String(role.name || "").toLowerCase() === name.toLowerCase()
      );

      return {
        id: dbRole?.id || `system-${name.toLowerCase()}`,
        name,
        description: dbRole?.description || `${name} system role`,
        permissions: Array.isArray(dbRole?.permissions)
          ? normalizePermissions(dbRole.permissions)
          : normalizePermissions(SYSTEM_ROLE_DEFAULTS[name]),
        isSystem: true,
        dbRole,
      };
    });

    const custom = customRoles
      .filter(
        (role) =>
          !systemRoleNames.some(
            (name) =>
              String(role.name || "").toLowerCase() === name.toLowerCase()
          )
      )
      .map((role) => ({
        ...role,
        permissions: normalizePermissions(role.permissions),
        isSystem: false,
      }));

    return [...systemRoles, ...custom];
  }, [databaseRoles, customRoles]);

  // ========== FIXED fetchTeamData ==========
  const fetchTeamData = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Load members
      const membersRes = await apiRequest(TEAM_API);

      const teamMembers = Array.isArray(membersRes?.data)
        ? membersRes.data
        : Array.isArray(membersRes?.members)
        ? membersRes.members
        : Array.isArray(membersRes?.data?.members)
        ? membersRes.data.members
        : [];

      // 2. Load roles (THIS WAS MISSING)
      const rolesRes = await apiRequest(`${TEAM_API}/roles`);

      const roles = Array.isArray(rolesRes?.data)
        ? rolesRes.data
        : Array.isArray(rolesRes?.roles)
        ? rolesRes.roles
        : [];

      const systemRoleNames = ["Owner", "Admin", "Manager", "Analyst", "Viewer"];

      const normalizedRoles = roles.map((role) => ({
        ...role,
        permissions: normalizePermissions(role.permissions),
      }));

      setDatabaseRoles(
        normalizedRoles.filter((role) =>
          systemRoleNames.some(
            (name) =>
              String(role.name || "").toLowerCase() === name.toLowerCase()
          )
        )
      );

      setCustomRoles(
        normalizedRoles.filter(
          (role) =>
            !systemRoleNames.some(
              (name) =>
                String(role.name || "").toLowerCase() === name.toLowerCase()
            )
        )
      );

      setMembers(teamMembers);

      // Auto-select Owner if nothing selected yet
      if (!selectedRoleId && normalizedRoles.length > 0) {
        const owner = normalizedRoles.find(
          (role) => String(role.name || "").toLowerCase() === "owner"
        );
        if (owner?.id) {
          setSelectedRoleId(owner.id);
        }
      }
    } catch (error) {
      console.error("Failed to load team permissions:", error);
      showError(error.message || "Failed to load team permissions.");
    } finally {
      setLoading(false);
    }
  }, [selectedRoleId]);
  // ========== END FIXED fetchTeamData ==========

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  useEffect(() => {
    if (permissionMode !== "role") return;

    if (!selectedRoleId) {
      setEditingPermissions([]);
      setPermissionsDirty(false);
      return;
    }

    const role = allRoleOptions.find((item) => item.id === selectedRoleId);

    if (!role) {
      setEditingPermissions([]);
      setPermissionsDirty(false);
      return;
    }

    setEditingPermissions(normalizePermissions(role.permissions));
    setPermissionsDirty(false);
  }, [selectedRoleId, permissionMode, allRoleOptions]);

  useEffect(() => {
    if (permissionMode !== "member") return;

    if (!selectedMember) {
      setEditingPermissions([]);
      setPermissionsDirty(false);
      return;
    }

    const extraPermissions = normalizePermissions(
      selectedMember.extraPermissions || selectedMember.permissions || []
    );

    setEditingPermissions(extraPermissions);
    setPermissionsDirty(false);
  }, [selectedMember, permissionMode]);

  const togglePermission = useCallback((permissionKey) => {
    setEditingPermissions((current) => {
      const exists = current.includes(permissionKey);
      const next = exists
        ? current.filter((permission) => permission !== permissionKey)
        : [...current, permissionKey];
      return normalizePermissions(next);
    });
    setPermissionsDirty(true);
  }, []);

  const selectAllPermissions = () => {
    setEditingPermissions([...ALL_PERMISSION_KEYS]);
    setPermissionsDirty(true);
  };

  const clearAllPermissions = () => {
    setEditingPermissions([]);
    setPermissionsDirty(true);
  };

  const saveRolePermissions = async () => {
    if (!selectedRoleMeta?.id) {
      showError("Please select a role.");
      return;
    }

    // Prevent saving with fake system-* IDs
    if (String(selectedRoleMeta.id).startsWith("system-")) {
      showError("This system role is not fully loaded. Please refresh the page.");
      return;
    }

    setSaving(true);

    try {
      await apiRequest(`${TEAM_API}/roles/${selectedRoleMeta.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          permissions: normalizePermissions(editingPermissions),
        }),
      });

      showSuccess("Role permissions updated successfully.");
      setPermissionsDirty(false);
      await fetchTeamData();
    } catch (error) {
      console.error("Save role permissions error:", error);
      showError(error.message || "Failed to save role permissions.");
    } finally {
      setSaving(false);
    }
  };

  const saveMemberPermissions = async () => {
    if (!selectedMemberId) {
      showError("Please select a team member.");
      return;
    }

    setSaving(true);

    try {
      await apiRequest(`${TEAM_API}/${selectedMemberId}/permissions`, {
        method: "PATCH",
        body: JSON.stringify({
          extraPermissions: normalizePermissions(editingPermissions),
        }),
      });

      showSuccess("Member permissions updated successfully.");
      setPermissionsDirty(false);
      await fetchTeamData();
    } catch (error) {
      console.error("Save member permissions error:", error);
      showError(error.message || "Failed to save member permissions.");
    } finally {
      setSaving(false);
    }
  };

  const savePermissions = async () => {
    if (permissionMode === "role") {
      await saveRolePermissions();
    } else {
      await saveMemberPermissions();
    }
  };

  const handleRoleCreated = async (createdRole) => {
    await fetchTeamData();
    if (createdRole?.id) {
      setSelectedRoleId(createdRole.id);
      setPermissionMode("role");
    }
  };

  const handleRoleUpdated = async (updatedRole) => {
    await fetchTeamData();
    if (updatedRole?.id) {
      setSelectedRoleId(updatedRole.id);
      setPermissionMode("role");
    }
  };

  const canEditCheckboxes =
    permissionMode === "role"
      ? Boolean(selectedRoleMeta)
      : Boolean(selectedMemberId);

  const selectedCount = editingPermissions.length;
  const totalPermissions = ALL_PERMISSION_KEYS.length;

  const permissionStats = [
    { label: "Total permissions", value: totalPermissions, icon: "lock" },
    { label: "Selected", value: selectedCount, icon: "check_circle" },
    { label: "Roles", value: allRoleOptions.length, icon: "badge" },
    { label: "Team members", value: members.length, icon: "groups" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Team & Permissions"
          description="Manage team members, roles, and permissions."
        />
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border-light bg-white">
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span className="material-symbols-outlined animate-spin text-lg">
              progress_activity
            </span>
            Loading team permissions...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Team & Permissions"
        description="Manage team members, roles, and permissions."
        action={
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
          >
            <span className="material-symbols-outlined text-[18px]">
              person_add
            </span>
            Invite member
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {permissionStats.map((stat) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="rounded-xl border border-border-light bg-white">
        <div className="border-b border-border-light px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Permission Management
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Configure permissions for a role or individual team member.
              </p>
            </div>

            <div className="inline-flex rounded-lg border border-border-light bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => {
                  setPermissionMode("role");
                  setPermissionsDirty(false);
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  permissionMode === "role"
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Role permissions
              </button>

              <button
                type="button"
                onClick={() => {
                  setPermissionMode("member");
                  setPermissionsDirty(false);
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  permissionMode === "member"
                    ? "bg-white text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Member permissions
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-border-light px-5 py-4">
          {permissionMode === "role" ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="w-full lg:max-w-sm">
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Select role
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(event) => {
                    setSelectedRoleId(event.target.value);
                    setPermissionsDirty(false);
                  }}
                  className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Select a role</option>
                  {allRoleOptions.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                      {role.isSystem ? " (System)" : " (Custom)"}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoleMeta && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {selectedRoleMeta.name}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {selectedRoleMeta.description ||
                      "Configure permissions for this role."}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full lg:max-w-sm">
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Select team member
              </label>
              <select
                value={selectedMemberId}
                onChange={(event) => {
                  setSelectedMemberId(event.target.value);
                  setPermissionsDirty(false);
                }}
                className="w-full rounded-lg border border-border-light bg-white px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Select a team member</option>
                {members.map((member) => {
                  const id = member.id || member.userId;
                  const name =
                    member.name ||
                    member.user?.name ||
                    member.email ||
                    "Unnamed member";
                  const role =
                    member.role?.name ||
                    member.roleName ||
                    member.role ||
                    "";

                  return (
                    <option key={id} value={id}>
                      {name}
                      {role ? ` — ${role}` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        <div className="px-5 py-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Permissions
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                {selectedCount} of {totalPermissions} permissions selected.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!canEditCheckboxes || saving}
                onClick={selectAllPermissions}
                className="rounded-lg border border-border-light bg-white px-3 py-2 text-xs font-medium text-text-primary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Select all
              </button>

              <button
                type="button"
                disabled={!canEditCheckboxes || saving}
                onClick={clearAllPermissions}
                className="rounded-lg border border-border-light bg-white px-3 py-2 text-xs font-medium text-text-primary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear all
              </button>
            </div>
          </div>

          {!canEditCheckboxes ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border-light bg-gray-50">
              <div className="text-center">
                <span className="material-symbols-outlined text-3xl text-text-muted">
                  lock
                </span>
                <p className="mt-2 text-sm font-medium text-text-primary">
                  Select a role or member
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  Choose an item above to manage permissions.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {PERMISSION_GROUPS.map((group) => (
                <div
                  key={group.key}
                  className="rounded-xl border border-border-light bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {group.label}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-text-secondary">
                      {
                        group.items.filter((item) =>
                          editingPermissions.includes(item.key)
                        ).length
                      }
                      /{group.items.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const checked = editingPermissions.includes(item.key);
                      return (
                        <PermissionCheckbox
                          key={item.key}
                          checked={checked}
                          disabled={saving}
                          label={item.label}
                          onChange={() => togglePermission(item.key)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-border-light pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-text-secondary">
              {permissionsDirty
                ? "You have unsaved permission changes."
                : "All changes are saved."}
            </div>

            <button
              type="button"
              onClick={savePermissions}
              disabled={saving || !permissionsDirty || !canEditCheckboxes}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    save
                  </span>
                  Save permissions
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <TeamRoles
        roles={allRoleOptions}
        onCreated={handleRoleCreated}
        onUpdated={handleRoleUpdated}
      />

      <TeamMemberTable
        members={members}
        onInvite={() => setInviteOpen(true)}
        onRefresh={fetchTeamData}
      />

      <TeamAuditLog />

      <MemberInvitationDrawer
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={async () => {
          setInviteOpen(false);
          await fetchTeamData();
        }}
      />
    </div>
  );
}