import { prisma } from "./utils/prisma.js";
import { downloadPdf } from "./utils/downloadPdf.js";
import { convertToImages } from "./utils/convertToImages.js";
import { uploadToCloudinary } from "./utils/uploadToCloudinary.js";
import { generateManifest } from "./utils/generateManifest.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

console.log("🚀 Starting NovelVerse Book Processing Engine...\n");

async function processBook(book) {
  console.log(`📘 Processing book: ${book.title}`);
  console.log(`➡️ PDF URL: ${book.pdfUrl}`);
  console.log(`➡️ Slug: ${book.slug}\n`);

  try {
    console.log("⬇️  Downloading PDF...");
    const pdfPath = await downloadPdf(book.pdfUrl, book.slug);
    const imagePaths = await convertToImages(pdfPath, book.slug);


    console.log("☁️  Uploading pages to Cloudinary...");
    const cloudUrls = await uploadToCloudinary(book.slug, imagePaths);

    const pageCount = cloudUrls.length;
    console.log(`📄 Total Pages Uploaded: ${pageCount}`);


    console.log("📝  Generating manifest.json...");
    const manifestPath = generateManifest(cloudUrls, book.slug);


    console.log("☁️  Uploading manifest.json...");
    const manifestUpload = await cloudinary.uploader.upload(manifestPath, {
      folder: `NovelVerse/books/${book.slug}`,
      resource_type: "raw"
    });


    console.log("💾 Updating database...\n");
    await prisma.books.update({
      where: { id: book.id },
      data: {
        manifestUrl: manifestUpload.secure_url,
        pageCount: pageCount,
        processed: true,
        updatedAt: new Date()
      }
    });

    console.log(`✔ DONE: ${book.title}\n`);
  } catch (err) {
    console.log(`❌ ERROR processing: ${book.title}`);
    console.error(err);
    console.log("\n");
  }
}

async function main() {
  console.log("🔍 Fetching all unprocessed books from database...\n");

  const books = await prisma.books.findMany({
    where: {
      pdfUrl: { not: null },
      slug: { not: null },
      processed: false
    }
  });

  if (books.length === 0) {
    console.log("🎉 All books are already processed. Nothing to do.\n");
    process.exit(0);
  }

  console.log(`📚 Found ${books.length} books to process.\n`);

  for (const book of books) {
    await processBook(book);
  }

  console.log("🎉 ALL BOOKS PROCESSED SUCCESSFULLY\n");
  process.exit(0);
}

main();