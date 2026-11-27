import { getCollection } from "astro:content"

/** Every day of the daily AI news, newest first. */
export async function getDays() {
  const months = await getCollection("daily")
  const days = months.flatMap(month => {
    if (!/^\d{4}-\d{2}$/.test(month.id)) {
      throw new Error(`content/daily/${month.id}.json: name month files YYYY-MM.json`)
    }
    return month.data.days.map(day => {
      if (!day.date.startsWith(`${month.id}-`)) {
        throw new Error(`content/daily/${month.id}.json has ${day.date}, which belongs in ${day.date.slice(0, 7)}.json`)
      }
      return day
    })
  })
  const seen = new Set<string>()
  for (const { date } of days) {
    if (seen.has(date)) throw new Error(`content/daily: ${date} appears twice`)
    seen.add(date)
  }
  return days.sort((a, b) => b.date.localeCompare(a.date))
}

export type Day = Awaited<ReturnType<typeof getDays>>[number]

/** Each tag's band colour and the text colour that reads on it (from the World of AI design). */
const TAG_COLOURS: Record<string, [string, string]> = {
  Models: ["#2C47D8", "#FFFFFF"],
  Research: ["#0F7A70", "#FFFFFF"],
  Agents: ["#F06A24", "#1E0D03"],
  Tools: ["#F3C53A", "#231A00"],
  Safety: ["#93D4B4", "#082A1B"],
  Policy: ["#5D2E86", "#FFFFFF"],
  Industry: ["#34475E", "#FFFFFF"],
  Deals: ["#1F8A4C", "#FFFFFF"],
  Security: ["#CF2B3E", "#FFFFFF"],
  "Open source": ["#62B9EC", "#03233A"],
  Hardware: ["#9C6430", "#FFFFFF"],
  Reads: ["#F1A3BE", "#3A0B1E"],
}

/** Inline style setting a tag's colours as --c (band) and --ci (text on the band). */
export const tagStyle = (tag: string) => {
  const [c, ci] = TAG_COLOURS[tag] ?? ["#5A5F6B", "#FFFFFF"]
  return `--c:${c};--ci:${ci}`
}

// Dates are calendar days, so format them at noon UTC: the same day everywhere.
const format = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options }).format(new Date(`${date}T12:00:00Z`))
export const weekday = (date: string) => format(date, { weekday: "long" })
export const fullDate = (date: string) => format(date, { day: "numeric", month: "long", year: "numeric" })
export const shortDate = (date: string) => format(date, { weekday: "short", day: "numeric", month: "short" })

export const readMinutes = (day: Day) => {
  const text = [
    ...day.items.flatMap(item => [item.headline, item.body, ...item.subitems.flatMap(s => [s.headline, s.body])]),
    ...day.prompts.flatMap(p => [p.setup, p.prompt, p.why]),
    day.tryThis?.text,
  ].join(" ")
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220))
}

/** Splits text on `backticks`, the one formatting daily text allows (see content/daily/AGENTS.md). */
export const codeSpans = (text: string) =>
  text.split(/`([^`]+)`/).map((part, i) => ({ code: i % 2 === 1, text: part }))
