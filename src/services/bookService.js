const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class BookService {
  // Get all books with optional filters
  async getAllBooks(filters = {}) {
    const { category, language, isFeatured, search, page = 1, limit = 10 } = filters;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (category) {
      where.category = category;
    }

    if (language) {
      where.language = language;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [books, total] = await Promise.all([
      prisma.books.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { readers: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.books.count({ where })
    ]);

    return {
      books,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  // Get a single book by ID
  async getBookById(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Valid book ID is required');
    }

    const book = await prisma.books.findUnique({
      where: { id },
      include: {
        readers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: { readers: true }
        }
      }
    });

    if (!book) {
      throw new Error('Book not found');
    }

    return book;
  }

  // Create a new book
  async createBook(bookData) {
    const {
      title,
      author,
      description,
      category,
      coverImage,
      pdfUrl,
      fileSize,
      publishedAt,
      isFeatured,
      pageCount,
      language
    } = bookData;

    // Validate required fields
    if (!title || !title.trim()) {
      throw new Error('Title is required');
    }

    if (!author || !author.trim()) {
      throw new Error('Author is required');
    }

    if (!category || !category.trim()) {
      throw new Error('Category is required');
    }

    // Validate optional fields
    if (pageCount && (isNaN(pageCount) || parseInt(pageCount) <= 0)) {
      throw new Error('Page count must be a positive number');
    }

    if (fileSize && (isNaN(fileSize) || BigInt(fileSize) < 0)) {
      throw new Error('File size must be a non-negative number');
    }

    if (publishedAt && isNaN(Date.parse(publishedAt))) {
      throw new Error('Invalid published date');
    }

    const book = await prisma.books.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        description: description?.trim() || null,
        category: category.trim(),
        coverImage: coverImage?.trim() || null,
        pdfUrl: pdfUrl?.trim() || null,
        fileSize: fileSize ? BigInt(fileSize) : null,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        isFeatured: isFeatured === true || isFeatured === 'true',
        pageCount: pageCount ? parseInt(pageCount) : null,
        language: language?.trim() || 'English'
      }
    });

    return book;
  }

  // Update a book
  async updateBook(id, bookData) {
    if (!id || typeof id !== 'string') {
      throw new Error('Valid book ID is required');
    }

    // Check if book exists
    const existingBook = await prisma.books.findUnique({ where: { id } });
    if (!existingBook) {
      throw new Error('Book not found');
    }

    const updateData = {};

    // Only update provided fields
    if (bookData.title !== undefined) {
      if (!bookData.title.trim()) {
        throw new Error('Title cannot be empty');
      }
      updateData.title = bookData.title.trim();
    }

    if (bookData.author !== undefined) {
      if (!bookData.author.trim()) {
        throw new Error('Author cannot be empty');
      }
      updateData.author = bookData.author.trim();
    }

    if (bookData.description !== undefined) {
      updateData.description = bookData.description?.trim() || null;
    }

    if (bookData.category !== undefined) {
      if (!bookData.category.trim()) {
        throw new Error('Category cannot be empty');
      }
      updateData.category = bookData.category.trim();
    }

    if (bookData.coverImage !== undefined) {
      updateData.coverImage = bookData.coverImage?.trim() || null;
    }

    if (bookData.pdfUrl !== undefined) {
      updateData.pdfUrl = bookData.pdfUrl?.trim() || null;
    }

    if (bookData.fileSize !== undefined) {
      if (bookData.fileSize && (isNaN(bookData.fileSize) || BigInt(bookData.fileSize) < 0)) {
        throw new Error('File size must be a non-negative number');
      }
      updateData.fileSize = bookData.fileSize ? BigInt(bookData.fileSize) : null;
    }

    if (bookData.publishedAt !== undefined) {
      if (bookData.publishedAt && isNaN(Date.parse(bookData.publishedAt))) {
        throw new Error('Invalid published date');
      }
      updateData.publishedAt = bookData.publishedAt ? new Date(bookData.publishedAt) : null;
    }

    if (bookData.isFeatured !== undefined) {
      updateData.isFeatured = bookData.isFeatured === true || bookData.isFeatured === 'true';
    }

    if (bookData.pageCount !== undefined) {
      if (bookData.pageCount && (isNaN(bookData.pageCount) || parseInt(bookData.pageCount) <= 0)) {
        throw new Error('Page count must be a positive number');
      }
      updateData.pageCount = bookData.pageCount ? parseInt(bookData.pageCount) : null;
    }

    if (bookData.language !== undefined) {
      updateData.language = bookData.language?.trim() || 'English';
    }

    const updatedBook = await prisma.books.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { readers: true }
        }
      }
    });

    return updatedBook;
  }

  // Delete a book
  async deleteBook(id) {
    if (!id || typeof id !== 'string') {
      throw new Error('Valid book ID is required');
    }

    // Check if book exists
    const existingBook = await prisma.books.findUnique({ where: { id } });
    if (!existingBook) {
      throw new Error('Book not found');
    }

    await prisma.books.delete({
      where: { id }
    });

    return { message: 'Book deleted successfully', id };
  }
}

module.exports = new BookService(); 