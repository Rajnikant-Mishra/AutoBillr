const prisma = require("../config/prisma");

async function main() {
  console.log("========================================");
  console.log("FIX PRODUCTION TEAM EXTRA PERMISSIONS");
  console.log("========================================");

  console.log("Checking TeamMember.extraPermissions...");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "TeamMember"
    ADD COLUMN IF NOT EXISTS "extraPermissions"
    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
  `);

  console.log("✅ TeamMember.extraPermissions column checked/added.");

  const result = await prisma.$queryRawUnsafe(`
    SELECT
      column_name,
      data_type,
      column_default
    FROM information_schema.columns
    WHERE table_name = 'TeamMember'
      AND column_name = 'extraPermissions';
  `);

  console.log("Verification:", result);

  console.log("========================================");
  console.log("TEAM MEMBER EXTRA PERMISSIONS FIX COMPLETE");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("❌ TEAM MEMBER EXTRA PERMISSIONS FIX FAILED:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });