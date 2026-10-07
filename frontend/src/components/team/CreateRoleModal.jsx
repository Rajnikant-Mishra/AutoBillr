import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Button from "../../components/ui/Button";
import FormInput from "../../components/ui/FormInput";
import Modal from "../../components/ui/Modal";
import PermissionCheckbox from "../../components/team/PermissionCheckbox";

import {
  showError,
  showSuccess,
} from "../../utils/toast";

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
    items: [
      {
        key: "dashboard:view",
        label: "View dashboard",
      },
    ],
  },

  {
    key: "invoices",
    label: "Invoices",
    items: [
      {
        key: "invoices:view",
        label: "View invoices",
      },
      {
        key: "invoices:create",
        label: "Create invoices",
      },
      {
        key: "invoices:edit",
        label: "Edit invoices",
      },
      {
        key: "invoices:delete",
        label: "Delete invoices",
      },
      {
        key: "invoices:send",
        label: "Send invoices",
      },
      {
        key: "invoices:remind",
        label: "Send reminders",
      },
      {
        key: "invoices:export",
        label: "Export invoices",
      },
    ],
  },

  {
    key: "clients",
    label: "Clients",
    items: [
      {
        key: "clients:view",
        label: "View clients",
      },
      {
        key: "clients:create",
        label: "Create clients",
      },
      {
        key: "clients:edit",
        label: "Edit clients",
      },
      {
        key: "clients:delete",
        label: "Delete clients",
      },
    ],
  },

  {
    key: "projects",
    label: "Projects",
    items: [
      {
        key: "projects:view",
        label: "View projects",
      },
      {
        key: "projects:create",
        label: "Create projects",
      },
      {
        key: "projects:edit",
        label: "Edit projects",
      },
      {
        key: "projects:delete",
        label: "Delete projects",
      },
      {
        key: "projects:milestones",
        label: "Manage milestones",
      },
    ],
  },

  {
    key: "analyticsAutomation",
    label: "Analytics & Automation",
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
    key: "team",
    label: "Team",
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
        label: "Edit members",
      },
      {
        key: "team:remove_member",
        label: "Remove members",
      },
      {
        key: "roles:manage",
        label: "Manage roles",
      },
    ],
  },

  {
    key: "settings",
    label: "Settings",
    items: [
      {
        key: "settings:view",
        label: "View settings",
      },
      {
        key: "settings:business",
        label: "Manage business settings",
      },
      {
        key: "settings:branding",
        label: "Manage branding",
      },
      {
        key: "settings:tax",
        label: "Manage tax settings",
      },
      {
        key: "settings:payments",
        label: "Manage payment settings",
      },
      {
        key: "settings:integrations",
        label: "Manage integrations",
      },
      {
        key: "settings:api",
        label: "Manage API settings",
      },
    ],
  },

  {
    key: "billing",
    label: "Billing",
    items: [
      {
        key: "billing:view",
        label: "View billing",
      },
    ],
  },

  {
    key: "clientPortal",
    label: "Client Portal",
    items: [
      {
        key: "clientportal:view",
        label: "View client portal",
      },
    ],
  },

  {
    key: "pricing",
    label: "Pricing",
    items: [
      {
        key: "pricing:view",
        label: "View pricing",
      },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap(
  (group) => group.items.map((item) => item.key)
);

const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return [
    ...new Set(
      permissions.filter((permission) =>
        ALL_PERMISSION_KEYS.includes(permission)
      )
    ),
  ];
};

export default function CreateRoleModal({
  isOpen,
  onClose,
  role = null,
  existingRoles = [],
  onCreated,
  onUpdated,
}) {
  const isEditMode = Boolean(role?.id);

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [permissions, setPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (isEditMode) {
      setName(role?.name || "");
      setDescription(role?.description || "");
      setPermissions(
        normalizePermissions(role?.permissions)
      );
    } else {
      setName("");
      setDescription("");
      setPermissions([]);
    }
  }, [isOpen, isEditMode, role]);

  const normalizedName = name.trim();

  const duplicateRole = useMemo(() => {
    if (!normalizedName) {
      return false;
    }

    return existingRoles.some((existingRole) => {
      if (
        isEditMode &&
        existingRole.id === role?.id
      ) {
        return false;
      }

      return (
        String(existingRole.name || "")
          .trim()
          .toLowerCase() ===
        normalizedName.toLowerCase()
      );
    });
  }, [
    existingRoles,
    normalizedName,
    isEditMode,
    role?.id,
  ]);

  const togglePermission = (permissionKey) => {
    setPermissions((current) => {
      if (current.includes(permissionKey)) {
        return current.filter(
          (permission) => permission !== permissionKey
        );
      }

      return [...current, permissionKey];
    });
  };

  const selectAllPermissions = () => {
    setPermissions([...ALL_PERMISSION_KEYS]);
  };

  const clearAllPermissions = () => {
    setPermissions([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (!normalizedName) {
      showError("Role name is required.");
      return;
    }

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 50
    ) {
      showError(
        "Role name must be between 2 and 50 characters."
      );
      return;
    }

    if (duplicateRole) {
      showError(
        "A role with this name already exists."
      );
      return;
    }

    setIsSaving(true);

    try {
      const token = getToken();

      const payload = {
        name: normalizedName,
        description:
          description.trim() ||
          "Custom workspace role.",
        permissions:
          normalizePermissions(permissions),
      };

      const url = isEditMode
        ? `${TEAM_API}/roles/${role.id}`
        : `${TEAM_API}/roles`;

      const response = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify(payload),
      });

      let responseData = null;

      try {
        responseData = await response.json();
      } catch {
        responseData = null;
      }

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            responseData?.error ||
            `Request failed with status ${response.status}`
        );
      }

      const savedRole =
        responseData?.data ||
        responseData?.role ||
        responseData;

      if (isEditMode) {
        showSuccess(
          "Role updated successfully."
        );

        if (onUpdated) {
          await onUpdated(savedRole);
        }
      } else {
        showSuccess(
          "Custom role created successfully."
        );

        if (onCreated) {
          await onCreated(savedRole);
        }
      }

      onClose();
    } catch (error) {
      console.error(
        isEditMode
          ? "Update role error:"
          : "Create role error:",
        error
      );

      showError(
        error.message ||
          (isEditMode
            ? "Failed to update role."
            : "Failed to create role.")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCount = permissions.length;
  const totalCount = ALL_PERMISSION_KEYS.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSaving ? undefined : onClose}
      title={
        isEditMode
          ? "Edit role"
          : "Create custom role"
      }
      size="xl"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            label="Role name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="e.g. Finance Assistant"
            disabled={isSaving}
            required
          />

          <FormInput
            label="Description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Describe what this role can do"
            disabled={isSaving}
          />
        </div>

        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Permissions
              </h3>

              <p className="mt-1 text-xs text-text-secondary">
                {selectedCount} of {totalCount}{" "}
                permissions selected.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={selectAllPermissions}
                className="rounded-lg border border-border-light bg-white px-3 py-2 text-xs font-medium text-text-primary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Select all
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={clearAllPermissions}
                className="rounded-lg border border-border-light bg-white px-3 py-2 text-xs font-medium text-text-primary transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="grid max-h-[55vh] grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2">
            {PERMISSION_GROUPS.map((group) => (
              <div
                key={group.key}
                className="rounded-xl border border-border-light bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-text-primary">
                    {group.label}
                  </h4>

                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-text-secondary">
                    {
                      group.items.filter((item) =>
                        permissions.includes(
                          item.key
                        )
                      ).length
                    }
                    /{group.items.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.items.map((permission) => {
                    const checked =
                      permissions.includes(
                        permission.key
                      );

                    return (
                      <PermissionCheckbox
                        key={permission.key}
                        checked={checked}
                        disabled={isSaving}
                        label={permission.label}
                        onChange={() =>
                          togglePermission(
                            permission.key
                          )
                        }
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {duplicateRole && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            A role with this name already exists.
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 border-t border-border-light pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSaving ||
              !normalizedName ||
              duplicateRole
            }
          >
            {isSaving
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update role"
              : "Create role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}