// Recreates the markup gatsby-remark-images produced around local markdown images
// (options showCaptions: true, markdownCaptions: true, maxWidth: 630):
//  - a centred wrapper capped at min(630px, image width)
//  - a link that opens the original file in a new tab
//  - an alt text taken from the file name when the markdown alt is empty
//  - a <figure>/<figcaption> using the alt text (as HTML) when an alt is given
// Astro still optimises the <img> itself (resizing, srcset, WebP) afterwards.
// The original files are copied next to each post by the `copy-post-assets`
// integration in astro.config.mjs, so the link target exists.
import path from "node:path"
import sharp from "sharp"
import { visit } from "unist-util-visit"

const MAX_WIDTH = 630

const isLocal = src => !URL.canParse(src) && !src.startsWith("/")

export default function rehypeImages({ base = "/" } = {}) {
  return async (tree, file) => {
    if (!file.path) return
    const postDir = path.dirname(file.path)
    const slug = path.basename(postDir)
    const jobs = []

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "img" || !parent) return
      const src = decodeURI(String(node.properties?.src ?? ""))
      if (!src || !isLocal(src)) return
      jobs.push({ node, index, parent, src })
    })

    // Replace from the end so earlier indexes stay valid.
    for (const { node, index, parent, src } of jobs.reverse()) {
      const file = path.resolve(postDir, src)
      const {
        width = MAX_WIDTH,
        height = MAX_WIDTH,
        format,
      } = await sharp(file).metadata()
      const presentationWidth = Math.min(MAX_WIDTH, width)
      // Gatsby took the aspect ratio from its smallest (maxWidth / 4) generated image.
      const smallest = Math.round(presentationWidth / 4)
      const paddingBottom =
        (Math.round((smallest * height) / width) / smallest) * 100
      // 20px-wide blurred placeholder shown until the real image paints (Gatsby's "blur-up").
      const placeholderFormat = format === "png" ? "png" : "jpeg"
      const placeholder = await sharp(file)
        .resize(20)
        .toFormat(placeholderFormat)
        .toBuffer()
      const caption = String(node.properties.alt ?? "")
      const fileName = path.basename(src, path.extname(src))
      const alt = caption || fileName.replace(/[^A-Z0-9]/gi, " ")

      node.properties = {
        ...node.properties,
        alt,
        // Render at 630px (1x and 2x in srcset), like gatsby-remark-images' maxWidth.
        width: presentationWidth,
        height: Math.round((height / width) * presentationWidth),
        className: ["gatsby-resp-image-image"],
        loading: "lazy",
        decoding: "async",
      }

      const wrapper = {
        type: "element",
        tagName: "span",
        properties: {
          className: ["gatsby-resp-image-wrapper"],
          style: `position: relative; display: block; margin-left: auto; margin-right: auto; max-width: ${presentationWidth}px;`,
        },
        children: [
          {
            type: "element",
            tagName: "a",
            properties: {
              className: ["gatsby-resp-image-link"],
              href: `${base}${slug}/${path.basename(src)}`,
              style: "display: block",
              target: "_blank",
              rel: ["noopener"],
            },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: {
                  className: ["gatsby-resp-image-background-image"],
                  style:
                    `padding-bottom: ${paddingBottom}%; position: relative; bottom: 0; left: 0; ` +
                    `background-image: url('data:image/${placeholderFormat};base64,${placeholder.toString("base64")}'); ` +
                    "background-size: cover; display: block;",
                },
                children: [],
              },
              node,
            ],
          },
        ],
      }

      parent.children[index] = caption
        ? {
            type: "element",
            tagName: "figure",
            properties: { className: ["gatsby-resp-image-figure"] },
            children: [
              wrapper,
              {
                type: "element",
                tagName: "figcaption",
                properties: { className: ["gatsby-resp-image-figcaption"] },
                children: [{ type: "raw", value: caption }],
              },
            ],
          }
        : wrapper
    }
  }
}
