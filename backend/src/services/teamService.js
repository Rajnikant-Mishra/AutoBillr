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

const {
  DEFAULT_ROLE_PERMISSIONS,
} = require("../constants/permissions");

const SYSTEM_ROLES = {
  Owner: "OWNER",
  Admin: "ADMIN",
  Manager: "MANAGER",
  Analyst: "ANALYST",
  Viewer: "VIEWER",
};

const SYSTEM_ROLE_NAMES =
  Object.keys(SYSTEM_ROLES);

function errorWithStatus(
  message,
  statusCode = 400
) {
  return Object.assign(new Error(message), {
    statusCode,
  });
}

function displayRole(member) {
  const raw =
    member.roleRef?.name ||
    member.role ||
    "VIEWER";

  const systemName =
    SYSTEM_ROLE_NAMES.find(
      (name) =>
        name.toLowerCase() ===
        String(raw).toLowerCase()
    );

  return systemName || raw;
}

function toFrontend(member) {
  return {
    id: member.id,
    userId: member.userId || null,
    name: member.name,
    email: member.email,
    avatar: member.avatar || null,

    role: displayRole(member),

    roleId:
      member.roleId ||
      member.roleRef?.id ||
      null,

    roleRef: member.roleRef
      ? {
          id: member.roleRef.id,
          name: member.roleRef.name,
          permissions: Array.isArray(
            member.roleRef.permissions
          )
            ? member.roleRef.permissions
            : [],
          isSystem: Boolean(
            member.roleRef.isSystem
          ),
        }
      : null,

    extraPermissions: Array.isArray(
      member.extraPermissions
    )
      ? member.extraPermissions
      : [],

    status: String(
      member.status || "PENDING"
    ).toLowerCase(),

    invitedById: member.invitedById || null,
    invitedAt: member.invitedAt || null,
    acceptedAt: member.acceptedAt || null,
    createdAt: member.createdAt || null,
    updatedAt: member.updatedAt || null,
  };
}

async function validateCompany(companyId) {
  if (!companyId) {
    throw errorWithStatus(
      "Company ID is required."
    );
  }

  const company =
    await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        ownerId: true,
      },
    });

  if (!company) {
    throw errorWithStatus(
      "Company associated with this account was not found. Please log in again.",
      404
    );
  }

  return company;
}

async function ensureSystemRoles(
  companyId,
  db = prisma
) {
  const definitions =
    SYSTEM_ROLE_NAMES.map((name) => ({
      name,
      description:
        name === "Owner"
          ? "Full access to the company"
          : `${name} access`,
      permissions:
        DEFAULT_ROLE_PERMISSIONS[name] || [],
    }));

  const roles = [];

  for (const role of definitions) {
    const savedRole =
      await db.role.upsert({
        where: {
          companyId_name: {
            companyId,
            name: role.name,
          },
        },
        update: {},
        create: {
          companyId,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
          isSystem: true,
        },
      });

    roles.push(savedRole);
  }

  return roles;
}

