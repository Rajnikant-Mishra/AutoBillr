import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

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

  // ============================================================
  // NORMALIZE AVATAR URL
  // ============================================================

  const normalizeAvatar = useCallback((avatar) => {
    if (!avatar) {
      return null;
    }

    // Full URL
    if (
      avatar.startsWith("http://") ||
      avatar.startsWith("https://")
    ) {
      return avatar;
    }

    // Backend uploads path
    if (avatar.startsWith("/uploads")) {
      return `${API_ORIGIN}${avatar}`;
    }

    // Other relative paths
    if (avatar.startsWith("/")) {
      return `${API_ORIGIN}${avatar}`;
    }

    return avatar;
  }, []);

  // ============================================================
  // LOAD PROFILE FROM DATABASE
  // ============================================================

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getProfile();

      console.log("REGISTERED USER:", response);

      const profile =
        response?.user ||
        response?.data?.user ||
        response?.data ||
        response;

      if (!profile) {
        throw new Error("User profile not found");
      }

      const normalizedProfile = {
        ...profile,

        // IMPORTANT:
        // If avatar is null/empty -> keep null
        // so default icon is displayed.
        avatar: normalizeAvatar(profile.avatar),
      };

      console.log(
        "PROFILE FROM DATABASE:",
        normalizedProfile
      );

      setUser(normalizedProfile);
    } catch (error) {
      console.error(
        "LOAD PROFILE ERROR:",
        error
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [normalizeAvatar]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ============================================================
  // CLOSE EDIT MODAL + RELOAD DATABASE PROFILE
  // ============================================================

  const handleClose = async () => {
    setEditOpen(false);

    // Reload latest saved profile from backend
    await loadProfile();
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="text-sm text-text-muted">
        Loading registered profile...
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (!user) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">
          Personal Info
        </h1>

        <p className="text-sm text-text-muted">
          Unable to load your registered profile.
        </p>

        <div className="mt-4">
          <Button
            size="sm"
            onClick={loadProfile}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ============================================================
  // USER DATA
  // ============================================================

  const displayName =
    `${user.firstName || ""} ${
      user.lastName || ""
    }`.trim() || "User";

  const role =
    user.role
      ?.replaceAll("_", " ")
      ?.toLowerCase()
      ?.replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      ) || "Member";

  return (
    <div>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <h1 className="text-2xl font-bold mb-1">
        Personal Info
      </h1>

      <p className="text-text-muted text-sm mb-8">
        Update your name and profile photo.
      </p>

      {/* ======================================================
          PROFILE CARD
      ====================================================== */}

      <div className="flex items-center gap-5 p-5 border border-border rounded-2xl max-w-md">

        {/* ====================================================
            PROFILE IMAGE / DEFAULT ICON
        ==================================================== */}

        {user.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover border border-border"
            onError={(event) => {
              // If image URL is invalid,
              // replace it with default icon.
              event.currentTarget.style.display =
                "none";

              const fallback =
                event.currentTarget
                  .nextElementSibling;

              if (fallback) {
                fallback.style.display = "grid";
              }
            }}
          />
        ) : null}

        {/* ====================================================
            DEFAULT PROFILE ICON

            This appears when:
            user.avatar === null
            user.avatar === ""
            user.avatar === undefined

            It disappears automatically after image upload.
        ==================================================== */}

        <div
          className={`w-16 h-16 rounded-2xl bg-gray-100 border border-border place-items-center ${
            user.avatar ? "hidden" : "grid"
          }`}
        >
          <span
            className="material-symbols-outlined text-gray-500"
            style={{
              fontSize: "32px",
            }}
          >
            person
          </span>
        </div>

        {/* ====================================================
            USER INFORMATION
        ==================================================== */}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text truncate">
            {displayName}
          </h3>

          <p className="text-sm text-text-muted truncate">
            {user.email}
          </p>

          <p className="text-xs text-text-light mt-1 uppercase tracking-wider">
            {role}
          </p>
        </div>

        {/* ====================================================
            EDIT BUTTON
        ==================================================== */}

        <Button
          size="sm"
          onClick={() => setEditOpen(true)}
        >
          Edit
        </Button>
      </div>

      {/* ======================================================
          EMAIL / NAME / ROLE
      ====================================================== */}

      <div className="mt-8 max-w-md space-y-4">

        {/* EMAIL */}
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

        {/* FULL NAME */}
        <div className="p-4 border border-border rounded-xl">
          <p className="text-xs text-text-muted mb-1">
            Full name
          </p>

          <p className="text-sm font-medium">
            {displayName}
          </p>
        </div>

        {/* ROLE */}
        <div className="p-4 border border-border rounded-xl">
          <p className="text-xs text-text-muted mb-1">
            Role
          </p>

          <p className="text-sm font-medium">
            {role}
          </p>
        </div>
      </div>

      {/* ======================================================
          EDIT MODAL
      ====================================================== */}

      <ProfileEditModal
        isOpen={editOpen}
        onClose={handleClose}
      />
    </div>
  );
}