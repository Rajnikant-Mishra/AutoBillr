import { useMemo, useState } from "react";

import SectionHeader from "../../components/ui/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import FormInput from "../../components/ui/FormInput";

import {
  showSuccessToast,
  showErrorToast,
} from "../../components/ui/CustomToast";
import MemberInvitationDrawer from "../../components/team/MemberInvitationDrawer";

/* =========================================================
   SAMPLE TEAM MEMBERS
========================================================= */

const INITIAL_MEMBERS = [
  {
    id: 1,
    name: "Alex Sterling",
    email: "alex@autobillr.io",
    role: "Owner",
    status: "active",
    lastLogin: "Just now",
    avatar: "https://i.pravatar.cc/40?img=12",
  },
  {
    id: 2,
    name: "Marcus Chen",
    email: "marcus@autobillr.io",
    role: "Admin",
    status: "active",
    lastLogin: "5 min ago",
    avatar: "https://i.pravatar.cc/40?img=24",
  },
  {
    id: 3,
    name: "Sarah Park",
    email: "sarah@autobillr.io",
    role: "Manager",
    status: "active",
    lastLogin: "1 hr ago",
    avatar: "https://i.pravatar.cc/40?img=47",
  },
  {
    id: 4,
    name: "Diego Ruiz",
    email: "diego@autobillr.io",
    role: "Analyst",
    status: "active",
    lastLogin: "Yesterday",
    avatar: "https://i.pravatar.cc/40?img=56",
  },
  {
    id: 5,
    name: "Aria Singh",
    email: "aria@autobillr.io",
    role: "Viewer",
    status: "pending",
    lastLogin: "—",
    avatar: "https://i.pravatar.cc/40?img=33",
  },
  {
    id: 6,
    name: "Liam O'Connor",
    email: "liam@autobillr.io",
    role: "Analyst",
    status: "inactive",
    lastLogin: "3 weeks",
    avatar: "https://i.pravatar.cc/40?img=60",
  },
  {
    id: 7,
    name: "Emma Wilson",
    email: "emma@autobillr.io",
    role: "Manager",
    status: "active",
    lastLogin: "2 hrs ago",
    avatar: "https://i.pravatar.cc/40?img=44",
  },
  {
    id: 8,
    name: "Noah Brown",
    email: "noah@autobillr.io",
    role: "Viewer",
    status: "active",
    lastLogin: "4 hrs ago",
    avatar: "https://i.pravatar.cc/40?img=11",
  },
  {
    id: 9,
    name: "Olivia Davis",
    email: "olivia@autobillr.io",
    role: "Analyst",
    status: "active",
    lastLogin: "Today",
    avatar: "https://i.pravatar.cc/40?img=32",
  },
  {
    id: 10,
    name: "James Miller",
    email: "james@autobillr.io",
    role: "Admin",
    status: "active",
    lastLogin: "Today",
    avatar: "https://i.pravatar.cc/40?img=15",
  },
  {
    id: 11,
    name: "Sophia Taylor",
    email: "sophia@autobillr.io",
    role: "Viewer",
    status: "inactive",
    lastLogin: "1 month",
    avatar: "https://i.pravatar.cc/40?img=49",
  },
  {
    id: 12,
    name: "Ethan Anderson",
    email: "ethan@autobillr.io",
    role: "Analyst",
    status: "active",
    lastLogin: "Yesterday",
    avatar: "https://i.pravatar.cc/40?img=13",
  },
];

/* =========================================================
   ROLE CONFIG  (uses design-system colors)
========================================================= */

