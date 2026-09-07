import { useState, useEffect } from "react";
import { getCurrentUser } from "../../utils/auth";
import Button from "../../components/ui/Button";
import ProfileEditModal from "../../components/profile/ProfileEditModal";

export default function ProfileSettings() {
  const [editOpen, setEditOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Load user on mount + when modal closes (so UI updates after save)
  useEffect(() => {
    setUser(getCurrentUser());
  }, [editOpen]);

  if (!user) {
    return (
      <div className="text-text-muted text-sm">
        Loading profile...
      </div>
    );
  }

  const displayName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

  const initials =
    `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
    "U";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Personal Info</h1>
      <p className="text-text-muted text-sm mb-8">
        Update your name and profile photo.
      </p>

      {/* Profile card */}
      <div className="flex items-center gap-5 p-5 border border-border rounded-2xl max-w-md">
        {/* Avatar */}
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover border border-border shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary-dark grid place-items-center text-xl font-bold">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text truncate">{displayName}</h3>
          <p className="text-sm text-text-muted truncate">{user.email}</p>
          <p className="text-xs text-text-light mt-1 uppercase tracking-wider">
            {user.role?.replaceAll("_", " ") || "Member"}
          </p>
        </div>

        <Button size="sm" onClick={() => setEditOpen(true)}>
          Edit
        </Button>
      </div>

      {/* Extra info section */}
      <div className="mt-8 max-w-md space-y-4">
        <div className="p-4 border border-border rounded-xl">
          <p className="text-xs text-text-muted mb-1">Email</p>
          <p className="text-sm font-medium">{user.email}</p>
          <p className="text-xs text-text-light mt-1">Email cannot be changed</p>
        </div>

        <div className="p-4 border border-border rounded-xl">
          <p className="text-xs text-text-muted mb-1">Full name</p>
          <p className="text-sm font-medium">{displayName}</p>
        </div>
      </div>

      {/* Same Instagram-style modal */}
      <ProfileEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}