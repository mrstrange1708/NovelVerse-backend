const express = require('express');
const bookController = require('../controller/bookController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/books', authMiddleware.authenticateToken, bookController.getAllBooks);
router.get('/book/:id', authMiddleware.authenticateToken, bookController.getBookById);
router.post('/createBook', authMiddleware.authenticateToken, bookController.createBook);
router.put('/updateBook', authMiddleware.authenticateToken, bookController.updateBook);
router.delete('/deleteBook', authMiddleware.authenticateToken, bookController.deleteBook);

module.exports = router;