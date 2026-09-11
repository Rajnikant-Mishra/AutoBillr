
import React, { useCallback, useEffect, useState } from "react";

import RightDrawer from "../layout/RightDrawer";
import Button from "../ui/Button";
import FormInput from "../ui/FormInput";
import Badge from "../ui/Badge";

import {
  showErrorToast,
  showSuccessToast,
} from "../ui/CustomToast";

import { useNotificationStore } from "../../store/notificationStore";

/* =========================================================
   CONSTANTS
========================================================= */

const ROLES = ["Admin", "Manager", "Analyst", "Viewer"];

const INVITATION_CHANNELS = [
  {
    value: "email",
    label: "Email",
    icon: "mail",
    description: "Send invitation to email",
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: "chat",
    description: "Send invitation to WhatsApp",
  },
  {
    value: "github",
    label: "GitHub",
    icon: "code",
    description: "Invite GitHub account",
  },
  {
    value: "discord",
    label: "Discord",
    icon: "forum",
    description: "Send invitation to Discord",
  },
];

/* =========================================================
   INITIAL FORM
========================================================= */

const getInitialFormData = () => ({
  name: "",
  email: "",
  avatar: "",

  role: "Viewer",

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

/* =========================================================
   CHANNEL ICON
========================================================= */

function ChannelIcon({ channel }) {
  const icons = {
    email: "mail",
    whatsapp: "chat",
    github: "code",
    discord: "forum",
  };

  return (
    <span
      className="material-symbols-outlined"
      style={{ fontSize: 20 }}
    >
      {icons[channel] || "send"}
    </span>
  );
}

/* =========================================================
   MEMBER INVITATION DRAWER
========================================================= */

const MemberInvitationDrawer = ({
  isOpen,
  onClose,
  onInvited,
}) => {
  const { addNotification } = useNotificationStore();

  const [formData, setFormData] = useState(
    getInitialFormData
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
  }, []);

  /* =======================================================
     INITIALIZE DRAWER
  ======================================================= */

  useEffect(() => {
    if (!isOpen) return;

    setFormData(getInitialFormData());
    setIsSubmitting(false);
  }, [isOpen]);

  /* =======================================================
     UPDATE FORM
  ======================================================= */

  const updateForm = useCallback((key, value) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  /* =======================================================
     TOGGLE INVITATION CHANNEL
  ======================================================= */

  const toggleChannel = useCallback((channel) => {
    setFormData((current) => {
      const channels = Array.isArray(current.channels)
        ? current.channels
        : [];

      const exists = channels.includes(channel);

      if (exists) {
        const updated = channels.filter(
          (item) => item !== channel
        );

        return {
          ...current,
          channels:
            updated.length > 0 ? updated : ["email"],
        };
      }

      return {
        ...current,
        channels: [...channels, channel],
      };
    });
  }, []);

  /* =======================================================
     AVATAR
  ======================================================= */

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorToast("Please select a valid image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showErrorToast("Avatar must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateForm("avatar", reader.result);
    };

    reader.readAsDataURL(file);
  };

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

    if (!ROLES.includes(formData.role)) {
      showErrorToast("Please select a valid role.");
      return false;
    }

    if (
      !Array.isArray(formData.channels) ||
      formData.channels.length === 0
    ) {
      showErrorToast(
        "Please select at least one invitation method."
      );
      return false;
    }

    if (
      formData.channels.includes("whatsapp") &&
      !formData.whatsapp.trim()
    ) {
      showErrorToast(
        "Please enter a WhatsApp number."
      );
      return false;
    }

    if (
      formData.channels.includes("github") &&
      !formData.github.trim()
    ) {
      showErrorToast(
        "Please enter the GitHub username."
      );
      return false;
    }

    if (
      formData.channels.includes("discord") &&
      !formData.discord.trim()
    ) {
      showErrorToast(
        "Please enter the Discord username."
      );
      return false;
    }

    return true;
  }, [formData]);

  /* =======================================================
     BUILD PAYLOAD
  ======================================================= */

  const buildPayload = useCallback(() => {
    return {
      name: formData.name.trim(),

      email: formData.email
        .trim()
        .toLowerCase(),

      avatar: formData.avatar || null,

      role: formData.role,

      channels: [...new Set(formData.channels)],

      recipients: {
        email: formData.email
          .trim()
          .toLowerCase(),

        whatsapp:
          formData.whatsapp.trim() || null,

        github:
          formData.github.trim() || null,

        discord:
          formData.discord.trim() || null,
      },

      message: formData.message.trim(),
    };
  }, [formData]);

  /* =======================================================
     SEND INVITATION
  ======================================================= */

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = buildPayload();

      /*
       * =====================================================
       * BACKEND API
       * =====================================================
       *
       * Connect your real invitation API here.
       *
       * Example:
       *
       * const response = await inviteTeamMember(payload);
       *
       * =====================================================
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      const member = {
        id: `invite-${Date.now()}`,

        name: payload.name,

        email: payload.email,

        role: payload.role,

        status: "pending",

        lastLogin: "—",

        avatar:
          payload.avatar ||
          `https://i.pravatar.cc/80?u=${encodeURIComponent(
            payload.email
          )}`,
      };

      /* =====================================================
         APPLICATION NOTIFICATION
      ===================================================== */

      addNotification({
        type: "team",
        icon: "person_add",
        title: "Member Invitation Sent",
        description: `${payload.name} has been invited as ${payload.role}.`,
      });

      /* =====================================================
         SEND DATA TO PARENT
      ===================================================== */

      if (typeof onInvited === "function") {
        onInvited({
          member,
          ...payload,
        });
      }

      showSuccessToast(
        "Invitation sent",
        `${payload.name} has been invited to your workspace.`
      );

      resetForm();

      onClose();
    } catch (error) {
      console.error(
        "Member invitation error:",
        error
      );

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
        disabled={isSubmitting}
        icon={
          <span
            className={`material-symbols-outlined text-sm ${
              isSubmitting ? "animate-spin" : ""
            }`}
          >
            {isSubmitting
              ? "progress_activity"
              : "send"}
          </span>
        }
      >
        {isSubmitting
          ? "Sending..."
          : "Send Invitation"}
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
        isSubmitting ? undefined : onClose
      }
      title="Invite Team Member"
      icon="person_add"
      width="max-w-xl"
      footer={footer}
    >
      <div className="space-y-6">

        {/* =================================================
            INTRO
        ================================================= */}

        <div
          className="
            rounded-xl
            border border-border-light
            bg-surface-secondary/50
            p-4
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                grid h-10 w-10 shrink-0
                place-items-center
                rounded-lg
                bg-primary-soft
                text-primary
              "
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                person_add
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-text">
                Invite someone to your workspace
              </div>

              <div className="mt-1 text-[11.5px] leading-5 text-text-muted">
                Add their details, choose a role and
                select where you want to send the
                invitation.
              </div>
            </div>

            <Badge
              label="Team"
              variant="active"
            />
          </div>
        </div>

        {/* =================================================
            MEMBER DETAILS
        ================================================= */}

        <section>
          <h4
            className="
              mb-3
              text-[11.5px]
              font-bold
              uppercase
              tracking-widest
              text-text-secondary
            "
          >
            Member Details
          </h4>

          <div className="space-y-4">

            {/* =================================================
                AVATAR
            ================================================= */}

            <div>
              <label
                htmlFor="member-avatar"
                className="
                  mb-2
                  block
                  text-[11.5px]
                  font-semibold
                  text-text-secondary
                "
              >
                Profile Photo
              </label>

              <div className="flex items-center gap-4">

                <div
                  className="
                    relative
                    w-14 h-14
                    shrink-0
                    overflow-hidden
                    rounded-full
                    border
                    border-border
                    bg-surface-secondary
                  "
                >
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Member avatar preview"
                      className="
                        w-full h-full
                        object-cover
                      "
                    />
                  ) : (
                    <span
                      className="
                        material-symbols-outlined
                        absolute
                        inset-0
                        grid
                        place-items-center
                        text-text-light
                      "
                      style={{ fontSize: 24 }}
                    >
                      person
                    </span>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="member-avatar"
                    className="
                      inline-flex
                      cursor-pointer
                      items-center
                      gap-2
                      rounded-lg
                      border border-border
                      bg-surface
                      px-3
                      py-2
                      text-xs
                      font-semibold
                      text-text-secondary
                      transition
                      hover:bg-surface-hover
                    "
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 16 }}
                    >
                      upload
                    </span>

                    Choose Photo
                  </label>

                  <input
                    id="member-avatar"
                    type="file"
                    accept="image/*"
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

            {/* =================================================
                NAME
            ================================================= */}

            <FormInput
              label="Member Name"
              icon="person"
              value={formData.name}
              onChange={(event) =>
                updateForm(
                  "name",
                  event.target.value
                )
              }
              placeholder="John Doe"
              autoComplete="name"
              required
              disabled={isSubmitting}
            />

            {/* =================================================
                EMAIL
            ================================================= */}

            <FormInput
              label="Email Address"
              icon="mail"
              type="email"
              value={formData.email}
              onChange={(event) =>
                updateForm(
                  "email",
                  event.target.value
                )
              }
              placeholder="john@example.com"
              autoComplete="email"
              required
              disabled={isSubmitting}
              helperText="Used for the member's AutoBillr account and email invitation."
            />

            {/* =================================================
                ROLE
            ================================================= */}

            <div>
              <label
                htmlFor="member-invitation-role"
                className="
                  mb-1.5
                  block
                  text-[11.5px]
                  font-semibold
                  text-text-secondary
                "
              >
                Workspace Role
              </label>

              <select
                id="member-invitation-role"
                value={formData.role}
                onChange={(event) =>
                  updateForm(
                    "role",
                    event.target.value
                  )
                }
                disabled={isSubmitting}
                className="
                  w-full
                  rounded-lg
                  border border-border
                  bg-[var(--input-background)]
                  px-3.5
                  py-2.5
                  text-sm
                  text-text
                  outline-none
                  transition
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary/20
                "
              >
                {ROLES.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                ))}
              </select>

              <p className="mt-1.5 text-[11px] text-text-light">
                This role controls what the member
                can access in AutoBillr.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            INVITATION METHODS
        ================================================= */}

        <section
          className="
            border-t
            border-border-light
            pt-5
          "
        >
          <div className="mb-3">
            <h4
              className="
                text-[11.5px]
                font-bold
                uppercase
                tracking-widest
                text-text-secondary
              "
            >
              Send Invitation Through
            </h4>

            <p className="mt-1 text-[10.5px] text-text-light">
              Select one or more methods.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

            {INVITATION_CHANNELS.map(
              (channel) => {
                const selected =
                  formData.channels.includes(
                    channel.value
                  );

                return (
                  <button
                    key={channel.value}
                    type="button"
                    disabled={isSubmitting}
                    aria-pressed={selected}
                    onClick={() =>
                      toggleChannel(
                        channel.value
                      )
                    }
                    className={`
                      group
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border-2
                      p-3
                      text-left
                      transition-all

                      ${
                        selected
                          ? "border-primary/30 bg-primary-soft ring-2 ring-primary/10"
                          : "border-border bg-surface hover:border-primary/30 hover:bg-surface-secondary"
                      }

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    `}
                  >
                    <div
                      className={`
                        grid
                        h-10
                        w-10
                        shrink-0
                        place-items-center
                        rounded-lg

                        ${
                          selected
                            ? "bg-primary text-text-inverse"
                            : "bg-surface-secondary text-text-muted group-hover:text-primary"
                        }
                      `}
                    >
                      <ChannelIcon
                        channel={
                          channel.value
                        }
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`
                          text-[12.5px]
                          font-bold

                          ${
                            selected
                              ? "text-primary-dark"
                              : "text-text"
                          }
                        `}
                      >
                        {channel.label}
                      </div>

                      <div
                        className="
                          mt-0.5
                          text-[10.5px]
                          leading-4
                          text-text-muted
                        "
                      >
                        {channel.description}
                      </div>
                    </div>

                    {selected && (
                      <span
                        className="
                          material-symbols-outlined
                          shrink-0
                          text-primary
                        "
                        style={{
                          fontSize: 18,
                        }}
                      >
                        check_circle
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* =================================================
            CHANNEL RECIPIENTS
        ================================================= */}

        {formData.channels.includes(
          "whatsapp"
        ) && (
          <section
            className="
              rounded-xl
              border border-border-light
              bg-surface-secondary/50
              p-4
            "
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="
                  material-symbols-outlined
                  text-primary
                "
                style={{ fontSize: 18 }}
              >
                chat
              </span>

              <div>
                <div className="text-sm font-bold text-text">
                  WhatsApp Recipient
                </div>

                <div className="text-[10.5px] text-text-muted">
                  Enter the member's WhatsApp number.
                </div>
              </div>
            </div>

            <FormInput
              label="WhatsApp Number"
              icon="phone"
              type="tel"
              value={formData.whatsapp}
              onChange={(event) =>
                updateForm(
                  "whatsapp",
                  event.target.value
                )
              }
              placeholder="+91 98765 43210"
              required
              disabled={isSubmitting}
            />
          </section>
        )}

        {formData.channels.includes(
          "github"
        ) && (
          <section
            className="
              rounded-xl
              border border-border-light
              bg-surface-secondary/50
              p-4
            "
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="
                  material-symbols-outlined
                  text-primary
                "
                style={{ fontSize: 18 }}
              >
                code
              </span>

              <div>
                <div className="text-sm font-bold text-text">
                  GitHub Recipient
                </div>

                <div className="text-[10.5px] text-text-muted">
                  Enter their GitHub username.
                </div>
              </div>
            </div>

            <FormInput
              label="GitHub Username"
              icon="code"
              value={formData.github}
              onChange={(event) =>
                updateForm(
                  "github",
                  event.target.value
                    .replace(/^@/, "")
                )
              }
              placeholder="octocat"
              required
              disabled={isSubmitting}
            />
          </section>
        )}

        {formData.channels.includes(
          "discord"
        ) && (
          <section
            className="
              rounded-xl
              border border-border-light
              bg-surface-secondary/50
              p-4
            "
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="
                  material-symbols-outlined
                  text-primary
                "
                style={{ fontSize: 18 }}
              >
                forum
              </span>

              <div>
                <div className="text-sm font-bold text-text">
                  Discord Recipient
                </div>

                <div className="text-[10.5px] text-text-muted">
                  Enter their Discord username.
                </div>
              </div>
            </div>

            <FormInput
              label="Discord Username"
              icon="forum"
              value={formData.discord}
              onChange={(event) =>
                updateForm(
                  "discord",
                  event.target.value
                )
              }
              placeholder="username"
              required
              disabled={isSubmitting}
            />
          </section>
        )}

        {/* =================================================
            PERSONAL MESSAGE
        ================================================= */}

        <section
          className="
            border-t
            border-border-light
            pt-5
          "
        >
          <h4
            className="
              mb-3
              text-[11.5px]
              font-bold
              uppercase
              tracking-widest
              text-text-secondary
            "
          >
            Personal Message
          </h4>

          <label
            htmlFor="member-invitation-message"
            className="
              mb-1.5
              block
              text-[11.5px]
              font-semibold
              text-text-secondary
            "
          >
            Message
          </label>

          <textarea
            id="member-invitation-message"
            rows={4}
            maxLength={1000}
            value={formData.message}
            onChange={(event) =>
              updateForm(
                "message",
                event.target.value
              )
            }
            placeholder="Hi John, I'd like to invite you to our AutoBillr workspace..."
            disabled={isSubmitting}
            className="
              w-full
              resize-none
              rounded-lg
              border border-border
              bg-[var(--input-background)]
              px-3.5
              py-2.5
              text-sm
              text-text
              outline-none
              transition
              focus:border-primary
              focus:ring-2
              focus:ring-primary/15
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />

          <div
            className="
              mt-1
              text-right
              text-[10px]
              text-text-light
            "
          >
            {formData.message.length}/1000
          </div>
        </section>

        {/* =================================================
            INVITATION SUMMARY
        ================================================= */}

        <section
          className="
            rounded-xl
            border border-primary/10
            bg-primary-soft/50
            p-4
          "
        >
          <div className="flex items-start gap-3">
            <span
              className="
                material-symbols-outlined
                shrink-0
                text-primary
              "
              style={{ fontSize: 19 }}
            >
              send
            </span>

            <div className="min-w-0">
              <div className="text-sm font-bold text-text">
                Invitation Summary
              </div>

              <div className="mt-2 space-y-1 text-[11px] text-text-muted">
                <div>
                  <strong className="text-text-secondary">
                    Member:
                  </strong>{" "}
                  {formData.name ||
                    "Not specified"}
                </div>

                <div>
                  <strong className="text-text-secondary">
                    Email:
                  </strong>{" "}
                  {formData.email ||
                    "Not specified"}
                </div>

                <div>
                  <strong className="text-text-secondary">
                    Role:
                  </strong>{" "}
                  {formData.role}
                </div>

                <div>
                  <strong className="text-text-secondary">
                    Send through:
                  </strong>{" "}
                  {formData.channels
                    .map(
                      (channel) =>
                        INVITATION_CHANNELS.find(
                          (item) =>
                            item.value ===
                            channel
                        )?.label
                    )
                    .join(", ")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SECURITY NOTE
        ================================================= */}

        <div
          className="
            flex
            items-start
            gap-3
            rounded-lg
            border
            border-border-light
            bg-surface-secondary
            p-3
          "
        >
          <span
            className="
              material-symbols-outlined
              shrink-0
              text-primary
            "
            style={{ fontSize: 18 }}
          >
            verified_user
          </span>

          <div
            className="
              text-[11px]
              leading-5
              text-text-muted
            "
          >
            Invitations should use a unique,
            expiring token generated by your
            backend. Pending invitations can
            also be revoked by workspace
            administrators.
          </div>
        </div>
      </div>
    </RightDrawer>
  );
};

export default MemberInvitationDrawer;

