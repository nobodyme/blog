// Collects the plain-text excerpt source the same way gatsby-transformer-remark
// does (text + image alt, with a space for each paragraph, heading, table cell
// and line break). Gatsby built the excerpt after its remark plugins ran, so
// inline code (turned into HTML by prismjs) and local images (turned into HTML
// by gatsby-remark-images) never made it into the excerpt. This plugin runs
// last for the same result. Exposed as `remarkPluginFrontmatter.excerpt` and
// trimmed with `prune()` in src/lib/excerpt.js.
import { visit } from "unist-util-visit"

const SPACE_TYPES = new Set(["paragraph", "heading", "tableCell", "break"])

export default function remarkExcerpt() {
  return (tree, file) => {
    const parts = []
    visit(tree, node => {
      if (node.type === "text" || node.type === "inlineCode")
        parts.push(node.value)
      else if (node.type === "image" && /^https?:/.test(node.url))
        parts.push(node.alt ?? "")
      else if (SPACE_TYPES.has(node.type)) parts.push(" ")
    })
    file.data.astro ??= {}
    file.data.astro.frontmatter ??= {}
    file.data.astro.frontmatter.excerpt = parts.join("").trim()
  }
}
