// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import Badge from "../../components/ui/Badge";
// import Button from "../../components/ui/Button";
// import DataTable from "../../components/ui/DataTable";
// import Modal from "../../components/ui/Modal";
// import {
//   showSuccessToast,
//   showErrorToast,
// } from "../../components/ui/CustomToast";

// const API_BASE = (
//   import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
// ).replace(/\/$/, "");

// const TEAM_API = `${API_BASE}/team`;

// const ROLE_CONFIG = {
//   Owner: { className: "bg-danger-soft text-danger" },
//   Admin: { className: "bg-warning-soft text-warning" },
//   Manager: { className: "bg-info-soft text-info" },
//   Analyst: { className: "bg-primary-soft text-primary" },
//   Viewer: { className: "bg-surface-secondary text-text-secondary" },
// };

// function formatLastActivity(date) {
//   if (!date) return "—";
//   const activityTime = new Date(date).getTime();
//   if (Number.isNaN(activityTime)) return "—";

//   const diffMs = Date.now() - activityTime;
//   if (diffMs < 0) return "Just now";

//   const diffMinutes = Math.floor(diffMs / (1000 * 60));
//   if (diffMinutes < 1) return "Just now";
//   if (diffMinutes === 1) return "1 min ago";
//   if (diffMinutes < 60) return `${diffMinutes} min ago`;

//   const diffHours = Math.floor(diffMinutes / 60);
//   if (diffHours === 1) return "1 hr ago";
//   if (diffHours < 24) return `${diffHours} hrs ago`;

//   const diffDays = Math.floor(diffHours / 24);
//   if (diffDays === 1) return "Yesterday";
//   if (diffDays < 7) return `${diffDays} days ago`;

//   return new Date(date).toLocaleDateString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// export function RoleBadge({ role }) {
//   const config = ROLE_CONFIG[role] || ROLE_CONFIG.Viewer;
//   return (
//     <span
//       className={`
//         inline-flex items-center px-2.5 py-1 text-[11px] font-bold
//         rounded-full uppercase tracking-wider whitespace-nowrap
//         ${config.className}
//       `}
//     >
//       {role || "Viewer"}
//     </span>
//   );
// }

// export function StatusBadge({ status }) {
//   const normalized = String(status || "").toLowerCase();
//   const map = {
//     active: { variant: "active", label: "active" },
//     pending: { variant: "pending", label: "pending" },
//     inactive: { variant: "default", label: "inactive" },
//   };
//   const current = map[normalized] || map.inactive;
//   return <Badge label={current.label} variant={current.variant} />;
// }

// export function MemberAvatar({ member, size = "w-9 h-9" }) {
//   const [imageError, setImageError] = useState(false);
//   const hasAvatar = member?.avatar && !imageError;

//   if (hasAvatar) {
//     return (
//       <img
//         src={member.avatar}
//         alt={member.name || "Team member"}
//         onError={() => setImageError(true)}
//         className={`${size} rounded-full border border-border object-cover flex-shrink-0`}
//       />
//     );
//   }

//   return (
//     <div
//       className={`
//         ${size} rounded-full border border-border bg-primary-soft text-primary
//         grid place-items-center flex-shrink-0
//       `}
//     >
//       <span className="material-symbols-outlined" style={{ fontSize: 19 }}>
//         person
//       </span>
//     </div>
//   );
// }

// export default function TeamMemberTable({
//   members = [],
//   setMembers,
//   customRoles = [],
// }) {
//   const [editOpen, setEditOpen] = useState(false);
//   const [deleteOpen, setDeleteOpen] = useState(false);
//   const [selectedMember, setSelectedMember] = useState(null);
//   const [editRole, setEditRole] = useState("Viewer");
//   const [isUpdating, setIsUpdating] = useState(false);

//   const [sortBy, setSortBy] = useState({ field: "name", direction: "asc" });
//   const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 });

//   const [, setActivityTick] = useState(0);
//   useEffect(() => {
//     const timer = setInterval(() => setActivityTick((v) => v + 1), 60 * 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const allRoleNames = useMemo(() => {
//     return [
//       "Owner",
//       "Admin",
//       "Manager",
//       "Analyst",
//       "Viewer",
//       ...customRoles.map((r) => r?.name).filter(Boolean),
//     ];
//   }, [customRoles]);

