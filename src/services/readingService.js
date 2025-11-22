const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class ReadingService {
    /**
     * Update reading progress for a user and book
     * Handles 90% completion threshold, UserBooks addition, and streak tracking
     */
    async updateReadingProgress(userId, bookId, currentPage, totalPages) {
        try {
            // Calculate progress percentage
            const progressPercent = (currentPage / totalPages) * 100;
            const isCompleted = progressPercent >= 90;

            // Get existing progress
            const existingProgress = await prisma.readingProgress.findUnique({
                where: {
                    userId_bookId: { userId, bookId },
                },
            });

            const wasAlreadyCompleted = existingProgress?.isCompleted || false;

            // Update or create reading progress
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
                    completedAt: isCompleted && !wasAlreadyCompleted ? new Date() : existingProgress?.completedAt,
                    lastReadAt: new Date(),
                },
            });

            // Update reading streak for today
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

            // Handle book completion (90% threshold)
            if (isCompleted && !wasAlreadyCompleted) {
                // Add to UserBooks table (many-to-many relationship)
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

                    // Increment user's booksRead counter
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

    /**
     * Get user's reading progress for a specific book
     */
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

    /**
     * Get all reading progress for a user
     */
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

    /**
     * Get continue reading list (books in progress, not completed, < 90%)
     */
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

            // Flatten the response to match frontend expectations
            return continueReading.map(progress => ({
                ...progress.book,
                progressId: progress.id,
                currentPage: progress.currentPage,
                totalPages: progress.totalPages,
                progressPercent: progress.progressPercent,
                lastReadAt: progress.lastReadAt,
                // Ensure ID is the book ID
                id: progress.book.id
            }));
        } catch (error) {
            console.error("Error getting continue reading:", error);
            return [];
        }
    }

    /**
     * Get completed books (from UserBooks table)
     */
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

            // Get completion dates from ReadingProgress
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

    /**
     * Calculate current reading streak
     */
    async getReadingStreak(userId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let currentStreak = 0;
            let checkDate = new Date(today);

            // Check backwards from today to find consecutive days
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

            // Get total pages read
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
     * Get reading heatmap data for a specific year
     */
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

            // Format for heatmap
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

    /**
     * Track when a user opens a book (for streak counting)
     */
    async trackBookOpen(userId, bookId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Create or update streak for today (mark that user read today)
            await prisma.readingStreak.upsert({
                where: {
                    userId_date: { userId, date: today },
                },
                create: {
                    userId,
                    date: today,
                    pagesRead: 1, // At least 1 page to count the day
                },
                update: {
                    // If already exists, don't change pages (will be updated by updateReadingProgress)
                },
            });

            return { success: true };
        } catch (error) {
            console.error("Error tracking book open:", error);
            return { success: false };
        }
    }
}

module.exports = new ReadingService();
