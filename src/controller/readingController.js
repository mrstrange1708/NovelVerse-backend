const readingService = require("../services/readingService");

class ReadingController {
  async updateProgress(req, res) {
    try {
      const { userId, bookId, currentPage, totalPages } = req.body;

      if (!userId || !bookId || !currentPage || !totalPages) {
        return res.status(400).json({
          success: false,
          message: "userId, bookId, currentPage, and totalPages are required",
        });
      }

      const result = await readingService.updateReadingProgress(
        userId,
        bookId,
        currentPage,
        totalPages
      );

      return res.status(200).json({
        success: true,
        message: result.completed
          ? "Congratulations! Book completed!"
          : "Progress updated successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error in updateProgress:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update progress",
        error: error.message,
      });
    }
  }

  async getBookProgress(req, res) {
    try {
      const { bookId } = req.params;
      const userId = req.user.userId;

      if (!bookId) {
        return res.status(400).json({
          success: false,
          message: "Book ID is required",
        });
      }

      const progress = await readingService.getBookProgress(userId, bookId);

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error("Error in getBookProgress:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get book progress",
        error: error.message,
      });
    }
  }

  async getAllProgress(req, res) {
    try {
      const userId = req.user.userId;

      const progress = await readingService.getUserReadingProgress(userId);

      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error("Error in getAllProgress:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get reading progress",
        error: error.message,
      });
    }
  }

  async getContinueReading(req, res) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit) || 5;

      const books = await readingService.getContinueReading(userId, limit);

      return res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      console.error("Error in getContinueReading:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get continue reading list",
        error: error.message,
      });
    }
  }

  async getCompletedBooks(req, res) {
    try {
      const userId = req.user.userId;

      const books = await readingService.getCompletedBooks(userId);

      return res.status(200).json({
        success: true,
        data: books,
      });
    } catch (error) {
      console.error("Error in getCompletedBooks:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get completed books",
        error: error.message,
      });
    }
  }

  async getReadingStreak(req, res) {
    try {
      const userId = req.user.userId;

      const streak = await readingService.getReadingStreak(userId);

      return res.status(200).json({
        success: true,
        data: streak,
      });
    } catch (error) {
      console.error("Error in getReadingStreak:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get reading streak",
        error: error.message,
      });
    }
  }

  async getReadingHeatmap(req, res) {
    try {
      const userId = req.user.userId;
      const year = parseInt(req.params.year) || new Date().getFullYear();

      const heatmap = await readingService.getReadingHeatmap(userId, year);

      return res.status(200).json({
        success: true,
        data: heatmap,
      });
    } catch (error) {
      console.error("Error in getReadingHeatmap:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get reading heatmap",
        error: error.message,
      });
    }
  }

  async trackBookOpen(req, res) {
    try {
      const { userId, bookId } = req.body;

      if (!userId || !bookId) {
        return res.status(400).json({
          success: false,
          message: "userId and bookId are required",
        });
      }

      const result = await readingService.trackBookOpen(userId, bookId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error in trackBookOpen:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to track book open",
        error: error.message,
      });
    }
  }

  async deleteOldStreaks(req, res) {
    try {
      const userId = req.user.userId;
      const retentionDays = parseInt(req.query.retentionDays) || 90;

      const result = await readingService.deleteOldStreaks(
        userId,
        retentionDays
      );

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in deleteOldStreaks:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete old streaks",
        error: error.message,
      });
    }
  }

  async resetBrokenStreak(req, res) {
    try {
      const userId = req.user.userId;

      const result = await readingService.resetBrokenStreak(userId);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in resetBrokenStreak:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to reset streak",
        error: error.message,
      });
    }
  }
}

module.exports = new ReadingController();
