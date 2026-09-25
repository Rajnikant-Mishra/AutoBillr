import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import RightDrawer from "../layout/RightDrawer";

import {
  createClient,
  updateClient,
} from "../../services/clientService";

import {
  showErrorToast,
  showSuccessToast,
} from "../ui/CustomToast";

import Button from "../ui/Button";
import Card from "../ui/Card";
import FormInput from "../ui/FormInput";
import Badge from "../ui/Badge";

import { useNotificationStore } from "../../store/notificationStore";

/* =========================================================
   STEPS
========================================================= */

const STEPS = [
  { id: 1, label: "Contact" },
  { id: 2, label: "Address" },
  { id: 3, label: "Preferences" },
];

/* =========================================================
   CLIENT OPTIONS
========================================================= */

const TIERS = [
  "Enterprise",
  "Mid-Market",
  "SMB",
  "Agency",
];

const COLORS = [
  "bg-primary",
  "bg-info",
  "bg-warning",
  "bg-danger",
  "bg-secondary",
  "bg-success",
];

const INDUSTRIES = [
  "SaaS / Software",
  "Agency / Consulting",
  "Professional Services",
  "E-commerce",
];

const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
];

const COUNTRY_DIAL_CODES = [
  {
    code: "+91",
    label: "🇮🇳 +91 (IN)",
  },
  {
    code: "+1",
    label: "🇺🇸 +1 (US/CA)",
  },
  {
    code: "+44",
    label: "🇬🇧 +44 (UK)",
  },
  {
    code: "+61",
    label: "🇦🇺 +61 (AU)",
  },
  {
    code: "+49",
    label: "🇩🇪 +49 (DE)",
  },
  {
    code: "+971",
    label: "🇦🇪 +971 (AE)",
  },
  {
    code: "+65",
    label: "🇸🇬 +65 (SG)",
  },
];

/* =========================================================
   AUTOMATION
========================================================= */

const AUTOMATION_ITEMS = [
  {
    key: "autoCharge",
    icon: "bolt",
    title: "Auto-charge on due date",
    description:
      "Charge stored payment method without manual confirmation",
  },
  {
    key: "reminders",
    icon: "notifications_active",
    title: "Send payment reminders",
    description:
      "Automated D-7, D-1 and D+3 follow-ups",
  },
  {
    key: "portalAccess",
    icon: "dashboard",
    title: "Enable client portal access",
    description:
      "Let them view & pay invoices online at portal.autobillr.io",
  },
  {
    key: "welcomeEmail",
    icon: "mark_email_read",
    title: "Send welcome email on creation",
    description:
      "Branded onboarding email with login link",
  },
];

const DEFAULT_AUTOMATION = {
  autoCharge: false,
  reminders: true,
  portalAccess: true,
  welcomeEmail: true,
};

/* =========================================================
   STYLES
========================================================= */

const selectClassName = `
  w-full rounded-lg border border-border
  bg-[var(--input-background)] px-3.5 py-2.5
  text-sm text-text
  outline-none transition-colors duration-fast
  focus:border-primary focus:ring-2 focus:ring-primary/20
`;

const sectionTitleClass =
  "mb-3 text-[11.5px] font-bold uppercase tracking-widest text-text-secondary";

const labelClass =
  "mb-1.5 block text-[11.5px] font-semibold text-text-secondary";

/* =========================================================
   DUMMY DATA VALIDATION
========================================================= */

const DUMMY_DOMAINS = [
  "example.com",
  "test.com",
  "dummy.com",
  "sample.com",
  "fake.com",
  "tempmail.com",
  "mailinator.com",
];

const isDummyEmail = (email) => {
  const clean = email.trim().toLowerCase();

  const domain = clean.split("@")[1];

  if (!domain) return true;

  if (DUMMY_DOMAINS.includes(domain)) {
    return true;
  }

  if (
    clean.startsWith("test@") ||
    clean.startsWith("dummy@") ||
    clean.startsWith("fake@") ||
    clean.startsWith("admin@example")
  ) {
    return true;
  }

  return false;
};

