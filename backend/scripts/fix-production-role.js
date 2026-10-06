const prisma = require("../config/prisma");

async function main() {
  console.log("========================================");
  console.log("FIX PRODUCTION ROLE TABLE");
  console.log("========================================");

  console.log("Checking Role.permissions...");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Role"
    ADD COLUMN IF NOT EXISTS "permissions"
    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
  `);

  console.log("✅ Role.permissions column checked/added.");

  const result = await prisma.$queryRawUnsafe(`
    SELECT
      column_name,
      data_type
    FROM information_schema.columns
    WHERE table_name = 'Role'
      AND column_name = 'permissions';
  `);

  console.log("Verification:", result);

  console.log("========================================");
  console.log("ROLE DATABASE FIX COMPLETE");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("❌ PRODUCTION ROLE FIX FAILED:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });