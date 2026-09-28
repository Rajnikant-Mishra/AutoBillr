const prisma = require("../../config/prisma");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const {
  generateRandomPassword,
} = require("../utils/generatePassword");

const {
  sendTeamInvitationEmail,
  sendWelcomeCredentialsEmail,
} = require("./emailService");

/*
|--------------------------------------------------------------------------
| SYSTEM ROLES
|--------------------------------------------------------------------------
*/

const SYSTEM_ROLES = {
  Owner: "OWNER",
  Admin: "ADMIN",
  Manager: "MANAGER",
  Analyst: "ANALYST",
  Viewer: "VIEWER",
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

/*
 * Convert database TeamMember into the format expected by frontend.
 *
 * IMPORTANT:
 * roleId and extraPermissions MUST be returned.
 */
function toFrontend(member) {
  const roleName = member.role || "VIEWER";

  const normalizedRole = String(roleName)
    .trim()
    .toUpperCase();

  const displayRole =
    normalizedRole === "OWNER"
      ? "Owner"
      : normalizedRole === "ADMIN"
      ? "Admin"
      : normalizedRole === "MANAGER"
      ? "Manager"
      : normalizedRole === "ANALYST"
      ? "Analyst"
      : normalizedRole === "VIEWER"
      ? "Viewer"
      : roleName;

  return {
    id: member.id,

    name: member.name,

    email: member.email,

    avatar: member.avatar,

    /*
     * Frontend display role.
     */
    role: displayRole,

    /*
     * IMPORTANT:
     * Database Role ID.
     */
    roleId: member.roleId || null,

    /*
     * Member-specific permissions.
     */
    extraPermissions: Array.isArray(member.extraPermissions)
      ? member.extraPermissions
      : [],

    status: member.status
      ? member.status.toLowerCase()
      : "pending",

    lastActivityAt:
      member.lastActivityAt?.toISOString() || null,

    channels:
      Array.isArray(member.channels)
        ? member.channels
        : ["email"],

    whatsapp: member.whatsapp || null,

    github: member.github || null,

    discord: member.discord || null,
  };
}

/*
|--------------------------------------------------------------------------
| VALIDATE COMPANY
|--------------------------------------------------------------------------
*/

async function validateCompany(companyId) {
  if (!companyId) {
    throw new Error("Company ID is required.");
  }

  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },

    select: {
      id: true,
      name: true,
    },
  });

  if (!company) {
    console.error(
      "TEAM SERVICE: Company not found:",
      companyId
    );

    throw new Error(
      "Company associated with this account was not found. Please login again."
    );
  }

  return company;
}

/*
|--------------------------------------------------------------------------
| ENSURE SYSTEM ROLES
|--------------------------------------------------------------------------
|
| Makes sure system roles exist in the database.
|
| IMPORTANT:
| Existing permissions are NOT overwritten.
|--------------------------------------------------------------------------
*/

async function ensureSystemRoles(companyId) {
  const {
    DEFAULT_ROLE_PERMISSIONS,
  } = require("../constants/permissions");

  const roles = [
    {
      name: "Owner",
      description: "Full access to the company",
      permissions:
        DEFAULT_ROLE_PERMISSIONS.Owner || [],
    },

    {
      name: "Admin",
      description: "Administrative access",
      permissions:
        DEFAULT_ROLE_PERMISSIONS.Admin || [],
    },

    {
      name: "Manager",
      description: "Management access",
      permissions:
        DEFAULT_ROLE_PERMISSIONS.Manager || [],
    },

    {
      name: "Analyst",
      description: "Analytics and read access",
      permissions:
        DEFAULT_ROLE_PERMISSIONS.Analyst || [],
    },

    {
      name: "Viewer",
      description: "Read-only access",
      permissions:
        DEFAULT_ROLE_PERMISSIONS.Viewer || [],
    },
  ];

  const databaseRoles = [];

  for (const role of roles) {
    const databaseRole =
      await prisma.role.upsert({
        where: {
          companyId_name: {
            companyId,
            name: role.name,
          },
        },

        /*
         * DO NOT overwrite customized permissions.
         */
        update: {},

        create: {
          companyId,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          isSystem: true,
        },
      });

    databaseRoles.push(databaseRole);
  }

  return databaseRoles;
}

