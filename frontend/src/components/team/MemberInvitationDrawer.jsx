import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import RightDrawer from "../../components/layout/RightDrawer";
import Button from "../../components/ui/Button";
import FormInput from "../../components/ui/FormInput";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

import { inviteTeamMember } from "../../services/teamService";

import {
  showErrorToast,
  showSuccessToast,
} from "../../components/ui/CustomToast";

import { useNotificationStore } from "../../store/notificationStore";

/* =========================================================
   API
========================================================= */

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const TEAM_ROLES_API = `${API_BASE}/team/roles`;

/* =========================================================
   CHANNELS
========================================================= */

const INVITATION_CHANNELS = [
  {
    value: "email",
    label: "Email",
    icon: "mail",
    description: "Send invitation via email",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: "chat",
    description: "Send invitation via WhatsApp",
  },
  {
    value: "github",
    label: "GitHub",
    icon: "code",
    description: "Invite via GitHub account",
  },
  {
    value: "discord",
    label: "Discord",
    icon: "forum",
    description: "Send invitation via Discord",
  },
];

const labelClass =
  "mb-1.5 block text-[11.5px] font-semibold text-text-secondary";

const sectionTitleClass =
  "mb-3 text-[11.5px] font-bold uppercase tracking-widest text-text-secondary";

/* =========================================================
   INITIAL FORM
========================================================= */

const getInitialFormData = () => ({
  name: "",
  email: "",
  avatar: "",
  role: "",
  channels: ["email"],
  whatsapp: "",
  github: "",
  discord: "",
  message: "",
});