//   const handleSort = useCallback((field) => {
//     setSortBy((current) => ({
//       field,
//       direction:
//         current.field === field && current.direction === "asc" ? "desc" : "asc",
//     }));
//     setPagination((current) => ({ ...current, pageIndex: 0 }));
//   }, []);

//   const sortedMembers = useMemo(() => {
//     const sorted = [...members];
//     sorted.sort((a, b) => {
//       const aValue = String(a?.[sortBy.field] || "").toLowerCase();
//       const bValue = String(b?.[sortBy.field] || "").toLowerCase();
//       if (aValue < bValue) return sortBy.direction === "asc" ? -1 : 1;
//       if (aValue > bValue) return sortBy.direction === "asc" ? 1 : -1;
//       return 0;
//     });
//     return sorted;
//   }, [members, sortBy]);

//   const tableMembers = useMemo(() => {
//     const start = pagination.pageIndex * pagination.pageSize;
//     return sortedMembers.slice(start, start + pagination.pageSize);
//   }, [sortedMembers, pagination]);

//   const openEdit = useCallback((member) => {
//     if (!member) return;
//     setSelectedMember(member);
//     setEditRole(member.role || "Viewer");
//     setEditOpen(true);
//   }, []);

//   const closeEdit = useCallback(() => {
//     if (isUpdating) return;
//     setEditOpen(false);
//     setSelectedMember(null);
//     setEditRole("Viewer");
//   }, [isUpdating]);

//   const handleEditRole = async () => {
//     if (!selectedMember?.id) {
//       showErrorToast("No team member selected.");
//       return;
//     }
//     if (selectedMember.role === "Owner") {
//       showErrorToast("The Owner role cannot be changed.");
//       return;
//     }

//     try {
//       setIsUpdating(true);
//       const res = await fetch(`${TEAM_API}/${selectedMember.id}/role`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ role: editRole }),
//       });

//       const text = await res.text();
//       let result = {};
//       try {
//         result = text ? JSON.parse(text) : {};
//       } catch {
//         throw new Error("Invalid server response.");
//       }

//       if (!res.ok || !result?.success) {
//         throw new Error(result?.message || "Failed to update role");
//       }

//       const updatedMember = result?.data;
//       if (updatedMember) {
//         setMembers((current) =>
//           current.map((m) => (m.id === updatedMember.id ? updatedMember : m))
//         );
//       }

//       const memberName = selectedMember.name || "Team member";
//       closeEdit();
//       showSuccessToast("Role updated", `${memberName}'s role has been updated.`);
//     } catch (error) {
//       console.error("Update role error:", error);
//       showErrorToast(error?.message || "Failed to update role");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const openDelete = useCallback((member) => {
//     if (!member) return;
//     if (member.role === "Owner") {
//       showErrorToast("The Owner cannot be removed.");
//       return;
//     }
//     setSelectedMember(member);
//     setDeleteOpen(true);
//   }, []);

//   const closeDelete = useCallback(() => {
//     if (isUpdating) return;
//     setDeleteOpen(false);
//     setSelectedMember(null);
//   }, [isUpdating]);

//   const handleDelete = async () => {
//     if (!selectedMember?.id) {
//       showErrorToast("No team member selected.");
//       return;
//     }

//     try {
//       setIsUpdating(true);
//       const res = await fetch(`${TEAM_API}/${selectedMember.id}`, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//       });

//       const text = await res.text();
//       let result = {};
//       try {
//         result = text ? JSON.parse(text) : {};
//       } catch {
//         result = {};
//       }

//       if (!res.ok) {
//         throw new Error(result?.message || "Failed to remove member");
//       }

