
// import { useEffect, useState } from "react";

// import Button from "../../components/ui/Button";
// import FormInput from "../../components/ui/FormInput";
// import Modal from "../../components/ui/Modal";

// import {
//   showSuccessToast,
//   showErrorToast,
// } from "../../components/ui/CustomToast";

// const API_BASE = (
//   import.meta.env.VITE_API_URL ||
//   "http://localhost:5000/api/v1"
// ).replace(/\/$/, "");

// const TEAM_API = `${API_BASE}/team`;

// // =====================================================
// // AUTH TOKEN HELPER
// // =====================================================

// const getAuthToken = () => {
//   const plain = localStorage.getItem("token");
//   if (plain && plain.startsWith("ey")) return plain;

//   const auth = localStorage.getItem("autobiller-auth");
//   if (!auth) return null;

//   if (auth.startsWith("ey")) return auth;

//   try {
//     const parsed = JSON.parse(auth);
//     return parsed?.state?.token || parsed?.token || null;
//   } catch {
//     return null;
//   }
// };

// export default function CreateRoleModal({
//   isOpen,
//   onClose,
//   role = null,
//   existingRoles = [],
//   onCreated,
//   onUpdated,
// }) {
//   const isEditMode = Boolean(role?.id);

//   const [form, setForm] = useState({
//     name: "",
//     description: "",
//   });

//   const [isSaving, setIsSaving] = useState(false);

//   useEffect(() => {
//     if (!isOpen) return;

//     if (isEditMode) {
//       setForm({
//         name: role?.name || "",
//         description: role?.description || "",
//       });
//     } else {
//       setForm({
//         name: "",
//         description: "",
//       });
//     }
//   }, [isOpen, isEditMode, role]);

//   const handleClose = () => {
//     if (isSaving) return;

//     setForm({
//       name: "",
//       description: "",
//     });

//     onClose?.();
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const name = form.name.trim();
//     const description = form.description.trim();

//     if (!name) {
//       showErrorToast("Please enter a role name.");
//       return;
//     }

//     if (name.length < 2) {
//       showErrorToast("Role name must contain at least 2 characters.");
//       return;
//     }

//     if (name.length > 50) {
//       showErrorToast("Role name cannot exceed 50 characters.");
//       return;
//     }

//     const duplicate = existingRoles.some((item) => {
//       if (isEditMode && item.id === role.id) return false;

//       return (
//         String(item.name || "")
//           .trim()
//           .toLowerCase() === name.toLowerCase()
//       );
//     });

//     if (duplicate) {
//       showErrorToast("A role with this name already exists.");
//       return;
//     }

//     const token = getAuthToken();
//     if (!token) {
//       showErrorToast("Session expired. Please login again.");
//       return;
//     }

//     try {
//       setIsSaving(true);

//       const url = isEditMode
//         ? `${TEAM_API}/roles/${role.id}`
//         : `${TEAM_API}/roles`;

//       const method = isEditMode ? "PATCH" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           name,
//           description: description || "Custom workspace role.",
//         }),
//       });

//       const text = await res.text();
//       let result = {};

//       try {
//         result = text ? JSON.parse(text) : {};
//       } catch {
//         throw new Error("Invalid server response. Please check the backend.");
//       }

//       if (!res.ok || !result?.success) {
//         throw new Error(
//           result?.message ||
//             (isEditMode ? "Failed to update role" : "Failed to create role")
//         );
//       }

//       if (isEditMode) {
//         const updatedRole = result?.data;
//         onUpdated?.(updatedRole);
//         showSuccessToast("Role updated", `${name} has been updated successfully.`);
//       } else {
//         const newRole = result?.data;
//         onCreated?.(newRole);
//         showSuccessToast("Role created", `${name} has been created successfully.`);
//       }

//       handleClose();
//     } catch (error) {
//       console.error("Role save error:", error);
//       showErrorToast(
//         error?.message ||
//           (isEditMode ? "Failed to update role" : "Failed to create role")
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <Modal
//       isOpen={isOpen}
//       onClose={handleClose}
//       title={isEditMode ? "Edit Role" : "Create Custom Role"}
//       size="sm"
//       position="right-modal"
//     >
//       <form onSubmit={handleSubmit} className="space-y-5">
//         <FormInput
//           label="Role Name"
//           icon="admin_panel_settings"
//           value={form.name}
//           placeholder="e.g. Finance Executive"
//           onChange={(event) =>
//             setForm((current) => ({
//               ...current,
//               name: event.target.value,
//             }))
//           }
//           maxLength={50}
//           disabled={isSaving}
//           autoFocus
//         />

