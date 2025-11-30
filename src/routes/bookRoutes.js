const express = require('express');
const bookController = require('../controller/bookController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/books', authMiddleware.authenticateToken, bookController.getAllBooks);
router.get('/book/:id', authMiddleware.authenticateToken, bookController.getBookById);
router.post('/createBook', authMiddleware.authenticateToken, bookController.createBook);
router.post('/book/progress', authMiddleware.authenticateToken, bookController.updateProgress);
router.put('/updateBook', authMiddleware.authenticateToken, bookController.updateBook);
router.delete('/deleteBook', authMiddleware.authenticateToken, bookController.deleteBook);
router.get('/book/slug/:slug', authMiddleware.authenticateToken, bookController.getBookBySlug);
router.get('/book/:slug/manifest', authMiddleware.authenticateToken, bookController.getManifest);

module.exports = router;