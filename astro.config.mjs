// @ts-check
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { unified } from "@astrojs/markdown-remark"
import { defineConfig } from "astro/config"
import sharp from "sharp"

import remarkExcerpt from "./src/plugins/remark-excerpt.mjs"
import remarkPrism from "./src/plugins/remark-prism.mjs"
import remarkResponsiveIframe from "./src/plugins/remark-responsive-iframe.mjs"
import remarkSmartypants from "./src/plugins/remark-smartypants.mjs"
import rehypeImages from "./src/plugins/rehype-images.mjs"

const BASE = "/blog/"
const POSTS_DIR = fileURLToPath(new URL("./content/blog/", import.meta.url))

/**
 * Publishes the files that sit next to each post at /blog/<slug>/<file>, so the
 * "open full image" links on markdown images work. As gatsby-remark-images
 * did, full-size JPEG/PNG copies are re-encoded (JPEG q50 progressive, PNG
 * palette) instead of shipping the multi-MB originals; other files are copied.
 * @returns {import("astro").AstroIntegration}
 */
function copyPostAssets() {
  const isAsset = (/** @type {string} */ f) => !f.endsWith(".md")
  /** @param {string} src @param {URL} dest */
  const publish = async (src, dest) => {
    const ext = path.extname(src).toLowerCase()
    if (ext === ".jpg" || ext === ".jpeg") {
      await sharp(src)
        .jpeg({ quality: 50, progressive: true })
        .toFile(fileURLToPath(dest))
    } else if (ext === ".png") {
      await sharp(src)
        .png({ palette: true, quality: 50, compressionLevel: 9 })
        .toFile(fileURLToPath(dest))
    } else {
      fs.copyFileSync(src, dest)
    }
  }
  return {
    name: "copy-post-assets",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use((req, res, next) => {
          let url = decodeURIComponent((req.url ?? "").split("?")[0])
          if (url.startsWith(BASE)) url = url.slice(BASE.length - 1) // the base may or may not be stripped already
          const match = url.match(/^\/([^/]+)\/([^/]+)$/)
          if (!match || !isAsset(match[2])) return next()
          const file = path.join(POSTS_DIR, match[1], match[2])
          if (!file.startsWith(POSTS_DIR) || !fs.existsSync(file)) return next()
          fs.createReadStream(file).pipe(res)
        })
      },
      "astro:build:done": async ({ dir }) => {
        for (const slug of fs.readdirSync(POSTS_DIR)) {
          const src = path.join(POSTS_DIR, slug)
          if (!fs.statSync(src).isDirectory()) continue
          for (const f of fs.readdirSync(src).filter(isAsset)) {
            const dest = new URL(`${slug}/${f}`, dir)
            fs.mkdirSync(new URL(".", dest), { recursive: true })
            await publish(path.join(src, f), dest)
          }
        }
      },
    },
  }
}

export default defineConfig({
  site: "https://nobodyme.github.io",
  base: BASE,
  trailingSlash: "ignore",
  // GitHub Pages runs Jekyll unless public/.nojekyll is deployed, and Jekyll drops
  // folders starting with "_" (Astro's default "_astro"). Use a plain name so CSS,
  // JS and images are served either way.
  build: { assets: "assets" },
  // JSX whitespace rules (Astro 7 default), same as the old React components.
  compressHTML: "jsx",
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  image: {
    layout: "constrained",
  },
  markdown: {
    processor: unified({
      // Gatsby-equivalent smartypants is applied per text node by our own plugin.
      smartypants: false,
      remarkPlugins: [
        remarkResponsiveIframe,
        remarkPrism,
        remarkSmartypants,
        remarkExcerpt,
      ],
      rehypePlugins: [[rehypeImages, { base: BASE }]],
    }),
    // Code is highlighted by remark-prism (same output as gatsby-remark-prismjs).
    syntaxHighlight: false,
  },
  integrations: [copyPostAssets()],
})