//         <div className="flex justify-between -mt-3">
//           <span className="text-[11px] text-text-muted">
//             Choose a unique role name.
//           </span>
//           <span className="text-[11px] text-text-light">
//             {form.name.length}/50
//           </span>
//         </div>

//         <div>
//           <label
//             htmlFor="role-description"
//             className="block text-sm font-medium text-text-secondary mb-2"
//           >
//             Description
//           </label>

//           <textarea
//             id="role-description"
//             value={form.description}
//             onChange={(event) =>
//               setForm((current) => ({
//                 ...current,
//                 description: event.target.value,
//               }))
//             }
//             placeholder="Describe what this role is responsible for..."
//             rows={4}
//             maxLength={200}
//             disabled={isSaving}
//             className="
//               w-full px-3 py-2.5 rounded-lg border border-border
//               bg-surface text-sm text-text outline-none resize-none transition
//               placeholder:text-text-light
//               focus:border-primary focus:ring-2 focus:ring-[rgba(15,157,148,0.15)]
//               disabled:opacity-60 disabled:cursor-not-allowed
//             "
//           />

//           <div className="flex justify-end mt-1.5">
//             <span className="text-[11px] text-text-light">
//               {form.description.length}/200
//             </span>
//           </div>
//         </div>

//         <div className="flex gap-3 p-3.5 rounded-lg bg-primary-soft border border-primary/10">
//           <span
//             className="material-symbols-outlined text-primary shrink-0"
//             style={{ fontSize: 20 }}
//           >
//             info
//           </span>
//           <p className="text-xs text-text-secondary leading-5">
//             {isEditMode
//               ? "Update the role name or description. Existing members assigned to this role will continue using this role."
//               : "Custom roles let you define workspace-specific responsibilities. You can configure permissions for this role later."}
//           </p>
//         </div>

//         <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
//           <Button
//             type="button"
//             variant="secondary"
//             onClick={handleClose}
//             disabled={isSaving}
//           >
//             Cancel
//           </Button>

//           <Button type="submit" variant="primary" disabled={isSaving}>
//             {isSaving
//               ? isEditMode
//                 ? "Saving..."
//                 : "Creating..."
//               : isEditMode
//               ? "Save Changes"
//               : "Create Role"}
//           </Button>
//         </div>
//       </form>
//     </Modal>
//   );
// }





import { useEffect, useMemo, useState } from "react";

import Button from "../../components/ui/Button";
import FormInput from "../../components/ui/FormInput";
import Modal from "../../components/ui/Modal";
import {
  showSuccessToast,
  showErrorToast,
} from "../../components/ui/CustomToast";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const TEAM_API = `${API_BASE}/team`;

/* =====================================================
   AUTH TOKEN HELPER
===================================================== */

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

/* =====================================================
   PERMISSION CATALOG
===================================================== */

