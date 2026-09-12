import { useState } from "react";
import toast from "react-hot-toast";
import ApiWebhooksSection from "../../components/setting/ApiWebhooksSection";
import DataExportSection from "../../components/setting/DataExportSection";
import NotificationsSection from "../../components/setting/NotificationsSection";
import IntegrationsSection from "../../components/setting/IntegrationsSection";
import PaymentMethodsSection from "../../components/setting/PaymentMethodsSection";
import SectionHeader from "../../components/ui/SectionHeader";
import SettingsNav from "../../components/setting/SettingsNav";
import BusinessInfoSection from "../../components/setting/BusinessInfoSection";
import BrandingSection from "../../components/setting/BrandingSection";
import TaxInvoicingSection from "../../components/setting/TaxInvoicingSection";
import { getCompany, getCurrentUser, setCompany } from "../../utils/auth";

const NOTIFICATION_ROWS = [
  { id: "paid", email: true, push: true, slack: true },
  { id: "overdue", email: true, push: false, slack: true },
  { id: "errors", email: true, push: true, slack: true },
  { id: "mentions", email: true, push: true, slack: true },
  { id: "weekly", email: true, push: false, slack: false },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");

  // Dynamic fetcher: Registered / Saved Business Data
  const getInitialBusinessData = () => {
    try {
      const savedBiz = localStorage.getItem("autobillr-business");
      if (savedBiz) return JSON.parse(savedBiz);
    } catch {
      // fallback to auth data
    }

    let regCompany = {};
    let regUser = {};

    try {
      regCompany = getCompany() || {};
      regUser = getCurrentUser() || {};
    } catch {
      // ignore
    }

    // Fallback: Zustand storage agar direct keys na milein
    if (!regUser || !Object.keys(regUser).length) {
      try {
        const rawAuth = localStorage.getItem("autobiller-auth");
        if (rawAuth) {
          const parsed = JSON.parse(rawAuth);
          regUser = parsed?.state?.user || parsed?.user || {};
          if (!regCompany || !Object.keys(regCompany).length) {
            regCompany = parsed?.state?.company || parsed?.company || {};
          }
        }
      } catch {
        // ignore
      }
    }

    const userName =
      regUser.name ||
      regUser.fullName ||
      regUser.username ||
      "Aanjaneya Dikhit";

    const compName =
      regCompany.name ||
      regCompany.companyName ||
      regUser.company ||
      regUser.companyName ||
      `${userName}'s Workspace`;

    return {
      companyName: compName,
      displayName: userName,
      industry: regCompany.industry || "SaaS / Software",
      companySize: regCompany.companySize || "1–10 employees",
      currency: "INR (₹)",
      fiscalYear: "April",
      address: regCompany.address || "",
      taxId: regCompany.taxId || regCompany.gstin || "",
      vat: regCompany.vat || "",
    };
  };

  // Branding
  const [logoUrl, setLogoUrl] = useState(
    () => localStorage.getItem("autobillr-logo") || null
  );
  const [brandColor, setBrandColor] = useState(
    () => localStorage.getItem("autobillr-brand-color") || "#0d9488"
  );
  const [brandToggles, setBrandToggles] = useState({
    qr: true,
    thumbnails: false,
    footer: true,
  });

  // Business
  const [business, setBusiness] = useState(getInitialBusinessData);

  // Tax
  const [tax, setTax] = useState(() => {
    try {
      const savedTax = localStorage.getItem("autobillr-tax");
      return savedTax
        ? JSON.parse(savedTax)
        : {
            rate: "18",
            label: "GST",
            prefix: "INV-",
            nextNumber: "1001",
            terms: "Net 15",
            lateFee: "1.5% / month",
            autoTax: true,
            breakdown: false,
          };
    } catch {
      return {
        rate: "18",
        label: "GST",
        prefix: "INV-",
        nextNumber: "1001",
        terms: "Net 15",
        lateFee: "1.5% / month",
        autoTax: true,
        breakdown: false,
      };
    }
  });

  // Notifications
  const [notif, setNotif] = useState(
    Object.fromEntries(
      NOTIFICATION_ROWS.map((r) => [
        r.id,
        { email: r.email, push: r.push, slack: r.slack },
      ])
    )
  );

  // Export
  const [exportToggles, setExportToggles] = useState({
    archive: true,
    encrypt: true,
  });

  const setBiz = (key) => (e) =>
    setBusiness((p) => ({ ...p, [key]: e.target.value }));

  const setTaxField = (key) => (e) =>
    setTax((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = () => {
    if (activeTab === "business") {
      localStorage.setItem("autobillr-business", JSON.stringify(business));

      const currentCompany = getCompany() || {};
      setCompany({
        ...currentCompany,
        name: business.companyName,
        companyName: business.companyName,
        displayName: business.displayName,
        currency: business.currency,
        address: business.address,
        taxId: business.taxId,
      });

      toast.success("Business details saved successfully!");
    } else if (activeTab === "branding") {
      if (logoUrl) localStorage.setItem("autobillr-logo", logoUrl);
      localStorage.setItem("autobillr-brand-color", brandColor);
      toast.success("Branding settings saved!");
    } else if (activeTab === "tax") {
      localStorage.setItem("autobillr-tax", JSON.stringify(tax));
      toast.success("Tax & invoicing settings saved!");
    } else {
      toast.success(`${activeTab.toUpperCase()} settings saved!`);
    }
  };

  const handleDiscard = () => {
    if (activeTab === "business") {
      localStorage.removeItem("autobillr-business");
      setBusiness(getInitialBusinessData());
      toast("Changes discarded", { icon: "↩️" });
    }
  };

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">
      <div className="page-in">
        <SectionHeader
          title="Settings"
          description="Configure your workspace, branding, tax, integrations and exports."
        />

        <div className="grid grid-cols-12 gap-6">
          <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="col-span-12 md:col-span-9 space-y-5">
            {activeTab === "business" && (
              <BusinessInfoSection
                business={business}
                setBiz={setBiz}
                onDiscard={handleDiscard}
                onSave={handleSave}
              />
            )}

            {activeTab === "branding" && (
              <BrandingSection
                brandColor={brandColor}
                setBrandColor={setBrandColor}
                brandToggles={brandToggles}
                setBrandToggles={setBrandToggles}
                logoUrl={logoUrl}
                setLogoUrl={setLogoUrl}
                onDiscard={handleDiscard}
                onSave={handleSave}
              />
            )}

            {activeTab === "tax" && (
              <TaxInvoicingSection
                tax={tax}
                setTaxField={setTaxField}
                setTax={setTax}
                onDiscard={handleDiscard}
                onSave={handleSave}
              />
            )}

            {activeTab === "payments" && (
              <PaymentMethodsSection
                onDiscard={handleDiscard}
                onSave={handleSave}
              />
            )}

            {activeTab === "integrations" && (
              <IntegrationsSection
                onDiscard={handleDiscard}
                onSave={handleSave}
              />
            )}

            {activeTab === "notifications" && (
              <NotificationsSection
                notif={notif}
                setNotif={setNotif}
                onDiscard={handleDiscard}
                onSave={handleSave}
              />
            )}

            {activeTab === "api" && (
              <ApiWebhooksSection
                onDiscard={handleDiscard}
                onSave={handleSave}
              />
            )}

            {activeTab === "export" && (
              <DataExportSection
                exportToggles={exportToggles}
                setExportToggles={setExportToggles}
                onDiscard={handleDiscard}
                onSave={handleSave}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}