/*
|--------------------------------------------------------------------------
| RESOLVE DATABASE ROLE
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This function returns the actual Role database record.
|
| We no longer only return "ANALYST".
| We return:
|
| {
|   id: "...",
|   name: "Analyst",
|   permissions: [...]
| }
|--------------------------------------------------------------------------
*/

async function resolveDatabaseRole(
  companyId,
  roleName
) {
  await validateCompany(companyId);

  /*
   * Make sure standard roles exist.
   */
  await ensureSystemRoles(companyId);

  if (!roleName) {
    roleName = "Viewer";
  }

  const requestedRole = String(roleName).trim();

  /*
   * First try exact/case-insensitive database role.
   */
  const databaseRole =
    await prisma.role.findFirst({
      where: {
        companyId,

        name: {
          equals: requestedRole,
          mode: "insensitive",
        },
      },

      select: {
        id: true,
        companyId: true,
        name: true,
        description: true,
        permissions: true,
        isSystem: true,
      },
    });

  if (databaseRole) {
    return databaseRole;
  }

  /*
   * Support uppercase system values:
   *
   * ANALYST -> Analyst
   * OWNER   -> Owner
   */
  const normalized =
    requestedRole.toUpperCase();

  const systemRoleName =
    Object.keys(SYSTEM_ROLES).find(
      (name) =>
        SYSTEM_ROLES[name] === normalized
    );

  if (systemRoleName) {
    const systemRole =
      await prisma.role.findFirst({
        where: {
          companyId,

          name: {
            equals: systemRoleName,
            mode: "insensitive",
          },
        },

        select: {
          id: true,
          companyId: true,
          name: true,
          description: true,
          permissions: true,
          isSystem: true,
        },
      });

    if (systemRole) {
      return systemRole;
    }
  }

  throw new Error(
    `Invalid role: ${roleName}`
  );
}

/*
|--------------------------------------------------------------------------
| RESOLVE ROLE
|--------------------------------------------------------------------------
|
| Backward-compatible helper.
|
| Returns the role value used by TeamMember.role.
|--------------------------------------------------------------------------
*/

async function resolveRole(
  companyId,
  roleName
) {
  const role =
    await resolveDatabaseRole(
      companyId,
      roleName
    );

  /*
   * Existing TeamMember.role values are
   * uppercase for system roles.
   */
  if (role.isSystem) {
    const systemValue =
      SYSTEM_ROLES[role.name];

    if (systemValue) {
      return systemValue;
    }
  }

  /*
   * Custom roles use their actual database name.
   */
  return role.name;
}

/*
|--------------------------------------------------------------------------
| LIST TEAM MEMBERS
|--------------------------------------------------------------------------
*/

async function listMembers(companyId) {
  await validateCompany(companyId);

  const members =
    await prisma.teamMember.findMany({
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

      select: {
        id: true,
        companyId: true,

        name: true,
        email: true,

        avatar: true,

        status: true,

        channels: true,

        whatsapp: true,
        github: true,
        discord: true,

        role: true,
        roleId: true,

        /*
         * IMPORTANT:
         * Return member-level permissions.
         */
        extraPermissions: true,

        invitationToken: true,
        invitationMessage: true,

        invitedById: true,
        invitedAt: true,
        acceptedAt: true,

        lastActivityAt: true,

        createdAt: true,
        updatedAt: true,

        /*
         * Return the actual Role too.
         */
        roleRef: {
          select: {
            id: true,
            name: true,
            permissions: true,
            isSystem: true,
          },
        },
      },
    });

  return members.map((member) => ({
    ...toFrontend(member),

    /*
     * Useful for Team Permissions UI.
     */
    roleRef: member.roleRef
      ? {
          id: member.roleRef.id,
          name: member.roleRef.name,
          permissions:
            Array.isArray(
              member.roleRef.permissions
            )
              ? member.roleRef.permissions
              : [],
          isSystem:
            Boolean(member.roleRef.isSystem),
        }
      : null,
  }));
}

