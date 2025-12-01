import { downloadPdf } from "./utils/downloadPdf.js";
import { convertToImages } from "./utils/convertToImages.js";
import { uploadToCloudinary } from "./utils/uploadToCloudinary.js";
import { generateManifest } from "./utils/generateManifest.js";

const pdfUrl = process.argv[2];   
const bookId = process.argv[3];  

if (!pdfUrl || !bookId) {
  console.error("Usage: node convert.js <pdfUrl> <bookId>");
  process.exit(1);
}

(async () => {
  const localPdfPath = await downloadPdf(pdfUrl, bookId);

  const imagePaths = await convertToImages(localPdfPath, bookId);

  const cloudinaryUrls = await uploadToCloudinary(imagePaths, bookId);

  const manifest = await generateManifest(cloudinaryUrls, bookId);

  console.log("---- DONE ----");
  console.log("Manifest URL:", manifest.manifestUrl);
  console.log("Pages:", manifest.pageCount);
})();

export async function runSingleConversion(pdfUrl, bookId) {
  const localPdfPath = await downloadPdf(pdfUrl, bookId);
  const images = await convertToImages(localPdfPath, bookId);
  const cloudinaryUrls = await uploadToCloudinary(images, bookId);
  const manifest = await generateManifest(cloudinaryUrls, bookId);
  return manifest;
}