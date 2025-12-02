const { PrismaClient } = require("./src/generated/prisma");
const prisma = new PrismaClient();

async function cleanupDuplicateStreaks() {
  console.log("🔍 Finding duplicate reading streaks...");

  try {
    // Find all reading streaks
    const allStreaks = await prisma.$queryRaw`
      SELECT userId, date, COUNT(*) as count
      FROM ReadingStreak
      GROUP BY userId, date
      HAVING count > 1
    `;

    console.log(`Found ${allStreaks.length} duplicate streak entries`);

    if (allStreaks.length === 0) {
      console.log("✅ No duplicates found!");
      return;
    }

    // For each duplicate, keep only the most recent one
    for (const duplicate of allStreaks) {
      console.log(
        `Cleaning duplicates for userId: ${duplicate.userId}, date: ${duplicate.date}`
      );

      // Get all duplicates for this userId and date
      const streaks = await prisma.readingStreak.findMany({
        where: {
          userId: duplicate.userId,
          date: duplicate.date,
        },
        orderBy: {
          createdAt: "desc", // Most recent first
        },
      });

      // Keep the first one (most recent), delete the rest
      const toKeep = streaks[0];
      const toDelete = streaks.slice(1);

      console.log(
        `  Keeping streak ${toKeep.id}, deleting ${toDelete.length} duplicates`
      );

      for (const streak of toDelete) {
        await prisma.readingStreak.delete({
          where: { id: streak.id },
        });
      }
    }

    console.log("✅ Cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateStreaks();