/*
|--------------------------------------------------------------------------
| INVITE TEAM MEMBER
|--------------------------------------------------------------------------
*/

async function inviteMember(
  companyId,
  invitedById,
  payload
) {
  const company =
    await validateCompany(companyId);

  console.log(
    "TEAM INVITE companyId:",
    companyId
  );

  console.log(
    "TEAM INVITE company:",
    company.name
  );

  /*
   * Validate inviting user.
   */
  if (!invitedById) {
    throw new Error(
      "Authenticated user is required."
    );
  }

  const invitedBy =
    await prisma.user.findFirst({
      where: {
        id: invitedById,
        companyId,
      },

      select: {
        id: true,
        companyId: true,
      },
    });

  if (!invitedBy) {
    throw new Error(
      "Authenticated user is not associated with this company."
    );
  }

  if (!payload) {
    throw new Error(
      "Invitation data is required."
    );
  }

  /*
   * Normalize email.
   */
  const email = String(
    payload.email || ""
  )
    .trim()
    .toLowerCase();

  const name = String(
    payload.name || ""
  ).trim();

  if (!name) {
    throw new Error(
      "Member name is required."
    );
  }

  if (!email) {
    throw new Error(
      "Member email is required."
    );
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error(
      "Invalid email address."
    );
  }

  /*
   * Resolve actual database Role.
   *
   * THIS IS IMPORTANT.
   */
  const databaseRole =
    await resolveDatabaseRole(
      companyId,
      payload.role
    );

  /*
   * TeamMember.role remains compatible with
   * the existing application.
   */
  const role =
    databaseRole.isSystem
      ? SYSTEM_ROLES[
          databaseRole.name
        ]
      : databaseRole.name;

  /*
   * Existing member.
   */
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

  /*
   * Invitation token.
   */
  const invitationToken =
    crypto
      .randomBytes(48)
      .toString("hex");

  /*
   * Invitation URL.
   */
  const frontendUrl = (
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");

  const invitationUrl =
    `${frontendUrl}/accept-invitation` +
    `?token=${encodeURIComponent(
      invitationToken
    )}`;

  /*
   * Channels.
   */
  const channels = [
    ...new Set([
      "email",

      ...(Array.isArray(
        payload.channels
      )
        ? payload.channels
        : []),
    ]),
  ];

  /*
   * Recipient data.
   */
  const recipients =
    payload.recipients &&
    typeof payload.recipients ===
      "object"
      ? payload.recipients
      : {};

  /*
   * Temporary password.
   */
  const temporaryPassword =
    generateRandomPassword(12);

  const temporaryPasswordHash =
    await bcrypt.hash(
      temporaryPassword,
      12
    );

  /*
   * CREATE / UPDATE TEAM MEMBER
   */
  const member =
    await prisma.teamMember.upsert({
      where: {
        companyId_email: {
          companyId,
          email,
        },
      },

      /*
       * CREATE
       */
      create: {
        companyId,

        name,
        email,

        avatar:
          payload.avatar || null,

        /*
         * Existing role field.
         */
        role,

        /*
         * IMPORTANT:
         * Save actual database Role ID.
         */
        roleId: databaseRole.id,

        /*
         * New members start with no
         * member-specific permissions.
         */
        extraPermissions: [],

        status: "PENDING",

        channels,

        whatsapp:
          recipients.whatsapp || null,

        github:
          recipients.github || null,

        discord:
          recipients.discord || null,

        invitationToken,

        invitationMessage:
          payload.message || null,

        invitedById,

        invitedAt: new Date(),

        lastActivityAt: new Date(),

        temporaryPasswordHash,
      },

      /*
       * UPDATE / RESEND
       */
      update: {
        name,

        avatar:
          payload.avatar || null,

        role,

        /*
         * IMPORTANT:
         * Update roleId when invitation is resent
         * with a different role.
         */
        roleId: databaseRole.id,

        status: "PENDING",

        channels,

        whatsapp:
          recipients.whatsapp || null,

        github:
          recipients.github || null,

        discord:
          recipients.discord || null,

        invitationToken,

        invitationMessage:
          payload.message || null,

        invitedById,

        invitedAt: new Date(),

        lastActivityAt: new Date(),

        acceptedAt: null,

        temporaryPasswordHash,
      },

      include: {
        roleRef: {
          select: {
            id: true,
            name: true,
            permissions: true,
            isSystem: true,
          },
        },
      },
    });

  /*
   * Send invitation.
   */
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
    "TEAM INVITATION ROLE ID:",
    databaseRole.id
  );

  console.log(
    "TEAM INVITATION COMPANY:",
    company.name
  );

  console.log(
    "TEAM INVITATION COMPANY ID:",
    company.id
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

  return {
    ...toFrontend(member),

    roleRef: member.roleRef
      ? {
          id: member.roleRef.id,
          name: member.roleRef.name,
          permissions:
            Array.isArray(
              member.roleRef.permissions
            )
              ? member.roleRef.permissions
              : [],
          isSystem:
            Boolean(member.roleRef.isSystem),
        }
      : null,
  };
}

/*
|--------------------------------------------------------------------------
| ACCEPT TEAM INVITATION
|--------------------------------------------------------------------------
*/

async function acceptInvitation(token) {
  if (!token) {
    throw new Error(
      "Invitation token is required."
    );
  }

  const member =
    await prisma.teamMember.findFirst({
      where: {
        invitationToken: token,
      },

      include: {
        company: true,

        roleRef: {
          select: {
            id: true,
            name: true,
            permissions: true,
            isSystem: true,
          },
        },
      },
    });

  if (!member) {
    throw new Error(
      "Invalid or expired invitation."
    );
  }

  /*
   * Already accepted.
   */
  if (member.status === "ACTIVE") {
    return {
      ...toFrontend(member),

      roleRef: member.roleRef
        ? {
            id: member.roleRef.id,
            name: member.roleRef.name,
            permissions:
              Array.isArray(
                member.roleRef.permissions
              )
                ? member.roleRef.permissions
                : [],
            isSystem:
              Boolean(
                member.roleRef.isSystem
              ),
          }
        : null,
    };
  }

  /*
   * Name.
   */
  const nameParts = String(
    member.name || "User"
  )
    .trim()
    .split(/\s+/);

  const firstName =
    nameParts[0] || "User";

  const lastName =
    nameParts.slice(1).join(" ") || "";

  /*
   * Existing TeamMember role.
   */
const invitationRole =
  member.role || "VIEWER";

const normalizedInvitationRole =
  String(invitationRole)
    .trim()
    .toUpperCase();

const userRole =
  ["OWNER", "ADMIN", "MANAGER", "ANALYST", "VIEWER"]
    .includes(normalizedInvitationRole)
    ? normalizedInvitationRole
    : "VIEWER";

const temporaryPassword =
  generateRandomPassword(16);

const passwordHash =
  await bcrypt.hash(
    temporaryPassword,
    12
  );

let user =
  await prisma.user.findUnique({
    where: {
      email: member.email,
    },
  });

if (!user) {
  user = await prisma.user.create({
    data: {
      email: member.email,
      firstName,
      lastName,
      passwordHash,
      role: userRole,
      companyId: member.companyId,
    },
  });
} else {
  user = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
      role: userRole,
      companyId: member.companyId,
      firstName,
      lastName,
    },
  });
}

  /*
   * Activate TeamMember.
   *
   * IMPORTANT:
   * roleId is preserved.
   * extraPermissions are preserved.
   */
  const updated =
    await prisma.teamMember.update({
      where: {
        id: member.id,
      },

      data: {
        status: "ACTIVE",

        acceptedAt: new Date(),

        lastActivityAt: new Date(),

        invitationToken: null,

        temporaryPassword,

        temporaryPasswordHash:
          passwordHash,

        /*
         * Keep the database role relationship.
         */
        roleId:
          member.roleId || null,

        /*
         * Keep member-specific permissions.
         */
        extraPermissions:
          Array.isArray(
            member.extraPermissions
          )
            ? member.extraPermissions
            : [],
      },

      include: {
        roleRef: {
          select: {
            id: true,
            name: true,
            permissions: true,
            isSystem: true,
          },
        },
      },
    });

  /*
   * Send credentials.
   */
  try {
    await sendWelcomeCredentialsEmail({
      to: member.email,

      name: member.name,

      userId: member.email,

      temporaryPassword,

      companyName:
        member.company?.name ||
        "AutoBillr",

      role: invitationRole,
    });
  } catch (emailErr) {
    console.error(
      "Welcome credentials email failed (member still activated):",
      emailErr
    );
  }

  return {
    ...toFrontend(updated),

    roleRef: updated.roleRef
      ? {
          id: updated.roleRef.id,
          name: updated.roleRef.name,
          permissions:
            Array.isArray(
              updated.roleRef.permissions
            )
              ? updated.roleRef.permissions
              : [],
          isSystem:
            Boolean(
              updated.roleRef.isSystem
            ),
        }
      : null,
  };
}

