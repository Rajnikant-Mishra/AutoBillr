import React, { useState, useEffect, useCallback, useMemo } from "react";
import RightDrawer from "../layout/RightDrawer";
import { createClient, updateClient } from "../../services/clientService";
import { showErrorToast, showSuccessToast } from "../ui/CustomToast";
import Button from "../ui/Button";
import Card from "../ui/Card";
import FormInput from "../ui/FormInput";
import Badge from "../ui/Badge";
import { useNotificationStore } from "../../store/notificationStore";

const tiers = ["Enterprise", "Mid-Market", "SMB", "Agency"];
const colors = [
  "bg-teal-500", "bg-indigo-500", "bg-amber-500",
  "bg-rose-500", "bg-violet-500", "bg-cyan-500",
];

const automationItems = [
  {
    key: "autoCharge",
    icon: "bolt",
    title: "Auto-charge on due date",
    description: "Charge stored payment method without manual confirmation",
  },
  {
    key: "reminders",
    icon: "notifications_active",
    title: "Send payment reminders",
    description: "Automated D-7, D-1 and D+3 follow-ups",
  },
  {
    key: "portalAccess",
    icon: "dashboard",
    title: "Enable client portal access",
    description: "Let them view & pay invoices online at portal.autobillr.io",
  },
  {
    key: "welcomeEmail",
    icon: "mark_email_read",
    title: "Send welcome email on creation",
    description: "Branded onboarding email with login link",
  },
];

const paymentMethods = [
  { value: "ACH", label: "ACH", icon: "account_balance" },
  { value: "Card", label: "Card", icon: "credit_card" },
  { value: "Wire", label: "Wire", icon: "swap_horiz" },
  { value: "Check", label: "Check", icon: "request_quote" },
];

