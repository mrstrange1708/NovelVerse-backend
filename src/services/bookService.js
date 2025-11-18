const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

class BookService {
  _handleDatabaseError(error, operation = "database operation") {
    console.error(`Database error during ${operation}:`, error);

    if (
      error.code === "P1001" ||
      error.code === "P1002" ||
      error.code === "P1003" ||
      error.message?.includes("Can't reach database server") ||
      error.message?.includes("Connection") ||
      error.message?.includes("ECONNREFUSED")
    ) {
      throw new Error("Database Connection lost. Please try again later.");
    }

    if (
      error.message === "Book not found" ||
      error.message === "Valid book ID is required" ||
      error.message?.includes("is required") ||
      error.message?.includes("cannot be empty") ||
      error.message?.includes("must be")
    ) {
      throw error;
    }

    throw new Error("Unable to process request. Please try again later.");
  }

  async getAllBooks(filters = {}) {
    try {
      const {
        category,
        language,
        isFeatured,
        search,
        page = 1,
        limit = 10,
      } = filters;

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
        where.isFeatured = isFeatured === "true";
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { author: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [books, total] = await Promise.all([
        prisma.books.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            title: true,
            author: true,
            category: true,
            coverImage: true,
            language: true,
            pageCount: true,
            slug: true,
            manifestUrl: true,
            processed: true,
            _count: {
              select: { User: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.books.count({ where }),
      ]);

      return {
        books,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      this._handleDatabaseError(error, "fetching books");
    }
  }

  async getBookById(id) {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid book ID is required");
      }

      const book = await prisma.books.findUnique({
        where: { id },
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: { User: true },
          },
        },
      });

      if (!book) {
        throw new Error("Book not found");
      }

      return book;
    } catch (error) {
      this._handleDatabaseError(error, "fetching book by ID");
    }
  }

  async createBook(bookData) {
    try {
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
        language,
      } = bookData;

      if (!title || !title.trim()) {
        throw new Error("Title is required");
      }

      if (!author || !author.trim()) {
        throw new Error("Author is required");
      }

      if (!category || !category.trim()) {
        throw new Error("Category is required");
      }

      if (pageCount && (isNaN(pageCount) || parseInt(pageCount) <= 0)) {
        throw new Error("Page count must be a positive number");
      }

      if (fileSize && (isNaN(fileSize) || BigInt(fileSize) < 0)) {
        throw new Error("File size must be a non-negative number");
      }

      if (publishedAt && isNaN(Date.parse(publishedAt))) {
        throw new Error("Invalid published date");
      }
      const slug = title.trim().toLowerCase().replace(/\s+/g, "-");
      const book = await prisma.books.create({
        data: {
          title: title.trim(),
          slug,
          author: author.trim(),
          description: description?.trim() || null,
          category: category.trim(),
          coverImage: coverImage?.trim() || null,
          pdfUrl: pdfUrl?.trim() || null,
          fileSize: fileSize ? BigInt(fileSize) : null,
          publishedAt: publishedAt ? new Date(publishedAt) : null,
          isFeatured: isFeatured === true || isFeatured === "true",
          pageCount: pageCount ? parseInt(pageCount) : null,
          language: language?.trim() || "English",
        },
      });

      return book;
    } catch (error) {
      this._handleDatabaseError(error, "creating book");
    }
  }

  async updateBook(id, bookData) {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid book ID is required");
      }

      const existingBook = await prisma.books.findUnique({ where: { id } });
      if (!existingBook) {
        throw new Error("Book not found");
      }

      const updateData = {};

      if (bookData.title !== undefined) {
        if (!bookData.title.trim()) {
          throw new Error("Title cannot be empty");
        }
        updateData.title = bookData.title.trim();
      }

      if (bookData.author !== undefined) {
        if (!bookData.author.trim()) {
          throw new Error("Author cannot be empty");
        }
        updateData.author = bookData.author.trim();
      }

      if (bookData.description !== undefined) {
        updateData.description = bookData.description?.trim() || null;
      }

      if (bookData.category !== undefined) {
        if (!bookData.category.trim()) {
          throw new Error("Category cannot be empty");
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
        if (
          bookData.fileSize &&
          (isNaN(bookData.fileSize) || BigInt(bookData.fileSize) < 0)
        ) {
          throw new Error("File size must be a non-negative number");
        }
        updateData.fileSize = bookData.fileSize
          ? BigInt(bookData.fileSize)
          : null;
      }

      if (bookData.publishedAt !== undefined) {
        if (bookData.publishedAt && isNaN(Date.parse(bookData.publishedAt))) {
          throw new Error("Invalid published date");
        }
        updateData.publishedAt = bookData.publishedAt
          ? new Date(bookData.publishedAt)
          : null;
      }

      if (bookData.isFeatured !== undefined) {
        updateData.isFeatured =
          bookData.isFeatured === true || bookData.isFeatured === "true";
      }

      if (bookData.pageCount !== undefined) {
        if (
          bookData.pageCount &&
          (isNaN(bookData.pageCount) || parseInt(bookData.pageCount) <= 0)
        ) {
          throw new Error("Page count must be a positive number");
        }
        updateData.pageCount = bookData.pageCount
          ? parseInt(bookData.pageCount)
          : null;
      }

      if (bookData.language !== undefined) {
        updateData.language = bookData.language?.trim() || "English";
      }

      const updatedBook = await prisma.books.update({
        where: { id },
        data: updateData,
        include: {
          _count: {
            select: { User: true },
          },
        },
      });

      return updatedBook;
    } catch (error) {
      this._handleDatabaseError(error, "updating book");
    }
  }

  async updateProgress(userId, slug, page) {
    try {
      const book = await prisma.books.findUnique({ where: { slug } });
      if (!book) throw new Error("Book not found");

      await prisma.userBooks.upsert({
        where: {
          A_B: { A: userId, B: book.id },
        },
        create: {
          A: userId,
          B: book.id,
        },
        update: {},
      });

      await prisma.user.update({
        where: { id: userId },
        data: { booksRead: page },
      });

      return { success: true };
    } catch (error) {
      this._handleDatabaseError(error, "updating progress");
    }
  }

  async getBookBySlug(slug) {
    try {
      if (!slug) throw new Error("Slug is required");

      const book = await prisma.books.findUnique({
        where: { slug },
        include: {
          User: true,
          _count: { select: { User: true } },
        },
      });

      if (!book) throw new Error("Book not found");

      return book;
    } catch (error) {
      this._handleDatabaseError(error, "fetching book by slug");
    }
  }

  async deleteBook(id) {
    try {
      if (!id || typeof id !== "string") {
        throw new Error("Valid book ID is required");
      }

      const existingBook = await prisma.books.findUnique({ where: { id } });
      if (!existingBook) {
        throw new Error("Book not found");
      }

      await prisma.books.delete({
        where: { id },
      });

      return { message: "Book deleted successfully", id };
    } catch (error) {
      this._handleDatabaseError(error, "deleting book");
    }
  }
}

module.exports = new BookService();