/*
|--------------------------------------------------------------------------
| UPDATE ROLE
|--------------------------------------------------------------------------
|
| This is VERY IMPORTANT.
|
| Before:
|
| TeamMember.role = "ANALYST"
| TeamMember.roleId = NULL
|
| Now:
|
| TeamMember.role = "ANALYST"
| TeamMember.roleId = actual Role.id
|
|--------------------------------------------------------------------------
*/

async function updateRole(
  companyId,
  memberId,
  newRole
) {
  await validateCompany(companyId);

  /*
   * Find actual database Role.
   */
  const databaseRole =
    await resolveDatabaseRole(
      companyId,
      newRole
    );

  /*
   * Convert system role to existing
   * TeamMember.role format.
   */
  const role =
    databaseRole.isSystem
      ? SYSTEM_ROLES[
          databaseRole.name
        ]
      : databaseRole.name;

  /*
   * Make sure member belongs to company.
   */
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

  /*
   * Update BOTH role and roleId.
   *
   * Do NOT modify extraPermissions.
   */
  const member =
    await prisma.teamMember.update({
      where: {
        id: memberId,
      },

      data: {
        role,

        roleId:
          databaseRole.id,

        lastActivityAt:
          new Date(),
      },

      include: {
        roleRef: {
          select: {
            id: true,
            name: true,
            permissions: true,
            isSystem: true,
          },
        },
      },
    });

  return {
    ...toFrontend(member),

    roleRef: member.roleRef
      ? {
          id: member.roleRef.id,
          name: member.roleRef.name,
          permissions:
            Array.isArray(
              member.roleRef.permissions
            )
              ? member.roleRef.permissions
              : [],
          isSystem:
            Boolean(member.roleRef.isSystem),
        }
      : null,
  };
}

