import fs from "fs";

export function generateManifest(urls, slug) {
  const manifest = {
    bookId: slug,
    pages: urls.map((url, index) => ({
      page: index + 1,
      image: url
    }))
  };

  const manifestPath = `/tmp/${slug}_manifest.json`;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  return manifestPath;
}