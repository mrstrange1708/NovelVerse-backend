import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export async function convertToImages(pdfPath, slug) {
  const outputDir = `/tmp/${slug}`;
  fs.mkdirSync(outputDir, { recursive: true });

  execSync(`pdftoppm -png "${pdfPath}" "${outputDir}/page"`);

  return fs.readdirSync(outputDir)
    .filter(f => f.endsWith(".png"))
    .map(f => path.join(outputDir, f));
}