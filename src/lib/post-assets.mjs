// Files that sit next to posts in content/blog/ (images, audio, ...) and how they
// are published at /blog/<path relative to content/blog>. Shared by the build
// hook and the dev-server middleware in astro.config.mjs, and by the
// rehype-images plugin that links to them, so all three agree on the rules.
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

export const CONTENT_TYPES = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
}

/** Only these extensions are published; markdown sources and dotfiles never are. */
export const isPublishable = (/** @type {string} */ relPath) => {
  const parts = relPath.split(/[\\/]/)
  if (parts.some(p => p === "" || p === "." || p === ".." || p.startsWith(".")))
    return false
  return Object.hasOwn(CONTENT_TYPES, path.extname(relPath).toLowerCase())
}

/**
 * Resolve a URL-ish path relative to postsDir to a real file inside postsDir,
 * or null. Rejects traversal, symlinks pointing outside, directories and
 * anything that isn't publishable.
 * @param {string} postsDir absolute, real path of content/blog
 * @param {string} relPath e.g. "aws-ai-league/finalists.png"
 */
export function resolvePostAsset(postsDir, relPath) {
  if (!isPublishable(relPath)) return null
  const candidate = path.resolve(postsDir, relPath)
  let real
  try {
    real = fs.realpathSync(candidate)
  } catch {
    return null
  }
  if (!real.startsWith(postsDir + path.sep)) return null
  if (!fs.statSync(real).isFile()) return null
  return real
}

/** Every publishable file under postsDir, as paths relative to it (posix separators). */
export function listPostAssets(postsDir, dir = postsDir) {
  /** @type {string[]} */
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue
    const abs = path.join(dir, entry.name)
    const rel = path.relative(postsDir, abs).split(path.sep).join("/")
    if (entry.isDirectory()) out.push(...listPostAssets(postsDir, abs))
    else if (resolvePostAsset(postsDir, rel)) out.push(rel)
  }
  return out
}

/** Longest side of a published full-size photo; camera originals can be 5000px+. */
export const MAX_PHOTO_SIDE = 2000

/**
 * Write the published copy of a post asset. As gatsby-remark-images did,
 * full-size JPEG/PNG copies are re-encoded (JPEG q50 progressive, PNG palette)
 * and rotated upright according to their EXIF orientation; other files are copied.
 * JPEGs (photos) are also capped at MAX_PHOTO_SIDE. PNGs are left at full size:
 * they are screenshots and diagrams whose text must stay readable when zoomed.
 * @param {string} src absolute source path
 * @param {string} dest absolute destination path
 */
export async function publishPostAsset(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  const ext = path.extname(src).toLowerCase()
  try {
    if (ext === ".jpg" || ext === ".jpeg") {
      await sharp(src)
        .rotate()
        .resize({
          width: MAX_PHOTO_SIDE,
          height: MAX_PHOTO_SIDE,
          fit: "inside",
          withoutEnlargement: true,
        })
        .jpeg({ quality: 50, progressive: true })
        .toFile(dest)
    } else if (ext === ".png") {
      await sharp(src)
        .rotate()
        .png({ palette: true, quality: 50, compressionLevel: 9 })
        .toFile(dest)
    } else {
      fs.copyFileSync(src, dest)
    }
  } catch (error) {
    throw new Error(`Could not publish post asset ${src}: ${error.message}`, {
      cause: error,
    })
  }
}

/** Image size as displayed, i.e. after applying any EXIF rotation. */
export async function displayedImageSize(file) {
  try {
    const meta = await sharp(file).metadata()
    const { width, height } = meta.autoOrient ?? meta
    return { width, height, format: meta.format }
  } catch (error) {
    throw new Error(`Could not read image ${file}: ${error.message}`, {
      cause: error,
    })
  }
}