/*
|--------------------------------------------------------------------------
| UPDATE MEMBER EXTRA PERMISSIONS
|--------------------------------------------------------------------------
|
| Although the controller currently performs this update,
| keeping the service function here makes the architecture cleaner.
|--------------------------------------------------------------------------
*/

async function updateMemberExtraPermissions(
  companyId,
  memberId,
  extraPermissions
) {
  await validateCompany(companyId);

  if (!Array.isArray(extraPermissions)) {
    throw new Error(
      "extraPermissions must be an array."
    );
  }

  const uniquePermissions = [
    ...new Set(
      extraPermissions
        .filter(Boolean)
        .map((permission) =>
          String(permission).trim()
        )
        .filter(Boolean)
    ),
  ];

  const existing =
    await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        companyId,
      },
    });

  if (!existing) {
    throw new Error(
      "Team member not found."
    );
  }

  const member =
    await prisma.teamMember.update({
      where: {
        id: memberId,
      },

      data: {
        extraPermissions:
          uniquePermissions,

        lastActivityAt:
          new Date(),
      },

      include: {
        roleRef: {
          select: {
            id: true,
            name: true,
            permissions: true,
            isSystem: true,
          },
        },
      },
    });

  return {
    ...toFrontend(member),

    roleRef: member.roleRef
      ? {
          id: member.roleRef.id,
          name: member.roleRef.name,
          permissions:
            Array.isArray(
              member.roleRef.permissions
            )
              ? member.roleRef.permissions
              : [],
          isSystem:
            Boolean(member.roleRef.isSystem),
        }
      : null,
  };
}

