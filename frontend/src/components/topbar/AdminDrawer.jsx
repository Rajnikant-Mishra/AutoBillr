import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import RightDrawer from "../layout/RightDrawer";
import { clearAuth, getAuthToken } from "../../utils/auth";
import { showSuccessToast } from "../ui/CustomToast";
import ProfileEditModal from "../profile/ProfileEditModal";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const API_ORIGIN = API_URL.replace(
  /\/api\/v1\/?$/,
  ""
);

// =====================================================
// AVATAR URL HELPER
// =====================================================

const getAvatarUrl = (avatar) => {
  if (!avatar || typeof avatar !== "string") {
    return null;
  }

  const cleanAvatar = avatar.trim();

  if (!cleanAvatar) {
    return null;
  }

  if (
    cleanAvatar.startsWith("http://") ||
    cleanAvatar.startsWith("https://")
  ) {
    return cleanAvatar;
  }

  return `${API_ORIGIN}${
    cleanAvatar.startsWith("/") ? "" : "/"
  }${cleanAvatar}`;
};

// =====================================================
// MENU
// =====================================================

const MENU_ITEMS = [
  {
    icon: "person",
    title: "Personal Info",
    path: "/settings/profile",
  },
  {
    icon: "domain",
    title: "Switch Workspace",
    meta: "3 connected",
  },
  {
    icon: "shield",
    title: "Security & Sessions",
    meta: "2FA enabled",
    path: "/settings/security",
  },
  {
    icon: "notifications",
    title: "Notification Preferences",
    path: "/settings/notifications",
  },
  {
    icon: "settings",
    title: "Account Settings",
    path: "/settings",
  },
  {
    icon: "help",
    title: "Help & Support",
    path: "/help",
  },
];

// =====================================================
// COMPONENT
// =====================================================