/* =========================================================
   HELPERS
========================================================= */

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getInitials = (name) => {
  const clean = String(name || "").trim();
  if (!clean) return "?";

  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

/* =========================================================
   COMPONENT
========================================================= */

const MemberInvitationDrawer = ({
  isOpen,
  onClose,
  onInvited,
}) => {
  const { addNotification } = useNotificationStore();

  const [formData, setFormData] = useState(getInitialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Roles come only from the backend
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  /* =======================================================
     LOAD ROLES FROM BACKEND
  ======================================================= */

  const loadRoles = useCallback(async () => {
    try {
      setRolesLoading(true);

      const res = await fetch(TEAM_ROLES_API, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const text = await res.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        setRoles([]);
        return;
      }

      if (!res.ok || !result?.success) {
        setRoles([]);
        return;
      }

      const list = Array.isArray(result.data) ? result.data : [];

      // Normalize to { value, label, description }
      const mapped = list
        .filter((r) => r?.name)
        .map((r) => ({
          value: r.name,
          label: r.name,
          description: r.description || "Workspace role",
          id: r.id,
        }));

      setRoles(mapped);

      // Set default role if form has none
      setFormData((prev) => {
        if (prev.role) return prev;
        const defaultRole =
          mapped.find((r) => r.value === "Viewer") ||
          mapped[0];
        return defaultRole
          ? { ...prev, role: defaultRole.value }
          : prev;
      });
    } catch (error) {
      console.error("Load roles error:", error);
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  /* =======================================================
     RESET + LOAD WHEN DRAWER OPENS
  ======================================================= */

  useEffect(() => {
    if (!isOpen) return;

    setFormData(getInitialFormData());
    setIsSubmitting(false);
    loadRoles();
  }, [isOpen, loadRoles]);

  /* =======================================================
     FORM HELPERS
  ======================================================= */

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
  }, []);

  const updateForm = useCallback((key, value) => {
    setFormData((previous) => ({
      ...previous,
      [key]: value,
    }));
  }, []);

  const toggleChannel = useCallback((channel) => {
    setFormData((previous) => {
      const channels = Array.isArray(previous.channels)
        ? previous.channels
        : [];

      const exists = channels.includes(channel);

      if (exists) {
        const updated = channels.filter((item) => item !== channel);
        return {
          ...previous,
          channels: updated.length > 0 ? updated : ["email"],
        };
      }

      return {
        ...previous,
        channels: [...channels, channel],
      };
    });
  }, []);

  const handleAvatarChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showErrorToast("Please select a valid image.");
        event.target.value = "";
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        showErrorToast("Avatar must be smaller than 2MB.");
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => updateForm("avatar", reader.result);
      reader.onerror = () =>
        showErrorToast("Unable to read the selected image.");
      reader.readAsDataURL(file);
    },
    [updateForm]
  );

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = useCallback(() => {
    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      showErrorToast("Member name is required.");
      return false;
    }

    if (!email) {
      showErrorToast("Email address is required.");
      return false;
    }

    if (!isValidEmail(email)) {
      showErrorToast("Please enter a valid email address.");
      return false;
    }

    if (!formData.role) {
      showErrorToast("Please select a role.");
      return false;
    }

    const roleExists = roles.some(
      (role) => role.value === formData.role
    );

    if (!roleExists) {
      showErrorToast("Please select a valid role.");
      return false;
    }

    if (
      !Array.isArray(formData.channels) ||
      formData.channels.length === 0
    ) {
      showErrorToast("Please select at least one invitation method.");
      return false;
    }

    if (
      formData.channels.includes("whatsapp") &&
      !formData.whatsapp.trim()
    ) {
      showErrorToast("Please enter a WhatsApp number.");
      return false;
    }

    if (
      formData.channels.includes("github") &&
      !formData.github.trim()
    ) {
      showErrorToast("Please enter the GitHub username.");
      return false;
    }

    if (
      formData.channels.includes("discord") &&
      !formData.discord.trim()
    ) {
      showErrorToast("Please enter the Discord username.");
      return false;
    }

    return true;
  }, [formData, roles]);

  /* =======================================================
     PAYLOAD
  ======================================================= */

  const buildPayload = useCallback(() => {
    const email = formData.email.trim().toLowerCase();

    const channels = [
      ...new Set(
        Array.isArray(formData.channels)
          ? formData.channels
          : ["email"]
      ),
    ];

    return {
      name: formData.name.trim(),
      email,
      avatar: formData.avatar || null,
      role: formData.role,
      channels,
      recipients: {
        email,
        whatsapp: formData.whatsapp.trim() || null,
        github: formData.github.trim() || null,
        discord: formData.discord.trim() || null,
      },
      message: formData.message.trim() || null,
    };
  }, [formData]);

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const requestPayload = buildPayload();
      const result = await inviteTeamMember(requestPayload);

      if (!result || !result.success) {
        throw new Error(
          result?.message || "Unable to send invitation"
        );
      }

      const member = result.data;

      if (!member) {
        throw new Error(
          "Invitation was created, but the server did not return the member."
        );
      }

      addNotification({
        type: "team",
        icon: "person_add",
        title: "Member Invitation Sent",
        description: `${member.name} has been invited as ${member.role}.`,
      });

      if (typeof onInvited === "function") {
        onInvited({
          success: true,
          data: member,
          member,
        });
      }

      showSuccessToast(
        "Invitation sent",
        `${member.name} has been invited to your workspace.`
      );

      resetForm();

      if (typeof onClose === "function") {
        onClose();
      }
    } catch (error) {
      console.error("Member invitation error:", error);
      showErrorToast(
        error?.message ||
          "Unable to send the invitation. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    addNotification,
    buildPayload,
    isSubmitting,
    onClose,
    onInvited,
    resetForm,
    validateForm,
  ]);

  /* =======================================================
     PREVIEW
  ======================================================= */

  const previewInitials = useMemo(
    () => getInitials(formData.name),
    [formData.name]
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

      <Button
        type="button"
        variant="primary"
        onClick={handleSubmit}
        disabled={isSubmitting || rolesLoading}
        loading={isSubmitting}
        icon="send"
      >
        {isSubmitting ? "Sending..." : "Send Invitation"}
      </Button>
    </div>
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={isSubmitting ? undefined : onClose}
      title="Invite Team Member"
      icon="person_add"
      width="max-w-xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Live Preview */}
        <Card
          bordered
          padding="p-4"
          className="flex items-center gap-3 bg-surface-secondary/50"
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-secondary">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-primary text-sm font-bold text-text-inverse">
                {previewInitials}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-text">
              {formData.name || "New team member"}
            </div>
            <div className="truncate text-[11.5px] text-text-muted">
              {formData.email || "No email yet"}
              {formData.role ? ` · ${formData.role}` : ""}
            </div>
          </div>

          <Badge label="Preview" variant="active" />
        </Card>

        {/* Member Details */}
        <section aria-labelledby="member-details-section">
          <h4 id="member-details-section" className={sectionTitleClass}>
            Member Details
          </h4>

          <div className="space-y-4">
            {/* Avatar */}
            <div>
              <label className={labelClass}>Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-secondary">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[24px] text-text-light">
                      person
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="member-avatar"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:bg-surface-hover"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      upload
                    </span>
                    Choose Photo
                  </label>

                  <input
                    id="member-avatar"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarChange}
                    disabled={isSubmitting}
                    className="hidden"
                  />

                  <p className="mt-1 text-[10px] text-text-light">
                    PNG, JPG or WEBP · Max 2MB
                  </p>
                </div>
              </div>
            </div>

            <FormInput
              label="Member Name"
              icon="person"
              value={formData.name}
              onChange={(e) => updateForm("name", e.target.value)}
              placeholder="John Doe"
              required
              disabled={isSubmitting}
            />

            <FormInput
              label="Email Address"
              icon="mail"
              type="email"
              value={formData.email}
              onChange={(e) => updateForm("email", e.target.value)}
              placeholder="john@company.com"
              required
              disabled={isSubmitting}
              helperText="Used for the member's account and email invitation."
            />

            {/* Roles from backend only */}
            <div>
              <label className={labelClass}>Workspace Role</label>

              {rolesLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-text-muted">
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                  Loading roles...
                </div>
              ) : roles.length === 0 ? (
                <p className="py-3 text-sm text-text-muted">
                  No roles available. Create roles in Team &amp; Permissions first.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {roles.map((role) => {
                    const selected = formData.role === role.value;

                    return (
                      <button
                        key={role.id || role.value}
                        type="button"
                        aria-pressed={selected}
                        disabled={isSubmitting}
                        onClick={() => updateForm("role", role.value)}
                        className={`
                          rounded-lg border-2 px-3 py-2.5 text-left transition-colors
                          ${
                            selected
                              ? "border-primary/30 bg-primary-soft text-primary-dark"
                              : "border-border bg-surface text-text-secondary hover:border-border-dark"
                          }
                          disabled:cursor-not-allowed disabled:opacity-60
                        `}
                      >
                        <div className="text-[12.5px] font-bold">
                          {role.label}
                        </div>
                        <div className="mt-0.5 text-[10px] text-text-muted line-clamp-2">
                          {role.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Invitation Channels */}
        <section
          aria-labelledby="channels-section"
          className="border-t border-border-light pt-5"
        >
          <h4 id="channels-section" className={sectionTitleClass}>
            Send Invitation Through
          </h4>

          <p className="mb-3 text-[11px] text-text-muted">
            Select one or more methods
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {INVITATION_CHANNELS.map((channel) => {
              const selected = formData.channels.includes(channel.value);

              return (
                <button
                  key={channel.value}
                  type="button"
                  disabled={isSubmitting}
                  aria-pressed={selected}
                  onClick={() => toggleChannel(channel.value)}
                  className={`
                    flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all
                    ${
                      selected
                        ? "border-primary/30 bg-primary-soft ring-2 ring-primary/10"
                        : "border-border bg-surface hover:border-primary/30 hover:bg-surface-secondary"
                    }
                    disabled:cursor-not-allowed disabled:opacity-60
                  `}
                >
                  <div
                    className={`
                      grid h-10 w-10 shrink-0 place-items-center rounded-lg
                      ${
                        selected
                          ? "bg-primary text-text-inverse"
                          : "bg-surface-secondary text-text-muted"
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {channel.icon}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`
                        text-[12.5px] font-bold
                        ${selected ? "text-primary-dark" : "text-text"}
                      `}
                    >
                      {channel.label}
                    </div>
                    <div className="mt-0.5 text-[10.5px] leading-4 text-text-muted">
                      {channel.description}
                    </div>
                  </div>

                  {selected && (
                    <span className="material-symbols-outlined shrink-0 text-primary text-[18px]">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Conditional channel fields */}
        {formData.channels.includes("whatsapp") && (
          <section className="rounded-xl border border-border-light bg-surface-secondary/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
                <span className="material-symbols-outlined text-[18px]">
                  chat
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-text">WhatsApp</div>
                <div className="text-[10.5px] text-text-muted">
                  Enter the member's WhatsApp number
                </div>
              </div>
            </div>
            <FormInput
              label="WhatsApp Number"
              icon="phone"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => updateForm("whatsapp", e.target.value)}
              placeholder="+91 98765 43210"
              required
              disabled={isSubmitting}
            />
          </section>
        )}

        {formData.channels.includes("github") && (
          <section className="rounded-xl border border-border-light bg-surface-secondary/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
                <span className="material-symbols-outlined text-[18px]">
                  code
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-text">GitHub</div>
                <div className="text-[10.5px] text-text-muted">
                  Enter their GitHub username
                </div>
              </div>
            </div>
            <FormInput
              label="GitHub Username"
              icon="code"
              value={formData.github}
              onChange={(e) =>
                updateForm("github", e.target.value.replace(/^@/, ""))
              }
              placeholder="octocat"
              required
              disabled={isSubmitting}
            />
          </section>
        )}

        {formData.channels.includes("discord") && (
          <section className="rounded-xl border border-border-light bg-surface-secondary/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary">
                <span className="material-symbols-outlined text-[18px]">
                  forum
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-text">Discord</div>
                <div className="text-[10.5px] text-text-muted">
                  Enter their Discord username
                </div>
              </div>
            </div>
            <FormInput
              label="Discord Username"
              icon="forum"
              value={formData.discord}
              onChange={(e) => updateForm("discord", e.target.value)}
              placeholder="username"
              required
              disabled={isSubmitting}
            />
          </section>
        )}

        {/* Personal Message */}
        <section
          aria-labelledby="message-section"
          className="border-t border-border-light pt-5"
        >
          <h4 id="message-section" className={sectionTitleClass}>
            Personal Message
          </h4>

          <label
            htmlFor="member-invitation-message"
            className={labelClass}
          >
            Optional message
          </label>

          <textarea
            id="member-invitation-message"
            rows={4}
            maxLength={1000}
            value={formData.message}
            onChange={(e) => updateForm("message", e.target.value)}
            placeholder="Hi John, I'd like to invite you to our AutoBillr workspace..."
            disabled={isSubmitting}
            className="
              w-full resize-none rounded-lg border border-border
              bg-surface px-3.5 py-2.5 text-sm text-text
              outline-none transition-colors
              placeholder:text-text-light
              focus:border-primary focus:ring-2 focus:ring-primary/15
              disabled:cursor-not-allowed disabled:opacity-60
            "
          />

          <div className="mt-1 text-right text-[10px] text-text-light">
            {formData.message.length}/1000
          </div>
        </section>

        {/* Summary */}
        <Card
          bordered
          padding="p-4"
          className="border-primary/10 bg-primary-soft/40"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <span className="material-symbols-outlined text-[18px]">
                send
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-text">
                Invitation Summary
              </div>

              <div className="mt-2 space-y-1 text-[11.5px] text-text-muted">
                <div>
                  <span className="font-semibold text-text-secondary">
                    Member:
                  </span>{" "}
                  {formData.name || "—"}
                </div>
                <div>
                  <span className="font-semibold text-text-secondary">
                    Email:
                  </span>{" "}
                  {formData.email || "—"}
                </div>
                <div>
                  <span className="font-semibold text-text-secondary">
                    Role:
                  </span>{" "}
                  {formData.role || "—"}
                </div>
                <div>
                  <span className="font-semibold text-text-secondary">
                    Via:
                  </span>{" "}
                  {formData.channels
                    .map(
                      (v) =>
                        INVITATION_CHANNELS.find((c) => c.value === v)
                          ?.label
                    )
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Security note */}
        <div className="flex items-start gap-3 rounded-lg border border-border-light bg-surface-secondary p-3">
          <span className="material-symbols-outlined shrink-0 text-primary text-[18px]">
            verified_user
          </span>
          <p className="text-[11px] leading-5 text-text-muted">
            Invitations use a unique, expiring token generated by your
            backend. Pending invitations can be revoked by workspace
            administrators at any time.
          </p>
        </div>
      </div>
    </RightDrawer>
  );
};

export default MemberInvitationDrawer;