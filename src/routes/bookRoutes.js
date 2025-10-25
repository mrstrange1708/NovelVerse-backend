const express = require('express');
const bookController = require('../controller/bookController');

const router = express.Router();

router.get('/books', bookController.getAllBooks);
router.get('/book/:id', bookController.getBookById);
router.post('/createBook', bookController.createBook);
router.put('/updateBook', bookController.updateBook);
router.delete('/deleteBook', bookController.deleteBook);

module.exports = router;