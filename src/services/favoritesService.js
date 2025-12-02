const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class FavoritesService {
  /**
   * Add a book to user's favorites
   */
  async addToFavorites(userId, bookId) {
    try {
      // Check if book exists
      const book = await prisma.books.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new Error("Book not found");
      }

      // Check if already in favorites
      const existingFavorite = await prisma.favorites.findUnique({
        where: {
          userId_bookId: { userId, bookId },
        },
      });

      if (existingFavorite) {
        throw new Error("Book is already in favorites");
      }

      // Add to favorites
      const favorite = await prisma.favorites.create({
        data: {
          userId,
          bookId,
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
              description: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Book added to favorites",
        favorite,
      };
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  }

  /**
   * Remove a book from user's favorites
   */
  async removeFromFavorites(userId, bookId) {
    try {
      const favorite = await prisma.favorites.findUnique({
        where: {
          userId_bookId: { userId, bookId },
        },
      });

      if (!favorite) {
        throw new Error("Book not found in favorites");
      }

      await prisma.favorites.delete({
        where: {
          userId_bookId: { userId, bookId },
        },
      });

      return {
        success: true,
        message: "Book removed from favorites",
      };
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  }

  /**
   * Get all favorites for a user
   */
  async getUserFavorites(userId, options = {}) {
    try {
      const { page = 1, limit = 20, category } = options;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const where = { userId };

      // Add category filter if provided
      if (category) {
        where.book = {
          category,
        };
      }

      const [favorites, total] = await Promise.all([
        prisma.favorites.findMany({
          where,
          skip,
          take,
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
                description: true,
                language: true,
                isFeatured: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.favorites.count({ where }),
      ]);

      // Format the response
      const formattedFavorites = favorites.map((fav) => ({
        favoriteId: fav.id,
        addedAt: fav.createdAt,
        ...fav.book,
      }));

      return {
        success: true,
        favorites: formattedFavorites,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      console.error("Error getting favorites:", error);
      throw new Error("Failed to get favorites");
    }
  }

  /**
   * Check if a book is in user's favorites
   */
  async isFavorite(userId, bookId) {
    try {
      const favorite = await prisma.favorites.findUnique({
        where: {
          userId_bookId: { userId, bookId },
        },
      });

      return {
        success: true,
        isFavorite: !!favorite,
      };
    } catch (error) {
      console.error("Error checking favorite status:", error);
      return {
        success: true,
        isFavorite: false,
      };
    }
  }

  /**
   * Get favorites count for a user
   */
  async getFavoritesCount(userId) {
    try {
      const count = await prisma.favorites.count({
        where: { userId },
      });

      return {
        success: true,
        count,
      };
    } catch (error) {
      console.error("Error getting favorites count:", error);
      throw new Error("Failed to get favorites count");
    }
  }

  /**
   * Toggle favorite status (add if not exists, remove if exists)
   */
  async toggleFavorite(userId, bookId) {
    try {
      const existingFavorite = await prisma.favorites.findUnique({
        where: {
          userId_bookId: { userId, bookId },
        },
      });

      if (existingFavorite) {
        // Remove from favorites
        await prisma.favorites.delete({
          where: {
            userId_bookId: { userId, bookId },
          },
        });

        return {
          success: true,
          message: "Book removed from favorites",
          isFavorite: false,
        };
      } else {
        // Check if book exists
        const book = await prisma.books.findUnique({
          where: { id: bookId },
        });

        if (!book) {
          throw new Error("Book not found");
        }

        // Add to favorites
        await prisma.favorites.create({
          data: {
            userId,
            bookId,
          },
        });

        return {
          success: true,
          message: "Book added to favorites",
          isFavorite: true,
        };
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  }
}

module.exports = new FavoritesService();