//       const memberName = selectedMember.name || "Team member";
//       setMembers((current) =>
//         current.filter((m) => m.id !== selectedMember.id)
//       );
//       setDeleteOpen(false);
//       setSelectedMember(null);
//       setPagination((current) => ({ ...current, pageIndex: 0 }));
//       showSuccessToast(
//         "Member removed",
//         `${memberName} has been removed from the workspace.`
//       );
//     } catch (error) {
//       console.error("Delete member error:", error);
//       showErrorToast(error?.message || "Failed to remove member");
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: "name",
//         header: () => (
//           <button
//             type="button"
//             onClick={() => handleSort("name")}
//             className="text-left text-[10.5px] font-bold text-text-muted uppercase tracking-widest hover:text-primary"
//           >
//             Member
//           </button>
//         ),
//         cell: ({ row }) => {
//           const member = row.original;
//           return (
//             <div className="flex items-center gap-3 min-w-[220px]">
//               <MemberAvatar member={member} />
//               <div className="min-w-0">
//                 <div className="text-sm font-semibold text-text truncate">
//                   {member.name || "Unnamed member"}
//                 </div>
//                 <div className="text-[11.5px] text-text-muted truncate">
//                   {member.email || "No email"}
//                 </div>
//               </div>
//             </div>
//           );
//         },
//       },
//       {
//         accessorKey: "role",
//         header: () => (
//           <button
//             type="button"
//             onClick={() => handleSort("role")}
//             className="text-left text-[10.5px] font-bold text-text-muted uppercase tracking-widest hover:text-primary"
//           >
//             Role
//           </button>
//         ),
//         cell: ({ row }) => (
//           <RoleBadge role={row.original.role || "Viewer"} />
//         ),
//       },
//       {
//         accessorKey: "status",
//         header: () => (
//           <button
//             type="button"
//             onClick={() => handleSort("status")}
//             className="text-left text-[10.5px] font-bold text-text-muted uppercase tracking-widest hover:text-primary"
//           >
//             Status
//           </button>
//         ),
//         cell: ({ row }) => (
//           <StatusBadge status={row.original.status || "pending"} />
//         ),
//       },
//       {
//         accessorKey: "lastActivityAt",
//         header: () => (
//           <span className="text-[10.5px] font-bold text-text-muted uppercase tracking-widest">
//             Last Activity
//           </span>
//         ),
//         cell: ({ row }) => (
//           <span className="text-sm text-text-muted whitespace-nowrap">
//             {formatLastActivity(row.original.lastActivityAt)}
//           </span>
//         ),
//       },
//       {
//         id: "actions",
//         header: () => (
//           <span className="block text-right text-[10.5px] font-bold text-text-muted uppercase tracking-widest">
//             Actions
//           </span>
//         ),
//         cell: ({ row }) => {
//           const member = row.original;
//           return (
//             <div className="flex justify-end gap-1">
//               <button
//                 type="button"
//                 onClick={() => openEdit(member)}
//                 className="p-1.5 text-text-light hover:text-primary hover:bg-surface-hover rounded-md transition"
//                 title="Edit member"
//               >
//                 <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
//                   edit
//                 </span>
//               </button>
//               {member.role !== "Owner" && (
//                 <button
//                   type="button"
//                   onClick={() => openDelete(member)}
//                   className="p-1.5 text-text-light hover:text-danger hover:bg-surface-hover rounded-md transition"
//                   title="Delete member"
//                 >
//                   <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
//                     delete
//                   </span>
//                 </button>
//               )}
//             </div>
//           );
//         },
//       },
//     ],
//     [handleSort, openEdit, openDelete]
//   );

//   return (
//     <>
//       <div className="bg-surface rounded-xl shadow-sm border border-border-light overflow-hidden w-full min-w-0">
//         <DataTable
//           data={tableMembers}
//           columns={columns}
//           totalRows={sortedMembers.length}
//           pagination={pagination}
//           setPagination={setPagination}
//           pageSizes={[6, 10, 20]}
//           emptyMessage="No team members found."
//           className="w-full min-w-0"
//         />
//       </div>