const isDummyPhone = (phone) => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) {
    return true;
  }

  if (/^(\d)\1+$/.test(digits)) {
    return true;
  }

  const obvious = [
    "1234567890",
    "0123456789",
    "9876543210",
    "0987654321",
  ];

  if (obvious.includes(digits)) {
    return true;
  }

  return false;
};

/* =========================================================
   INITIAL FORM
========================================================= */

const getInitialFormData = () => ({
  companyName: "",
  contactName: "",
  contactEmail: "",

  countryCode: "+91",
  phone: "",

  website: "",

  industry: INDUSTRIES[0],
  selectedTier: TIERS[0],
  selectedColor: COLORS[0],

  billingAddress: "",
  city: "",
  stateRegion: "",
  postalCode: "",
  country: "India",

  taxId: "",

  notes: "",

  automation: {
    ...DEFAULT_AUTOMATION,
  },

  selectedTags: [],
});

/* =========================================================
   HELPERS
========================================================= */

const asString = (value, fallback = "") =>
  typeof value === "string"
    ? value
    : value == null
    ? fallback
    : String(value);

const normalizeTags = (tags) => {
  if (Array.isArray(tags)) {
    return [
      ...new Set(
        tags
          .map((tag) => asString(tag).trim())
          .filter(Boolean)
      ),
    ];
  }

  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);

      return Array.isArray(parsed)
        ? normalizeTags(parsed)
        : [];
    } catch {
      return [];
    }
  }

  return [];
};

const getClientId = (client) =>
  client?.id ?? client?._id ?? null;

