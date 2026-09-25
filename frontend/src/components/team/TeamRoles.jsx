import {
  useMemo,
  useState,
} from "react";

import Card from "../../components/ui/Card";

import {
  showErrorToast,
} from "../../components/ui/CustomToast";

import CreateRoleModal from "./CreateRoleModal";

const DEFAULT_ROLES = {
  Owner: {
    className:
      "bg-danger-soft text-danger",

    description:
      "Full workspace ownership and administrative access.",
  },

  Admin: {
    className:
      "bg-warning-soft text-warning",

    description:
      "Manage workspace settings, members and billing.",
  },

  Manager: {
    className:
      "bg-info-soft text-info",

    description:
      "Manage projects, clients and operational workflows.",
  },

  Analyst: {
    className:
      "bg-primary-soft text-primary",

    description:
      "View reports, analytics and business information.",
  },

  Viewer: {
    className:
      "bg-surface-secondary text-text-secondary",

    description:
      "Read-only access to permitted workspace information.",
  },
};

function RoleBadge({ role }) {
  const config =
    DEFAULT_ROLES[role?.name] ||
    DEFAULT_ROLES.Viewer;

  return (
    <span
      className={`
        inline-flex
        items-center
        px-2.5
        py-1
        text-[11px]
        font-bold
        rounded-full
        uppercase
        tracking-wider
        whitespace-nowrap
        ${config.className}
      `}
    >
      {role?.name || "Viewer"}
    </span>
  );
}

export default function TeamRoles({
  members = [],
  customRoles = [],
  setCustomRoles,
}) {
  const [roleModalOpen, setRoleModalOpen] =
    useState(false);

  const [selectedRole, setSelectedRole] =
    useState(null);

  /* =========================================================
     ALL ROLES
  ========================================================= */

  const allRoles = useMemo(() => {
    return [
      ...Object.keys(DEFAULT_ROLES).map(
        (name) => ({
          name,
          isDefault: true,
        })
      ),

      ...customRoles.map((role) => ({
        ...role,
        isDefault: false,
      })),
    ];
  }, [customRoles]);

  /* =========================================================
     OPEN CREATE
  ========================================================= */

  const openCreateRole = () => {
    setSelectedRole(null);
    setRoleModalOpen(true);
  };

  /* =========================================================
     OPEN EDIT
  ========================================================= */

  const openEditRole = (role) => {
    /*
      IMPORTANT:

      Default roles cannot be edited from
      CreateRoleModal because they don't have
      a custom database ID.

      Only custom roles open the edit modal.
    */

    if (role.isDefault) {
      showErrorToast(
        "Default workspace roles cannot be edited."
      );
      return;
    }

    setSelectedRole(role);
    setRoleModalOpen(true);
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  const closeRoleModal = () => {
    setRoleModalOpen(false);
    setSelectedRole(null);
  };

  /* =========================================================
     CREATE CALLBACK
  ========================================================= */

  const handleCreated = (newRole) => {
    if (!newRole) return;

    setCustomRoles?.((current) => [
      ...current,
      newRole,
    ]);
  };

  /* =========================================================
     UPDATE CALLBACK
  ========================================================= */

  const handleUpdated = (updatedRole) => {
    if (!updatedRole) return;

    setCustomRoles?.((current) =>
      current.map((role) =>
        role.id === updatedRole.id
          ? updatedRole
          : role
      )
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-5
      ">
        {allRoles.map((role) => {
          const count = members.filter(
            (member) =>
              member.role === role.name
          ).length;

          const description =
            role.isDefault
              ? DEFAULT_ROLES[
                  role.name
                ]?.description
              : role.description;

          return (
            <Card
              key={
                role.id ||
                `default-${role.name}`
              }
              className="
                min-h-[260px]
                flex
                flex-col
                p-5
              "
            >
              {/* =================================================
                  HEADER
              ================================================= */}

              <div className="
                flex
                items-center
                justify-between
                mb-5
              ">
                <RoleBadge role={role} />

                <button
                  type="button"
                  onClick={() =>
                    openEditRole(role)
                  }
                  className="
                    p-1
                    rounded-md
                    text-text-light
                    hover:text-text
                    hover:bg-surface-hover
                    transition
                  "
                  title={
                    role.isDefault
                      ? "Default role"
                      : "Edit role"
                  }
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                    }}
                  >
                    {role.isDefault
                      ? "more_vert"
                      : "edit"}
                  </span>
                </button>
              </div>

              {/* =================================================
                  COUNT
              ================================================= */}

              <div className="
                text-3xl
                font-bold
                text-text
              ">
                {count}
              </div>

              <div className="
                text-[11px]
                font-bold
                text-text-light
                uppercase
                tracking-widest
                mt-1
              ">
                MEMBERS
              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <p className="
                text-sm
                text-text-muted
                leading-6
                mt-5
                flex-1
              ">
                {description ||
                  "Custom workspace role."}
              </p>

              {/* =================================================
                  EDIT BUTTON
              ================================================= */}

              {!role.isDefault && (
                <button
                  type="button"
                  onClick={() =>
                    openEditRole(role)
                  }
                  className="
                    mx-auto
                    flex
                    items-center
                    justify-center
                    gap-1
                    rounded-lg
                    px-3
                    py-1
                    mt-3
                    text-xs
                    font-bold
                    text-primary
                    transition-all
                    duration-200
                    hover:bg-primary-light
                    hover:text-primary-hover
                  "
                >
                  <span className="
                    material-symbols-outlined
                    text-[16px]
                  ">
                    edit
                  </span>

                  Edit Role
                </button>
              )}
            </Card>
          );
        })}

        {/* =====================================================
            CREATE CUSTOM ROLE
        ===================================================== */}

        <button
          type="button"
          onClick={openCreateRole}
          className="
            bg-surface
            rounded-xl
            border-2
            border-dashed
            border-border
            min-h-[260px]
            flex
            flex-col
            items-center
            justify-center
            text-primary
            hover:border-primary
            hover:bg-primary-soft
            transition
            group
          "
        >
          <div className="
            w-12
            h-12
            rounded-full
            border-2
            border-primary
            grid
            place-items-center
            mb-4
            group-hover:scale-105
            transition
          ">
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 26,
              }}
            >
              add
            </span>
          </div>

          <span className="
            text-base
            font-semibold
          ">
            Create custom role
          </span>

          <span className="
            text-xs
            text-text-muted
            mt-1
          ">
            Define your own permissions
          </span>
        </button>
      </div>

      {/* =====================================================
          CREATE / EDIT ROLE MODAL
      ===================================================== */}

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