//       {/* Edit Role Modal */}
//       <Modal
//         isOpen={editOpen}
//         onClose={closeEdit}
//         title="Edit Member Role"
//         size="sm"
//         position="right-modal"
//       >
//         {selectedMember && (
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               if (!isUpdating) handleEditRole();
//             }}
//             className="space-y-5"
//           >
//             <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-secondary border border-border-light">
//               <MemberAvatar member={selectedMember} size="w-11 h-11" />
//               <div className="min-w-0">
//                 <div className="font-semibold text-text truncate">
//                   {selectedMember.name || "Unnamed member"}
//                 </div>
//                 <div className="text-xs text-text-muted truncate mt-0.5">
//                   {selectedMember.email || "No email"}
//                 </div>
//               </div>
//               <div className="ml-auto">
//                 <StatusBadge status={selectedMember.status || "pending"} />
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="edit-member-role"
//                 className="block text-sm font-medium text-text-secondary mb-2"
//               >
//                 Role
//               </label>
//               <select
//                 id="edit-member-role"
//                 value={editRole}
//                 onChange={(e) => setEditRole(e.target.value)}
//                 disabled={isUpdating || selectedMember.role === "Owner"}
//                 className="
//                   w-full h-11 px-3 rounded-lg border border-border bg-surface text-sm text-text
//                   outline-none transition focus:border-primary focus:ring-2
//                   focus:ring-[rgba(15,157,148,0.15)] disabled:opacity-60 disabled:cursor-not-allowed
//                 "
//               >
//                 {allRoleNames.map((role) => (
//                   <option key={role} value={role}>
//                     {role}
//                   </option>
//                 ))}
//               </select>
//               {selectedMember.role === "Owner" && (
//                 <p className="text-xs text-warning mt-2">
//                   The workspace Owner role cannot be changed.
//                 </p>
//               )}
//             </div>

//             <div className="flex gap-3 p-3.5 rounded-lg bg-primary-soft border border-primary/10">
//               <span
//                 className="material-symbols-outlined text-primary shrink-0"
//                 style={{ fontSize: 20 }}
//               >
//                 info
//               </span>
//               <p className="text-xs text-text-secondary leading-5">
//                 Changing the role updates this member's workspace access and permissions.
//               </p>
//             </div>

//             <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
//               <Button type="button" variant="secondary" onClick={closeEdit} disabled={isUpdating}>
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 variant="primary"
//                 disabled={isUpdating || selectedMember.role === "Owner"}
//               >
//                 {isUpdating ? "Saving..." : "Save Changes"}
//               </Button>
//             </div>
//           </form>
//         )}
//       </Modal>

//       {/* Delete Member Modal */}
//       <Modal
//         isOpen={deleteOpen}
//         onClose={closeDelete}
//         title="Remove Team Member"
//         size="sm"
//         position="right-modal"
//       >
//         {selectedMember && (
//           <div className="space-y-5">
//             <div className="flex gap-3 p-4 rounded-lg bg-danger-soft border border-danger/10">
//               <span
//                 className="material-symbols-outlined text-danger shrink-0"
//                 style={{ fontSize: 22 }}
//               >
//                 warning
//               </span>
//               <div>
//                 <div className="text-sm font-semibold text-text">Remove team member?</div>
//                 <p className="text-xs text-text-muted leading-5 mt-1">
//                   This action will remove the member from your AutoBillr workspace.
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-secondary border border-border-light">
//               <MemberAvatar member={selectedMember} size="w-11 h-11" />
//               <div className="min-w-0">
//                 <div className="font-semibold text-text truncate">
//                   {selectedMember.name || "Unnamed member"}
//                 </div>
//                 <div className="text-xs text-text-muted truncate mt-0.5">
//                   {selectedMember.email || "No email"}
//                 </div>
//               </div>
//               <div className="ml-auto">
//                 <RoleBadge role={selectedMember.role || "Viewer"} />
//               </div>
//             </div>

//             <p className="text-sm text-text-secondary leading-6">
//               Are you sure you want to remove{" "}
//               <strong className="text-text">
//                 {selectedMember.name || "this member"}
//               </strong>{" "}
//               from your AutoBillr workspace?
//             </p>

//             <div className="flex gap-3 p-3.5 rounded-lg bg-surface-secondary border border-border-light">
//               <span
//                 className="material-symbols-outlined text-text-muted shrink-0"
//                 style={{ fontSize: 20 }}
//               >
//                 info
//               </span>
//               <p className="text-xs text-text-muted leading-5">
//                 The member will lose access to the workspace immediately.
//               </p>
//             </div>

