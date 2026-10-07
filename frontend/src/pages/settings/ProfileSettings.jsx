
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
    if (!avatar || typeof avatar !== "string") {
      return null;
    }

    const cleanAvatar = avatar.trim();

    if (!cleanAvatar) {
      return null;
    }

    // Already a complete URL
    if (
      cleanAvatar.startsWith("http://") ||
      cleanAvatar.startsWith("https://")
    ) {
      return cleanAvatar;
    }

    // Backend relative path
    if (cleanAvatar.startsWith("/")) {
      return `${API_ORIGIN}${cleanAvatar}`;
    }

    // Relative path without /
    return `${API_ORIGIN}/${cleanAvatar}`;
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
  // CLOSE EDIT MODAL + RELOAD PROFILE
  // ============================================================

  const handleClose = async () => {
    setEditOpen(false);

    // Reload latest profile from database
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

  // ============================================================
  // INITIALS
  //
  // John Smith -> JS
  // John -> J
  // No name -> U
  // ============================================================

  const initials =
    `${user.firstName?.[0] || ""}${
      user.lastName?.[0] || ""
    }`.toUpperCase() || "U";

  // ============================================================
  // ROLE
  // ============================================================

  const role =
    user.role
      ?.replaceAll("_", " ")
      ?.toLowerCase()
      ?.replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      ) || "Member";

  // ============================================================
  // RENDER
  // ============================================================

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
            PROFILE AVATAR
        ==================================================== */}

        {user.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="w-16 h-16 rounded-full object-cover border border-border"
            onError={(event) => {
              console.error(
                "PROFILE AVATAR ERROR:",
                user.avatar
              );

              // Hide broken image
              event.currentTarget.style.display =
                "none";

              // Show initials fallback
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
            DEFAULT INITIAL AVATAR
        ==================================================== */}

        <div
          className={`w-16 h-16 rounded-full bg-primary text-white place-items-center text-xl font-bold border border-border ${
            user.avatar ? "hidden" : "grid"
          }`}
        >
          {initials}
        </div>

        {/* ====================================================
            USER INFORMATION
        ==================================================== */}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text truncate">
            {displayName}
          </h3>

          <p className="text-sm text-text-muted truncate">
            {user.email || "No email"}
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
            {user.email || "—"}
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


