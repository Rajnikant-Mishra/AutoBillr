const prisma = require("../config/prisma");

async function main() {
  const members =
    await prisma.teamMember.findMany({
      select: {
        id: true,
        companyId: true,
        role: true,
        roleId: true,
        email: true,
      },
    });

  let fixed = 0;
  let skipped = 0;

  for (const member of members) {
    if (member.roleId) {
      skipped++;
      continue;
    }

    const roleValue = String(
      member.role || "VIEWER"
    )
      .trim()
      .toUpperCase();

    const systemRoleMap = {
      OWNER: "Owner",
      ADMIN: "Admin",
      MANAGER: "Manager",
      ANALYST: "Analyst",
      VIEWER: "Viewer",
    };

    const roleName =
      systemRoleMap[roleValue] ||
      member.role;

    const role =
      await prisma.role.findFirst({
        where: {
          companyId: member.companyId,

          name: {
            equals: roleName,
            mode: "insensitive",
          },
        },

        select: {
          id: true,
          name: true,
        },
      });

    if (!role) {
      console.log(
        "ROLE NOT FOUND:",
        member.email,
        member.role
      );

      continue;
    }

    await prisma.teamMember.update({
      where: {
        id: member.id,
      },

      data: {
        roleId: role.id,
      },
    });

    console.log(
      "FIXED:",
      member.email,
      "=>",
      role.name,
      role.id
    );

    fixed++;
  }

  console.log("");
  console.log("==============================");
  console.log("ROLE ID REPAIR COMPLETE");
  console.log("Fixed:", fixed);
  console.log("Skipped:", skipped);
  console.log("==============================");
}

main()
  .catch((error) => {
    console.error(
      "ROLE ID REPAIR ERROR:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });