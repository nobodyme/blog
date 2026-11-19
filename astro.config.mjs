// @ts-check
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { unified } from "@astrojs/markdown-remark"
import { defineConfig } from "astro/config"

import remarkExcerpt from "./src/plugins/remark-excerpt.mjs"
import remarkPrism from "./src/plugins/remark-prism.mjs"
import remarkResponsiveIframe from "./src/plugins/remark-responsive-iframe.mjs"
import remarkSmartypants from "./src/plugins/remark-smartypants.mjs"
import rehypeImages from "./src/plugins/rehype-images.mjs"
import {
  CONTENT_TYPES,
  listPostAssets,
  publishPostAsset,
  resolvePostAsset,
} from "./src/lib/post-assets.mjs"

const BASE = "/blog/"
const POSTS_DIR = fs.realpathSync(
  fileURLToPath(new URL("./content/blog/", import.meta.url)),
)

/**
 * Publishes the files that sit next to posts (images, audio, ...) at
 * /blog/<path inside content/blog>, so "open full image" links and media work.
 * The rules (what's publishable, EXIF rotation, re-encoding) live in
 * src/lib/post-assets.mjs and are shared with the dev server below.
 * @returns {import("astro").AstroIntegration}
 */
function copyPostAssets() {
  return {
    name: "copy-post-assets",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use((req, res, next) => {
          let url
          try {
            url = decodeURIComponent((req.url ?? "").split("?")[0])
          } catch {
            return next()
          }
          // The base may or may not have been stripped already.
          if (url.startsWith(BASE)) url = url.slice(BASE.length - 1)
          const file = resolvePostAsset(POSTS_DIR, url.replace(/^\/+/, ""))
          if (!file) return next()
          res.setHeader(
            "Content-Type",
            CONTENT_TYPES[path.extname(file).toLowerCase()],
          )
          fs.createReadStream(file).on("error", next).pipe(res)
        })
      },
      "astro:build:done": async ({ dir }) => {
        const outDir = fileURLToPath(dir)
        for (const rel of listPostAssets(POSTS_DIR)) {
          await publishPostAsset(
            path.join(POSTS_DIR, rel),
            path.join(outDir, rel),
          )
        }
      },
    },
  }
}

export default defineConfig({
  site: "https://nobodyme.github.io",
  base: BASE,
  trailingSlash: "ignore",
  // public/.nojekyll is what keeps GitHub Pages from running Jekyll, which drops
  // anything starting with "_". The plain folder name (instead of "_astro") is
  // just tidier; Astro can still emit "_"-prefixed bundle names (e.g. _slug_.css).
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
      rehypePlugins: [[rehypeImages, { base: BASE, postsDir: POSTS_DIR }]],
    }),
    // Code is highlighted by remark-prism (same output as gatsby-remark-prismjs).
    syntaxHighlight: false,
  },
  integrations: [copyPostAssets()],
})
