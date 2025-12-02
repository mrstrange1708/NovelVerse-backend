const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class ReadingService {
  async updateReadingProgress(userId, bookId, currentPage, totalPages) {
    try {
      const progressPercent = (currentPage / totalPages) * 100;
      const isCompleted = progressPercent >= 90;

      const existingProgress = await prisma.readingProgress.findUnique({
        where: {
          userId_bookId: { userId, bookId },
        },
      });

      const wasAlreadyCompleted = existingProgress?.isCompleted || false;

      const progress = await prisma.readingProgress.upsert({
        where: {
          userId_bookId: { userId, bookId },
        },
        create: {
          userId,
          bookId,
          currentPage,
          totalPages,
          progressPercent,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          lastReadAt: new Date(),
        },
        update: {
          currentPage,
          totalPages,
          progressPercent,
          isCompleted,
          completedAt:
            isCompleted && !wasAlreadyCompleted
              ? new Date()
              : existingProgress?.completedAt,
          lastReadAt: new Date(),
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pagesReadToday = currentPage - (existingProgress?.currentPage || 0);

      await prisma.readingStreak.upsert({
        where: {
          userId_date: { userId, date: today },
        },
        create: {
          userId,
          date: today,
          pagesRead: Math.max(1, pagesReadToday),
        },
        update: {
          pagesRead: {
            increment: Math.max(0, pagesReadToday),
          },
        },
      });

      if (isCompleted && !wasAlreadyCompleted) {
        const existingUserBook = await prisma.userBooks.findUnique({
          where: {
            A_B: { A: bookId, B: userId },
          },
        });

        if (!existingUserBook) {
          await prisma.userBooks.create({
            data: {
              A: bookId,
              B: userId,
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: {
              booksRead: {
                increment: 1,
              },
            },
          });
        }
      }

      return {
        success: true,
        progress,
        completed: isCompleted && !wasAlreadyCompleted,
        progressPercent,
      };
    } catch (error) {
      console.error("Error updating reading progress:", error);
      throw new Error("Failed to update reading progress");
    }
  }

  async getBookProgress(userId, bookId) {
    try {
      const progress = await prisma.readingProgress.findUnique({
        where: {
          userId_bookId: { userId, bookId },
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: true,
              coverImage: true,
              category: true,
              pageCount: true,
            },
          },
        },
      });

      return progress;
    } catch (error) {
      console.error("Error getting book progress:", error);
      return null;
    }
  }

  async getUserReadingProgress(userId) {
    try {
      const progress = await prisma.readingProgress.findMany({
        where: { userId },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: true,
              coverImage: true,
              category: true,
              pageCount: true,
            },
          },
        },
        orderBy: {
          lastReadAt: "desc",
        },
      });

      return progress;
    } catch (error) {
      console.error("Error getting user reading progress:", error);
      return [];
    }
  }

  async getContinueReading(userId, limit = 5) {
    try {
      const continueReading = await prisma.readingProgress.findMany({
        where: {
          userId,
          isCompleted: false,
          progressPercent: {
            lt: 90,
          },
        },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: true,
              coverImage: true,
              category: true,
              pageCount: true,
            },
          },
        },
        orderBy: {
          lastReadAt: "desc",
        },
        take: limit,
      });

      return continueReading.map((progress) => ({
        ...progress.book,
        progressId: progress.id,
        currentPage: progress.currentPage,
        totalPages: progress.totalPages,
        progressPercent: progress.progressPercent,
        lastReadAt: progress.lastReadAt,
        id: progress.book.id,
      }));
    } catch (error) {
      console.error("Error getting continue reading:", error);
      return [];
    }
  }

  async getCompletedBooks(userId) {
    try {
      const userBooks = await prisma.userBooks.findMany({
        where: { B: userId },
        include: {
          Books: {
            select: {
              id: true,
              title: true,
              slug: true,
              author: true,
              coverImage: true,
              category: true,
              pageCount: true,
            },
          },
        },
      });

      const booksWithProgress = await Promise.all(
        userBooks.map(async (ub) => {
          const progress = await prisma.readingProgress.findUnique({
            where: {
              userId_bookId: { userId, bookId: ub.A },
            },
            select: {
              completedAt: true,
              progressPercent: true,
            },
          });

          return {
            ...ub.Books,
            completedAt: progress?.completedAt,
            progressPercent: progress?.progressPercent || 100,
          };
        })
      );

      return booksWithProgress.sort((a, b) => {
        if (!a.completedAt) return 1;
        if (!b.completedAt) return -1;
        return new Date(b.completedAt) - new Date(a.completedAt);
      });
    } catch (error) {
      console.error("Error getting completed books:", error);
      return [];
    }
  }

  async getReadingStreak(userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Delete old streaks (older than 90 days)
      await this.deleteOldStreaks(userId);

      let currentStreak = 0;
      let checkDate = new Date(today);

      while (true) {
        const streak = await prisma.readingStreak.findUnique({
          where: {
            userId_date: { userId, date: new Date(checkDate) },
          },
        });

        if (streak && streak.pagesRead > 0) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      const allStreaks = await prisma.readingStreak.findMany({
        where: { userId },
      });

      const totalPagesRead = allStreaks.reduce(
        (sum, streak) => sum + streak.pagesRead,
        0
      );

      return {
        currentStreak,
        totalPagesRead,
        lastReadDate: currentStreak > 0 ? today : null,
      };
    } catch (error) {
      console.error("Error calculating reading streak:", error);
      return {
        currentStreak: 0,
        totalPagesRead: 0,
        lastReadDate: null,
      };
    }
  }

  /**
   * Delete old reading streaks (older than retention period)
   * Helps keep the database clean and efficient
   */
  async deleteOldStreaks(userId, retentionDays = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      cutoffDate.setHours(0, 0, 0, 0);

      const deletedCount = await prisma.readingStreak.deleteMany({
        where: {
          userId,
          date: {
            lt: cutoffDate,
          },
        },
      });

      return {
        success: true,
        deletedCount: deletedCount.count,
        message: `Deleted ${deletedCount.count} old streak records`,
      };
    } catch (error) {
      console.error("Error deleting old streaks:", error);
      return {
        success: false,
        deletedCount: 0,
        message: "Failed to delete old streaks",
      };
    }
  }

  /**
   * Reset streak if it's broken (no activity yesterday)
   * This can be called manually or scheduled
   */
  async resetBrokenStreak(userId) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayStreak = await prisma.readingStreak.findUnique({
        where: {
          userId_date: { userId, date: yesterday },
        },
      });

      if (!yesterdayStreak || yesterdayStreak.pagesRead === 0) {
        // Streak is broken, could optionally delete all old streaks
        // or just return the status
        return {
          success: true,
          streakBroken: true,
          message: "Streak was broken",
        };
      }

      return {
        success: true,
        streakBroken: false,
        message: "Streak is still active",
      };
    } catch (error) {
      console.error("Error checking streak:", error);
      return {
        success: false,
        message: "Failed to check streak status",
      };
    }
  }

  async getReadingHeatmap(userId, year = new Date().getFullYear()) {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      const streaks = await prisma.readingStreak.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: "asc",
        },
      });

      const heatmapData = streaks.map((streak) => ({
        date: streak.date,
        pagesRead: streak.pagesRead,
      }));

      return heatmapData;
    } catch (error) {
      console.error("Error getting reading heatmap:", error);
      return [];
    }
  }

  async trackBookOpen(userId, bookId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await prisma.readingStreak.upsert({
        where: {
          userId_date: { userId, date: today },
        },
        create: {
          userId,
          date: today,
          pagesRead: 1,
        },
        update: {},
      });

      return { success: true };
    } catch (error) {
      console.error("Error tracking book open:", error);
      return { success: false };
    }
  }
}

module.exports = new ReadingService();
