import { useEffect, useState } from "react";
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
import { getProfile } from "../../services/userService";
import { updateBusinessProfile } from "../../services/settingsService";
import { showSuccessToast } from "../../components/ui/CustomToast";
import FeatureGate from "../../components/common/FeatureGate";

/* =========================================================
   EMPTY STATES
========================================================= */

const EMPTY_BUSINESS = {
  companyName: "",
  displayName: "",
  industry: "",
  companySize: "",
  currency: "USD",
  fiscalYear: "",
  address: "",
  taxId: "",
  vat: "",
};

const EMPTY_TAX = {
  rate: "18",
  label: "",
  prefix: "",
  nextNumber: "",
  terms: "",
  lateFee: "",
  autoTax: false,
  breakdown: false,
};

const EMPTY_BRANDING = {
  logo: null,
  brandColor: "",
  qr: false,
  thumbnails: false,
  footer: false,
};

const NOTIFICATION_ROWS = [
  { id: "paid", email: true, push: true, slack: true },
  { id: "overdue", email: true, push: false, slack: true },
  { id: "errors", email: true, push: true, slack: true },
  { id: "mentions", email: true, push: true, slack: true },
  { id: "weekly", email: true, push: false, slack: false },
];

function getEmptyNotifications() {
  return Object.fromEntries(
    NOTIFICATION_ROWS.map((row) => [
      row.id,
      {
        email: row.email,
        push: row.push,
        slack: row.slack,
      },
    ])
  );
}

