const bookService = require('../services/bookService');

class BookController {
  // GET /books - Get all books with optional filters
  async getAllBooks(req, res) {
    try {
      const filters = {
        category: req.query.category,
        language: req.query.language,
        isFeatured: req.query.isFeatured,
        search: req.query.search,
        page: req.query.page || 1,
        limit: req.query.limit || 100
      };

      const result = await bookService.getAllBooks(filters);

      return res.status(200).json({
        success: true,
        data: result.books,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error in getAllBooks:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch books',
        error: error.message
      });
    }
  }

  // GET /book/:id - Get a single book by ID
  async getBookById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Book ID is required'
        });
      }

      const book = await bookService.getBookById(id);

      return res.status(200).json({
        success: true,
        data: book
      });
    } catch (error) {
      console.error('Error in getBookById:', error);
      
      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch book',
        error: error.message
      });
    }
  }

  // POST /createBook - Create a new book
  async createBook(req, res) {
    try {
      const bookData = req.body;

      // Basic validation
      if (!bookData || Object.keys(bookData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Book data is required'
        });
      }

      const book = await bookService.createBook(bookData);

      return res.status(201).json({
        success: true,
        message: 'Book created successfully',
        data: book
      });
    } catch (error) {
      console.error('Error in createBook:', error);

      // Handle validation errors
      if (
        error.message.includes('required') ||
        error.message.includes('must be') ||
        error.message.includes('Invalid') ||
        error.message.includes('cannot be empty')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to create book',
        error: error.message
      });
    }
  }

  // PUT /updateBook - Update a book
  async updateBook(req, res) {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Book ID is required in request body'
        });
      }

      const bookData = { ...req.body };
      delete bookData.id; // Remove id from update data

      if (Object.keys(bookData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No data provided for update'
        });
      }

      const updatedBook = await bookService.updateBook(id, bookData);

      return res.status(200).json({
        success: true,
        message: 'Book updated successfully',
        data: updatedBook
      });
    } catch (error) {
      console.error('Error in updateBook:', error);

      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (
        error.message.includes('required') ||
        error.message.includes('must be') ||
        error.message.includes('Invalid') ||
        error.message.includes('cannot be empty')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to update book',
        error: error.message
      });
    }
  }

  // DELETE /deleteBook - Delete a book
  async deleteBook(req, res) {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Book ID is required in request body'
        });
      }

      const result = await bookService.deleteBook(id);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: { id: result.id }
      });
    } catch (error) {
      console.error('Error in deleteBook:', error);

      if (error.message === 'Book not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to delete book',
        error: error.message
      });
    }
  }
}

module.exports = new BookController();