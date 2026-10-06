const prisma = require("../config/prisma");

async function main() {
  console.log("========================================");
  console.log("FIX PRODUCTION UserRole ENUM");
  console.log("========================================");

  const requiredRoles = [
    "OWNER",
    "ADMIN",
    "MANAGER",
    "ANALYST",
    "VIEWER",
  ];

  console.log("Checking production UserRole enum...");

  for (const role of requiredRoles) {
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "UserRole"
      ADD VALUE IF NOT EXISTS '${role}';
    `);

    console.log(`✅ UserRole.${role} checked/added.`);
  }

  const result = await prisma.$queryRawUnsafe(`
    SELECT
      e.enumlabel AS role
    FROM pg_enum e
    JOIN pg_type t
      ON e.enumtypid = t.oid
    WHERE t.typname = 'UserRole'
    ORDER BY e.enumsortorder;
  `);

  console.log("");
  console.log("Production UserRole values:");
  console.table(result);

  console.log("========================================");
  console.log("UserRole ENUM FIX COMPLETE");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("❌ USER ROLE ENUM FIX FAILED:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });