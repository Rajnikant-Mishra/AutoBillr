// src/services/teamService.js
const prisma = require("../../config/prisma"); // adjust path if needed
const crypto = require("crypto");

const ROLE_MAP = {
  Owner: "OWNER",
  Admin: "ADMIN",
  Manager: "MANAGER",
  Analyst: "ANALYST",
  Viewer: "VIEWER",
};

function toFrontend(member) {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    avatar: member.avatar,
    role: member.role.charAt(0) + member.role.slice(1).toLowerCase(), // OWNER → Owner
    status: member.status.toLowerCase(),
    lastActivityAt: member.lastActivityAt?.toISOString() || null,
    channels: member.channels || ["email"],
    whatsapp: member.whatsapp,
    github: member.github,
    discord: member.discord,
  };
}

/* =========================================================
   TEAM MEMBERS
========================================================= */

async function listMembers(companyId) {
  const members = await prisma.teamMember.findMany({
    where: { companyId },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
  return members.map(toFrontend);
}

async function inviteMember(companyId, invitedById, payload) {
  const email = payload.email.trim().toLowerCase();
  const name = payload.name.trim();
  const role = ROLE_MAP[payload.role] || "VIEWER";

  const existing = await prisma.teamMember.findUnique({
    where: {
      companyId_email: { companyId, email },
    },
  });

  if (existing && existing.status !== "INACTIVE") {
    throw new Error("A member with this email already exists.");
  }

  const invitationToken = crypto.randomBytes(32).toString("hex");

  const member = await prisma.teamMember.upsert({
    where: {
      companyId_email: { companyId, email },
    },
    create: {
      companyId,
      name,
      email,
      avatar: payload.avatar || null,
      role,
      status: "PENDING",
      channels: payload.channels || ["email"],
      whatsapp: payload.recipients?.whatsapp || null,
      github: payload.recipients?.github || null,
      discord: payload.recipients?.discord || null,
      invitationToken,
      invitationMessage: payload.message || null,
      invitedById,
      lastActivityAt: new Date(),
    },
    update: {
      name,
      avatar: payload.avatar || null,
      role,
      status: "PENDING",
      channels: payload.channels || ["email"],
      whatsapp: payload.recipients?.whatsapp || null,
      github: payload.recipients?.github || null,
      discord: payload.recipients?.discord || null,
      invitationToken,
      invitationMessage: payload.message || null,
      invitedById,
      lastActivityAt: new Date(),
      acceptedAt: null,
    },
  });

  return toFrontend(member);
}

async function updateRole(companyId, memberId, newRole) {
  const role = ROLE_MAP[newRole];
  if (!role) throw new Error("Invalid role");

  // Optional: make sure the member belongs to this company
  const existing = await prisma.teamMember.findFirst({
    where: { id: memberId, companyId },
  });
  if (!existing) throw new Error("Team member not found");

  const member = await prisma.teamMember.update({
    where: { id: memberId },
    data: {
      role,
      lastActivityAt: new Date(),
    },
  });

  return toFrontend(member);
}

async function removeMember(companyId, memberId) {
  const existing = await prisma.teamMember.findFirst({
    where: { id: memberId, companyId },
  });
  if (!existing) throw new Error("Team member not found");

  await prisma.teamMember.delete({
    where: { id: memberId },
  });
}

async function getStats(companyId) {
  const [total, active, pending] = await Promise.all([
    prisma.teamMember.count({ where: { companyId } }),
    prisma.teamMember.count({ where: { companyId, status: "ACTIVE" } }),
    prisma.teamMember.count({ where: { companyId, status: "PENDING" } }),
  ]);

  return { total, active, pending };
}

/* =========================================================
   CUSTOM ROLES
========================================================= */

/* =========================================================
   CUSTOM ROLES  (model name = Role)
========================================================= */

async function listCustomRoles(companyId) {
  const roles = await prisma.role.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description || "Custom workspace role.",
    createdAt: role.createdAt,
  }));
}

async function createCustomRole(companyId, payload) {
  const name = (payload.name || "").trim();
  const description = (payload.description || "").trim();

  if (!name) {
    throw new Error("Role name is required.");
  }

  if (name.length < 2) {
    throw new Error("Role name must contain at least 2 characters.");
  }

  if (name.length > 50) {
    throw new Error("Role name cannot exceed 50 characters.");
  }

  // Prevent colliding with default system roles
  const defaultRoles = ["Owner", "Admin", "Manager", "Analyst", "Viewer"];
  if (defaultRoles.some((r) => r.toLowerCase() === name.toLowerCase())) {
    throw new Error("A role with this name already exists.");
  }

  // Case-insensitive uniqueness check
  const existing = await prisma.role.findFirst({
    where: {
      companyId,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    throw new Error("A role with this name already exists.");
  }

  const role = await prisma.role.create({
    data: {
      companyId,
      name,
      description: description || "Custom workspace role.",
    },
  });

  return {
    id: role.id,
    name: role.name,
    description: role.description,
    createdAt: role.createdAt,
  };
}

async function deleteCustomRole(companyId, roleId) {
  const existing = await prisma.role.findFirst({
    where: { id: roleId, companyId },
  });

  if (!existing) {
    throw new Error("Custom role not found.");
  }

  await prisma.role.delete({
    where: { id: roleId },
  });
}

module.exports = {
  listMembers,
  inviteMember,
  updateRole,
  removeMember,
  getStats,

  // Custom roles
  listCustomRoles,
  createCustomRole,
  deleteCustomRole,
};