//             <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
//               <Button type="button" variant="secondary" onClick={closeDelete} disabled={isUpdating}>
//                 Cancel
//               </Button>
//               <Button type="button" variant="danger" onClick={handleDelete} disabled={isUpdating}>
//                 {isUpdating ? "Removing..." : "Remove Member"}
//               </Button>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </>
//   );
// }



























import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import DataTable from "../../components/ui/DataTable";
import Modal from "../../components/ui/Modal";
import {
  showSuccessToast,
  showErrorToast,
} from "../../components/ui/CustomToast";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const TEAM_API = `${API_BASE}/team`;

// =====================================================
// AUTH TOKEN HELPER
// =====================================================

const getAuthToken = () => {
  const plain = localStorage.getItem("token");
  if (plain && plain.startsWith("ey")) return plain;

  const auth = localStorage.getItem("autobiller-auth");
  if (!auth) return null;

  if (auth.startsWith("ey")) return auth;

  try {
    const parsed = JSON.parse(auth);
    return parsed?.state?.token || parsed?.token || null;
  } catch {
    return null;
  }
};

const ROLE_CONFIG = {
  Owner: { className: "bg-danger-soft text-danger" },
  Admin: { className: "bg-warning-soft text-warning" },
  Manager: { className: "bg-info-soft text-info" },
  Analyst: { className: "bg-primary-soft text-primary" },
  Viewer: { className: "bg-surface-secondary text-text-secondary" },
};

function formatLastActivity(date) {
  if (!date) return "—";
  const activityTime = new Date(date).getTime();
  if (Number.isNaN(activityTime)) return "—";

  const diffMs = Date.now() - activityTime;
  if (diffMs < 0) return "Just now";

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes === 1) return "1 min ago";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours === 1) return "1 hr ago";
  if (diffHours < 24) return `${diffHours} hrs ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.Viewer;
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 text-[11px] font-bold
        rounded-full uppercase tracking-wider whitespace-nowrap
        ${config.className}
      `}
    >
      {role || "Viewer"}
    </span>
  );
}

export function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const map = {
    active: { variant: "active", label: "active" },
    pending: { variant: "pending", label: "pending" },
    inactive: { variant: "default", label: "inactive" },
  };
  const current = map[normalized] || map.inactive;
  return <Badge label={current.label} variant={current.variant} />;
}

