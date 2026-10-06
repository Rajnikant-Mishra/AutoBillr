const prisma = require("../config/prisma");

async function main() {
  console.log("========================================");
  console.log("FIX PRODUCTION TEAM MEMBER temporaryPassword");
  console.log("========================================");

  console.log("Checking TeamMember.temporaryPassword...");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "TeamMember"
    ADD COLUMN IF NOT EXISTS "temporaryPassword" TEXT;
  `);

  console.log("✅ TeamMember.temporaryPassword column checked/added.");

  const result = await prisma.$queryRawUnsafe(`
    SELECT
      column_name,
      data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'TeamMember'
      AND column_name = 'temporaryPassword';
  `);

  console.log("Verification:", result);

  console.log("========================================");
  console.log("TEMPORARY PASSWORD FIX COMPLETE");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("❌ TEMPORARY PASSWORD FIX FAILED:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });