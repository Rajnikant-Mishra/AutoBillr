// backend/services/teamService.js

const prisma = require("../../config/prisma");
const crypto = require("crypto");

const {
  sendTeamInvitationEmail,
} = require("./emailService");

/* =========================================================
   SYSTEM ROLES
========================================================= */

const SYSTEM_ROLES = {
  Owner: "OWNER",
  Admin: "ADMIN",
  Manager: "MANAGER",
  Analyst: "ANALYST",
  Viewer: "VIEWER",
};

/* =========================================================
   HELPERS
========================================================= */

function toFrontend(member) {
  const roleName = member.role || "VIEWER";

  const displayRole =
    roleName === "OWNER"
      ? "Owner"
      : roleName === "ADMIN"
      ? "Admin"
      : roleName === "MANAGER"
      ? "Manager"
      : roleName === "ANALYST"
      ? "Analyst"
      : roleName === "VIEWER"
      ? "Viewer"
      : roleName;

  return {
    id: member.id,
    name: member.name,
    email: member.email,
    avatar: member.avatar,
    role: displayRole,
    status: member.status.toLowerCase(),
    lastActivityAt:
      member.lastActivityAt?.toISOString() || null,
    channels: member.channels || ["email"],
    whatsapp: member.whatsapp,
    github: member.github,
    discord: member.discord,
  };
}

/* =========================================================
   RESOLVE ROLE
========================================================= */

async function resolveRole(companyId, roleName) {
  if (!roleName) {
    return "VIEWER";
  }

  /* -------------------------------------------------------
     SYSTEM ROLE
  ------------------------------------------------------- */

  if (SYSTEM_ROLES[roleName]) {
    return SYSTEM_ROLES[roleName];
  }

  /* -------------------------------------------------------
     CUSTOM ROLE
  ------------------------------------------------------- */

  const custom = await prisma.role.findFirst({
    where: {
      companyId,
      name: {
        equals: roleName,
        mode: "insensitive",
      },
    },
  });

  if (custom) {
    return custom.name;
  }

  throw new Error("Invalid role");
}

/* =========================================================
   LIST TEAM MEMBERS
========================================================= */

async function listMembers(companyId) {
  const members = await prisma.teamMember.findMany({
    where: {
      companyId,
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        name: "asc",
      },
    ],
  });

  return members.map(toFrontend);
}

/* =========================================================
   INVITE TEAM MEMBER
========================================================= */

async function inviteMember(
  companyId,
  invitedById,
  payload
) {
  /* -------------------------------------------------------
     VALIDATE PAYLOAD
  ------------------------------------------------------- */

  if (!payload) {
    throw new Error("Invitation data is required.");
  }

  const email = String(payload.email || "")
    .trim()
    .toLowerCase();

  const name = String(payload.name || "").trim();

  if (!name) {
    throw new Error("Member name is required.");
  }

  if (!email) {
    throw new Error("Member email is required.");
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error("Invalid email address.");
  }

  /* -------------------------------------------------------
     RESOLVE ROLE
  ------------------------------------------------------- */

  const role = await resolveRole(
    companyId,
    payload.role
  );

  /* -------------------------------------------------------
     CHECK EXISTING MEMBER
  ------------------------------------------------------- */

  const existing =
    await prisma.teamMember.findUnique({
      where: {
        companyId_email: {
          companyId,
          email,
        },
      },
    });

  if (
    existing &&
    existing.status !== "INACTIVE"
  ) {
    throw new Error(
      "A member with this email already exists."
    );
  }

  /* -------------------------------------------------------
     GENERATE SECURE INVITATION TOKEN
  ------------------------------------------------------- */

  const invitationToken =
    crypto.randomBytes(48).toString("hex");

  /* -------------------------------------------------------
     INVITATION URL
  ------------------------------------------------------- */

  const frontendUrl = (
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");

  const invitationUrl =
    `${frontendUrl}/accept-invitation` +
    `?token=${encodeURIComponent(
      invitationToken
    )}`;

  /* -------------------------------------------------------
     CHANNELS

     Email is always included because the actual
     invitation is currently sent through SMTP.
  ------------------------------------------------------- */

  const channels = [
    ...new Set([
      "email",
      ...(Array.isArray(payload.channels)
        ? payload.channels
        : []),
    ]),
  ];

  /* -------------------------------------------------------
     CREATE / UPDATE PENDING MEMBER
  ------------------------------------------------------- */

  const member =
    await prisma.teamMember.upsert({
      where: {
        companyId_email: {
          companyId,
          email,
        },
      },

      /* ===================================================
         CREATE
      =================================================== */

      create: {
        companyId,
        name,
        email,
        avatar: payload.avatar || null,

        role,

        status: "PENDING",

        channels,

        whatsapp:
          payload.recipients?.whatsapp ||
          null,

        github:
          payload.recipients?.github ||
          null,

        discord:
          payload.recipients?.discord ||
          null,

        invitationToken,

        invitationMessage:
          payload.message || null,

        invitedById,

        lastActivityAt: new Date(),
      },

      /* ===================================================
         UPDATE / RESEND INVITATION
      =================================================== */

      update: {
        name,

        avatar:
          payload.avatar || null,

        role,

        status: "PENDING",

        channels,

        whatsapp:
          payload.recipients?.whatsapp ||
          null,

        github:
          payload.recipients?.github ||
          null,

        discord:
          payload.recipients?.discord ||
          null,

        invitationToken,

        invitationMessage:
          payload.message || null,

        invitedById,

        lastActivityAt: new Date(),

        acceptedAt: null,
      },
    });

  /* -------------------------------------------------------
     GET COMPANY
  ------------------------------------------------------- */

  const company =
    await prisma.company.findUnique({
      where: {
        id: companyId,
      },

      select: {
        id: true,
        name: true,
      },
    });

  if (!company) {
    throw new Error(
      "Company associated with this invitation was not found."
    );
  }

  /* -------------------------------------------------------
     SEND INVITATION EMAIL
     
     THIS IS THE IMPORTANT PART.

     `to: email` means the email entered in the
     Member Invitation Drawer receives the email.
  ------------------------------------------------------- */

  console.log(
    "========================================"
  );

  console.log(
    "TEAM INVITATION RECIPIENT:",
    email
  );

  console.log(
    "TEAM INVITATION ROLE:",
    role
  );

  console.log(
    "TEAM INVITATION COMPANY:",
    company.name
  );

  console.log(
    "TEAM INVITATION URL:",
    invitationUrl
  );

  console.log(
    "========================================"
  );

  await sendTeamInvitationEmail({
    to: email,

    memberName: name,

    companyName: company.name,

    role,

    invitationUrl,

    message:
      payload.message || null,
  });

  /* -------------------------------------------------------
     RETURN MEMBER
  ------------------------------------------------------- */

  return toFrontend(member);
}

/* =========================================================
   ACCEPT TEAM INVITATION
========================================================= */

async function acceptInvitation(token) {
  if (!token) {
    throw new Error("Invitation token is required.");
  }

  const member = await prisma.teamMember.findFirst({
    where: { invitationToken: token },
  });

  if (!member) {
    throw new Error("Invalid or expired invitation.");
  }

  if (member.status === "ACTIVE") {
    // already accepted
    return toFrontend(member);
  }

  const updated = await prisma.teamMember.update({
    where: { id: member.id },
    data: {
      status: "ACTIVE",
      acceptedAt: new Date(),
      lastActivityAt: new Date(),
      invitationToken: null, // clear token so it can't be reused
    },
  });

  return toFrontend(updated);
}
/* =========================================================
   UPDATE ROLE
========================================================= */

async function updateRole(
  companyId,
  memberId,
  newRole
) {
  const role = await resolveRole(
    companyId,
    newRole
  );

  const existing =
    await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        companyId,
      },
    });

  if (!existing) {
    throw new Error(
      "Team member not found"
    );
  }

  const member =
    await prisma.teamMember.update({
      where: {
        id: memberId,
      },

      data: {
        role,
        lastActivityAt: new Date(),
      },
    });

  return toFrontend(member);
}