export default function AdminDrawer({
  isOpen,
  onClose,
  onProfileUpdated,
}) {
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // ===================================================
  // FETCH USER FROM DATABASE
  // ===================================================

  const fetchProfile = async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        setUser(null);
        return null;
      }

      setLoadingUser(true);

      const response = await fetch(
        `${API_URL}/users/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      console.log(
        "ADMIN DRAWER /users/me:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to fetch profile"
        );
      }

      const databaseUser = data?.user || null;

      setUser(databaseUser);

      return databaseUser;
    } catch (error) {
      console.error(
        "ADMIN DRAWER PROFILE ERROR:",
        error
      );

      setUser(null);

      return null;
    } finally {
      setLoadingUser(false);
    }
  };

  // ===================================================
  // FETCH WHEN DRAWER OPENS
  // ===================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    fetchProfile();
  }, [isOpen]);

  // ===================================================
  // DISPLAY DATA
  // ===================================================

  const displayName = user
    ? `${user.firstName || ""} ${
        user.lastName || ""
      }`.trim() ||
      user.email?.split("@")[0] ||
      "User"
    : "User";

  const displayEmail =
    user?.email || "—";

  const displayRole = user?.role
    ? String(user.role).replaceAll("_", " ")
    : "Member";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "U";

  const avatarUrl = getAvatarUrl(
    user?.avatar
  );

  // ===================================================
  // SIGN OUT
  // ===================================================

  const handleSignOut = () => {
    clearAuth();

    setUser(null);

    onClose();

    showSuccessToast(
      "Signed out",
      "You have been logged out successfully"
    );

    navigate("/login", {
      replace: true,
    });
  };

  // ===================================================
  // MENU CLICK
  // ===================================================

  const handleMenuClick = (item) => {
    if (!item.path) {
      return;
    }

    onClose();

    navigate(item.path);
  };

  // ===================================================
  // OPEN PROFILE EDIT
  // ===================================================

  const handleEditProfile = () => {
    /*
      IMPORTANT:
      Do NOT navigate to /settings/profile here.

      The profile header opens the modal directly.
    */

    setEditOpen(true);

    /*
      Close the drawer after the modal has been
      requested to open.
    */
    onClose();
  };

  // ===================================================
  // PROFILE MODAL CLOSE
  // ===================================================

  const handleProfileModalClose = async () => {
    setEditOpen(false);

    /*
      Fetch latest user from PostgreSQL.
    */
    const updatedUser = await fetchProfile();

    /*
      Send latest user to Topbar.
    */
    if (updatedUser) {
      onProfileUpdated?.(updatedUser);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <>
      {/* =================================================
          ADMIN DRAWER
      ================================================= */}

      <RightDrawer
        isOpen={isOpen}
        onClose={onClose}
        title="Account"
        icon="account_circle"
        width="max-w-lg"
        footer={
          <button
            type="button"
            onClick={handleSignOut}
            className="
              w-full
              h-[var(--button-height-md)]
              px-4
              rounded-[var(--button-radius)]
              bg-danger-soft
              text-danger
              font-semibold
              text-sm
              hover:bg-danger/15
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-danger/30
              transition-colors
              duration-fast
              flex
              items-center
              justify-center
              gap-2
            "
          >
            <span
              className="
                material-symbols-outlined
                text-[18px]
              "
              aria-hidden
            >
              logout
            </span>

            Sign Out
          </button>
        }
      >
        {/* =============================================
            PROFILE HEADER
        ============================================= */}

        <button
          type="button"
          onClick={handleEditProfile}
          className="
            w-full
            flex
            items-center
            gap-4
            mb-6
            pb-6
            border-b
            border-border-light
            text-left
            hover:bg-surface-hover/50
            rounded-xl
            -mx-2
            px-2
            py-2
            transition-colors
            group
          "
        >
          {/* AVATAR */}

          <div className="relative shrink-0">
            {loadingUser ? (
              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-surface-secondary
                  animate-pulse
                "
              />
            ) : avatarUrl ? (
              <img
                key={avatarUrl}
                src={avatarUrl}
                alt={displayName}
                className="
                  w-14
                  h-14
                  rounded-2xl
                  object-cover
                  border-2
                  border-surface
                  shadow-sm
                "
                onError={(event) => {
                  console.error(
                    "ADMIN DRAWER AVATAR ERROR:",
                    avatarUrl
                  );

                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-primary-soft
                  text-primary-dark
                  grid
                  place-items-center
                  text-lg
                  font-bold
                  border-2
                  border-surface
                  shadow-sm
                "
              >
                {initials}
              </div>
            )}

            {/* EDIT BADGE */}

            <span
              className="
                absolute
                -bottom-1
                -right-1
                w-5
                h-5
                rounded-full
                bg-primary
                text-white
                grid
                place-items-center
                text-[10px]
                shadow
              "
            >
              <span
                className="
                  material-symbols-outlined
                  text-[12px]
                "
              >
                edit
              </span>
            </span>
          </div>

          {/* USER INFO */}

          <div className="min-w-0 flex-1">
            <h4
              className="
                text-[15px]
                font-bold
                text-text
                truncate
                group-hover:text-primary
                transition-colors
              "
            >
              {displayName}
            </h4>

            <p
              className="
                text-xs
                text-text-muted
                truncate
              "
            >
              {displayEmail}
            </p>

            <span
              className="
                inline-block
                mt-1.5
                px-2
                py-0.5
                rounded-md
                bg-primary-soft
                text-primary-dark
                text-[10px]
                font-bold
                uppercase
                tracking-wider
              "
            >
              {displayRole}
            </span>
          </div>
        </button>

        {/* =============================================
            MENU
        ============================================= */}

        <nav
          aria-label="Account menu"
          className="space-y-1"
        >
          {MENU_ITEMS.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() =>
                handleMenuClick(item)
              }
              className="
                w-full
                flex
                items-center
                gap-3
                px-3
                py-3
                rounded-xl
                text-left
                hover:bg-surface-hover
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary/25
                transition-colors
                duration-fast
                group
              "
            >
              <span
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-surface-secondary
                  grid
                  place-items-center
                  text-text-secondary
                  group-hover:bg-surface
                  group-hover:text-text
                  transition-colors
                  duration-fast
                  shrink-0
                "
              >
                <span
                  className="
                    material-symbols-outlined
                    text-[18px]
                  "
                >
                  {item.icon}
                </span>
              </span>

              <span className="flex-1 min-w-0">
                <span
                  className="
                    block
                    text-[13.5px]
                    font-medium
                    text-text-secondary
                    group-hover:text-text
                    transition-colors
                  "
                >
                  {item.title}
                </span>
              </span>

              {item.meta && (
                <span
                  className="
                    text-[11px]
                    text-text-light
                    whitespace-nowrap
                    shrink-0
                  "
                >
                  {item.meta}
                </span>
              )}

              <span
                className="
                  material-symbols-outlined
                  text-text-light
                  text-[16px]
                  shrink-0
                "
              >
                chevron_right
              </span>
            </button>
          ))}
        </nav>
      </RightDrawer>

      {/* =============================================
          PROFILE EDIT MODAL
      ============================================= */}

      <ProfileEditModal
        isOpen={editOpen}
        onClose={handleProfileModalClose}
      />
    </>
  );
}