/*
|--------------------------------------------------------------------------
| REMOVE MEMBER
|--------------------------------------------------------------------------
*/

async function removeMember(
  companyId,
  memberId
) {
  await validateCompany(companyId);

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

/*
|--------------------------------------------------------------------------
| TEAM STATS
|--------------------------------------------------------------------------
*/

async function getStats(companyId) {
  await validateCompany(companyId);

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

/*
|--------------------------------------------------------------------------
| LIST ROLES
|--------------------------------------------------------------------------
*/

async function listCustomRoles(
  companyId
) {
  await validateCompany(companyId);

  /*
   * Make sure system roles exist.
   */
  await ensureSystemRoles(companyId);

  const roles =
    await prisma.role.findMany({
      where: {
        companyId,
      },

      orderBy: [
        {
          isSystem: "desc",
        },

        {
          name: "asc",
        },
      ],
    });

  return roles.map((role) => ({
    id: role.id,

    name: role.name,

    description:
      role.description ||
      "Custom workspace role.",

    permissions:
      Array.isArray(
        role.permissions
      )
        ? role.permissions
        : [],

    isSystem:
      Boolean(role.isSystem),

    createdAt:
      role.createdAt,
  }));
}

/*
|--------------------------------------------------------------------------
| CREATE CUSTOM ROLE
|--------------------------------------------------------------------------
*/

async function createCustomRole(
  companyId,
  payload
) {
  await validateCompany(companyId);

  const name = (
    payload?.name || ""
  ).trim();

  const description = (
    payload?.description || ""
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

  /*
   * Custom roles start with no permissions.
   * They can then be configured in Team Permissions.
   */
  const role =
    await prisma.role.create({
      data: {
        companyId,

        name,

        description:
          description ||
          "Custom workspace role.",

        permissions: [],

        isSystem: false,
      },
    });

  return {
    id: role.id,

    name: role.name,

    description: role.description,

    permissions:
      Array.isArray(
        role.permissions
      )
        ? role.permissions
        : [],

    isSystem:
      Boolean(role.isSystem),

    createdAt:
      role.createdAt,
  };
}

/*
|--------------------------------------------------------------------------
| DELETE CUSTOM ROLE
|--------------------------------------------------------------------------
*/

async function deleteCustomRole(
  companyId,
  roleId
) {
  await validateCompany(companyId);

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

  /*
   * Never delete system roles.
   */
  if (existing.isSystem) {
    throw new Error(
      "System roles cannot be deleted."
    );
  }

  /*
   * Check whether any members use this role.
   */
  const membersUsingRole =
    await prisma.teamMember.count({
      where: {
        companyId,
        roleId,
      },
    });

  if (membersUsingRole > 0) {
    throw new Error(
      "This role is assigned to team members. Reassign those members before deleting the role."
    );
  }

  await prisma.role.delete({
    where: {
      id: roleId,
    },
  });
}

/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/

module.exports = {
  listMembers,

  inviteMember,

  acceptInvitation,

  updateRole,

  updateMemberExtraPermissions,

  removeMember,

  getStats,

  listCustomRoles,

  createCustomRole,

  deleteCustomRole,

  resolveRole,

  resolveDatabaseRole,

  ensureSystemRoles,
};