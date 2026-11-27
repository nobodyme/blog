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

// The daily AI news: one JSON file per month (content/daily/2026-11.json), each
// holding that month's days. content/daily/AGENTS.md is the contract for whoever
// writes them; src/lib/daily.ts checks what a schema can't (dates match the file,
// no day twice).
export const DAILY_TAGS = [
  "Models",
  "Research",
  "Agents",
  "Tools",
  "Safety",
  "Policy",
  "Industry",
  "Deals",
  "Security",
  "Open source",
  "Hardware",
  "Reads",
] as const

const link = z.object({
  label: z.string().min(1),
  url: z.string().regex(/^https:\/\//, "Daily links must be https URLs"),
})

const dailyDay = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  source: z.string().optional(),
  items: z
    .array(
      z.object({
        tag: z.enum(DAILY_TAGS),
        headline: z.string().min(1),
        hook: z.string().optional(),
        body: z.string().default(""),
        links: z.array(link).default([]),
        subitems: z
          .array(
            z.object({
              headline: z.string().min(1),
              body: z.string().default(""),
              links: z.array(link).default([]),
            }),
          )
          .default([]),
      }),
    )
    .min(1),
  prompts: z
    .array(
      z.object({
        author: z.string().min(1),
        name: z.string().optional(),
        credit: z.string().optional(),
        likes: z.number().int().nonnegative().optional(),
        setup: z.string().optional(),
        prompt: z.string().min(1),
        why: z.string().optional(),
        links: z.array(link).default([]),
      }),
    )
    .default([]),
  tryThis: z
    .object({ text: z.string().min(1), links: z.array(link).default([]) })
    .optional(),
})

const daily = defineCollection({
  loader: glob({ pattern: "*.json", base: "./content/daily" }),
  schema: z.object({ days: z.array(dailyDay).min(1) }),
})

export const collections = { blog, likedPosts, daily }