const ROLE_CONFIG = {
  Owner: {
    className: "bg-danger-soft text-danger",
  },
  Admin: {
    className: "bg-warning-soft text-warning",
  },
  Manager: {
    className: "bg-info-soft text-info",
  },
  Analyst: {
    className: "bg-primary-soft text-primary",
  },
  Viewer: {
    className: "bg-surface-secondary text-text-secondary",
  },
};

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.Viewer;

  return (
    <span
      className={`
        inline-flex items-center
        px-2.5 py-1
        text-[11px] font-bold
        rounded-full uppercase tracking-wider
        whitespace-nowrap
        ${config.className}
      `}
    >
      {role}
    </span>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const config = {
    active: {
      wrapper: "bg-primary-soft text-primary",
      dot: "bg-primary",
      label: "active",
    },
    pending: {
      wrapper: "bg-warning-soft text-warning",
      dot: "bg-warning",
      label: "pending",
    },
    inactive: {
      wrapper: "bg-surface-secondary text-text-muted",
      dot: "bg-text-light",
      label: "inactive",
    },
  };

  const current = config[status] || config.inactive;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-full
        text-[11px] font-bold uppercase tracking-wider
        whitespace-nowrap
        ${current.wrapper}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {current.label}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function TeamStatCard({
  icon,
  iconWrapper,
  iconColor,
  badge,
  badgeClass,
  label,
  value,
  description,
}) {
  return (
    <div className="bg-surface p-5 rounded-xl shadow-sm border border-border-light min-w-0">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`
            w-9 h-9 rounded-lg grid place-items-center
            ${iconWrapper} ${iconColor}
          `}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {icon}
          </span>
        </div>

        {badge && (
          <span
            className={`
              text-[11px] font-bold px-2 py-0.5 rounded-full
              ${badgeClass}
            `}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="text-[11px] font-bold text-text-light uppercase tracking-widest mb-1">
        {label}
      </div>

      <div className="text-2xl md:text-3xl font-bold text-text tabular-nums">
        {value}
      </div>

      {description && (
        <div className="text-[11.5px] text-text-muted mt-2">{description}</div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function TeamPermissions() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [activeTab, setActiveTab] = useState("Members");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Viewer",
  });

  const [editRole, setEditRole] = useState("Viewer");

  /* =======================================================
     SORTING
  ======================================================= */

  const [sortBy, setSortBy] = useState({
    field: "name",
    direction: "asc",
  });

  const sortedMembers = useMemo(() => {
    const sorted = [...members];

    sorted.sort((a, b) => {
      const aValue = String(a[sortBy.field] || "").toLowerCase();
      const bValue = String(b[sortBy.field] || "").toLowerCase();

      if (aValue < bValue) return sortBy.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortBy.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [members, sortBy]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 6,
  });

  /* =======================================================
     HANDLE SORT
  ======================================================= */

  const handleSort = (field) => {
    setSortBy((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  /* =======================================================
     INVITE MEMBER
  ======================================================= */

  const handleInvite = () => {
    const name = inviteForm.name.trim();
    const email = inviteForm.email.trim();

    if (!name || !email) {
      showErrorToast("Please enter the member name and email.");
      return;
    }

    const newMember = {
      id: Date.now(),
      name,
      email,
      role: inviteForm.role,
      status: "pending",
      lastLogin: "—",
      avatar: `https://i.pravatar.cc/40?u=${encodeURIComponent(email)}`,
    };

    setMembers((current) => [newMember, ...current]);

    setInviteForm({ name: "", email: "", role: "Viewer" });
    setInviteOpen(false);

    setPagination((current) => ({ ...current, pageIndex: 0 }));

    showSuccessToast(
      "Invitation sent",
      `${email} has been invited to the workspace.`
    );
  };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEdit = (member) => {
    setSelectedMember(member);
    setEditRole(member.role);
    setEditOpen(true);
  };

  /* =======================================================
     SAVE ROLE
  ======================================================= */

  const handleEditRole = () => {
    if (!selectedMember) return;

    setMembers((current) =>
      current.map((member) =>
        member.id === selectedMember.id
          ? { ...member, role: editRole }
          : member
      )
    );

    setEditOpen(false);

    showSuccessToast(
      "Role updated",
      `${selectedMember.name}'s role has been updated.`
    );
  };

  /* =======================================================
     OPEN DELETE
  ======================================================= */

  const openDelete = (member) => {
    setSelectedMember(member);
    setDeleteOpen(true);
  };

  /* =======================================================
     DELETE MEMBER
  ======================================================= */

  const handleDelete = () => {
    if (!selectedMember) return;

    setMembers((current) =>
      current.filter((member) => member.id !== selectedMember.id)
    );

    setDeleteOpen(false);
    setSelectedMember(null);

    setPagination((current) => ({ ...current, pageIndex: 0 }));

    showSuccessToast(
      "Member removed",
      `${selectedMember.name} has been removed from the workspace.`
    );
  };

  /* =======================================================
     TABLE COLUMNS
  ======================================================= */

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: () => (
          <button
            type="button"
            onClick={() => handleSort("name")}
            className="
              text-left text-[10.5px] font-bold
              text-text-muted uppercase tracking-widest
              hover:text-primary
            "
          >
            Member
          </button>
        ),
        cell: ({ row }) => {
          const member = row.original;

          return (
            <div className="flex items-center gap-3 min-w-[220px]">
              <img
                src={member.avatar}
                alt={member.name}
                className="
                  w-9 h-9 rounded-full
                  border border-border
                  flex-shrink-0
                "
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text truncate">
                  {member.name}
                </div>
                <div className="text-[11.5px] text-text-muted truncate">
                  {member.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: () => (
          <button
            type="button"
            onClick={() => handleSort("role")}
            className="
              text-left text-[10.5px] font-bold
              text-text-muted uppercase tracking-widest
              hover:text-primary
            "
          >
            Role
          </button>
        ),
        cell: ({ row }) => <RoleBadge role={row.original.role} />,
      },
      {
        accessorKey: "status",
        header: () => (
          <button
            type="button"
            onClick={() => handleSort("status")}
            className="
              text-left text-[10.5px] font-bold
              text-text-muted uppercase tracking-widest
              hover:text-primary
            "
          >
            Status
          </button>
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "lastLogin",
        header: () => (
          <span className="text-[10.5px] font-bold text-text-muted uppercase tracking-widest">
            Last Active
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-text-muted whitespace-nowrap">
            {row.original.lastLogin}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => (
          <span className="block text-right text-[10.5px] font-bold text-text-muted uppercase tracking-widest">
            Actions
          </span>
        ),
        cell: ({ row }) => {
          const member = row.original;

          return (
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={() => openEdit(member)}
                className="
                  p-1.5 text-text-light
                  hover:text-primary hover:bg-surface-hover
                  rounded-md transition
                "
                title="Edit member"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 16 }}
                >
                  edit
                </span>
              </button>

              {member.role !== "Owner" && (
                <button
                  type="button"
                  onClick={() => openDelete(member)}
                  className="
                    p-1.5 text-text-light
                    hover:text-danger hover:bg-surface-hover
                    rounded-md transition
                  "
                  title="Delete member"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 16 }}
                  >
                    delete
                  </span>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [sortBy]
  );

  /* =======================================================
     TABLE DATA
  ======================================================= */

  const tableMembers = sortedMembers.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  );

  /* =======================================================
     STATS
  ======================================================= */

  const activeMembers = members.filter(
    (member) => member.status === "active"
  ).length;

  const pendingMembers = members.filter(
    (member) => member.status === "pending"
  ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in w-full min-w-0">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
              Team &amp; Permissions
            </h1>
            <p className="text-text-muted text-sm mt-1.5 max-w-2xl">
              Manage who has access to your AutoBillr workspace and what they
              can do.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              className="
                px-3.5 py-2
                bg-surface border border-border
                rounded-lg text-sm font-semibold
                text-text-secondary
                hover:bg-surface-hover
                flex items-center gap-2 transition
              "
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                download
              </span>
              Audit log
            </button>

        
<button
  type="button"
  onClick={() => setInviteOpen(true)}
  className="
    px-4 py-2
    bg-primary hover:bg-primary-hover
    text-text-inverse
    rounded-lg text-sm font-semibold
    flex items-center gap-2
    shadow-sm shadow-primary/20
    transition
  "
>
  <span
    className="material-symbols-outlined"
    style={{ fontSize: 16 }}
  >
    person_add
  </span>

  Invite Member
</button>


          </div>
        </div>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
          <TeamStatCard
            icon="group"
            iconWrapper="bg-primary-soft"
            iconColor="text-primary"
            badge="+3"
            badgeClass="bg-primary-soft text-primary"
            label="Team Members"
            value={members.length + 4}
            description={`${pendingMembers} pending invites`}
          />

          <TeamStatCard
            icon="online_prediction"
            iconWrapper="bg-info-soft"
            iconColor="text-info"
            badge="Live"
            badgeClass="bg-surface-secondary text-text-muted"
            label="Active Sessions"
            value={Math.min(activeMembers, 8)}
          />

          <TeamStatCard
            icon="admin_panel_settings"
            iconWrapper="bg-warning-soft"
            iconColor="text-warning"
            label="Roles Configured"
            value="5"
            description="Custom + default"
          />

          <TeamStatCard
            icon="key"
            iconWrapper="bg-primary-soft"
            iconColor="text-primary"
            badge="SAML 2.0"
            badgeClass="bg-surface-secondary text-text-muted"
            label="SSO Status"
            value="Active"
          />
        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="mb-5 overflow-x-auto">
          <div className="inline-flex p-1 bg-surface-secondary rounded-lg gap-1 min-w-max">
            {[
              { label: "Members", count: members.length + 4 },
              { label: "Roles", count: 5 },
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
                        ml-1.5 text-[10px] tabular-nums
                        px-1.5 py-0.5 rounded-full font-bold
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

        {/* =================================================
            MEMBERS TABLE
        ================================================= */}

        {activeTab === "Members" && (
          <div className="bg-surface rounded-xl shadow-sm border border-border-light overflow-hidden w-full min-w-0">
            <DataTable
              data={tableMembers}
              columns={columns}
              totalRows={sortedMembers.length}
              pagination={pagination}
              setPagination={setPagination}
              pageSizes={[6, 10, 20]}
              emptyMessage="No team members found."
              className="w-full min-w-0"
            />
          </div>
        )}

        {/* =================================================
            ROLES
        ================================================= */}

        {activeTab === "Roles" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.keys(ROLE_CONFIG).map((role) => {
              const count = members.filter(
                (member) => member.role === role
              ).length;

              return (
                <div
                  key={role}
                  className="bg-surface rounded-xl shadow-sm border border-border-light p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <RoleBadge role={role} />
                    <span className="text-sm font-bold text-text">{count}</span>
                  </div>

                  <p className="text-sm text-text-muted">
                    {role === "Owner" &&
                      "Full workspace ownership and administrative access."}
                    {role === "Admin" &&
                      "Manage workspace settings, members and billing."}
                    {role === "Manager" &&
                      "Manage projects, clients and operational workflows."}
                    {role === "Analyst" &&
                      "View reports, analytics and business information."}
                    {role === "Viewer" &&
                      "Read-only access to permitted workspace information."}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* =================================================
            PERMISSIONS
        ================================================= */}

        {activeTab === "Permissions" && (
          <div className="bg-surface rounded-xl shadow-sm border border-border-light p-6">
            <h2 className="text-lg font-bold text-text">Permissions</h2>
            <p className="text-sm text-text-muted mt-1">
              Configure what each role can access inside your AutoBillr
              workspace.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Manage invoices",
                "Manage clients",
                "Manage projects",
                "View analytics",
                "Manage billing",
                "Manage team members",
                "Edit workspace settings",
                "View audit logs",
              ].map((permission) => (
                <div
                  key={permission}
                  className="
                    flex items-center justify-between
                    p-4 rounded-lg
                    bg-surface-secondary border border-border-light
                  "
                >
                  <span className="text-sm font-medium text-text-secondary">
                    {permission}
                  </span>
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: 20 }}
                  >
                    check_circle
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================
            AUDIT LOG
        ================================================= */}

        {activeTab === "Audit log" && (
          <div className="bg-surface rounded-xl shadow-sm border border-border-light p-6">
            <h2 className="text-lg font-bold text-text">Audit log</h2>
            <p className="text-sm text-text-muted mt-1">
              Recent team and permission activity will appear here.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Marcus Chen updated billing permissions.",
                "Sarah Park was assigned the Manager role.",
                "Aria Singh received a workspace invitation.",
              ].map((activity, index) => (
                <div
                  key={index}
                  className="
                    flex items-center gap-3
                    p-4 rounded-lg
                    bg-surface-secondary border border-border-light
                  "
                >
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: 20 }}
                  >
                    history
                  </span>
                  <span className="text-sm text-text-secondary">{activity}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

 

    
{/* =====================================================
    MEMBER INVITATION DRAWER
===================================================== */}

<MemberInvitationDrawer
  isOpen={inviteOpen}
  onClose={() => setInviteOpen(false)}
  onInvited={(payload) => {
    const invitedMember = payload?.member;

    if (!invitedMember) {
      return;
    }

    setMembers((current) => [invitedMember, ...current]);

    setPagination((current) => ({
      ...current,
      pageIndex: 0,
    }));

    showSuccessToast(
      "Invitation sent",
      `${invitedMember.email} has been invited to the workspace.`
    );
  }}
/>



      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Member Role"
        size="sm"
      >
        {selectedMember && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img
                src={selectedMember.avatar}
                alt={selectedMember.name}
                className="w-11 h-11 rounded-full border border-border"
              />
              <div>
                <div className="font-semibold text-text">
                  {selectedMember.name}
                </div>
                <div className="text-xs text-text-muted">
                  {selectedMember.email}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Role
              </label>
              <select
                value={editRole}
                onChange={(event) => setEditRole(event.target.value)}
                className="
                  w-full h-11 px-3 rounded-lg
                  border border-border
                  bg-surface text-sm text-text-secondary
                  outline-none
                  focus:border-primary
                  focus:ring-2 focus:ring-[rgba(15,157,148,0.15)]
                "
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Analyst">Analyst</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleEditRole}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Remove Team Member"
        size="sm"
      >
        {selectedMember && (
          <div className="space-y-5">
            <p className="text-sm text-text-secondary leading-6">
              Are you sure you want to remove{" "}
              <strong className="text-text">{selectedMember.name}</strong> from
              your AutoBillr workspace?
            </p>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleDelete}>
                Remove Member
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}