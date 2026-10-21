// import {
//   useMemo,
//   useState,
// } from "react";

// import Card from "../../components/ui/Card";

// import {
//   showErrorToast,
// } from "../../components/ui/CustomToast";

// import CreateRoleModal from "./CreateRoleModal";

// const DEFAULT_ROLES = {
//   Owner: {
//     className:
//       "bg-danger-soft text-danger",

//     description:
//       "Full workspace ownership and administrative access.",
//   },

//   Admin: {
//     className:
//       "bg-warning-soft text-warning",

//     description:
//       "Manage workspace settings, members and billing.",
//   },

//   Manager: {
//     className:
//       "bg-info-soft text-info",

//     description:
//       "Manage projects, clients and operational workflows.",
//   },

//   Analyst: {
//     className:
//       "bg-primary-soft text-primary",

//     description:
//       "View reports, analytics and business information.",
//   },

//   Viewer: {
//     className:
//       "bg-surface-secondary text-text-secondary",

//     description:
//       "Read-only access to permitted workspace information.",
//   },
// };

// function RoleBadge({ role }) {
//   const config =
//     DEFAULT_ROLES[role?.name] ||
//     DEFAULT_ROLES.Viewer;

//   return (
//     <span
//       className={`
//         inline-flex
//         items-center
//         px-2.5
//         py-1
//         text-[11px]
//         font-bold
//         rounded-full
//         uppercase
//         tracking-wider
//         whitespace-nowrap
//         ${config.className}
//       `}
//     >
//       {role?.name || "Viewer"}
//     </span>
//   );
// }

// export default function TeamRoles({
//   members = [],
//   customRoles = [],
//   setCustomRoles,
// }) {
//   const [roleModalOpen, setRoleModalOpen] =
//     useState(false);

//   const [selectedRole, setSelectedRole] =
//     useState(null);

//   /* =========================================================
//      ALL ROLES
//   ========================================================= */

//   const allRoles = useMemo(() => {
//     return [
//       ...Object.keys(DEFAULT_ROLES).map(
//         (name) => ({
//           name,
//           isDefault: true,
//         })
//       ),

//       ...customRoles.map((role) => ({
//         ...role,
//         isDefault: false,
//       })),
//     ];
//   }, [customRoles]);

//   /* =========================================================
//      OPEN CREATE
//   ========================================================= */

//   const openCreateRole = () => {
//     setSelectedRole(null);
//     setRoleModalOpen(true);
//   };

//   /* =========================================================
//      OPEN EDIT
//   ========================================================= */

//   const openEditRole = (role) => {
//     /*
//       IMPORTANT:

//       Default roles cannot be edited from
//       CreateRoleModal because they don't have
//       a custom database ID.

//       Only custom roles open the edit modal.
//     */

//     if (role.isDefault) {
//       showErrorToast(
//         "Default workspace roles cannot be edited."
//       );
//       return;
//     }

//     setSelectedRole(role);
//     setRoleModalOpen(true);
//   };

//   /* =========================================================
//      CLOSE
//   ========================================================= */

//   const closeRoleModal = () => {
//     setRoleModalOpen(false);
//     setSelectedRole(null);
//   };

//   /* =========================================================
//      CREATE CALLBACK
//   ========================================================= */

//   const handleCreated = (newRole) => {
//     if (!newRole) return;

//     setCustomRoles?.((current) => [
//       ...current,
//       newRole,
//     ]);
//   };

//   /* =========================================================
//      UPDATE CALLBACK
//   ========================================================= */

//   const handleUpdated = (updatedRole) => {
//     if (!updatedRole) return;

//     setCustomRoles?.((current) =>
//       current.map((role) =>
//         role.id === updatedRole.id
//           ? updatedRole
//           : role
//       )
//     );
//   };

//   /* =========================================================
//      RENDER
//   ========================================================= */

//   return (
//     <>
//       <div className="
//         grid
//         grid-cols-1
//         md:grid-cols-2
//         lg:grid-cols-3
//         gap-5
//       ">
//         {allRoles.map((role) => {
//           const count = members.filter(
//             (member) =>
//               member.role === role.name
//           ).length;

