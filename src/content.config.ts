import { defineCollection } from "astro:content"
import { file, glob } from "astro/loaders"
import { z } from "astro/zod"

// Each post lives in content/blog/<slug>/index.md; the folder name is the URL slug,
// matching the paths Gatsby generated (/blog/<slug>/). Drafts and TIL notes in
// content/draft and content/TIL stay unpublished, as before.
const blog = defineCollection({
  loader: glob({
    pattern: "*/index.md",
    base: "./content/blog",
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
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
    date: z.coerce.date(),
    title: z.string(),
    link: z.string(),
    reaction: z.string(),
    tags: z.array(z.string()).optional(),
  }),
})

export const collections = { blog, likedPosts }
