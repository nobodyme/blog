// Port of gatsby-remark-responsive-iframe: an <iframe>/<object> with numeric
// width and height in markdown HTML is wrapped in a fixed-aspect-ratio box and
// stretched to fill it, so embeds (e.g. YouTube) scale with the column width.
import { visit } from "unist-util-visit"

const WRAPPER_STYLE = "margin-bottom: 1.0725rem"
const toNumber = v =>
  v == null || v.trim().endsWith("%") ? NaN : parseInt(v, 10)
const attr = (tag, name) =>
  tag.match(new RegExp(`\\s${name}\\s*=\\s*["']?([^"'\\s>]+)`, "i"))?.[1]

export default function remarkResponsiveIframe() {
  return tree => {
    visit(tree, "html", node => {
      const open = node.value.match(/<(iframe|object)\b[^>]*>/i)
      if (!open) return
      const tag = open[0]
      const width = toNumber(attr(tag, "width"))
      const height = toNumber(attr(tag, "height"))
      if (!Number.isFinite(width) || !Number.isFinite(height)) return

      let style = attr(tag, "style") ?? ""
      if (style && !style.endsWith(";")) style += ";"
      const newTag = tag
        .replace(/\s(width|height|style)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
        .replace(
          /\s*\/?>$/,
          ` style="${style} position: absolute; top: 0; left: 0; width: 100%; height: 100%;">`,
        )

      node.value =
        `<div class="gatsby-resp-iframe-wrapper" style="padding-bottom: ${(height / width) * 100}%; ` +
        `position: relative; height: 0; overflow: hidden; ${WRAPPER_STYLE}">` +
        node.value.replace(tag, newTag) +
        `</div>`
    })
  }
}