const availableTags = [
  "Strategic", "Net-30", "Auto-Pay", "Q1", "Q2", "Q3", "Q4",
  "VIP", "Priority", "Annual",
];
const initialFormData = {
  companyName: "",
  contactName: "",
  contactEmail: "",
  phone: "",
  website: "",
  industry: "SaaS / Software",
  selectedTier: "Enterprise",
  selectedColor: "bg-teal-500",
  billingAddress: "",
  city: "",
  stateRegion: "",
  postalCode: "",
  country: "United States",
  taxId: "",
  currency: "USD",
  paymentTerms: "Net 30",
  paymentMethod: "ACH",
  notes: "",
  automation: {
    autoCharge: true,
    reminders: true,
    portalAccess: true,
    welcomeEmail: true,
  },
  selectedTags: [],
};
export default function ClientFormDrawer({
  isOpen,
  onClose,
  client = null,           // null = create, object = edit
}) {
  const { addNotification } = useNotificationStore();
  const isEditing = !!client;

  const [step, setStep] = useState(1);


const [formData, setFormData] = useState(initialFormData);
const resetForm = () => {
  setFormData(initialFormData);
  setStep(1);
};
  

  // Populate form when editing
  useEffect(() => {
    if (isEditing && client) {
      setFormData({
  companyName: client.name || "",
  contactName: client.contactName || "",
  contactEmail: client.email || "",
  phone: client.phone || "",

  website: client.website || "",
  industry: client.industry || "SaaS / Software",

  selectedTier: client.tier || "Enterprise",
  selectedColor: client.color || "bg-teal-500",

  billingAddress: client.address?.street || "",
  city: client.address?.city || "",
  stateRegion: client.address?.state || "",
  postalCode: client.address?.postalCode || "",
  country: client.address?.country || "United States",

  taxId: client.taxId || "",

  currency: client.currency || "USD",
  paymentTerms: client.paymentTerms || "Net 30",
  paymentMethod: client.paymentMethod || "ACH",

  notes: client.notes || "",

  automation: client.automation || {
    autoCharge: true,
    reminders: true,
    portalAccess: true,
    welcomeEmail: true,
  },

  selectedTags: client.tags || [],
});
    }
    setStep(1);
  }, [client, isEditing]);

  const updateForm = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateAutomation = useCallback((key) => {
    setFormData(prev => ({
      ...prev,
      automation: { ...prev.automation, [key]: !prev.automation[key] },
    }));
  }, []);

  const toggleTag = useCallback((tag) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag],
    }));
  }, []);

  const removeTag = useCallback((tag) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(t => t !== tag),
    }));
  }, []);

  const handleContinue = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    const initials = formData.companyName
      .trim()
      .split(" ")
      .map(w => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    const payload = {
  initials,

  name: formData.companyName,
  contactName: formData.contactName,
  email: formData.contactEmail,
  phone: formData.phone,

  website: formData.website,
  industry: formData.industry,

  tier: formData.selectedTier,
  color: formData.selectedColor,

  currency: formData.currency,
  paymentTerms: formData.paymentTerms,
  paymentMethod: formData.paymentMethod,

  taxId: formData.taxId,

  notes: formData.notes,

  tags: formData.selectedTags,

  automation: formData.automation,

  address: {
    street: formData.billingAddress,
    city: formData.city,
    state: formData.stateRegion,
    postalCode: formData.postalCode,
    country: formData.country,
  },
};

    try {
  if (isEditing) {
    await updateClient(client._id, payload);

    showSuccessToast("Client Updated", formData.companyName);

    addNotification({
      type: "client",
      icon: "edit",
      iconColor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      title: "Client Updated",
      description: `${formData.companyName} was updated successfully`,
      borderColor: "border-l-indigo-500",
    });
  } else {
    await createClient(payload);

    showSuccessToast("Client Created", formData.companyName);

    addNotification({
      type: "client",
      icon: "person_add",
      iconColor: "text-teal-600",
      bgColor: "bg-teal-50",
      title: "New Client Added",
      description: `${formData.companyName} has been successfully created`,
      borderColor: "border-l-teal-500",
    });

    resetForm();
  }

  onClose();

  window.dispatchEvent(
    new CustomEvent("client-updated", {
      detail: {
        client: {
          name: formData.companyName,
        },
      },
    })
  );
} catch (error) {
  showErrorToast(
    error?.response?.data?.message || "Operation failed"
  );
}
  };

  // ✅ FIXED: Preview definition
  const preview = useMemo(() => ({
    initials: formData.companyName
      .trim()
      .split(" ")
      .map(w => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?",
  }), [formData.companyName]);

  const footer = (
    <div className="flex justify-end gap-2">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
      >
        Cancel
      </button>

      {step > 1 && (
       <Button
  variant="secondary"
  onClick={handleBack}
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
  onClick={step === 3 ? handleSubmit : handleContinue}
  icon={
    <span className="material-symbols-outlined text-sm">
      {step === 3
        ? isEditing
          ? "save"
          : "person_add"
        : "arrow_forward"}
    </span>
  }
>
  {step === 3
    ? isEditing
      ? "Save Changes"
      : "Add Client"
    : "Continue"}
</Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Client" : "New Client"}
      icon={isEditing ? "edit" : "person_add"}
      width="max-w-2xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Stepper */}
        <div className="flex items-center gap-2 mb-6 pb-5 border-b border-slate-100">
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step >= s ? "text-teal-600" : "text-slate-400"}`}>
                <div className={`w-7 h-7 rounded-full grid place-items-center font-bold text-xs transition-all
                  ${step > s ? "bg-teal-600 text-white" : step === s ? "bg-teal-600 text-white ring-4 ring-teal-100" : "bg-slate-200"}`}
                >
                  {step > s ? <span className="material-symbols-outlined text-sm">check</span> : s}
                </div>
                <span className="text-[12.5px] font-semibold">
                  {s === 1 && "Contact"}
                  {s === 2 && "Billing"}
                  {s === 3 && "Preferences"}
                </span>
              </div>
              {i < 2 && <div className={`flex-1 h-px ${step > s ? "bg-teal-600" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Preview Card */}
        <Card
                 bordered
               padding="p-4"
               className="bg-slate-50/50 flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl grid place-items-center font-bold text-sm text-white ${formData.selectedColor}`}>
            {preview.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-900 truncate">{formData.companyName || "Unnamed client"}</div>
            <div className="text-[11.5px] text-slate-500 truncate">
              {formData.contactEmail} · {formData.selectedTier}
            </div>
           
          </div>
          <Badge
  label="Preview"
  variant="active"
/>
        </Card>


        {step === 1 && ( 
                <>
            <section>
              <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3">Company</h4>
              <div className="space-y-4">
                <div>
                 <FormInput
  label="Company Name *"
  icon="business"
  value={formData.companyName}
  onChange={(e) => updateForm("companyName", e.target.value)}
  placeholder="Acme Dynamics Corp"
/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <FormInput
  label="Website"
  icon="language"
  value={formData.website}
  onChange={(e) => updateForm("website", e.target.value)}
  placeholder="company.com"
/>
                  </div>
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Industry</label>
                    <select
  value={formData.industry}
  onChange={(e) => updateForm("industry", e.target.value)}
  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm"
>
                      <option>SaaS / Software</option>
                      <option>Agency / Consulting</option>
                      <option>Professional Services</option>
                      <option>E-commerce</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-2">Account Tier</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {tiers.map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => updateForm("selectedTier", tier)}
                        className={`px-3 py-2.5 rounded-lg border-2 text-[12.5px] font-bold transition ${
                          formData.selectedTier === tier
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="pt-5 border-t border-slate-100">
              <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3">Primary Contact</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FormInput
  label="Contact Name"
  icon="person"
  value={formData.contactName}
  onChange={(e) => updateForm("contactName", e.target.value)}
  placeholder="Sarah Jenkins"
/>
                </div>
                <div>
                  <FormInput
  label="Phone"
  icon="phone"
  value={formData.phone}
  onChange={(e) => updateForm("phone", e.target.value)}
  placeholder="+91 9876543210"
/>
                </div>
              </div>

              <div className="mt-3">
               <FormInput
  label="Contact Email *"
  icon="mail"
  type="email"
  value={formData.contactEmail}
  onChange={(e) => updateForm("contactEmail", e.target.value)}
  placeholder="billing@company.com"
/>
              </div>
            </section>

            <section className="pt-5 border-t border-slate-100">
              <label className="block text-[11.5px] font-semibold text-slate-600 mb-2">Color Tag</label>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateForm("selectedColor", color)}
                    className={`w-9 h-9 rounded-lg ${color} transition hover:scale-105 ${
                      formData.selectedColor === color ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : ""
                    }`}
                  />
                ))}
              </div>
            </section>
          </>)}
        {step === 2 && ( 
                    <div className="space-y-5">
            <section>
              <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3">Billing Address</h4>
              <div className="space-y-3">
                <div>
                  <FormInput
  label="Street Address"
  value={formData.billingAddress}
  onChange={(e) => updateForm("billingAddress", e.target.value)}
/>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                   <FormInput
  label="City"
  value={formData.city}
  onChange={(e) => updateForm("city", e.target.value)}
/>
                  </div>
                  <div>
                    <FormInput
  label="State / Region"
  value={formData.stateRegion}
  onChange={(e) => updateForm("stateRegion", e.target.value)}
/>
                  </div>
                  <div>
                    <FormInput
  label="Postal Code"
  value={formData.postalCode}
  onChange={(e) => updateForm("postalCode", e.target.value)}
/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Country</label>
                    <select value={formData.country} onChange={(e) => updateForm("country", e.target.value)} className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm">
                      <option>United States</option>
                      <option>India</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                    </select>
                  </div>
                  <div>
                   <FormInput
  label="Tax ID / VAT"
  value={formData.taxId}
  onChange={(e) => updateForm("taxId", e.target.value)}
  placeholder="Optional"
/>
                  </div>
                </div>
              </div>
            </section>

            <section className="pt-5 border-t border-slate-100">
              <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3">Payment</h4>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Currency</label>
                  <select
  value={formData.currency}
  onChange={(e) => updateForm("currency", e.target.value)}
  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm"
>
                    <option>USD</option>
                    <option>INR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Payment terms</label>
                  <select
  value={formData.paymentTerms}
  onChange={(e) => updateForm("paymentTerms", e.target.value)}
  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm"
>
                    <option>Net 30</option>
                    <option>Due on receipt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-2">Preferred payment method</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => updateForm("paymentMethod", method.value)}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.paymentMethod === method.value
                          ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100 scale-[1.02]"
                          : "border-slate-200 bg-white hover:border-teal-300"
                      }`}
                    >
                      <span className={`material-symbols-outlined mb-1 ${formData.paymentMethod === method.value ? "text-teal-600" : "text-slate-400"}`} style={{ fontSize: "18px" }}>
                        {method.icon}
                      </span>
                      <span className={`text-[11.5px] font-bold ${formData.paymentMethod === method.value ? "text-teal-700" : "text-slate-700"}`}>
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div> )}
        {step === 3 && ( 
         <section className="space-y-5">
            <section>
              <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3">Automation</h4>
              <div className="space-y-3">
                {automationItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg grid place-items-center bg-teal-100 text-teal-600">
                        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{item.icon}</span>
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-900">{item.title}</div>
                        <div className="text-[11.5px] text-slate-500 leading-tight">{item.description}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateAutomation(item.key)}
                      className={`w-11 h-6 rounded-full relative transition ${formData.automation[item.key] ? "bg-teal-600" : "bg-slate-300"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${formData.automation[item.key] ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="pt-5 border-t border-slate-100">
              <h4 className="text-[11.5px] font-bold text-slate-600 uppercase tracking-widest mb-3">Tags &amp; Notes</h4>
              <div className="mb-4">
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedTags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-[11.5px] font-bold">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-teal-900">
                        <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>close</span>
                      </button>
                    </span>
                  ))}

                  {availableTags
                    .filter((tag) => !formData.selectedTags.includes(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 border border-dashed border-slate-300 hover:border-teal-300 text-slate-500 hover:text-teal-600 rounded-full text-[11.5px] font-bold transition"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "11px" }}>add</span>
                        {tag}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-600 mb-1.5">Internal notes</label>
                <textarea
  rows={3}
  value={formData.notes}
  onChange={(e) => updateForm("notes", e.target.value)}
  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500/15 focus:border-teal-500 outline-none resize-none"
/>
              </div>
            </section>
          </section> )}
      </div>
    </RightDrawer>
  );
}