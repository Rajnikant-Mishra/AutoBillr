
import React, { useEffect, useState } from "react";

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
import { showSuccessToast } from "../../components/ui/CustomToast";

/* =========================================================
   EMPTY STATES
   These are NOT default company values.
   They are only empty values until backend data loads.
========================================================= */

const EMPTY_BUSINESS = {
  companyName: "",
  displayName: "",
  industry: "",
  companySize: "",
  currency: "",
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
  {
    id: "paid",
    email: true,
    push: true,
    slack: true,
  },
  {
    id: "overdue",
    email: true,
    push: false,
    slack: true,
  },
  {
    id: "errors",
    email: true,
    push: true,
    slack: true,
  },
  {
    id: "mentions",
    email: true,
    push: true,
    slack: true,
  },
  {
    id: "weekly",
    email: true,
    push: false,
    slack: false,
  },
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
   SETTINGS
========================================================= */

export default function Settings() {
  const [activeTab, setActiveTab] = useState("business");

  const [loading, setLoading] = useState(true);

  const [business, setBusiness] =
    useState(EMPTY_BUSINESS);

  const [tax, setTax] =
    useState(EMPTY_TAX);

  const [branding, setBranding] =
    useState(EMPTY_BRANDING);

  const [notif, setNotif] = useState(
    getEmptyNotifications()
  );

  const [exportToggles, setExportToggles] =
    useState({
      archive: false,
      encrypt: false,
    });

  /* =========================================================
     LOAD REGISTERED DATA
  ========================================================= */

  const loadSettings = async () => {
    try {
      setLoading(true);

      const response = await getProfile();

      console.log(
        "REGISTERED PROFILE RESPONSE:",
        response
      );

      const user = response?.user;

      if (!user) {
        throw new Error(
          "User information not returned by backend"
        );
      }

      /*
       * Company can come from:
       *
       * response.user.company
       * response.company
       *
       */

      const company =
        user?.company ||
        response?.company ||
        {};

      console.log(
        "REGISTERED COMPANY:",
        company
      );

      /* =====================================================
         BUSINESS
      ===================================================== */

      setBusiness({
        companyName:
          company?.name ??
          user?.companyName ??
          "",

        displayName:
          company?.displayName ??
          user?.displayName ??
          "",

        industry:
          company?.industry ??
          user?.industry ??
          "",

        companySize:
          company?.companySize ??
          user?.companySize ??
          "",

        currency:
          company?.currency ??
          user?.currency ??
          "",

        fiscalYear:
          company?.fiscalYear ??
          user?.fiscalYear ??
          "",

        address:
          company?.address ??
          user?.address ??
          "",

        taxId:
          company?.taxId ??
          user?.taxId ??
          "",

        vat:
          company?.vat ??
          user?.vat ??
          "",
      });

      /* =====================================================
         TAX

         THIS IS THE IMPORTANT PART.

         Values come from backend/database.
         No hardcoded tax values.
      ===================================================== */

      setTax({
        rate:
          company?.taxRate ??
          user?.taxRate ??
          "",

        label:
          company?.taxLabel ??
          user?.taxLabel ??
          "",

        prefix:
          company?.invoicePrefix ??
          user?.invoicePrefix ??
          "",

        nextNumber:
          company?.nextInvoiceNumber ??
          user?.nextInvoiceNumber ??
          "",

        terms:
          company?.paymentTerms ??
          user?.paymentTerms ??
          "",

        lateFee:
          company?.lateFee ??
          user?.lateFee ??
          "",

        autoTax:
          company?.autoTax ??
          user?.autoTax ??
          false,

        breakdown:
          company?.taxBreakdown ??
          user?.taxBreakdown ??
          false,
      });

      /* =====================================================
         BRANDING
      ===================================================== */

      setBranding({
        logo:
          company?.logo ??
          user?.logo ??
          null,

        brandColor:
          company?.brandColor ??
          user?.brandColor ??
          "",

        qr:
          company?.showQr ??
          user?.showQr ??
          false,

        thumbnails:
          company?.showThumbnails ??
          user?.showThumbnails ??
          false,

        footer:
          company?.showFooter ??
          user?.showFooter ??
          false,
      });

      /* =====================================================
         NOTIFICATIONS
      ===================================================== */

      if (
        company?.notifications ||
        user?.notifications
      ) {
        setNotif(
          company?.notifications ||
            user?.notifications
        );
      }

      /* =====================================================
         EXPORT
      ===================================================== */

      if (
        company?.exportSettings ||
        user?.exportSettings
      ) {
        setExportToggles(
          company?.exportSettings ||
            user?.exportSettings
        );
      }

    } catch (error) {
      console.error(
        "LOAD SETTINGS ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD WHEN PAGE OPENS
  ========================================================= */

  useEffect(() => {
    loadSettings();
  }, []);

  /* =========================================================
     BUSINESS INPUT
  ========================================================= */

  const setBiz = (key) => (event) => {
    setBusiness((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  /* =========================================================
     TAX INPUT
  ========================================================= */

  const setTaxField = (key) => (event) => {
    setTax((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  /* =========================================================
     THEME
  ========================================================= */

  const applyThemeColor = (color) => {
    if (!color) return;

    document.documentElement.style.setProperty(
      "--primary",
      color
    );

    document.documentElement.style.setProperty(
      "--color-primary",
      color
    );

    document.documentElement.style.setProperty(
      "--primary-color",
      color
    );
  };

  /* =========================================================
     BRAND COLOR
  ========================================================= */

  const handleBrandColor = (color) => {
    setBranding((previous) => ({
      ...previous,
      brandColor: color,
    }));

    applyThemeColor(color);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = async () => {
  console.log("TAX VALUES:", tax);
  console.log("BUSINESS VALUES:", business);
  console.log("BRANDING VALUES:", branding);

  // Persist tax so Composer can use it
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

  showSuccessToast("Tax settings updated.");
};

  /* =========================================================
     DISCARD
  ========================================================= */

  const handleDiscard = async () => {
    await loadSettings();

    showSuccessToast(
      "Changes reverted."
    );
  };

  /* =========================================================
     LOADING
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
     UI
  ========================================================= */

  return (
    <main className="flex-1 pt-2 pb-12 max-w-[1600px] mx-auto w-full scroll-host">

      <div className="page-in">

        <SectionHeader
          title="Settings"
          description="Configure your workspace, branding, tax, integrations and exports."
        />

        <div className="grid grid-cols-12 gap-6">

          <SettingsNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="col-span-12 md:col-span-9 space-y-5">

            {/* =================================================
                BUSINESS
            ================================================= */}

            {activeTab === "business" && (
              <BusinessInfoSection
                business={business}
                setBiz={setBiz}
                onDiscard={handleDiscard}
                onSave={handleSave}
              />
            )}

            {/* =================================================
                BRANDING
            ================================================= */}

            {activeTab === "branding" && (
              <BrandingSection
                brandColor={
                  branding.brandColor
                }

                setBrandColor={
                  handleBrandColor
                }

                brandToggles={{
                  qr: branding.qr,
                  thumbnails:
                    branding.thumbnails,
                  footer:
                    branding.footer,
                }}

                setBrandToggles={(value) => {
                  setBranding(
                    (previous) => ({
                      ...previous,
                      ...value,
                    })
                  );
                }}

                logoUrl={
                  branding.logo
                }

                setLogoUrl={(value) => {
                  setBranding(
                    (previous) => ({
                      ...previous,
                      logo: value,
                    })
                  );
                }}

                onDiscard={
                  handleDiscard
                }

                onSave={
                  handleSave
                }
              />
            )}

            {/* =================================================
                TAX
            ================================================= */}

            {activeTab === "tax" && (
              <TaxInvoicingSection
                tax={tax}

                setTaxField={
                  setTaxField
                }

                setTax={setTax}

                onDiscard={
                  handleDiscard
                }

                onSave={
                  handleSave
                }
              />
            )}

            {/* =================================================
                PAYMENTS
            ================================================= */}

            {activeTab === "payments" && (
              <PaymentMethodsSection
                onDiscard={
                  handleDiscard
                }
                onSave={
                  handleSave
                }
              />
            )}

            {/* =================================================
                INTEGRATIONS
            ================================================= */}

            {activeTab === "integrations" && (
              <IntegrationsSection
                onDiscard={
                  handleDiscard
                }
                onSave={
                  handleSave
                }
              />
            )}

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            {activeTab === "notifications" && (
              <NotificationsSection
                notif={notif}
                setNotif={setNotif}
                onDiscard={
                  handleDiscard
                }
                onSave={
                  handleSave
                }
              />
            )}

            {/* =================================================
                API
            ================================================= */}

            {activeTab === "api" && (
              <ApiWebhooksSection
                onDiscard={
                  handleDiscard
                }
                onSave={
                  handleSave
                }
              />
            )}

            {/* =================================================
                EXPORT
            ================================================= */}

            {activeTab === "export" && (
              <DataExportSection
                exportToggles={
                  exportToggles
                }
                setExportToggles={
                  setExportToggles
                }
                onDiscard={
                  handleDiscard
                }
                onSave={
                  handleSave
                }
              />
            )}

          </div>
        </div>
      </div>
    </main>
  );
}