async function resolveDatabaseRole(
  companyId,
  roleName
) {
  await validateCompany(companyId);
  await ensureSystemRoles(companyId);

  const requested = String(
    roleName || "Viewer"
  ).trim();

  let role = await prisma.role.findFirst({
    where: {
      companyId,
      name: {
        equals: requested,
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

  if (!role) {
    const mappedName =
      SYSTEM_ROLE_NAMES.find(
        (name) =>
          SYSTEM_ROLES[name] ===
          requested.toUpperCase()
      );

    if (mappedName) {
      role = await prisma.role.findFirst({
        where: {
          companyId,
          name: mappedName,
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
    }
  }

  if (!role) {
    throw errorWithStatus(
      `Invalid role: ${requested}`
    );
  }

  return role;
}

async function resolveRole(
  companyId,
  roleName
) {
  const role = await resolveDatabaseRole(
    companyId,
    roleName
  );

  return role.isSystem
    ? SYSTEM_ROLES[role.name] || role.name
    : role.name;
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
      where: { companyId },
      orderBy: [
        { status: "asc" },
        { name: "asc" },
      ],
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

  return members.map(toFrontend);
}

/*
|--------------------------------------------------------------------------
| INVITE TEAM MEMBER
|--------------------------------------------------------------------------
*/

async function inviteMember(
  companyId,
  invitedById,
  payload = {}
) {
  const company =
    await validateCompany(companyId);

  if (!invitedById) {
    throw errorWithStatus(
      "Authenticated user is required.",
      401
    );
  }

  const inviter =
    await prisma.user.findUnique({
      where: { id: invitedById },
      select: {
        id: true,
        email: true,
      },
    });

  if (!inviter) {
    throw errorWithStatus(
      "Inviting user was not found.",
      401
    );
  }

  const isOwner =
    company.ownerId === inviter.id;

  const activeMembership = isOwner
    ? null
    : await prisma.teamMember.findFirst({
        where: {
          companyId,
          userId: inviter.id,
          status: "ACTIVE",
        },
        select: { id: true },
      });

  if (!isOwner && !activeMembership) {
    throw errorWithStatus(
      "Authenticated user is not associated with this company.",
      403
    );
  }

  const email = String(
    payload.email || ""
  ).trim().toLowerCase();

  const name = String(
    payload.name || ""
  ).trim();

  if (!name) {
    throw errorWithStatus(
      "Member name is required."
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw errorWithStatus(
      "A valid email address is required."
    );
  }

  if (
    email ===
    String(inviter.email).toLowerCase()
  ) {
    throw errorWithStatus(
      "You cannot invite yourself."
    );
  }

  const databaseRole =
    await resolveDatabaseRole(
      companyId,
      payload.role || "Viewer"
    );

  const role = databaseRole.isSystem
    ? SYSTEM_ROLES[databaseRole.name]
    : databaseRole.name;

  const existingUser =
    await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

  const existingMember =
    await prisma.teamMember.findUnique({
      where: {
        companyId_email: {
          companyId,
          email,
        },
      },
    });

  if (
    existingMember &&
    existingMember.status !== "INACTIVE"
  ) {
    throw errorWithStatus(
      "A member with this email already exists."
    );
  }

  const invitationToken =
    crypto.randomBytes(48).toString("hex");

  const frontendUrl = (
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");

  const invitationUrl =
    `${frontendUrl}/accept-invitation?token=` +
    encodeURIComponent(invitationToken);

  const member =
    await prisma.teamMember.upsert({
      where: {
        companyId_email: {
          companyId,
          email,
        },
      },

      create: {
        companyId,
        userId: existingUser?.id || null,
        name,
        email,
        avatar: payload.avatar || null,
        role,
        roleId: databaseRole.id,
        extraPermissions: [],
        status: "PENDING",
        invitationToken,
        invitationMessage:
          payload.message || null,
        invitedById,
        invitedAt: new Date(),
        acceptedAt: null,
      },

      update: {
        userId: existingUser?.id || null,
        name,
        avatar: payload.avatar || null,
        role,
        roleId: databaseRole.id,
        status: "PENDING",
        invitationToken,
        invitationMessage:
          payload.message || null,
        invitedById,
        invitedAt: new Date(),
        acceptedAt: null,
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

  await sendTeamInvitationEmail({
    to: email,
    memberName: name,
    companyName: company.name,
    role,
    invitationUrl,
    message: payload.message || null,
  });

  return toFrontend(member);
}

/*
|--------------------------------------------------------------------------
| ACCEPT INVITATION
|--------------------------------------------------------------------------
|
| Important:
| User has no role or companyId columns in your schema.
| The member's company and role are stored on TeamMember.
|--------------------------------------------------------------------------
*/

async function acceptInvitation(token) {
  if (!token) {
    throw errorWithStatus(
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
    throw errorWithStatus(
      "Invalid or expired invitation.",
      404
    );
  }

  if (
    member.status === "ACTIVE" &&
    member.userId
  ) {
    return toFrontend(member);
  }

  const nameParts = String(
    member.name || "User"
  ).trim().split(/\s+/);

  const firstName = nameParts[0] || "User";
  const lastName = nameParts
    .slice(1)
    .join(" ");

  /*
   * Only create a new password for a newly created
   * account. Never reset an existing user's password
   * just because they accepted a team invitation.
   */
  let temporaryPassword = null;

  const result = await prisma.$transaction(
    async (tx) => {
      let user = await tx.user.findUnique({
        where: {
          email: member.email,
        },
      });

      if (!user) {
        temporaryPassword =
          generateRandomPassword(16);

        const passwordHash =
          await bcrypt.hash(
            temporaryPassword,
            12
          );

        user = await tx.user.create({
          data: {
            email: member.email,
            firstName,
            lastName,
            passwordHash,
          },
        });
      }

      const updatedMember =
        await tx.teamMember.update({
          where: {
            id: member.id,
          },
          data: {
            userId: user.id,
            status: "ACTIVE",
            acceptedAt: new Date(),
            invitationToken: null,
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
        user,
        member: updatedMember,
      };
    }
  );

  /*
   * Send temporary credentials only if a new account
   * was created. Existing users keep their password.
   */
  if (temporaryPassword) {
    try {
      await sendWelcomeCredentialsEmail({
        to: member.email,
        name: member.name,
        userId: member.email,
        temporaryPassword,
        companyName:
          member.company?.name || "AutoBillr",
        role: displayRole(member),
      });
    } catch (error) {
      console.error(
        "Welcome credentials email failed. Membership remains active:",
        error
      );
    }
  }

  return toFrontend(result.member);
}

/*
|--------------------------------------------------------------------------
| UPDATE TEAM MEMBER ROLE
|--------------------------------------------------------------------------
*/

async function updateRole(
  companyId,
  memberId,
  newRole
) {
  const company =
    await validateCompany(companyId);

  const existing =
    await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        companyId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

  if (!existing) {
    throw errorWithStatus(
      "Team member not found.",
      404
    );
  }

  if (
    existing.userId &&
    existing.userId === company.ownerId
  ) {
    throw errorWithStatus(
      "The workspace owner's role cannot be changed.",
      403
    );
  }

  const databaseRole =
    await resolveDatabaseRole(
      companyId,
      newRole
    );

  const role = databaseRole.isSystem
    ? SYSTEM_ROLES[databaseRole.name]
    : databaseRole.name;

  const member =
    await prisma.teamMember.update({
      where: {
        id: memberId,
      },
      data: {
        role,
        roleId: databaseRole.id,
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

  return toFrontend(member);
}

/*
|--------------------------------------------------------------------------
| UPDATE MEMBER EXTRA PERMISSIONS
|--------------------------------------------------------------------------
*/

async function updateMemberExtraPermissions(
  companyId,
  memberId,
  extraPermissions
) {
  const company =
    await validateCompany(companyId);

  if (!Array.isArray(extraPermissions)) {
    throw errorWithStatus(
      "extraPermissions must be an array."
    );
  }

  const existing =
    await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        companyId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

  if (!existing) {
    throw errorWithStatus(
      "Team member not found.",
      404
    );
  }

  if (
    existing.userId &&
    existing.userId === company.ownerId
  ) {
    throw errorWithStatus(
      "The workspace owner's permissions cannot be changed.",
      403
    );
  }

  const normalizedPermissions = [
    ...new Set(
      extraPermissions
        .map((permission) =>
          String(permission).trim()
        )
        .filter(Boolean)
    ),
  ];

  const member =
    await prisma.teamMember.update({
      where: {
        id: memberId,
      },
      data: {
        extraPermissions:
          normalizedPermissions,
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

  return toFrontend(member);
}

/*
|--------------------------------------------------------------------------
| REMOVE TEAM MEMBER
|--------------------------------------------------------------------------
*/

async function removeMember(
  companyId,
  memberId
) {
  const company =
    await validateCompany(companyId);

  const member =
    await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        companyId,
      },
      select: {
        id: true,
        userId: true,
      },
    });

  if (!member) {
    throw errorWithStatus(
      "Team member not found.",
      404
    );
  }

  if (
    member.userId &&
    member.userId === company.ownerId
  ) {
    throw errorWithStatus(
      "The workspace owner cannot be removed.",
      403
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
| TEAM STATISTICS
|--------------------------------------------------------------------------
*/

async function getStats(companyId) {
  await validateCompany(companyId);

  const [total, active, pending] =
    await Promise.all([
      prisma.teamMember.count({
        where: { companyId },
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

async function listCustomRoles(companyId) {
  await validateCompany(companyId);
  await ensureSystemRoles(companyId);

  return prisma.role.findMany({
    where: { companyId },
    orderBy: [
      { isSystem: "desc" },
      { name: "asc" },
    ],
  });
}

/*
|--------------------------------------------------------------------------
| CREATE CUSTOM ROLE
|--------------------------------------------------------------------------
*/

async function createCustomRole(
  companyId,
  payload = {}
) {
  await validateCompany(companyId);

  const name = String(
    payload.name || ""
  ).trim();

  const description = String(
    payload.description || ""
  ).trim();

  if (name.length < 2 || name.length > 50) {
    throw errorWithStatus(
      "Role name must contain between 2 and 50 characters."
    );
  }

  if (
    SYSTEM_ROLE_NAMES.some(
      (role) =>
        role.toLowerCase() ===
        name.toLowerCase()
    )
  ) {
    throw errorWithStatus(
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
    throw errorWithStatus(
      "A role with this name already exists."
    );
  }

  return prisma.role.create({
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

  const role =
    await prisma.role.findFirst({
      where: {
        id: roleId,
        companyId,
      },
    });

  if (!role) {
    throw errorWithStatus(
      "Role not found.",
      404
    );
  }

  if (role.isSystem) {
    throw errorWithStatus(
      "System roles cannot be deleted."
    );
  }

  const assignedMembers =
    await prisma.teamMember.count({
      where: {
        companyId,
        roleId,
      },
    });

  if (assignedMembers > 0) {
    throw errorWithStatus(
      "This role is assigned to team members. Reassign those members before deleting the role."
    );
  }

  await prisma.role.delete({
    where: {
      id: roleId,
    },
  });
}

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