/* =========================================================
   SETTINGS COMPONENT
========================================================= */

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");
  const [loading, setLoading] = useState(true);

  const [business, setBusiness] = useState(EMPTY_BUSINESS);
  const [tax, setTax] = useState(EMPTY_TAX);
  const [branding, setBranding] = useState(EMPTY_BRANDING);
  const [notif, setNotif] = useState(getEmptyNotifications());
  const [exportToggles, setExportToggles] = useState({
    archive: false,
    encrypt: false,
  });

  /* =========================================================
     LOAD SAVED / REGISTERED DATA
  ========================================================= */

  const loadSettings = async () => {
    const localBiz = JSON.parse(
      localStorage.getItem("autobillr-business") || "{}"
    );
    const localTax = JSON.parse(
      localStorage.getItem("autobillr-tax") || "{}"
    );
    const localBranding = JSON.parse(
      localStorage.getItem("autobillr-branding") || "{}"
    );

    try {
      setLoading(true);

      const response = await getProfile().catch(() => null);
      const user = response?.user || {};
      const company = user?.company || response?.company || {};

      /* ================= BUSINESS ================= */
      setBusiness({
        companyName:
          company?.name || user?.companyName || localBiz.companyName || "",
        displayName:
          company?.displayName || user?.displayName || localBiz.displayName || "",
        industry:
          company?.industry || user?.industry || localBiz.industry || "",
        companySize:
          company?.companySize || user?.companySize || localBiz.companySize || "",
        currency:
          company?.currency || user?.currency || localBiz.currency || "USD",
        fiscalYear:
          company?.fiscalYear || user?.fiscalYear || localBiz.fiscalYear || "",
        address:
          company?.address || user?.address || localBiz.address || "",
        taxId:
          company?.taxId || user?.taxId || localBiz.taxId || "",
        vat:
          company?.vat || user?.vat || localBiz.vat || "",
      });

      /* ================= TAX ================= */
      setTax({
        rate: company?.taxRate || user?.taxRate || localTax.rate || "18",
        label: company?.taxLabel || user?.taxLabel || localTax.label || "",
        prefix: company?.invoicePrefix || user?.invoicePrefix || localTax.prefix || "",
        nextNumber:
          company?.nextInvoiceNumber || user?.nextInvoiceNumber || localTax.nextNumber || "",
        terms: company?.paymentTerms || user?.paymentTerms || localTax.terms || "",
        lateFee: company?.lateFee || user?.lateFee || localTax.lateFee || "",
        autoTax:
          company?.autoTax ?? user?.autoTax ?? localTax.autoTax ?? false,
        breakdown:
          company?.taxBreakdown ?? user?.taxBreakdown ?? localTax.breakdown ?? false,
      });

      /* ================= BRANDING ================= */
      setBranding({
        logo: company?.logo || user?.logo || localBranding.logo || null,
        brandColor:
          company?.brandColor || user?.brandColor || localBranding.brandColor || "",
        qr: company?.showQr ?? user?.showQr ?? localBranding.qr ?? false,
        thumbnails:
          company?.showThumbnails ?? user?.showThumbnails ?? localBranding.thumbnails ?? false,
        footer:
          company?.showFooter ?? user?.showFooter ?? localBranding.footer ?? false,
      });

      if (company?.notifications || user?.notifications) {
        setNotif(company?.notifications || user?.notifications);
      }

      if (company?.exportSettings || user?.exportSettings) {
        setExportToggles(company?.exportSettings || user?.exportSettings);
      }
    } catch (error) {
      console.error("LOAD SETTINGS ERROR:", error);
      if (Object.keys(localBiz).length > 0) setBusiness((prev) => ({ ...prev, ...localBiz }));
      if (Object.keys(localTax).length > 0) setTax((prev) => ({ ...prev, ...localTax }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  /* =========================================================
     INPUT HANDLERS
  ========================================================= */

  const setBiz = (key) => (event) => {
    setBusiness((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  const setTaxField = (key) => (event) => {
    setTax((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  const applyThemeColor = (color) => {
    if (!color) return;
    document.documentElement.style.setProperty("--primary", color);
    document.documentElement.style.setProperty("--color-primary", color);
    document.documentElement.style.setProperty("--primary-color", color);
  };

  const handleBrandColor = (color) => {
    setBranding((previous) => ({
      ...previous,
      brandColor: color,
    }));
    applyThemeColor(color);
  };

  /* =========================================================
     SAVE HANDLER
  ========================================================= */

  const handleSave = async () => {
    try {
      localStorage.setItem("autobillr-business", JSON.stringify(business));
      localStorage.setItem(
        "autobillr-tax",
        JSON.stringify({
          rate: tax.rate ?? "18",
          label: tax.label ?? "",
          prefix: tax.prefix ?? "",
          nextNumber: tax.nextNumber ?? "",
          terms: tax.terms ?? "",
          lateFee: tax.lateFee ?? "",
          autoTax: Boolean(tax.autoTax),
          breakdown: Boolean(tax.breakdown),
        })
      );
      localStorage.setItem("autobillr-branding", JSON.stringify(branding));

      try {
        await updateBusinessProfile(business);
      } catch (apiErr) {
        console.warn("Backend update API failed, but data is saved in browser:", apiErr);
      }

      showSuccessToast("Settings saved successfully.");
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  /* =========================================================
     DISCARD HANDLER
  ========================================================= */

  const handleDiscard = async () => {
    await loadSettings();
    showSuccessToast("Changes reverted.");
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <main className="flex-1 pt-2 pb-12">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="py-10 text-sm text-text-muted">
            Loading your registered settings...
          </div>
        </div>
      </main>
    );
  }

  /* =========================================================
     RENDER UI
  ========================================================= */

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
            {/* BUSINESS */}
            {activeTab === "business" && (
              <BusinessInfoSection
                business={business}
                setBiz={setBiz}
                onDiscard={handleDiscard}
                onSave={handleSave}
              />
            )}

            {/* BRANDING */}
            {activeTab === "branding" && (
              <BrandingSection
                brandColor={branding.brandColor}
                setBrandColor={handleBrandColor}
                brandToggles={{
                  qr: branding.qr,
                  thumbnails: branding.thumbnails,
                  footer: branding.footer,
                }}
                setBrandToggles={(value) => {
                  setBranding((previous) => ({
                    ...previous,
                    ...value,
                  }));
                }}
                logoUrl={branding.logo}
                setLogoUrl={(value) => {
                  setBranding((previous) => ({
                    ...previous,
                    logo: value,
                  }));
                }}
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
              <FeatureGate feature="canUseApiWebhooks" requiredPlan="Pro">
                <ApiWebhooksSection
                  onDiscard={handleDiscard}
                  onSave={handleSave}
                />
              </FeatureGate>
            )}

            {/* EXPORT */}
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