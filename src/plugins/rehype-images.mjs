// Recreates the markup gatsby-remark-images produced around local markdown images
// (options showCaptions: true, markdownCaptions: true, maxWidth: 630):
//  - a centred wrapper capped at min(630px, image width)
//  - a 20px blurred placeholder shown until the image paints ("blur-up")
//  - a link that opens the full-size file in a new tab (omitted when the image
//    is already inside a link)
//  - an alt text taken from the file name when the markdown alt is empty
//  - a <figure>/<figcaption> using the image title, or else its alt text
// Astro still optimises the <img> itself (resizing, srcset, WebP) afterwards.
// Full-size copies are published by the copy-post-assets integration
// (astro.config.mjs) at the same path, using the rules in src/lib/post-assets.mjs.
import path from "node:path"
import sanitizeHtml from "sanitize-html"
import sharp from "sharp"
import { visitParents } from "unist-util-visit-parents"
import { displayedImageSize } from "../lib/post-assets.mjs"

const MAX_WIDTH = 630

// Inline, like Gatsby's, so feed readers (which don't load the site CSS) still
// lay the image over its placeholder instead of below it.
const IMAGE_STYLE =
  "width:100%;height:100%;margin:0;vertical-align:middle;position:absolute;top:0;left:0;"

// Captions may contain simple HTML (e.g. the AWS AI League post centres one),
// but nothing that can run script or break out of the <figcaption>.
const CAPTION_HTML = {
  allowedTags: [
    "a",
    "abbr",
    "b",
    "br",
    "center",
    "code",
    "em",
    "i",
    "kbd",
    "s",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "u",
  ],
  allowedAttributes: { a: ["href", "title"], "*": ["style", "title"] },
  allowedSchemes: ["http", "https", "mailto"],
}

const isLocal = src => !URL.canParse(src) && !src.startsWith("/")

const safeDecodeURI = value => {
  try {
    return decodeURI(value)
  } catch {
    return value
  }
}

/** @param {{ base?: string, postsDir: string }} options */
export default function rehypeImages({ base = "/", postsDir }) {
  return async (tree, file) => {
    if (!file.path) return
    const postDir = path.dirname(file.path)
    const jobs = []

    visitParents(tree, "element", (node, ancestors) => {
      if (node.tagName !== "img") return
      const parent = ancestors.at(-1)
      const src = safeDecodeURI(String(node.properties?.src ?? ""))
      if (!parent || !src || !isLocal(src)) return
      const inLink = ancestors.some(
        a => a.type === "element" && a.tagName === "a",
      )
      jobs.push({ node, parent, src, inLink })
    })

    for (const { node, parent, src, inLink } of jobs) {
      const imageFile = path.resolve(postDir, src)
      const {
        width = MAX_WIDTH,
        height = MAX_WIDTH,
        format,
      } = await displayedImageSize(imageFile)
      const presentationWidth = Math.min(MAX_WIDTH, width)
      // Gatsby took the aspect ratio from its smallest (maxWidth / 4) generated image.
      const smallest = Math.round(presentationWidth / 4)
      const paddingBottom =
        (Math.round((smallest * height) / width) / smallest) * 100
      const placeholderFormat = format === "png" ? "png" : "jpeg"
      const placeholder = await sharp(imageFile)
        .rotate()
        .resize(20)
        .toFormat(placeholderFormat)
        .toBuffer()

      const title = String(node.properties.title ?? "")
      const markdownAlt = String(node.properties.alt ?? "")
      const caption = title || markdownAlt
      const fileName = path.basename(src, path.extname(src))
      const alt = markdownAlt || fileName.replace(/[^A-Z0-9]/gi, " ")

      node.properties = {
        ...node.properties,
        alt,
        // Render at 630px (1x and 2x in srcset), like gatsby-remark-images' maxWidth.
        width: presentationWidth,
        height: Math.round((height / width) * presentationWidth),
        className: ["gatsby-resp-image-image"],
        style: IMAGE_STYLE,
        loading: "lazy",
        decoding: "async",
      }

      const placeholderSpan = {
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
      }

      // Same path under /blog/ as the file under content/blog/ (subfolders included).
      const assetPath = path
        .relative(postsDir, imageFile)
        .split(path.sep)
        .map(encodeURIComponent)
        .join("/")
      const content = inLink
        ? [placeholderSpan, node]
        : [
            {
              type: "element",
              tagName: "a",
              properties: {
                className: ["gatsby-resp-image-link"],
                href: `${base}${assetPath}`,
                style: "display: block",
                target: "_blank",
                rel: ["noopener"],
              },
              children: [placeholderSpan, node],
            },
          ]

      const wrapper = {
        type: "element",
        tagName: "span",
        properties: {
          className: ["gatsby-resp-image-wrapper"],
          style: `position: relative; display: block; margin-left: auto; margin-right: auto; max-width: ${presentationWidth}px;`,
        },
        children: content,
      }

      const replacement = caption
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
                children: [
                  { type: "raw", value: sanitizeHtml(caption, CAPTION_HTML) },
                ],
              },
            ],
          }
        : wrapper
      parent.children[parent.children.indexOf(node)] = replacement
    }
  }
}