/* =========================================================
   REMOVE MEMBER
========================================================= */

async function removeMember(
  companyId,
  memberId
) {
  const existing =
    await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        companyId,
      },
    });

  if (!existing) {
    throw new Error(
      "Team member not found"
    );
  }

  await prisma.teamMember.delete({
    where: {
      id: memberId,
    },
  });
}

/* =========================================================
   TEAM STATS
========================================================= */

async function getStats(companyId) {
  const [
    total,
    active,
    pending,
  ] = await Promise.all([
    prisma.teamMember.count({
      where: {
        companyId,
      },
    }),

    prisma.teamMember.count({
      where: {
        companyId,
        status: "ACTIVE",
      },
    }),

    prisma.teamMember.count({
      where: {
        companyId,
        status: "PENDING",
      },
    }),
  ]);

  return {
    total,
    active,
    pending,
  };
}

/* =========================================================
   CUSTOM ROLES
========================================================= */

async function listCustomRoles(companyId) {
  const roles =
    await prisma.role.findMany({
      where: {
        companyId,
      },

      orderBy: {
        name: "asc",
      },
    });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description:
      role.description ||
      "Custom workspace role.",
    createdAt: role.createdAt,
  }));
}

/* =========================================================
   CREATE CUSTOM ROLE
========================================================= */

async function createCustomRole(
  companyId,
  payload
) {
  const name = (
    payload.name || ""
  ).trim();

  const description = (
    payload.description || ""
  ).trim();

  if (!name) {
    throw new Error(
      "Role name is required."
    );
  }

  if (name.length < 2) {
    throw new Error(
      "Role name must contain at least 2 characters."
    );
  }

  if (name.length > 50) {
    throw new Error(
      "Role name cannot exceed 50 characters."
    );
  }

  const defaultRoles = [
    "Owner",
    "Admin",
    "Manager",
    "Analyst",
    "Viewer",
  ];

  if (
    defaultRoles.some(
      (role) =>
        role.toLowerCase() ===
        name.toLowerCase()
    )
  ) {
    throw new Error(
      "A role with this name already exists."
    );
  }

  const existing =
    await prisma.role.findFirst({
      where: {
        companyId,

        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

  if (existing) {
    throw new Error(
      "A role with this name already exists."
    );
  }

  const role =
    await prisma.role.create({
      data: {
        companyId,
        name,
        description:
          description ||
          "Custom workspace role.",
      },
    });

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    createdAt: role.createdAt,
  };
}

/* =========================================================
   DELETE CUSTOM ROLE
========================================================= */

async function deleteCustomRole(
  companyId,
  roleId
) {
  const existing =
    await prisma.role.findFirst({
      where: {
        id: roleId,
        companyId,
      },
    });

  if (!existing) {
    throw new Error(
      "Custom role not found."
    );
  }

  await prisma.role.delete({
    where: {
      id: roleId,
    },
  });
}

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  listMembers,
  inviteMember,
  acceptInvitation,
  updateRole,
  removeMember,
  getStats,
  listCustomRoles,
  createCustomRole,
  deleteCustomRole,
};