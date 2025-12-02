const express = require("express");
const favoritesController = require("../controller/favoritesController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.authenticateToken);

// Get all favorites for the logged-in user
router.get("/", favoritesController.getUserFavorites);

// Get favorites count
router.get("/count", favoritesController.getFavoritesCount);

// Check if a specific book is in favorites
router.get("/check/:bookId", favoritesController.checkFavorite);

// Add a book to favorites
router.post("/", favoritesController.addToFavorites);

// Toggle favorite status (add/remove)
router.post("/toggle", favoritesController.toggleFavorite);

// Remove a book from favorites
router.delete("/:bookId", favoritesController.removeFromFavorites);

module.exports = router;