const PERMISSION_GROUPS = [
  {
    title: "Dashboard",
    items: [
      {
        key: "dashboard:view",
        label: "View dashboard",
      },
    ],
  },

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
    title: "Team",
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
    ],
  },

  {
    title: "Settings",
    items: [
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
    ],
  },

  {
    title: "Client Portal",
    items: [
      {
        key: "clientportal:view",
        label: "View client portal",
      },
    ],
  },

  {
    title: "Pricing",
    items: [
      {
        key: "pricing:view",
        label: "View pricing",
      },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((group) =>
  group.items.map((item) => item.key),
);

/* =====================================================
   COMPONENT
===================================================== */

export default function CreateRoleModal({
  isOpen,
  onClose,
  role = null,
  existingRoles = [],
  onCreated,
  onUpdated,
}) {
  const isEditMode = Boolean(role?.id);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [permissions, setPermissions] = useState([]);

  const [isSaving, setIsSaving] = useState(false);

  /* =====================================================
     INITIALIZE FORM
  ===================================================== */

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode) {
      setForm({
        name: role?.name || "",
        description: role?.description || "",
      });

      setPermissions(
        Array.isArray(role?.permissions)
          ? [...new Set(role.permissions)]
          : [],
      );
    } else {
      setForm({
        name: "",
        description: "",
      });

      setPermissions([]);
    }
  }, [isOpen, isEditMode, role]);

  /* =====================================================
     SELECTED COUNT
  ===================================================== */

  const selectedPermissionCount = permissions.length;

  const allPermissionsSelected = useMemo(() => {
    return (
      ALL_PERMISSION_KEYS.length > 0 &&
      ALL_PERMISSION_KEYS.every((permission) =>
        permissions.includes(permission),
      )
    );
  }, [permissions]);

  /* =====================================================
     TOGGLE PERMISSION
  ===================================================== */

  const togglePermission = (permission) => {
    setPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter((item) => item !== permission);
      }

      return [...current, permission];
    });
  };

  /* =====================================================
     TOGGLE GROUP
  ===================================================== */

  const toggleGroup = (group) => {
    const groupPermissions = group.items.map((item) => item.key);

    const groupSelected = groupPermissions.every((permission) =>
      permissions.includes(permission),
    );

    setPermissions((current) => {
      if (groupSelected) {
        return current.filter(
          (permission) => !groupPermissions.includes(permission),
        );
      }

      return [
        ...new Set([
          ...current,
          ...groupPermissions,
        ]),
      ];
    });
  };

  /* =====================================================
     SELECT / CLEAR ALL
  ===================================================== */

  const toggleAllPermissions = () => {
    if (allPermissionsSelected) {
      setPermissions([]);
      return;
    }

    setPermissions([...ALL_PERMISSION_KEYS]);
  };

  /* =====================================================
     CLOSE
  ===================================================== */

  const handleClose = () => {
    if (isSaving) return;

    setForm({
      name: "",
      description: "",
    });

    setPermissions([]);

    onClose?.();
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      showErrorToast("Please enter a role name.");
      return;
    }

    if (name.length < 2) {
      showErrorToast(
        "Role name must contain at least 2 characters.",
      );
      return;
    }

    if (name.length > 50) {
      showErrorToast(
        "Role name cannot exceed 50 characters.",
      );
      return;
    }

    const duplicate = existingRoles.some((item) => {
      if (
        isEditMode &&
        String(item.id) === String(role.id)
      ) {
        return false;
      }

      return (
        String(item.name || "")
          .trim()
          .toLowerCase() === name.toLowerCase()
      );
    });

    if (duplicate) {
      showErrorToast(
        "A role with this name already exists.",
      );
      return;
    }

    const token = getAuthToken();

    if (!token) {
      showErrorToast(
        "Session expired. Please login again.",
      );
      return;
    }

    try {
      setIsSaving(true);

      const url = isEditMode
        ? `${TEAM_API}/roles/${role.id}`
        : `${TEAM_API}/roles`;

      const method = isEditMode ? "PATCH" : "POST";

      const cleanPermissions = [
        ...new Set(
          permissions.filter(Boolean),
        ),
      ];

      const res = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name,

          description:
            description ||
            "Custom workspace role.",

          permissions: cleanPermissions,
        }),
      });

      const text = await res.text();

      let result = {};

      try {
        result = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "Invalid server response. Please check the backend.",
        );
      }

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.message ||
            (isEditMode
              ? "Failed to update role"
              : "Failed to create role"),
        );
      }

      if (isEditMode) {
        const updatedRole = result?.data;

        onUpdated?.({
          ...updatedRole,
          permissions: cleanPermissions,
        });

        showSuccessToast(
          "Role updated",
          `${name} has been updated successfully.`,
        );
      } else {
        const newRole = result?.data;

        onCreated?.({
          ...newRole,
          permissions: cleanPermissions,
        });

        showSuccessToast(
          "Role created",
          `${name} has been created successfully.`,
        );
      }

      handleClose();
    } catch (error) {
      console.error(
        "Role save error:",
        error,
      );

      showErrorToast(
        error?.message ||
          (isEditMode
            ? "Failed to update role"
            : "Failed to create role"),
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        isEditMode
          ? "Edit Role"
          : "Create Custom Role"
      }
      size="lg"
      position="right-modal"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* ROLE NAME */}

        <FormInput
          label="Role Name"
          icon="admin_panel_settings"
          value={form.name}
          placeholder="e.g. Finance Executive"
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              name: event.target.value,
            }))
          }
          maxLength={50}
          disabled={isSaving}
          autoFocus
        />

        <div className="flex justify-between -mt-3">
          <span className="text-[11px] text-text-muted">
            Choose a unique role name.
          </span>

          <span className="text-[11px] text-text-light">
            {form.name.length}/50
          </span>
        </div>

        {/* DESCRIPTION */}

        <div>
          <label
            htmlFor="role-description"
            className="block text-sm font-medium text-text-secondary mb-2"
          >
            Description
          </label>

          <textarea
            id="role-description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description:
                  event.target.value,
              }))
            }
            placeholder="Describe what this role is responsible for..."
            rows={3}
            maxLength={200}
            disabled={isSaving}
            className="
              w-full px-3 py-2.5 rounded-lg
              border border-border
              bg-surface text-sm text-text
              outline-none resize-none transition
              placeholder:text-text-light
              focus:border-primary
              focus:ring-2
              focus:ring-[rgba(15,157,148,0.15)]
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          />

          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-text-light">
              {form.description.length}/200
            </span>
          </div>
        </div>

        {/* PERMISSIONS */}

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-surface-muted border-b border-border flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-text">
                Permissions
              </h3>

              <p className="text-xs text-text-muted mt-0.5">
                Choose what this role can access.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleAllPermissions}
              disabled={isSaving}
              className="
                text-xs font-medium
                text-primary
                hover:underline
                disabled:opacity-50
              "
            >
              {allPermissionsSelected
                ? "Clear all"
                : "Select all"}
            </button>
          </div>

          <div className="px-4 py-3 border-b border-border-light bg-primary-soft">
            <span className="text-xs text-text-secondary">
              <strong>
                {selectedPermissionCount}
              </strong>{" "}
              permission
              {selectedPermissionCount === 1
                ? ""
                : "s"} selected
            </span>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-4 space-y-5">
            {PERMISSION_GROUPS.map((group) => {
              const groupKeys =
                group.items.map(
                  (item) => item.key,
                );

              const groupSelected =
                groupKeys.length > 0 &&
                groupKeys.every(
                  (permission) =>
                    permissions.includes(
                      permission,
                    ),
                );

              const groupPartial =
                !groupSelected &&
                groupKeys.some(
                  (permission) =>
                    permissions.includes(
                      permission,
                    ),
                );

              return (
                <div
                  key={group.title}
                  className="space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                      {group.title}
                    </h4>

                    <button
                      type="button"
                      onClick={() =>
                        toggleGroup(group)
                      }
                      disabled={isSaving}
                      className="
                        text-[11px]
                        font-medium
                        text-primary
                        hover:underline
                        disabled:opacity-50
                      "
                    >
                      {groupSelected
                        ? "Clear"
                        : groupPartial
                        ? "Select remaining"
                        : "Select all"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {group.items.map(
                      (permission) => {
                        const checked =
                          permissions.includes(
                            permission.key,
                          );

                        return (
                          <label
                            key={permission.key}
                            className={`
                              flex items-center gap-3
                              p-2.5 rounded-lg
                              border cursor-pointer
                              transition
                              ${
                                checked
                                  ? "border-primary/30 bg-primary-soft"
                                  : "border-border-light hover:border-border"
                              }
                              ${
                                isSaving
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isSaving}
                              onChange={() =>
                                togglePermission(
                                  permission.key,
                                )
                              }
                              className="
                                h-4 w-4
                                rounded
                                border-border
                                text-primary
                                focus:ring-primary
                              "
                            />

                            <span className="text-xs text-text-secondary">
                              {permission.label}
                            </span>
                          </label>
                        );
                      },
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* INFORMATION */}

        <div className="flex gap-3 p-3.5 rounded-lg bg-primary-soft border border-primary/10">
          <span
            className="material-symbols-outlined text-primary shrink-0"
            style={{ fontSize: 20 }}
          >
            info
          </span>

          <p className="text-xs text-text-secondary leading-5">
            {isEditMode
              ? "Update the role details and permissions. Members assigned to this role will use the updated permissions."
              : "Select the permissions this custom role should have. These permissions will be saved with the role and applied when the role is assigned to a team member."}
          </p>
        </div>

        {/* BUTTONS */}

        <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
          >
            {isSaving
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
              ? "Save Changes"
              : "Create Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}