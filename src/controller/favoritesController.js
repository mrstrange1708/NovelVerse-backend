const favoritesService = require("../services/favoritesService");

class FavoritesController {
  async addToFavorites(req, res) {
    try {
      const userId = req.user.userId;
      const { bookId } = req.body;

      if (!bookId) {
        return res.status(400).json({
          success: false,
          message: "Book ID is required",
        });
      }

      const result = await favoritesService.addToFavorites(userId, bookId);

      return res.status(201).json(result);
    } catch (error) {
      console.error("Error in addToFavorites:", error);

      if (error.message === "Book not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message === "Book is already in favorites") {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to add book to favorites",
        error: error.message,
      });
    }
  }


  async removeFromFavorites(req, res) {
    try {
      const userId = req.user.userId;
      const { bookId } = req.params;

      if (!bookId) {
        return res.status(400).json({
          success: false,
          message: "Book ID is required",
        });
      }

      const result = await favoritesService.removeFromFavorites(userId, bookId);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in removeFromFavorites:", error);

      if (error.message === "Book not found in favorites") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to remove book from favorites",
        error: error.message,
      });
    }
  }


  async getUserFavorites(req, res) {
    try {
      const userId = req.user.userId;
      const { page, limit, category } = req.query;

      const result = await favoritesService.getUserFavorites(userId, {
        page,
        limit,
        category,
      });

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getUserFavorites:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get favorites",
        error: error.message,
      });
    }
  }

  async checkFavorite(req, res) {
    try {
      const userId = req.user.userId;
      const { bookId } = req.params;

      if (!bookId) {
        return res.status(400).json({
          success: false,
          message: "Book ID is required",
        });
      }

      const result = await favoritesService.isFavorite(userId, bookId);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in checkFavorite:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to check favorite status",
        error: error.message,
      });
    }
  }

  async getFavoritesCount(req, res) {
    try {
      const userId = req.user.userId;

      const result = await favoritesService.getFavoritesCount(userId);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in getFavoritesCount:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get favorites count",
        error: error.message,
      });
    }
  }

  async toggleFavorite(req, res) {
    try {
      const userId = req.user.userId;
      const { bookId } = req.body;

      if (!bookId) {
        return res.status(400).json({
          success: false,
          message: "Book ID is required",
        });
      }

      const result = await favoritesService.toggleFavorite(userId, bookId);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in toggleFavorite:", error);

      if (error.message === "Book not found") {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to toggle favorite",
        error: error.message,
      });
    }
  }
}

module.exports = new FavoritesController();
