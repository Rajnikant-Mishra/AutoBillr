import { useState, useEffect, useCallback, useRef } from "react";
import AdminDrawer from "../topbar/AdminDrawer";
import Breadcrumb from "../ui/Breadcrumb";
import { useCurrencyStore } from "../../store/currencyStore";
import { showToast, showErrorToast } from "../../components/ui/CustomToast";
import NotificationDrawer from "../topbar/NotificationDrawer";
export default function Topbar() {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAdminDrawer, setShowAdminDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
const [isCommandVisible, setIsCommandVisible] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);
  const currencyModalRef = useRef(null);
  const commandModalRef = useRef(null);
const {
  currencies,
  selectedCurrency,
  setCurrencies,
  setSelectedCurrency,
  changeCurrency,
} = useCurrencyStore();


  // Fetch Currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/currencies");
        if (!res.ok) throw new Error("Failed to fetch currencies");
        
        const data = await res.json();
       setCurrencies(data.currencies || []);

const current =
  data.currencies?.find(
    c => c.code === data.selectedCurrency
  ) ||
  data.currencies?.find(
    c => c.code === "USD"
  );

if (current) {
  setSelectedCurrency(current);
}
      } catch (err) {
        console.error("Currency fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencies();
  }, []);

  // Close modals on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (currencyModalRef.current && !currencyModalRef.current.contains(e.target)) {
        setShowCurrencyModal(false);
      }
      if (commandModalRef.current && !commandModalRef.current.contains(e.target)) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Shortcuts (⌘K / Ctrl+K and ESC)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === "Escape") {
        setShowCommandPalette(false);
        setShowCurrencyModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCurrencyModal = useCallback(() => {
    setShowCurrencyModal(prev => !prev);
  }, []);

  const openCommandPalette = useCallback(() => {
    setShowCommandPalette(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setShowCommandPalette(false);
  }, []);

 const handleCurrencySelect = useCallback(
  async (currency) => {
    try {
      // Don't do anything if the same currency is selected
      if (selectedCurrency?.code === currency.code) {
        setShowCurrencyModal(false);
        return;
      }

      const previousCurrency = selectedCurrency;

      const res = await fetch(
        "http://localhost:5000/api/currencies/select",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currency: currency.code,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update currency");
      }

      // Update Zustand Store
      changeCurrency(currency);

      setShowCurrencyModal(false);

      // Success Toast
      showToast({
  title: "Currency Changed",
  message: `${previousCurrency?.name} (${previousCurrency?.code}) → ${currency.name} (${currency.code})`,
  type: "success",
});
    } catch (error) {
      console.error(error);

      showErrorToast("Unable to change currency.");
    }
  },
  [selectedCurrency, changeCurrency]
);
useEffect(() => {
    if (showCommandPalette) {
      // Small delay to trigger animation after render
      const timer = setTimeout(() => {
        setIsCommandVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setIsCommandVisible(false);
    }
  }, [showCommandPalette]);
  if (loading && !currencies.length) {
    return <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md z-30" />;
  }

  return (
    <>
      <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md z-30 flex items-center justify-between px-6 md:px-8 shadow-sm">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          {/* Breadcrumb */}
        <div className="hidden md:block">
  <Breadcrumb />
</div>

          {/* Search Bar - Click to Open Command Palette */}
          <div 
            onClick={openCommandPalette}
            className="relative flex-1 max-w-md ml-0 md:ml-4 cursor-pointer"
          >
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: "18px" }}>
              search
            </span>
            
            <input
              readOnly
              placeholder="Search invoices, clients, projects…"
              className="w-full pl-10 pr-12 py-2 bg-slate-100 border border-transparent hover:border-slate-200 rounded-lg text-sm focus:bg-white focus:border-teal-300 focus:ring-2 focus:ring-teal-500/15 outline-none transition cursor-pointer"
            />
            
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 bg-white hidden sm:block">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Currency Selector */}
          {/* Currency Selector */}
<div className="relative" ref={currencyModalRef}>
  <button
    onClick={toggleCurrencyModal}
    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold transition active:scale-95"
    aria-label="Select currency"
  >
    <span>{selectedCurrency?.flag || "🇮🇳"}</span>
    <span>{selectedCurrency?.code || "INR"}</span>
    <span 
      className="material-symbols-outlined text-slate-400 hidden md:inline transition-colors group-hover:text-slate-600" 
      style={{ fontSize: "16px" }}
    >
      expand_more
    </span>
  </button>

  {showCurrencyModal && (
    <div className="modal-in absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Currency</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Rates updated 2 min ago</div>
        </div>
        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">LIVE</span>
      </div>

      {/* Currency List */}
      <div className="max-h-80 overflow-auto py-1">
        {currencies.map((currency) => (
          <button
            key={currency.code}
            onClick={() => handleCurrencySelect(currency)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition text-left ${
              selectedCurrency?.code === currency.code ? "bg-teal-50" : ""
            }`}
          >
            <span className="text-xl leading-none">{currency.flag}</span>

            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-bold text-slate-900 flex items-center gap-2">
                {currency.code}
                <span className="text-slate-400 font-normal">{currency.symbol}</span>
              </div>
              <div className="text-[11px] text-slate-500">{currency.name}</div>
            </div>

            <div className="text-right">
              <div className="text-[11px] tabular font-mono text-slate-500">
                {currency.rate || "—"}
              </div>
              {selectedCurrency?.code === currency.code && (
                <span 
                  className="material-symbols-outlined text-teal-600 ml-auto mt-0.5 block"
                  style={{ fontSize: "14px" }}
                >
                  check_circle
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2 text-[10.5px] text-slate-500">
        <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>info</span>
        Base: USD · Auto-refreshed daily
      </div>
    </div>
  )}
</div>

          {/* Other Right Side Buttons */}
          <button className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition" title="Refresh">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>refresh</span>
          </button>

          <button className="relative p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition" title="Notifications" onClick={() => setShowNotifications(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full ring-2 ring-white"></span>
          </button>

          <button className="hidden md:inline-flex p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition" title="Help">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>help</span>
          </button>

          <div className="h-8 w-px bg-slate-200 hidden md:block" />

          {/* Profile */}
          <div onClick={() => setShowAdminDrawer(true)} className="flex items-center gap-2.5 cursor-pointer group p-1 hover:bg-slate-100 rounded-lg pr-3">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" src="https://i.pravatar.cc/64?img=12" />
            <div className="hidden md:block leading-tight">
              <div className="text-[13px] font-semibold text-slate-900">Alex Sterling</div>
              <div className="text-[10.5px] text-slate-500">Admin · Enterprise</div>
            </div>
            <span className="material-symbols-outlined text-slate-400 hidden md:inline" style={{ fontSize: "16px" }}>expand_more</span>
          </div>
        </div>
      </header>

      {/* COMMAND PALETTE MODAL */}
      {showCommandPalette && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[101] flex items-start justify-end pt-[12vh] pr-6 md:pr-8">
          <div 
            ref={commandModalRef} 
            className="modal-in w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Search Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "20px" }}>search</span>
              <input
                autoFocus
                placeholder="Search or jump to…"
                className="flex-1 border-0 outline-none text-[15px] font-medium placeholder:text-slate-400"
              />
              <kbd className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50">ESC</kbd>
            </div>

            {/* Content */}
            <div className="max-h-[420px] overflow-auto p-2">
              {/* Navigate Section */}
              <div>
                <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigate</div>
                {[
                  { icon: "dashboard", label: "Dashboard" },
                  { icon: "receipt_long", label: "Invoices" },
                  { icon: "edit_note", label: "Invoice Composer" },
                  { icon: "group", label: "Clients" },
                  { icon: "assignment", label: "Projects & Milestones" },
                  { icon: "bar_chart", label: "Analytics" },
                  { icon: "auto_awesome", label: "Recurring Automation" },
                  { icon: "settings", label: "Settings" },
                  { icon: "admin_panel_settings", label: "Team & Permissions" },
                  { icon: "share", label: "Client Portal" },
                  { icon: "loyalty", label: "Pricing" },
                ].map((item, i) => (
                  <div 
      key={i} 
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-teal-50"
    >
      <span className="w-7 h-7 rounded-md grid place-items-center bg-slate-100 text-slate-500 
                       group-hover:bg-white group-hover:text-teal-600 transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
          {item.icon}
        </span>
                    </span>
                    <span className="text-[13px] font-medium flex-1">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Actions Section */}
              <div>
                <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Actions</div>
                {[
                  { icon: "add", label: "Create new invoice", shortcut: "⇧ N" },
                  { icon: "person_add", label: "Add a new client" },
                  { icon: "add_business", label: "Add a new project" },
                  { icon: "bolt", label: "Quick invoice (drawer)" },
                  { icon: "filter_list", label: "Open filter panel" },
                  { icon: "notifications", label: "Notifications" },
                ].map((item, i) => (
                <div 
      key={i} 
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-teal-50"
    >
      <span className="w-7 h-7 rounded-md grid place-items-center bg-slate-100 text-slate-500 
                       group-hover:bg-white group-hover:text-teal-600 transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
          {item.icon}
        </span>
      </span>
                    <span className="text-[13px] font-medium flex-1">{item.label}</span>
                    {item.shortcut && <span className="text-[11px] text-slate-400">{item.shortcut}</span>}
                  </div>
                ))}
              </div>

              {/* Recent Section */}
              <div>
                <div className="px-3 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent</div>
                <div  
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-teal-50"
    >
      <span className="w-7 h-7 rounded-md grid place-items-center bg-slate-100 text-slate-500 
                       group-hover:bg-white group-hover:text-teal-600 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>receipt_long</span>
                  </span>
                  <span className="text-[13px] font-medium flex-1">INV-8821 · Apex Partners</span>
                </div>
               <div
      className="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-slate-700 hover:text-slate-900 hover:bg-teal-50"
    >
      <span className="w-7 h-7 rounded-md grid place-items-center bg-slate-100 text-slate-500 
                       group-hover:bg-white group-hover:text-teal-600 transition-colors">
                    <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>assignment</span>
                  </span>
                  <span className="text-[13px] font-medium flex-1">Q4 Marketing Campaign · Acme</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 flex gap-4 text-[10.5px] text-slate-500">
              <span><kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono mr-1">↑↓</kbd>Navigate</span>
              <span><kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white font-mono mr-1">↵</kbd>Select</span>
              <span className="ml-auto">19 results</span>
            </div>
          </div>
        </div>
      )}
      <AdminDrawer
  isOpen={showAdminDrawer}
  onClose={() => setShowAdminDrawer(false)}
/>
<NotificationDrawer
  isOpen={showNotifications}
  onClose={() => setShowNotifications(false)}
/>
    </>
  );
}