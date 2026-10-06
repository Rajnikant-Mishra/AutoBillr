const prisma = require("../config/prisma");

async function main() {
  console.log("========================================");
  console.log("FIX PRODUCTION ROLE.isSystem");
  console.log("========================================");

  console.log("Checking Role.isSystem...");

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Role"
    ADD COLUMN IF NOT EXISTS "isSystem"
    BOOLEAN NOT NULL DEFAULT FALSE;
  `);

  console.log("✅ Role.isSystem column checked/added.");

  const result = await prisma.$queryRawUnsafe(`
    SELECT
      column_name,
      data_type,
      column_default
    FROM information_schema.columns
    WHERE table_name = 'Role'
      AND column_name = 'isSystem';
  `);

  console.log("Verification:", result);

  console.log("========================================");
  console.log("ROLE.isSystem FIX COMPLETE");
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("❌ ROLE.isSystem FIX FAILED:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });