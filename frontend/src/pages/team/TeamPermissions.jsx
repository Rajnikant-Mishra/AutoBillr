import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import SectionHeader from "../../components/ui/SectionHeader";
import StatCard from "../../components/ui/StatCard";
import { showErrorToast } from "../../components/ui/CustomToast";

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
   MAIN
========================================================= */

export default function TeamPermissions() {
  /* =========================================================
     STATE
  ========================================================= */

  const [members, setMembers] = useState([]);

  // Custom roles created in Roles section
  const [customRoles, setCustomRoles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("Members");

  const [inviteOpen, setInviteOpen] = useState(false);

  /* =========================================================
     LOAD MEMBERS
  ========================================================= */

  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await fetch(TEAM_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const text = await res.text();

      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
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
      console.error("Load members error:", error);

      setMembers([]);

      showErrorToast(
        error?.message ||
          "Failed to load team members"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* =========================================================
     LOAD CUSTOM ROLES
  ========================================================= */

  const loadCustomRoles = useCallback(async () => {
    try {
      const res = await fetch(
        `${TEAM_API}/roles`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const text = await res.text();

      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          "Invalid server response while loading roles."
        );
      }

      if (!res.ok || !result?.success) {
        throw new Error(
          result?.message ||
            "Failed to load custom roles"
        );
      }

      setCustomRoles(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "Load custom roles error:",
        error
      );

      // Don't crash the page if roles fail
      setCustomRoles([]);
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
     ROLE CREATED
  ========================================================= */

  const handleRoleCreated = useCallback(
    (newRole) => {
      if (!newRole) return;

      setCustomRoles((currentRoles) => {
        const exists = currentRoles.some(
          (role) => role.id === newRole.id
        );

        if (exists) {
          return currentRoles;
        }

        return [
          ...currentRoles,
          newRole,
        ];
      });
    },
    []
  );

  /* =========================================================
     ROLE UPDATED
  ========================================================= */

  const handleRoleUpdated = useCallback(
    (updatedRole) => {
      if (!updatedRole) return;

      setCustomRoles((currentRoles) =>
        currentRoles.map((role) =>
          role.id === updatedRole.id
            ? updatedRole
            : role
        )
      );
    },
    []
  );

  /* =========================================================
     ROLE DELETED
  ========================================================= */

  const handleRoleDeleted = useCallback(
    (roleId) => {
      if (!roleId) return;

      setCustomRoles((currentRoles) =>
        currentRoles.filter(
          (role) => role.id !== roleId
        )
      );
    },
    []
  );

  /* =========================================================
     STATS
  ========================================================= */

  const activeMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          String(
            member.status
          ).toLowerCase() === "active"
      ).length,
    [members]
  );

  const pendingMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          String(
            member.status
          ).toLowerCase() === "pending"
      ).length,
    [members]
  );

  /*
    Five predefined roles:

    Owner
    Admin
    Manager
    Analyst
    Viewer

    + custom roles
  */

  const totalRoles =
    5 + customRoles.length;

  /* =========================================================
     MEMBER INVITED
  ========================================================= */

  const handleMemberInvited = async (
    payload
  ) => {
    try {
      const invitedMember =
        payload?.data ||
        payload?.member;

      if (invitedMember?.id) {
        setMembers((current) => {
          const alreadyExists =
            current.some(
              (member) =>
                member.id ===
                invitedMember.id
            );

          if (alreadyExists) {
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
      console.error(
        "Handle member invited error:",
        error
      );

      showErrorToast(
        error?.message ||
          "Failed to refresh team members"
      );
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main
      className="
        flex-1
        pt-2
        pb-12
        max-w-[1600px]
        mx-auto
        w-full
        scroll-host
      "
    >
      <div
        className="
          page-in
          w-full
          min-w-0
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <SectionHeader
          title="Team & Permissions"
          description="
            Manage who has access to your AutoBillr
            workspace and what they can do.
          "
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

        {/* ===================================================
            STAT CARDS
        =================================================== */}

        <div
          className="
            grid
            grid-cols-2
            lg:grid-cols-4
            gap-4
            mb-6
            w-full
          "
        >
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
            badgeColor="
              bg-surface-secondary
              text-text-muted
            "
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
            badgeColor="
              bg-surface-secondary
              text-text-muted
            "
            icon="key"
            iconColor="text-primary"
            variant="dashboard"
          />
        </div>

        {/* ===================================================
            TABS
        =================================================== */}

        <div className="mb-5 overflow-x-auto">
          <div
            className="
              inline-flex
              p-1
              bg-surface-secondary
              rounded-lg
              gap-1
              min-w-max
            "
          >
            {[
              {
                label: "Members",
                count: members.length,
              },
              {
                label: "Roles",
                count: totalRoles,
              },
              {
                label: "Permissions",
              },
              {
                label: "Audit log",
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
                    px-3.5
                    py-1.5
                    rounded-md
                    text-[12.5px]
                    font-semibold
                    transition
                    whitespace-nowrap
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
                        ml-1.5
                        text-[10px]
                        tabular-nums
                        px-1.5
                        py-0.5
                        rounded-full
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

        {/* ===================================================
            MEMBERS
        =================================================== */}

        {activeTab ===
          "Members" && (
          <TeamMemberTable
            members={members}
            setMembers={setMembers}
            customRoles={
              customRoles
            }
          />
        )}

        {/* ===================================================
            ROLES
        =================================================== */}

        {activeTab === "Roles" && (
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

        {/* ===================================================
            PERMISSIONS
        =================================================== */}

        {activeTab ===
          "Permissions" && (
          <div
            className="
              bg-surface
              rounded-xl
              shadow-sm
              border border-border-light
              p-6
            "
          >
            <h2
              className="
                text-lg
                font-bold
                text-text
              "
            >
              Permissions
            </h2>

            <p
              className="
                text-sm
                text-text-muted
                mt-1
              "
            >
              Configure what each role
              can access inside your
              AutoBillr workspace.
            </p>

            <div
              className="
                mt-6
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              "
            >
              {[
                "Manage invoices",
                "Manage clients",
                "Manage projects",
                "View analytics",
                "Manage billing",
                "Manage team members",
                "Edit workspace settings",
                "View audit logs",
              ].map(
                (permission) => (
                  <div
                    key={permission}
                    className="
                      flex
                      items-center
                      justify-between
                      p-4
                      rounded-lg
                      bg-surface-secondary
                      border border-border-light
                    "
                  >
                    <span
                      className="
                        text-sm
                        font-medium
                        text-text-secondary
                      "
                    >
                      {permission}
                    </span>

                    <span
                      className="
                        material-symbols-outlined
                        text-primary
                      "
                      style={{
                        fontSize: 20,
                      }}
                    >
                      check_circle
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ===================================================
            AUDIT LOG
        =================================================== */}

        {activeTab ===
          "Audit log" && (
          <TeamAuditLog />
        )}
      </div>

      {/* =====================================================
          INVITATION DRAWER
      ===================================================== */}

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