export function MemberAvatar({ member, size = "w-9 h-9" }) {
  const [imageError, setImageError] = useState(false);
  const hasAvatar = member?.avatar && !imageError;

  if (hasAvatar) {
    return (
      <img
        src={member.avatar}
        alt={member.name || "Team member"}
        onError={() => setImageError(true)}
        className={`${size} rounded-full border border-border object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`
        ${size} rounded-full border border-border bg-primary-soft text-primary
        grid place-items-center flex-shrink-0
      `}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 19 }}>
        person
      </span>
    </div>
  );
}

export default function TeamMemberTable({
  members = [],
  setMembers,
  customRoles = [],
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [editRole, setEditRole] = useState("Viewer");
  const [isUpdating, setIsUpdating] = useState(false);

  const [sortBy, setSortBy] = useState({ field: "name", direction: "asc" });
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 6 });

  const [, setActivityTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActivityTick((v) => v + 1), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const allRoleNames = useMemo(() => {
    return [
      "Owner",
      "Admin",
      "Manager",
      "Analyst",
      "Viewer",
      ...customRoles.map((r) => r?.name).filter(Boolean),
    ];
  }, [customRoles]);

  const handleSort = useCallback((field) => {
    setSortBy((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, []);

  const sortedMembers = useMemo(() => {
    const sorted = [...members];
    sorted.sort((a, b) => {
      const aValue = String(a?.[sortBy.field] || "").toLowerCase();
      const bValue = String(b?.[sortBy.field] || "").toLowerCase();
      if (aValue < bValue) return sortBy.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortBy.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [members, sortBy]);

  const tableMembers = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return sortedMembers.slice(start, start + pagination.pageSize);
  }, [sortedMembers, pagination]);

  const openEdit = useCallback((member) => {
    if (!member) return;
    setSelectedMember(member);
    setEditRole(member.role || "Viewer");
    setEditOpen(true);
  }, []);

  const closeEdit = useCallback(() => {
    if (isUpdating) return;
    setEditOpen(false);
    setSelectedMember(null);
    setEditRole("Viewer");
  }, [isUpdating]);

  const handleEditRole = async () => {
    if (!selectedMember?.id) {
      showErrorToast("No team member selected.");
      return;
    }
    if (selectedMember.role === "Owner") {
      showErrorToast("The Owner role cannot be changed.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showErrorToast("Session expired. Please login again.");
      return;
    }

    try {
      setIsUpdating(true);

      const res = await fetch(`${TEAM_API}/${selectedMember.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: editRole }),
      });

      const text = await res.text();
      let result = {};
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Invalid server response.");
      }

      if (!res.ok || !result?.success) {
        throw new Error(result?.message || "Failed to update role");
      }

      const updatedMember = result?.data;
      if (updatedMember) {
        setMembers((current) =>
          current.map((m) => (m.id === updatedMember.id ? updatedMember : m))
        );
      }

      const memberName = selectedMember.name || "Team member";
      closeEdit();
      showSuccessToast("Role updated", `${memberName}'s role has been updated.`);
    } catch (error) {
      console.error("Update role error:", error);
      showErrorToast(error?.message || "Failed to update role");
    } finally {
      setIsUpdating(false);
    }
  };

  const openDelete = useCallback((member) => {
    if (!member) return;
    if (member.role === "Owner") {
      showErrorToast("The Owner cannot be removed.");
      return;
    }
    setSelectedMember(member);
    setDeleteOpen(true);
  }, []);

  const closeDelete = useCallback(() => {
    if (isUpdating) return;
    setDeleteOpen(false);
    setSelectedMember(null);
  }, [isUpdating]);

  const handleDelete = async () => {
    if (!selectedMember?.id) {
      showErrorToast("No team member selected.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      showErrorToast("Session expired. Please login again.");
      return;
    }

    try {
      setIsUpdating(true);

      const res = await fetch(`${TEAM_API}/${selectedMember.id}`, {
        method: "DELETE",
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
        result = {};
      }

      if (!res.ok) {
        throw new Error(result?.message || "Failed to remove member");
      }

      const memberName = selectedMember.name || "Team member";
      setMembers((current) =>
        current.filter((m) => m.id !== selectedMember.id)
      );
      setDeleteOpen(false);
      setSelectedMember(null);
      setPagination((current) => ({ ...current, pageIndex: 0 }));
      showSuccessToast(
        "Member removed",
        `${memberName} has been removed from the workspace.`
      );
    } catch (error) {
      console.error("Delete member error:", error);
      showErrorToast(error?.message || "Failed to remove member");
    } finally {
      setIsUpdating(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: () => (
          <button
            type="button"
            onClick={() => handleSort("name")}
            className="text-left text-[10.5px] font-bold text-text-muted uppercase tracking-widest hover:text-primary"
          >
            Member
          </button>
        ),
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-3 min-w-[220px]">
              <MemberAvatar member={member} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text truncate">
                  {member.name || "Unnamed member"}
                </div>
                <div className="text-[11.5px] text-text-muted truncate">
                  {member.email || "No email"}
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
            className="text-left text-[10.5px] font-bold text-text-muted uppercase tracking-widest hover:text-primary"
          >
            Role
          </button>
        ),
        cell: ({ row }) => (
          <RoleBadge role={row.original.role || "Viewer"} />
        ),
      },
      {
        accessorKey: "status",
        header: () => (
          <button
            type="button"
            onClick={() => handleSort("status")}
            className="text-left text-[10.5px] font-bold text-text-muted uppercase tracking-widest hover:text-primary"
          >
            Status
          </button>
        ),
        cell: ({ row }) => (
          <StatusBadge status={row.original.status || "pending"} />
        ),
      },
      {
        accessorKey: "lastActivityAt",
        header: () => (
          <span className="text-[10.5px] font-bold text-text-muted uppercase tracking-widest">
            Last Activity
          </span>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-text-muted whitespace-nowrap">
            {formatLastActivity(row.original.lastActivityAt)}
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
                className="p-1.5 text-text-light hover:text-primary hover:bg-surface-hover rounded-md transition"
                title="Edit member"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  edit
                </span>
              </button>
              {member.role !== "Owner" && (
                <button
                  type="button"
                  onClick={() => openDelete(member)}
                  className="p-1.5 text-text-light hover:text-danger hover:bg-surface-hover rounded-md transition"
                  title="Delete member"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    delete
                  </span>
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleSort, openEdit, openDelete]
  );

  return (
    <>
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

      {/* Edit Role Modal */}
      <Modal
        isOpen={editOpen}
        onClose={closeEdit}
        title="Edit Member Role"
        size="sm"
        position="right-modal"
      >
        {selectedMember && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isUpdating) handleEditRole();
            }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-secondary border border-border-light">
              <MemberAvatar member={selectedMember} size="w-11 h-11" />
              <div className="min-w-0">
                <div className="font-semibold text-text truncate">
                  {selectedMember.name || "Unnamed member"}
                </div>
                <div className="text-xs text-text-muted truncate mt-0.5">
                  {selectedMember.email || "No email"}
                </div>
              </div>
              <div className="ml-auto">
                <StatusBadge status={selectedMember.status || "pending"} />
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-member-role"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Role
              </label>
              <select
                id="edit-member-role"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                disabled={isUpdating || selectedMember.role === "Owner"}
                className="
                  w-full h-11 px-3 rounded-lg border border-border bg-surface text-sm text-text
                  outline-none transition focus:border-primary focus:ring-2
                  focus:ring-[rgba(15,157,148,0.15)] disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {allRoleNames.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              {selectedMember.role === "Owner" && (
                <p className="text-xs text-warning mt-2">
                  The workspace Owner role cannot be changed.
                </p>
              )}
            </div>

            <div className="flex gap-3 p-3.5 rounded-lg bg-primary-soft border border-primary/10">
              <span
                className="material-symbols-outlined text-primary shrink-0"
                style={{ fontSize: 20 }}
              >
                info
              </span>
              <p className="text-xs text-text-secondary leading-5">
                Changing the role updates this member's workspace access and permissions.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
              <Button type="button" variant="secondary" onClick={closeEdit} disabled={isUpdating}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isUpdating || selectedMember.role === "Owner"}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Member Modal */}
      <Modal
        isOpen={deleteOpen}
        onClose={closeDelete}
        title="Remove Team Member"
        size="sm"
        position="right-modal"
      >
        {selectedMember && (
          <div className="space-y-5">
            <div className="flex gap-3 p-4 rounded-lg bg-danger-soft border border-danger/10">
              <span
                className="material-symbols-outlined text-danger shrink-0"
                style={{ fontSize: 22 }}
              >
                warning
              </span>
              <div>
                <div className="text-sm font-semibold text-text">Remove team member?</div>
                <p className="text-xs text-text-muted leading-5 mt-1">
                  This action will remove the member from your AutoBillr workspace.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-secondary border border-border-light">
              <MemberAvatar member={selectedMember} size="w-11 h-11" />
              <div className="min-w-0">
                <div className="font-semibold text-text truncate">
                  {selectedMember.name || "Unnamed member"}
                </div>
                <div className="text-xs text-text-muted truncate mt-0.5">
                  {selectedMember.email || "No email"}
                </div>
              </div>
              <div className="ml-auto">
                <RoleBadge role={selectedMember.role || "Viewer"} />
              </div>
            </div>

            <p className="text-sm text-text-secondary leading-6">
              Are you sure you want to remove{" "}
              <strong className="text-text">
                {selectedMember.name || "this member"}
              </strong>{" "}
              from your AutoBillr workspace?
            </p>

            <div className="flex gap-3 p-3.5 rounded-lg bg-surface-secondary border border-border-light">
              <span
                className="material-symbols-outlined text-text-muted shrink-0"
                style={{ fontSize: 20 }}
              >
                info
              </span>
              <p className="text-xs text-text-muted leading-5">
                The member will lose access to the workspace immediately.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border-light">
              <Button type="button" variant="secondary" onClick={closeDelete} disabled={isUpdating}>
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleDelete} disabled={isUpdating}>
                {isUpdating ? "Removing..." : "Remove Member"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}