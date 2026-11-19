import { defineCollection } from "astro:content"
import { file, glob } from "astro/loaders"
import { z } from "astro/zod"

// Every markdown file under content/blog is a post, with the URL Gatsby's
// createFilePath gave it: <slug>/index.md and <slug>.md both become /blog/<slug>/,
// and nested folders keep their path. Drafts and TIL notes in content/draft and
// content/TIL stay unpublished, as before.
// Gatsby read dates as UTC. A date-time without a timezone ("2026-11-01T02:00")
// would otherwise be read in the build machine's local time, and could show a
// different day locally than on CI.
const postDate = z.preprocess(
  value =>
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value.trim())
      ? `${value.trim().replace(" ", "T")}Z`
      : value,
  z.coerce.date(),
)

const blog = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "./content/blog",
    generateId: ({ entry }) =>
      entry.replace(/\.md$/, "").replace(/(^|\/)index$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    date: postDate,
    description: z.string().optional(),
  }),
})

const likedPosts = defineCollection({
  loader: file("./content/liked-posts/likedPosts.json", {
    // The JSON entries have no id field, so use their position in the file.
    parser: text =>
      JSON.parse(text).map((post: object, i: number) => ({
        id: String(i),
        ...post,
      })),
  }),
  schema: z.object({
    date: postDate,
    title: z.string(),
    link: z
      .string()
      .regex(/^https?:\/\//, "Liked post links must be http(s) URLs"),
    reaction: z.string(),
    tags: z.array(z.string()).optional(),
  }),
})

export const collections = { blog, likedPosts }