//           const description =
//             role.isDefault
//               ? DEFAULT_ROLES[
//                   role.name
//                 ]?.description
//               : role.description;

//           return (
//             <Card
//               key={
//                 role.id ||
//                 `default-${role.name}`
//               }
//               className="
//                 min-h-[260px]
//                 flex
//                 flex-col
//                 p-5
//               "
//             >
//               {/* =================================================
//                   HEADER
//               ================================================= */}

//               <div className="
//                 flex
//                 items-center
//                 justify-between
//                 mb-5
//               ">
//                 <RoleBadge role={role} />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     openEditRole(role)
//                   }
//                   className="
//                     p-1
//                     rounded-md
//                     text-text-light
//                     hover:text-text
//                     hover:bg-surface-hover
//                     transition
//                   "
//                   title={
//                     role.isDefault
//                       ? "Default role"
//                       : "Edit role"
//                   }
//                 >
//                   <span
//                     className="material-symbols-outlined"
//                     style={{
//                       fontSize: 20,
//                     }}
//                   >
//                     {role.isDefault
//                       ? "more_vert"
//                       : "edit"}
//                   </span>
//                 </button>
//               </div>

//               {/* =================================================
//                   COUNT
//               ================================================= */}

//               <div className="
//                 text-3xl
//                 font-bold
//                 text-text
//               ">
//                 {count}
//               </div>

//               <div className="
//                 text-[11px]
//                 font-bold
//                 text-text-light
//                 uppercase
//                 tracking-widest
//                 mt-1
//               ">
//                 MEMBERS
//               </div>

//               {/* =================================================
//                   DESCRIPTION
//               ================================================= */}

//               <p className="
//                 text-sm
//                 text-text-muted
//                 leading-6
//                 mt-5
//                 flex-1
//               ">
//                 {description ||
//                   "Custom workspace role."}
//               </p>

//               {/* =================================================
//                   EDIT BUTTON
//               ================================================= */}

//               {!role.isDefault && (
//                 <button
//                   type="button"
//                   onClick={() =>
//                     openEditRole(role)
//                   }
//                   className="
//                     mx-auto
//                     flex
//                     items-center
//                     justify-center
//                     gap-1
//                     rounded-lg
//                     px-3
//                     py-1
//                     mt-3
//                     text-xs
//                     font-bold
//                     text-primary
//                     transition-all
//                     duration-200
//                     hover:bg-primary-light
//                     hover:text-primary-hover
//                   "
//                 >
//                   <span className="
//                     material-symbols-outlined
//                     text-[16px]
//                   ">
//                     edit
//                   </span>

//                   Edit Role
//                 </button>
//               )}
//             </Card>
//           );
//         })}

//         {/* =====================================================
//             CREATE CUSTOM ROLE
//         ===================================================== */}

//         <button
//           type="button"
//           onClick={openCreateRole}
//           className="
//             bg-surface
//             rounded-xl
//             border-2
//             border-dashed
//             border-border
//             min-h-[260px]
//             flex
//             flex-col
//             items-center
//             justify-center
//             text-primary
//             hover:border-primary
//             hover:bg-primary-soft
//             transition
//             group
//           "
//         >
//           <div className="
//             w-12
//             h-12
//             rounded-full
//             border-2
//             border-primary
//             grid
//             place-items-center
//             mb-4
//             group-hover:scale-105
//             transition
//           ">
//             <span
//               className="material-symbols-outlined"
//               style={{
//                 fontSize: 26,
//               }}
//             >
//               add
//             </span>
//           </div>

//           <span className="
//             text-base
//             font-semibold
//           ">
//             Create custom role
//           </span>

//           <span className="
//             text-xs
//             text-text-muted
//             mt-1
//           ">
//             Define your own permissions
//           </span>
//         </button>
//       </div>

//       {/* =====================================================
//           CREATE / EDIT ROLE MODAL
//       ===================================================== */}

