const express = require("express");
const readingController = require("../controller/readingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.put(
  "/progress",
  authMiddleware.authenticateToken,
  readingController.updateProgress
);
router.get(
  "/progress",
  authMiddleware.authenticateToken,
  readingController.getAllProgress
);
router.get(
  "/progress/:bookId",
  authMiddleware.authenticateToken,
  readingController.getBookProgress
);
router.get(
  "/continue",
  authMiddleware.authenticateToken,
  readingController.getContinueReading
);
router.get(
  "/completed",
  authMiddleware.authenticateToken,
  readingController.getCompletedBooks
);
router.get(
  "/streak",
  authMiddleware.authenticateToken,
  readingController.getReadingStreak
);
router.get(
  "/heatmap/:year",
  authMiddleware.authenticateToken,
  readingController.getReadingHeatmap
);
router.post(
  "/track-open",
  authMiddleware.authenticateToken,
  readingController.trackBookOpen
);

// Streak management
router.delete(
  "/streak/old",
  authMiddleware.authenticateToken,
  readingController.deleteOldStreaks
);
router.post(
  "/streak/reset",
  authMiddleware.authenticateToken,
  readingController.resetBrokenStreak
);

module.exports = router;