const getInitials = (companyName) => {
  const name = asString(companyName).trim();

  if (!name) {
    return "?";
  }

  const words = name
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

/* =========================================================
   NORMALIZE CLIENT FOR EDIT
========================================================= */

const normalizeClientToForm = (client) => {
  const defaults = getInitialFormData();

  if (!client) {
    return defaults;
  }

  let rawPhone = asString(client.phone).trim();

  let extractedCode = "+91";
  let extractedNumber = rawPhone;

  for (const dial of COUNTRY_DIAL_CODES) {
    if (rawPhone.startsWith(dial.code)) {
      extractedCode = dial.code;

      extractedNumber = rawPhone
        .slice(dial.code.length)
        .trim();

      break;
    }
  }

  return {
    ...defaults,

    companyName: asString(client.name),

    contactName: asString(
      client.contactName
    ),

    contactEmail: asString(
      client.email
    ),

    countryCode: extractedCode,

    phone: extractedNumber,

    website: asString(
      client.website
    ),

    industry: asString(
      client.industry,
      defaults.industry
    ),

    selectedTier: asString(
      client.tier,
      defaults.selectedTier
    ),

    selectedColor: asString(
      client.color,
      defaults.selectedColor
    ),

    /* Address */

    billingAddress: asString(
      client.billingAddress
    ),

    city: asString(client.city),

    stateRegion: asString(
      client.stateRegion
    ),

    postalCode: asString(
      client.postalCode
    ),

    country: asString(
      client.country,
      defaults.country
    ),

    taxId: asString(client.taxId),

    /* Notes */

    notes: asString(client.notes),

    /* Automation */

    automation: {
      autoCharge: Boolean(
        client.autoCharge ??
          defaults.automation.autoCharge
      ),

      reminders: Boolean(
        client.reminders ??
          defaults.automation.reminders
      ),

      portalAccess: Boolean(
        client.portalAccess ??
          defaults.automation.portalAccess
      ),

      welcomeEmail: Boolean(
        client.welcomeEmail ??
          defaults.automation.welcomeEmail
      ),
    },

    /* Tags */

    selectedTags: normalizeTags(
      client.tags
    ),
  };
};

/* =========================================================
   API ERROR
========================================================= */

const getApiErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Unable to save the client. Please try again.";

/* =========================================================
   SELECT FIELD
========================================================= */

const SelectField = ({
  id,
  label,
  value,
  options,
  onChange,
}) => (
  <div>
    <label
      htmlFor={id}
      className={labelClass}
    >
      {label}
    </label>

    <select
      id={id}
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className={selectClassName}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

/* =========================================================
   COMPONENT
========================================================= */

const ClientFormDrawer = ({
  isOpen,
  onClose,
  client = null,
}) => {
  const { addNotification } =
    useNotificationStore();

  const isEditing = Boolean(client);

  const clientId = getClientId(client);

  const [step, setStep] = useState(1);

  const [formData, setFormData] =
    useState(getInitialFormData);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  /* =======================================================
     FORM UPDATE
  ======================================================= */

  const updateForm = useCallback(
    (key, value) => {
      setFormData((previous) => ({
        ...previous,
        [key]: value,
      }));
    },
    []
  );

  /* =======================================================
     AUTOMATION
  ======================================================= */

  const updateAutomation = useCallback(
    (key) => {
      setFormData((previous) => ({
        ...previous,

        automation: {
          ...previous.automation,

          [key]: !Boolean(
            previous.automation?.[key]
          ),
        },
      }));
    },
    []
  );

  /* =======================================================
     TAGS
  ======================================================= */

  const toggleTag = useCallback(
    (tag) => {
      setFormData((previous) => {
        const currentTags =
          normalizeTags(
            previous.selectedTags
          );

        const exists =
          currentTags.includes(tag);

        return {
          ...previous,

          selectedTags: exists
            ? currentTags.filter(
                (item) => item !== tag
              )
            : [...currentTags, tag],
        };
      });
    },
    []
  );

  const removeTag = useCallback(
    (tag) => {
      setFormData((previous) => ({
        ...previous,

        selectedTags:
          normalizeTags(
            previous.selectedTags
          ).filter(
            (item) => item !== tag
          ),
      }));
    },
    []
  );

  /* =======================================================
     RESET
  ======================================================= */

  const resetForm = useCallback(() => {
    setFormData(
      getInitialFormData()
    );

    setStep(1);
  }, []);

  /* =======================================================
     LOAD EDIT DATA
  ======================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(
      normalizeClientToForm(client)
    );

    setStep(1);
  }, [isOpen, client]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateStep = useCallback(
    (targetStep = step) => {
      const companyName =
        formData.companyName.trim();

      const contactEmail =
        formData.contactEmail.trim();

      const phone =
        formData.phone.trim();

      /* ---------------------------------------------------
         STEP 1
      --------------------------------------------------- */

      if (targetStep === 1) {
        if (!companyName) {
          showErrorToast(
            "Company name is required"
          );

          return false;
        }

        if (!contactEmail) {
          showErrorToast(
            "Contact email is required"
          );

          return false;
        }

        if (
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            contactEmail
          )
        ) {
          showErrorToast(
            "Please enter a valid email address"
          );

          return false;
        }

        if (isDummyEmail(contactEmail)) {
          showErrorToast(
            "Dummy emails (@example, @test, etc.) are not allowed"
          );

          return false;
        }

        if (
          phone &&
          isDummyPhone(phone)
        ) {
          showErrorToast(
            "Please enter a valid phone number (dummy numbers not allowed)"
          );

          return false;
        }

        if (formData.website.trim()) {
          const website =
            formData.website.trim();

          if (
            !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(
              website
            )
          ) {
            showErrorToast(
              "Please enter a valid website URL"
            );

            return false;
          }
        }
      }

      /* ---------------------------------------------------
         STEP 2
      --------------------------------------------------- */

      if (targetStep === 2) {
        if (
          formData.postalCode.trim()
            .length > 20
        ) {
          showErrorToast(
            "Postal code is too long"
          );

          return false;
        }
      }

      return true;
    },
    [formData, step]
  );

  /* =======================================================
     CONTINUE
  ======================================================= */

  const handleContinue = useCallback(() => {
    if (!validateStep(step)) {
      return;
    }

    setStep((current) =>
      Math.min(
        current + 1,
        STEPS.length
      )
    );
  }, [step, validateStep]);

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = useCallback(() => {
    setStep((current) =>
      Math.max(current - 1, 1)
    );
  }, []);

  /* =======================================================
     BUILD PAYLOAD
  ======================================================= */

  const buildPayload = useCallback(() => {
    const companyName =
      formData.companyName.trim();

    const rawPhone =
      formData.phone.trim();

    const formattedPhone = rawPhone
      ? `${formData.countryCode} ${rawPhone}`
      : "";

    return {
      /* Basic */

      initials:
        getInitials(companyName),

      name: companyName,

      contactName:
        formData.contactName.trim() ||
        null,

      email:
        formData.contactEmail.trim() ||
        null,

      phone:
        formattedPhone || null,

      website:
        formData.website.trim() ||
        null,

      industry:
        formData.industry || null,

      tier:
        formData.selectedTier || null,

      color:
        formData.selectedColor || null,

      /* Address */

      billingAddress:
        formData.billingAddress.trim() ||
        null,

      city:
        formData.city.trim() ||
        null,

      stateRegion:
        formData.stateRegion.trim() ||
        null,

      postalCode:
        formData.postalCode.trim() ||
        null,

      country:
        formData.country || null,

      /* Tax */

      taxId:
        formData.taxId.trim() ||
        null,

      /* Automation */

      autoCharge: Boolean(
        formData.automation?.autoCharge
      ),

      reminders: Boolean(
        formData.automation?.reminders
      ),

      portalAccess: Boolean(
        formData.automation?.portalAccess
      ),

      welcomeEmail: Boolean(
        formData.automation?.welcomeEmail
      ),

      /* Extra */

      notes:
        formData.notes.trim() ||
        null,

      tags: normalizeTags(
        formData.selectedTags
      ),
    };
  }, [formData]);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = useCallback(
    async () => {
      if (isSubmitting) {
        return;
      }

      /* Validate every step */

      for (const currentStep of STEPS.map(
        (item) => item.id
      )) {
        if (
          !validateStep(currentStep)
        ) {
          setStep(currentStep);

          return;
        }
      }

      /* Editing requires ID */

      if (isEditing && !clientId) {
        showErrorToast(
          "Client ID is missing"
        );

        return;
      }

      setIsSubmitting(true);

      try {
        const payload =
          buildPayload();

        const companyName =
          payload.name;

        /* -------------------------------------------------
           UPDATE
        ------------------------------------------------- */

        if (isEditing) {
          await updateClient(
            clientId,
            payload
          );

          showSuccessToast(
            "Client Updated",
            companyName
          );

          addNotification({
            type: "client",
            icon: "edit",
            title: "Client Updated",
            description: `${companyName} was updated successfully`,
          });
        }

        /* -------------------------------------------------
           CREATE
        ------------------------------------------------- */

        else {
          const createdClient =
            await createClient(
              payload
            );

          const createdId =
            getClientId(
              createdClient
            );

          showSuccessToast(
            "Client Created",
            companyName
          );

          addNotification({
            type: "client",
            icon: "person_add",
            title: "New Client Added",
            description: `${companyName} has been successfully created`,
          });

          window.dispatchEvent(
            new CustomEvent(
              "client-updated",
              {
                detail: {
                  client: {
                    id:
                      createdId,
                    name:
                      companyName,
                  },
                },
              }
            )
          );
        }

        /* -------------------------------------------------
           UPDATE EVENT
        ------------------------------------------------- */

        if (isEditing) {
          window.dispatchEvent(
            new CustomEvent(
              "client-updated",
              {
                detail: {
                  client: {
                    id: clientId,
                    name: companyName,
                  },
                },
              }
            )
          );
        }

        resetForm();

        onClose();
      } catch (error) {
        console.error(
          "Client save error:",
          error
        );

        showErrorToast(
          getApiErrorMessage(error)
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      addNotification,
      buildPayload,
      clientId,
      isEditing,
      isSubmitting,
      onClose,
      resetForm,
      validateStep,
    ]
  );

  /* =======================================================
     PREVIEW
  ======================================================= */

  const previewInitials =
    useMemo(
      () =>
        getInitials(
          formData.companyName
        ),
      [formData.companyName]
    );

  /* =======================================================
     FOOTER
  ======================================================= */

  const footer = (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Cancel
      </Button>

      {step > 1 && (
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={isSubmitting}
          icon={
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
          }
        >
          Back
        </Button>
      )}

      <Button
        onClick={
          step === 3
            ? handleSubmit
            : handleContinue
        }
        disabled={isSubmitting}
        icon={
          <span
            className={`material-symbols-outlined text-sm ${
              isSubmitting
                ? "animate-spin"
                : ""
            }`}
          >
            {isSubmitting
              ? "progress_activity"
              : step === 3
              ? isEditing
                ? "save"
                : "person_add"
              : "arrow_forward"}
          </span>
        }
      >
        {isSubmitting
          ? "Saving..."
          : step === 3
          ? isEditing
            ? "Save Changes"
            : "Add Client"
          : "Continue"}
      </Button>
    </div>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={
        isSubmitting
          ? undefined
          : onClose
      }
      title={
        isEditing
          ? "Edit Client"
          : "New Client"
      }
      icon={
        isEditing
          ? "edit"
          : "person_add"
      }
      width="max-w-2xl"
      footer={footer}
    >
      <div className="space-y-6">

        {/* =================================================
            STEPPER
        ================================================= */}

        <nav
          aria-label="Client form progress"
          className="mb-6 flex items-center gap-2 border-b border-border-light pb-5"
        >
          {STEPS.map(
            (
              currentStep,
              index
            ) => {
              const isComplete =
                step >
                currentStep.id;

              const isCurrent =
                step ===
                currentStep.id;

              return (
                <React.Fragment
                  key={
                    currentStep.id
                  }
                >
                  <div
                    className={`flex items-center gap-2 ${
                      step >=
                      currentStep.id
                        ? "text-primary"
                        : "text-text-light"
                    }`}
                    aria-current={
                      isCurrent
                        ? "step"
                        : undefined
                    }
                  >
                    <div
                      className={`
                        grid h-7 w-7 shrink-0 place-items-center
                        rounded-full text-xs font-bold
                        transition-all duration-fast
                        ${
                          isComplete
                            ? "bg-primary text-text-inverse"
                            : isCurrent
                            ? "bg-primary text-text-inverse ring-4 ring-primary/15"
                            : "bg-surface-secondary text-text-muted"
                        }
                      `}
                    >
                      {isComplete ? (
                        <span className="material-symbols-outlined text-sm">
                          check
                        </span>
                      ) : (
                        currentStep.id
                      )}
                    </div>

                    <span className="text-[12.5px] font-semibold">
                      {
                        currentStep.label
                      }
                    </span>
                  </div>

                  {index <
                    STEPS.length -
                      1 && (
                    <div
                      aria-hidden
                      className={`h-px flex-1 ${
                        step >
                        currentStep.id
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            }
          )}
        </nav>

        {/* =================================================
            LIVE PREVIEW
        ================================================= */}

        <Card
          bordered
          padding="p-4"
          className="flex items-center gap-3 bg-surface-secondary/50"
        >
          <div
            className={`
              grid h-12 w-12 shrink-0 place-items-center
              rounded-xl text-sm font-bold text-text-inverse
              ${
                formData.selectedColor ||
                COLORS[0]
              }
            `}
            aria-hidden
          >
            {previewInitials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-text">
              {formData.companyName ||
                "Unnamed client"}
            </div>

            <div className="truncate text-[11.5px] text-text-muted">
              {formData.contactEmail ||
                "No email"}{" "}
              ·{" "}
              {formData.selectedTier ||
                TIERS[0]}
            </div>
          </div>

          <Badge
            label="Preview"
            variant="active"
          />
        </Card>

        {/* =================================================
            STEP 1
        ================================================= */}

        {step === 1 && (
          <div className="space-y-6">

            {/* Company */}

            <section aria-labelledby="company-section">
              <h4
                id="company-section"
                className={
                  sectionTitleClass
                }
              >
                Company
              </h4>

              <div className="space-y-4">
                <FormInput
                  label="Company Name"
                  icon="business"
                  value={
                    formData.companyName
                  }
                  onChange={(event) =>
                    updateForm(
                      "companyName",
                      event.target.value
                    )
                  }
                  placeholder="Acme Dynamics Corp"
                  required
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormInput
                    label="Website"
                    icon="language"
                    value={
                      formData.website
                    }
                    onChange={(event) =>
                      updateForm(
                        "website",
                        event.target.value
                      )
                    }
                    placeholder="https://company.com"
                    type="text"
                  />

                  <div>
                    <label
                      htmlFor="client-industry"
                      className={
                        labelClass
                      }
                    >
                      Industry
                    </label>

                    <select
                      id="client-industry"
                      value={
                        formData.industry
                      }
                      onChange={(event) =>
                        updateForm(
                          "industry",
                          event.target.value
                        )
                      }
                      className={
                        selectClassName
                      }
                    >
                      {INDUSTRIES.map(
                        (industry) => (
                          <option
                            key={
                              industry
                            }
                            value={
                              industry
                            }
                          >
                            {industry}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className={labelClass}
                  >
                    Account Tier
                  </label>

                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {TIERS.map(
                      (tier) => {
                        const selected =
                          formData.selectedTier ===
                          tier;

                        return (
                          <button
                            key={tier}
                            type="button"
                            aria-pressed={
                              selected
                            }
                            onClick={() =>
                              updateForm(
                                "selectedTier",
                                tier
                              )
                            }
                            className={`
                              rounded-lg border-2 px-3 py-2.5
                              text-[12.5px] font-bold
                              transition-colors duration-fast
                              ${
                                selected
                                  ? "border-primary/30 bg-primary-soft text-primary-dark"
                                  : "border-border bg-surface text-text-secondary hover:border-border-dark"
                              }
                            `}
                          >
                            {tier}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}

            <section
              aria-labelledby="contact-section"
              className="border-t border-border-light pt-5"
            >
              <h4
                id="contact-section"
                className={
                  sectionTitleClass
                }
              >
                Primary Contact
              </h4>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormInput
                  label="Contact Name"
                  icon="person"
                  value={
                    formData.contactName
                  }
                  onChange={(event) =>
                    updateForm(
                      "contactName",
                      event.target.value
                    )
                  }
                  placeholder="Sarah Jenkins"
                />

                <div>
                  <label
                    className={labelClass}
                  >
                    Phone Number
                  </label>

                  <div className="flex gap-2">
                    <select
                      value={
                        formData.countryCode
                      }
                      onChange={(event) =>
                        updateForm(
                          "countryCode",
                          event.target.value
                        )
                      }
                      className="w-[120px] shrink-0 rounded-lg border border-border bg-[var(--input-background)] px-2 py-2 text-xs font-semibold text-text outline-none focus:border-primary"
                    >
                      {COUNTRY_DIAL_CODES.map(
                        (dial) => (
                          <option
                            key={
                              dial.code
                            }
                            value={
                              dial.code
                            }
                          >
                            {dial.label}
                          </option>
                        )
                      )}
                    </select>

                    <div className="flex-1">
                      <FormInput
                        value={
                          formData.phone
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "phone",
                            event.target.value
                          )
                        }
                        placeholder="9876543210"
                        type="tel"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <FormInput
                  label="Contact Email"
                  icon="mail"
                  type="email"
                  value={
                    formData.contactEmail
                  }
                  onChange={(event) =>
                    updateForm(
                      "contactEmail",
                      event.target.value
                    )
                  }
                  placeholder="billing@company.com"
                  required
                />
              </div>
            </section>

            {/* Color */}

            <section
              aria-labelledby="color-section"
              className="border-t border-border-light pt-5"
            >
              <label
                className={labelClass}
              >
                Color Tag
              </label>

              <div className="flex flex-wrap gap-2">
                {COLORS.map(
                  (color) => {
                    const selected =
                      formData.selectedColor ===
                      color;

                    return (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Select ${color.replace(
                          "bg-",
                          ""
                        )} color`}
                        aria-pressed={
                          selected
                        }
                        onClick={() =>
                          updateForm(
                            "selectedColor",
                            color
                          )
                        }
                        className={`
                          h-9 w-9 rounded-lg
                          transition-transform duration-fast hover:scale-105
                          ${
                            selected
                              ? "scale-110 ring-2 ring-text ring-offset-2"
                              : ""
                          }
                          ${color}
                        `}
                      />
                    );
                  }
                )}
              </div>
            </section>
          </div>
        )}

        {/* =================================================
            STEP 2
        ================================================= */}

        {step === 2 && (
          <div className="space-y-5">

            <section aria-labelledby="billing-section">
              <h4
                id="billing-section"
                className={
                  sectionTitleClass
                }
              >
                Billing Address
              </h4>

              <div className="space-y-3">
                <FormInput
                  label="Street Address"
                  value={
                    formData.billingAddress
                  }
                  onChange={(event) =>
                    updateForm(
                      "billingAddress",
                      event.target.value
                    )
                  }
                  autoComplete="street-address"
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <FormInput
                    label="City"
                    value={
                      formData.city
                    }
                    onChange={(event) =>
                      updateForm(
                        "city",
                        event.target.value
                      )
                    }
                    autoComplete="address-level2"
                  />

                  <FormInput
                    label="State / Region"
                    value={
                      formData.stateRegion
                    }
                    onChange={(event) =>
                      updateForm(
                        "stateRegion",
                        event.target.value
                      )
                    }
                    autoComplete="address-level1"
                  />

                  <FormInput
                    label="Postal Code"
                    value={
                      formData.postalCode
                    }
                    onChange={(event) =>
                      updateForm(
                        "postalCode",
                        event.target.value
                      )
                    }
                    autoComplete="postal-code"
                    inputMode="numeric"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="client-country"
                      className={
                        labelClass
                      }
                    >
                      Country
                    </label>

                    <select
                      id="client-country"
                      value={
                        formData.country
                      }
                      onChange={(event) =>
                        updateForm(
                          "country",
                          event.target.value
                        )
                      }
                      autoComplete="country-name"
                      className={
                        selectClassName
                      }
                    >
                      {COUNTRIES.map(
                        (country) => (
                          <option
                            key={
                              country
                            }
                            value={
                              country
                            }
                          >
                            {country}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <FormInput
                    label="Tax ID / VAT"
                    value={
                      formData.taxId
                    }
                    onChange={(event) =>
                      updateForm(
                        "taxId",
                        event.target.value
                      )
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
            </section>

            {/* Payment intentionally removed.
                Billing belongs to Project. */}

            <section
              aria-labelledby="payment-section"
              className="border-t border-border-light pt-5"
            >
              <div className="rounded-lg border border-border-light bg-surface-secondary p-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <span className="material-symbols-outlined text-[18px]">
                      receipt_long
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[13px] font-bold text-text">
                      Billing belongs to
                      Projects
                    </h4>

                    <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
                      MRR, billing cycle,
                      payment terms,
                      payment method and
                      invoice scheduling are
                      managed at the Project
                      level.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =================================================
            STEP 3
        ================================================= */}

        {step === 3 && (
          <section className="space-y-5">

            {/* Automation */}

            <section
              aria-labelledby="automation-section"
            >
              <h4
                id="automation-section"
                className={
                  sectionTitleClass
                }
              >
                Automation
              </h4>

              <div className="space-y-3">
                {AUTOMATION_ITEMS.map(
                  (item) => {
                    const enabled =
                      Boolean(
                        formData.automation?.[
                          item.key
                        ]
                      );

                    return (
                      <div
                        key={item.key}
                        className="
                          flex items-center justify-between gap-4
                          rounded-lg border border-border-light
                          bg-surface-secondary p-3
                        "
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                            <span className="material-symbols-outlined text-[18px]">
                              {item.icon}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-text">
                              {item.title}
                            </div>

                            <div className="leading-tight text-[11.5px] text-text-muted">
                              {
                                item.description
                              }
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={
                            enabled
                          }
                          aria-label={`Toggle ${item.title}`}
                          onClick={() =>
                            updateAutomation(
                              item.key
                            )
                          }
                          className={`
                            relative h-6 w-11 shrink-0 rounded-full
                            transition-colors duration-fast
                            ${
                              enabled
                                ? "bg-primary"
                                : "bg-border-dark"
                            }
                          `}
                        >
                          <span
                            aria-hidden
                            className={`
                              absolute top-0.5 h-5 w-5 rounded-full
                              bg-surface shadow-sm
                              transition-all duration-fast
                              ${
                                enabled
                                  ? "right-0.5"
                                  : "left-0.5"
                              }
                            `}
                          />
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            {/* Tags & Notes */}

            <section
              aria-labelledby="tags-notes-section"
              className="border-t border-border-light pt-5"
            >
              <h4
                id="tags-notes-section"
                className={
                  sectionTitleClass
                }
              >
                Tags & Notes
              </h4>

              <div className="mb-4">
                <label
                  className={labelClass}
                >
                  Tags
                </label>

                <div className="flex flex-wrap gap-2">
                  {normalizeTags(
                    formData.selectedTags
                  ).map((tag) => (
                    <span
                      key={tag}
                      className="
                        inline-flex items-center gap-1
                        rounded-full bg-primary-soft
                        px-2.5 py-1
                        text-[11.5px] font-bold
                        text-primary-dark
                      "
                    >
                      {tag}

                      <button
                        type="button"
                        onClick={() =>
                          removeTag(tag)
                        }
                        aria-label={`Remove ${tag}`}
                        className="
                          rounded-full
                          hover:text-primary
                          focus:outline-none
                          focus:ring-2
                          focus:ring-primary/25
                        "
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          close
                        </span>
                      </button>
                    </span>
                  ))}

                  {normalizeTags(
                    formData.selectedTags
                  ).length === 0 && (
                    <span className="text-[11.5px] text-text-light">
                      No tags added
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="client-notes"
                  className={
                    labelClass
                  }
                >
                  Internal notes
                </label>

                <textarea
                  id="client-notes"
                  rows={4}
                  maxLength={2000}
                  value={formData.notes}
                  onChange={(event) =>
                    updateForm(
                      "notes",
                      event.target.value
                    )
                  }
                  placeholder="Add internal notes about this client..."
                  className="
                    w-full resize-none rounded-lg
                    border border-border px-3.5 py-2.5
                    text-sm
                    bg-[var(--input-background)]
                    text-text
                    outline-none
                    transition-colors duration-fast
                    focus:border-primary
                    focus:ring-2
                    focus:ring-primary/15
                  "
                />

                <div className="mt-1 text-right text-[10px] text-text-light">
                  {
                    formData.notes.length
                  }
                  /2000
                </div>
              </div>
            </section>
          </section>
        )}
      </div>
    </RightDrawer>
  );
};

export default ClientFormDrawer;