//       <CreateRoleModal
//         isOpen={roleModalOpen}
//         onClose={closeRoleModal}
//         role={selectedRole}
//         existingRoles={allRoles}
//         onCreated={handleCreated}
//         onUpdated={handleUpdated}
//       />
//     </>
//   );
// }








































































import { useMemo, useState } from "react";

import Card from "../../components/ui/Card";
import { showErrorToast } from "../../components/ui/CustomToast";
import CreateRoleModal from "./CreateRoleModal";

/* =========================================================
   DEFAULT ROLES
========================================================= */

const DEFAULT_ROLES = {
  Owner: {
    className: "bg-danger-soft text-danger",
    description:
      "Full workspace ownership and administrative access.",
  },
  Admin: {
    className: "bg-warning-soft text-warning",
    description:
      "Manage workspace settings, members and billing.",
  },
  Manager: {
    className: "bg-info-soft text-info",
    description:
      "Manage projects, clients and operational workflows.",
  },
  Analyst: {
    className: "bg-primary-soft text-primary",
    description:
      "View reports, analytics and business information.",
  },
  Viewer: {
    className: "bg-surface-secondary text-text-secondary",
    description:
      "Read-only access to permitted workspace information.",
  },
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeRoleName = (value) => {
  if (!value) return "";

  if (typeof value === "object") {
    return normalizeRoleName(
      value.name || value.roleName || value.role || value.title
    );
  }

  const normalized = String(value).trim().toLowerCase();

  const roleMap = {
    owner: "Owner",
    admin: "Admin",
    administrator: "Admin",
    manager: "Manager",
    analyst: "Analyst",
    viewer: "Viewer",
  };

  return roleMap[normalized] || String(value).trim();
};

const getMemberRoleName = (member) => {
  if (!member) return "";

  return normalizeRoleName(
    member.roleName ||
      member.roleRef?.name ||
      member.role?.name ||
      member.role ||
      member.roleRef ||
      member.systemRole
  );
};

const getMemberIdentity = (member) => {
  return (
    member?.userId ||
    member?.user?.id ||
    member?.id ||
    member?.email ||
    member?.user?.email ||
    null
  );
};

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({ role }) {
  const roleName = normalizeRoleName(role?.name) || "Viewer";
  const config =
    DEFAULT_ROLES[roleName] || DEFAULT_ROLES.Viewer;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {roleName}
    </span>
  );
}

/* =========================================================
   TEAM ROLES
========================================================= */

