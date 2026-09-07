import { useState, useEffect, useCallback } from "react";

import AdminDrawer from "../topbar/AdminDrawer";
import Breadcrumb from "../ui/Breadcrumb";
import NotificationDrawer from "../topbar/notifications/NotificationDrawer";

import { useCurrencyStore } from "../../store/currencyStore";

import { showToast, showErrorToast } from "../../components/ui/CustomToast";

import { getAuthToken } from "../../utils/auth";
import CommandPalette from "../topbar/CommandPalette";
import CurrencyModal from "../topbar/CurrencyModal";


/* =========================================================
   API CONFIG
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1";

const API_ORIGIN = API_URL.replace(
  /\/api\/v1\/?$/,
  ""
);

/* =========================================================
   AVATAR URL HELPER
========================================================= */

const getAvatarUrl = (avatar) => {
  if (!avatar || typeof avatar !== "string") {
    return null;
  }

  const cleanAvatar = avatar.trim();

  if (!cleanAvatar) {
    return null;
  }

  // Already a complete URL
  if (cleanAvatar.startsWith("http://") || cleanAvatar.startsWith("https://")) {
    return cleanAvatar;
  }

  // Relative path from backend
  return `${API_ORIGIN}${cleanAvatar.startsWith("/") ? "" : "/"}${cleanAvatar}`;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Topbar() {
  /* =======================================================
     STATE
  ======================================================= */

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const [showAdminDrawer, setShowAdminDrawer] = useState(false);

  const [loading, setLoading] = useState(true);

  const [showNotifications, setShowNotifications] = useState(false);

  const [user, setUser] = useState(null);

  const [notificationsCount, setNotificationsCount] = useState(0);

  /* =======================================================
     CURRENCY STORE
  ======================================================= */

  const { currencies, selectedCurrency, setCurrency, fetchCurrencies } =
    useCurrencyStore();

  /* =======================================================
     NORMALIZE SELECTED CURRENCY
  ======================================================= */

  const selectedCurrencyCode =
    typeof selectedCurrency === "object" && selectedCurrency !== null
      ? selectedCurrency.code
      : selectedCurrency;

  /* =======================================================
     CURRENT CURRENCY
  ======================================================= */

  const currentCurrency =
    currencies?.find((currency) => currency?.code === selectedCurrencyCode) ||
    (typeof selectedCurrency === "object" ? selectedCurrency : null);

  /* =======================================================
     FETCH USER FROM DATABASE
  ======================================================= */

  const fetchUser = useCallback(async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return null;
      }

      const response = await fetch(`${API_URL}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch user");
      }

      const databaseUser = data?.user || null;

      console.log("=================================");

      console.log("TOPBAR USER FROM DATABASE:", databaseUser);

      console.log("AVATAR FROM DATABASE:", databaseUser?.avatar);

      console.log("AVATAR FINAL URL:", getAvatarUrl(databaseUser?.avatar));

      console.log("=================================");

      setUser(databaseUser);

      return databaseUser;
    } catch (error) {
      console.error("TOPBAR USER FETCH ERROR:", error);

      setUser(null);

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     LOAD USER ON TOPBAR MOUNT
  ======================================================= */

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /* =======================================================
     LOAD USER WHEN ADMIN DRAWER OPENS
  ======================================================= */

  useEffect(() => {
    if (showAdminDrawer) {
      fetchUser();
    }
  }, [showAdminDrawer, fetchUser]);

  /* =======================================================
     LOAD CURRENCIES
  ======================================================= */

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        await fetchCurrencies();
      } catch (error) {
        console.error("CURRENCY FETCH ERROR:", error);
      }
    };

    loadCurrencies();
  }, [fetchCurrencies]);

  /* =======================================================
     PROFILE UPDATED
  ======================================================= */

  const handleProfileUpdated = useCallback((updatedUser) => {
    if (!updatedUser) {
      return;
    }

    console.log("TOPBAR PROFILE UPDATED:", updatedUser);

    setUser(updatedUser);
  }, []);

  /* =======================================================
     DISPLAY NAME
  ======================================================= */

  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";

  /* =======================================================
     INITIALS
  ======================================================= */

  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "U";

  /* =======================================================
     AVATAR URL
  ======================================================= */

  const avatarUrl = getAvatarUrl(user?.avatar);

  /* =======================================================
     OPEN COMMAND PALETTE
  ======================================================= */

  const openCommandPalette = () => {
    setShowCommandPalette(true);
  };

  /* =======================================================
     KEYBOARD SHORTCUTS
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        setShowCommandPalette(true);
      }

      if (event.key === "Escape") {
        setShowCommandPalette(false);
        setShowCurrencyModal(false);
        setShowNotifications(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* =======================================================
     CURRENCY CHANGE
  ======================================================= */

  const handleCurrencyChange = async (currency) => {
    try {
      if (!currency?.code) {
        return;
      }

      await setCurrency(currency.code);

      setShowCurrencyModal(false);

      showToast(`Currency changed to ${currency.code}`);
    } catch (error) {
      console.error("CURRENCY CHANGE ERROR:", error);

      showErrorToast("Failed to change currency");
    }
  };

  /* =======================================================
     ADMIN DRAWER CLOSE
  ======================================================= */

  const handleAdminDrawerClose = () => {
    setShowAdminDrawer(false);
  };

  /* =======================================================
     NOTIFICATIONS CLOSE
  ======================================================= */

  const handleNotificationsClose = () => {
    setShowNotifications(false);
  };

  /* =======================================================
     AVATAR ERROR
  ======================================================= */

  const handleAvatarError = (event) => {
    console.error("=================================");

    console.error("TOPBAR AVATAR FAILED TO LOAD");

    console.error("Avatar from DB:", user?.avatar);

    console.error("Final avatar URL:", avatarUrl);

    console.error("=================================");

    event.currentTarget.style.display = "none";
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      {/* ===================================================
          TOPBAR
      =================================================== */}

      <header
        className="
          fixed
          top-0
          right-0
          w-full
          md:w-[calc(100%-16rem)]
          h-16
          border-b
          border-border
          bg-surface/80
          backdrop-blur-md
          z-30
          flex
          items-center
          justify-between
          px-6
          md:px-8
          shadow-sm
        "
      >
        {/* =================================================
            LEFT
        ================================================= */}

        <div className="flex items-center gap-5 flex-1 min-w-0">
          <Breadcrumb />
        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="flex items-center gap-2 md:gap-4">
          {/* ===============================================
              SEARCH - DESKTOP
          =============================================== */}

          <button
            type="button"
            onClick={openCommandPalette}
            className="
              hidden
              md:flex
              items-center
              gap-2
              px-3
              py-2
              rounded-lg
              border
              border-border
              bg-background
              text-text-muted
              hover:text-text
              hover:bg-surface-hover
              transition
            "
            aria-label="Open command palette"
          >
            <span className="text-sm">Search</span>

            <span
              className="
                text-xs
                px-1.5
                py-0.5
                rounded
                border
                border-border
                bg-surface
              "
            >
              Ctrl K
            </span>
          </button>

          {/* ===============================================
              SEARCH - MOBILE
          =============================================== */}

          <button
            type="button"
            onClick={openCommandPalette}
            className="
              md:hidden
              w-9
              h-9
              rounded-lg
              flex
              items-center
              justify-center
              text-text-muted
              hover:text-text
              hover:bg-surface-hover
              transition
            "
            aria-label="Search"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />

              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          {/* ===============================================
              CURRENCY
          =============================================== */}

          <button
            type="button"
            onClick={() => setShowCurrencyModal((prev) => !prev)}
            className=" flex items-center gap-2 px-3 py-1.5 bg-surface border border-border hover:bg-surface-hover rounded-lg text-sm font-semibold transition active:scale-95 "
            aria-label="Select currency"
            aria-expanded={showCurrencyModal}
          >
            {" "}
            <span>{currentCurrency?.flag || "🇺🇸"}</span>{" "}
            <span>{selectedCurrencyCode || "USD"}</span>{" "}
            <span
              className="material-symbols-outlined text-text-light hidden md:inline"
              style={{ fontSize: "16px" }}
            >
              {" "}
              {showCurrencyModal ? "expand_less" : "expand_more"}{" "}
            </span>{" "}
          </button>

          {/* ===============================================
              NOTIFICATIONS
          =============================================== */}

          <button
            type="button"
            onClick={() => setShowNotifications(true)}
            className="
              relative
              w-9
              h-9
              rounded-lg
              flex
              items-center
              justify-center
              text-text-muted
              hover:text-text
              hover:bg-surface-hover
              transition
            "
            aria-label="Notifications"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />

              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {notificationsCount > 0 && (
              <span
                className="
                  absolute
                  top-1
                  right-1
                  min-w-4
                  h-4
                  px-1
                  rounded-full
                  bg-red-500
                  text-white
                  text-[10px]
                  flex
                  items-center
                  justify-center
                  font-semibold
                "
              >
                {notificationsCount > 99 ? "99+" : notificationsCount}
              </span>
            )}
          </button>

          {/* ===============================================
              DIVIDER
          =============================================== */}

          <div
            className="
              hidden
              sm:block
              w-px
              h-8
              bg-border
              mx-1
            "
          />

          {/* ===============================================
              USER PROFILE
          =============================================== */}

          <button
            type="button"
            onClick={() => setShowAdminDrawer(true)}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              px-1.5
              py-1.5
              hover:bg-surface-hover
              transition
              max-w-[220px]
            "
            aria-label="Open profile menu"
          >
            {/* ===========================================
                AVATAR
            =========================================== */}

            {avatarUrl ? (
              <img
                key={avatarUrl}
                src={avatarUrl}
                alt={displayName}
                className="
                  w-8
                  h-8
                  rounded-full
                  object-cover
                  border-2
                  border-surface
                  shadow-sm
                  flex-shrink-0
                "
                onError={handleAvatarError}
              />
            ) : (
              <div
                className="
                  w-8
                  h-8
                  rounded-full
                  flex
                  items-center
                  justify-center
                  bg-primary
                  text-white
                  text-xs
                  font-semibold
                  border-2
                  border-surface
                  shadow-sm
                  flex-shrink-0
                "
              >
                {initials}
              </div>
            )}

            {/* ===========================================
                USER NAME
            =========================================== */}

            <div className="hidden lg:block text-left min-w-0">
              <p
                className="
                  text-sm
                  font-medium
                  text-text
                  truncate
                  max-w-[140px]
                "
              >
                {loading ? "Loading..." : displayName}
              </p>

              {user?.role && (
                <p
                  className="
                    text-xs
                    text-text-muted
                    capitalize
                  "
                >
                  {String(user.role).toLowerCase()}
                </p>
              )}
            </div>

            {/* ===========================================
                CHEVRON
            =========================================== */}

            <svg
              className="
                hidden
                lg:block
                text-text-muted
              "
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </header>

      {/* ===================================================
          ADMIN DRAWER
      =================================================== */}

      <AdminDrawer
        isOpen={showAdminDrawer}
        onClose={handleAdminDrawerClose}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* ===================================================
          NOTIFICATION DRAWER
      =================================================== */}

      <NotificationDrawer
        isOpen={showNotifications}
        onClose={handleNotificationsClose}
      />

      {/* ===================================================
          CURRENCY MODAL
      =================================================== */}

      <CurrencyModal
        isOpen={showCurrencyModal}
        currencies={currencies}
        selectedCurrencyCode={selectedCurrencyCode}
        onSelect={handleCurrencyChange}
        onClose={() => setShowCurrencyModal(false)}
      />

      {/* ===================================================
          COMMAND PALETTE
      =================================================== */}

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenProfile={() => {
          setShowCommandPalette(false);
          setShowAdminDrawer(true);
        }}
        onOpenCurrency={() => {
          setShowCommandPalette(false);
          setShowCurrencyModal(true);
        }}
      />
    </>
  );
}
