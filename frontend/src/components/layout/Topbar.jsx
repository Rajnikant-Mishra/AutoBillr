

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AdminDrawer from "../topbar/AdminDrawer";
import Breadcrumb from "../ui/Breadcrumb";
import NotificationDrawer from "../topbar/notifications/NotificationDrawer";
import { useCurrencyStore } from "../../store/currencyStore";
import { useNotificationStore } from "../../store/notificationStore";
import { showToast, showErrorToast } from "../../components/ui/CustomToast";
import { getAuthToken } from "../../utils/auth";
import CommandPalette from "../topbar/CommandPalette";
import CurrencyModal from "../topbar/CurrencyModal";

/* =========================================================
   API CONFIG
========================================================= */

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, "");

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

  if (cleanAvatar.startsWith("http://") || cleanAvatar.startsWith("https://")) {
    return cleanAvatar;
  }

  return `${API_ORIGIN}${cleanAvatar.startsWith("/") ? "" : "/"}${cleanAvatar}`;
};

const DEFAULT_FLAGS = {
  USD: "🇺🇸",
  INR: "🇮🇳",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  JPY: "🇯🇵",
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

  const isMountedRef = useRef(true);

  /* =======================================================
     STORES (CURRENCY & NOTIFICATION)
  ======================================================= */

  const {
    currencies = [],
    selectedCurrency,
    setCurrency,
    changeCurrency,
    setSelectedCurrency,
    fetchCurrencies,
  } = useCurrencyStore();

  const { unreadCount = 0, fetchNotifications } = useNotificationStore();

  /* =======================================================
     NORMALIZE SELECTED CURRENCY
  ======================================================= */

  const selectedCurrencyCode = useMemo(() => {
    if (typeof selectedCurrency === "string") return selectedCurrency;
    if (selectedCurrency && typeof selectedCurrency === "object") {
      return selectedCurrency.code || "USD";
    }
    return "USD";
  }, [selectedCurrency]);

  const currentCurrency = useMemo(() => {
    const found = currencies?.find((c) => c?.code === selectedCurrencyCode);
    if (found) return found;

    if (typeof selectedCurrency === "object" && selectedCurrency !== null) {
      return selectedCurrency;
    }

    return {
      code: selectedCurrencyCode,
      symbol: selectedCurrencyCode === "INR" ? "₹" : "$",
      flag: DEFAULT_FLAGS[selectedCurrencyCode] || "🌐",
    };
  }, [currencies, selectedCurrency, selectedCurrencyCode]);

  /* =======================================================
     FETCH USER FROM DATABASE (SAFE CLEANUP)
  ======================================================= */

  const fetchUser = useCallback(async () => {
    try {
      const token = getAuthToken();

      if (!token) {
        if (isMountedRef.current) {
          setUser(null);
          setLoading(false);
        }
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
      if (isMountedRef.current) {
        setUser(databaseUser);
      }
      return databaseUser;
    } catch (error) {
      console.error("TOPBAR USER FETCH ERROR:", error);
      if (isMountedRef.current) {
        setUser(null);
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  /* =======================================================
     MOUNT EFFECT (RUNS ONCE WITHOUT LOOPING)
  ======================================================= */

  useEffect(() => {
    isMountedRef.current = true;

    fetchUser();

    if (typeof fetchCurrencies === "function") {
      fetchCurrencies();
    }

    if (typeof fetchNotifications === "function") {
      fetchNotifications();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchUser, fetchCurrencies, fetchNotifications]);

  /* =======================================================
     PROFILE UPDATED HANDLER
  ======================================================= */

  const handleProfileUpdated = useCallback((updatedUser) => {
    if (!updatedUser) return;
    setUser(updatedUser);
  }, []);

  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";

  const initials =
    `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() ||
    "U";

  const avatarUrl = getAvatarUrl(user?.avatar);

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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* =======================================================
     CURRENCY CHANGE HANDLER
  ======================================================= */

  const handleCurrencyChange = async (currency) => {
    try {
      if (!currency) return;

      const code = typeof currency === "string" ? currency : currency.code;
      const matched =
        currencies?.find((c) => c.code === code) ||
        (typeof currency === "object" ? currency : null) || {
          code,
          symbol: code === "INR" ? "₹" : code === "EUR" ? "€" : "$",
          flag: DEFAULT_FLAGS[code] || "🌐",
          name: code,
          rate: 1,
        };

      const updateFn = setCurrency || changeCurrency || setSelectedCurrency;
      if (typeof updateFn === "function") {
        await updateFn(matched);
      }

      localStorage.setItem("selectedCurrency", JSON.stringify(matched));
      localStorage.setItem("app_currency", matched.code);
      localStorage.setItem("app_currency_symbol", matched.symbol || "$");

      setShowCurrencyModal(false);
      showToast(`Currency changed to ${matched.code}`);
    } catch (error) {
      console.error("CURRENCY CHANGE ERROR:", error);
      showErrorToast("Failed to change currency");
    }
  };

  const handleAvatarError = (event) => {
    event.currentTarget.style.display = "none";
  };

  return (
    <>
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
        {/* LEFT */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <Breadcrumb />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* SEARCH - DESKTOP */}
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
            <span className="text-xs px-1.5 py-0.5 rounded border border-border bg-surface">
              Ctrl K
            </span>
          </button>

          {/* SEARCH - MOBILE */}
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

          {/* CURRENCY SELECTOR (ANCHORED RELATIVE CONTAINER) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCurrencyModal((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border hover:bg-surface-hover rounded-lg text-sm font-semibold transition active:scale-95"
              aria-label="Select currency"
              aria-expanded={showCurrencyModal}
            >
              <span>{currentCurrency?.flag || "🇺🇸"}</span>
              <span>{selectedCurrencyCode || "USD"}</span>
              <span
                className="material-symbols-outlined text-text-light hidden md:inline"
                style={{ fontSize: "16px" }}
              >
                {showCurrencyModal ? "expand_less" : "expand_more"}
              </span>
            </button>

            {/* CURRENCY MODAL RENDERED EXACTLY UNDER THE BUTTON */}
            <CurrencyModal
              isOpen={showCurrencyModal}
              currencies={currencies}
              selectedCurrencyCode={selectedCurrencyCode}
              onSelect={handleCurrencyChange}
              onClose={() => setShowCurrencyModal(false)}
            />
          </div>

          {/* NOTIFICATIONS */}
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

            {unreadCount > 0 && (
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
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div className="hidden sm:block w-px h-8 bg-border mx-1" />

          {/* USER PROFILE */}
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

            <div className="hidden lg:block text-left min-w-0">
              <p className="text-sm font-medium text-text truncate max-w-[140px]">
                {loading ? "Loading..." : displayName}
              </p>
              {user?.role && (
                <p className="text-xs text-text-muted capitalize">
                  {String(user.role).toLowerCase()}
                </p>
              )}
            </div>

            <svg
              className="hidden lg:block text-text-muted"
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

      {/* DRAWERS & COMMAND PALETTE */}
      <AdminDrawer
        isOpen={showAdminDrawer}
        onClose={() => setShowAdminDrawer(false)}
        onProfileUpdated={handleProfileUpdated}
      />

      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

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