export default function TeamRoles({
  members = [],
  customRoles = [],
  setCustomRoles,
  currentUser = null,
}) {
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  /*
   * Supports a current user passed directly as an object,
   * or as { user: {...} } / { data: {...} }.
   */
  const ownerUser = useMemo(() => {
    const candidate =
      currentUser?.user ||
      currentUser?.data?.user ||
      currentUser?.data ||
      currentUser;

    if (!candidate || typeof candidate !== "object") {
      return null;
    }

    return candidate;
  }, [currentUser]);

  /*
   * Create the complete role list.
   */
  const allRoles = useMemo(() => {
    const defaultRoles = Object.keys(DEFAULT_ROLES).map(
      (name) => ({
        name,
        isDefault: true,
      })
    );

    const customRoleList = Array.isArray(customRoles)
      ? customRoles.map((role) => ({
          ...role,
          name: normalizeRoleName(role.name),
          isDefault: false,
        }))
      : [];

    const roleNames = new Set(
      defaultRoles.map((role) => role.name.toLowerCase())
    );

    const uniqueCustomRoles = customRoleList.filter((role) => {
      const key = role.name?.toLowerCase();

      if (!key || roleNames.has(key)) {
        return false;
      }

      roleNames.add(key);
      return true;
    });

    return [...defaultRoles, ...uniqueCustomRoles];
  }, [customRoles]);

  /*
   * Count members using different API response shapes.
   *
   * The registered owner might not be included in `members`,
   * so include the current owner separately when necessary.
   */
  const getRoleMemberCount = (roleName) => {
    const targetRole = normalizeRoleName(roleName).toLowerCase();

    const matchingMembers = (Array.isArray(members) ? members : []).filter(
      (member) =>
        getMemberRoleName(member).toLowerCase() === targetRole
    );

    /*
     * Only the Owner role needs the registered account fallback.
     */
    if (targetRole !== "owner" || !ownerUser) {
      return matchingMembers.length;
    }

    const currentUserRole = normalizeRoleName(
      ownerUser.role ||
        ownerUser.roleName ||
        ownerUser.systemRole ||
        ownerUser.roleRef?.name
    );

    if (currentUserRole.toLowerCase() !== "owner") {
      return matchingMembers.length;
    }

    const ownerIdentity = getMemberIdentity(ownerUser);

    /*
     * If the current owner already exists in the member list,
     * do not count them twice.
     */
    const ownerAlreadyCounted = matchingMembers.some((member) => {
      const memberIdentity = getMemberIdentity(member);

      if (ownerIdentity && memberIdentity) {
        return String(ownerIdentity) === String(memberIdentity);
      }

      return false;
    });

    return ownerAlreadyCounted
      ? matchingMembers.length
      : matchingMembers.length + 1;
  };

  /* =========================================================
     MODAL HANDLERS
  ========================================================= */

  const openCreateRoleModal = () => {
    setSelectedRole(null);
    setRoleModalOpen(true);
  };

  const openEditRoleModal = (role) => {
    if (role.isDefault) {
      showErrorToast("Default roles cannot be edited.");
      return;
    }

    setSelectedRole(role);
    setRoleModalOpen(true);
  };

  const closeRoleModal = () => {
    setRoleModalOpen(false);
    setSelectedRole(null);
  };

  const handleCreated = (createdRole) => {
    if (!createdRole) return;

    if (typeof setCustomRoles === "function") {
      setCustomRoles((previousRoles) => {
        const existing = Array.isArray(previousRoles)
          ? previousRoles
          : [];

        const exists = existing.some(
          (role) =>
            (role.id && role.id === createdRole.id) ||
            role.name?.toLowerCase() ===
              createdRole.name?.toLowerCase()
        );

        if (exists) {
          return existing.map((role) =>
            role.id === createdRole.id
              ? { ...role, ...createdRole }
              : role
          );
        }

        return [...existing, createdRole];
      });
    }

    closeRoleModal();
  };

  const handleUpdated = (updatedRole) => {
    if (!updatedRole) return;

    if (typeof setCustomRoles === "function") {
      setCustomRoles((previousRoles) =>
        (Array.isArray(previousRoles) ? previousRoles : []).map(
          (role) =>
            role.id === updatedRole.id
              ? { ...role, ...updatedRole }
              : role
        )
      );
    }

    closeRoleModal();
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Roles & Permissions
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Manage workspace roles and see how many members
              are assigned to each role.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateRoleModal}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <span aria-hidden="true">+</span>
            Create Role
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {allRoles.map((role) => {
            const roleName = normalizeRoleName(role.name);
            const config =
              DEFAULT_ROLES[roleName] || DEFAULT_ROLES.Viewer;

            const count = getRoleMemberCount(roleName);

            const description = role.isDefault
              ? config.description
              : role.description ||
                "Custom workspace role with configured permissions.";

            return (
              <Card
                key={role.id || `default-${roleName}`}
                className="flex h-full flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words text-base font-semibold text-text-primary">
                      {roleName}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {description}
                    </p>
                  </div>

                  <RoleBadge role={{ ...role, name: roleName }} />
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-2xl font-bold text-text-primary">
                      {count}
                    </p>

                    <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                      {count === 1 ? "Member" : "Members"}
                    </p>
                  </div>

                  {!role.isDefault && (
                    <button
                      type="button"
                      onClick={() => openEditRoleModal(role)}
                      className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary"
                    >
                      Edit Role
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {allRoles.length === 0 && (
          <div className="rounded-xl border border-border p-8 text-center">
            <p className="text-sm text-text-secondary">
              No roles available.
            </p>
          </div>
        )}
      </div>

      <CreateRoleModal
        isOpen={roleModalOpen}
        onClose={closeRoleModal}
        role={selectedRole}
        existingRoles={allRoles}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
      />
    </>
  );
}
