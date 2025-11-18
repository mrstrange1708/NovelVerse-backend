import axios from "axios";
import fs from "fs";
import path from "path";

export async function downloadPdf(url, slug) {
  const pdfPath = `/tmp/${slug}.pdf`;
  const writer = fs.createWriteStream(pdfPath);

  const response = await axios.get(url, { responseType: "stream" });
  response.data.pipe(writer);

  await new Promise(resolve => writer.on("finish", resolve));

  return pdfPath;
}