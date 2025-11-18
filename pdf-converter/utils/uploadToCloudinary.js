import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

export async function uploadToCloudinary(slug, imagePaths) {
  const baseFolder = `NovelVerse/books/${slug}/pages`;

  const urls = [];

  for (const img of imagePaths) {
    const result = await cloudinary.uploader.upload(img, {
      folder: baseFolder
    });
    urls.push(result.secure_url);
  }

  return urls;
}