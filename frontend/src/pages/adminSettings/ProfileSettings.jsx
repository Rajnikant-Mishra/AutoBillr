import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import ProfileEditModal from "../../components/profile/ProfileEditModal";
import { getProfile } from "../../services/userService";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const API_ORIGIN = API_URL.replace(
  /\/api\/v1\/?$/,
  ""
);

export default function ProfileSettings() {
  const [editOpen, setEditOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD PROFILE FROM BACKEND
  // =====================================================

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await getProfile();

      const profile = response.user;

      if (!profile) {
        throw new Error("Profile not found");
      }

      // Convert relative avatar path into full URL
      if (
        profile.avatar &&
        profile.avatar.startsWith("/uploads")
      ) {
        profile.avatar =
          `${API_ORIGIN}${profile.avatar}`;
      }

      setUser(profile);
    } catch (error) {
      console.error(
        "LOAD PROFILE ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD WHEN PAGE OPENS
  // AND AFTER MODAL CLOSES
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, [editOpen]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="text-text-muted text-sm">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-text-muted text-sm">
        Unable to load profile.
      </div>
    );
  }

  // =====================================================
  // DISPLAY NAME
  // =====================================================

  const displayName =
    `${user.firstName || ""} ${
      user.lastName || ""
    }`.trim() || "User";

  // =====================================================
  // INITIALS
  // =====================================================

  const initials =
    `${user.firstName?.[0] || ""}${
      user.lastName?.[0] || ""
    }`.toUpperCase() || "U";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div>

      <h1 className="text-2xl font-bold mb-1">
        Personal Info
      </h1>

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

        {/* User info */}

        <div className="flex-1 min-w-0">

          <h3 className="font-bold text-text truncate">
            {displayName}
          </h3>

          <p className="text-sm text-text-muted truncate">
            {user.email}
          </p>

          <p className="text-xs text-text-light mt-1 uppercase tracking-wider">
            {user.role?.replaceAll("_", " ") ||
              "Member"}
          </p>

        </div>

        <Button
          size="sm"
          onClick={() => setEditOpen(true)}
        >
          Edit
        </Button>

      </div>

      {/* Extra info */}

      <div className="mt-8 max-w-md space-y-4">

        <div className="p-4 border border-border rounded-xl">

          <p className="text-xs text-text-muted mb-1">
            Email
          </p>

          <p className="text-sm font-medium">
            {user.email}
          </p>

          <p className="text-xs text-text-light mt-1">
            Email cannot be changed
          </p>

        </div>

        <div className="p-4 border border-border rounded-xl">

          <p className="text-xs text-text-muted mb-1">
            Full name
          </p>

          <p className="text-sm font-medium">
            {displayName}
          </p>

        </div>

      </div>

      {/* Edit Modal */}

      <ProfileEditModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />

    </div>
  );
}