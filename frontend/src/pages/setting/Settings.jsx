import React, { useState } from "react";
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

const NOTIFICATION_ROWS = [
  { id: "paid", email: true, push: true, slack: true },
  { id: "overdue", email: true, push: false, slack: true },
  { id: "errors", email: true, push: true, slack: true },
  { id: "mentions", email: true, push: true, slack: true },
  { id: "weekly", email: true, push: false, slack: false },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");

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
  const [business, setBusiness] = useState({
    companyName: "AutoBillr Inc.",
    displayName: "AutoBillr",
    industry: "SaaS / Software",
    companySize: "50–250 employees",
    currency: "USD ($)",
    fiscalYear: "January",
    address: "1287 Financial District, San Francisco, CA 94105, United States",
    taxId: "84-3219872",
    vat: "",
  });

  // Tax
  const [tax, setTax] = useState({
    rate: "8.5",
    label: "Sales Tax (CA)",
    prefix: "INV-",
    nextNumber: "8831",
    terms: "Net 15",
    lateFee: "1.5% / month",
    autoTax: true,
    breakdown: false,
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

  const handleSave = () => console.log("Save", activeTab);
  const handleDiscard = () => console.log("Discard", activeTab);

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