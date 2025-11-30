const express = require('express');
const readingController = require('../controller/readingController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.post('/progress', authMiddleware.authenticateToken, readingController.updateProgress);
router.get('/progress', authMiddleware.authenticateToken, readingController.getAllProgress);
router.get('/progress/:bookId', authMiddleware.authenticateToken, readingController.getBookProgress);
router.get('/continue', authMiddleware.authenticateToken, readingController.getContinueReading);
router.get('/completed', authMiddleware.authenticateToken, readingController.getCompletedBooks);
router.get('/streak', authMiddleware.authenticateToken, readingController.getReadingStreak);
router.get('/heatmap/:year', authMiddleware.authenticateToken, readingController.getReadingHeatmap);
router.post('/track-open', authMiddleware.authenticateToken, readingController.trackBookOpen);

module.exports = router;
