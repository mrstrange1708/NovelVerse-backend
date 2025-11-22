const express = require('express');
const readingController = require('../controller/readingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.post('/reading/progress', authMiddleware.authenticateToken, readingController.updateProgress);
router.get('/reading/progress', authMiddleware.authenticateToken, readingController.getAllProgress);
router.get('/reading/progress/:bookId', authMiddleware.authenticateToken, readingController.getBookProgress);
router.get('/reading/continue', authMiddleware.authenticateToken, readingController.getContinueReading);
router.get('/reading/completed', authMiddleware.authenticateToken, readingController.getCompletedBooks);
router.get('/reading/streak', authMiddleware.authenticateToken, readingController.getReadingStreak);
router.get('/reading/heatmap/:year', authMiddleware.authenticateToken, readingController.getReadingHeatmap);
router.post('/reading/track-open', authMiddleware.authenticateToken, readingController.trackBookOpen);

module.exports = router;
