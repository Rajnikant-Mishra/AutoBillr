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
  const [editOpen, setEditOpen] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const loadProfile = useCallback(
    async () => {
      try {
        setLoading(true);

        const response =
          await getProfile();

        console.log(
          "REGISTERED USER:",
          response
        );

        const profile =
          response?.user;

        if (!profile) {
          throw new Error(
            "User profile not found"
          );
        }

        const normalizedProfile = {
          ...profile,

          avatar:
            profile.avatar &&
            profile.avatar.startsWith(
              "/uploads"
            )
              ? `${API_ORIGIN}${profile.avatar}`
              : profile.avatar,
        };

        setUser(
          normalizedProfile
        );
      } catch (error) {
        console.error(
          "LOAD PROFILE ERROR:",
          error
        );

        setUser(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="text-sm text-text-muted">
        Loading registered profile...
      </div>
    );
  }

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

  const displayName =
    `${user.firstName || ""} ${
      user.lastName || ""
    }`.trim() || "User";

  const initials =
    `${user.firstName?.[0] || ""}${
      user.lastName?.[0] || ""
    }`.toUpperCase() || "U";

  const role =
    user.role
      ?.replaceAll("_", " ")
      ?.toLowerCase()
      ?.replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      ) || "Member";

  const handleClose = () => {
    setEditOpen(false);

    /*
     * Get the newly registered/edited values
     * from backend again.
     */
    loadProfile();
  };

  return (
    <div>

      <h1 className="text-2xl font-bold mb-1">
        Personal Info
      </h1>

      <p className="text-text-muted text-sm mb-8">
        Update your name and profile photo.
      </p>

      {/* PROFILE */}

      <div className="flex items-center gap-5 p-5 border border-border rounded-2xl max-w-md">

        {user.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="w-16 h-16 rounded-2xl object-cover border border-border"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary-dark grid place-items-center text-xl font-bold">
            {initials}
          </div>
        )}

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

        <Button
          size="sm"
          onClick={() =>
            setEditOpen(true)
          }
        >
          Edit
        </Button>

      </div>

      {/* EMAIL */}

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

        {/* NAME */}

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

      <ProfileEditModal
        isOpen={editOpen}
        onClose={handleClose}
      />

    </div>
  );
}