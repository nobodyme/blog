// Helpers that reproduce Gatsby's `excerpt`, `timeToRead` and date formatting
// so the migrated pages show exactly the same text.
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime.js"
import utc from "dayjs/plugin/utc.js"
import words from "lodash/words.js"
import sanitizeHtml from "sanitize-html"

dayjs.extend(utc)
dayjs.extend(relativeTime)

/** underscore.string `prune`: cut to `length` without splitting a word, then add "…". */
export function prune(str, length, pruneStr = "…") {
  if (str.length <= length) return str
  const tmpl = c => (c.toUpperCase() !== c.toLowerCase() ? "A" : " ")
  let template = str.slice(0, length + 1).replace(/.(?=\W*\w*$)/g, tmpl)
  if (template.slice(template.length - 2).match(/\w\w/)) {
    template = template.replace(/\s*\S+$/, "")
  } else {
    template = template.slice(0, template.length - 1).replace(/\s+$/, "")
  }
  return (template + pruneStr).length > str.length
    ? str
    : str.slice(0, template.length) + pruneStr
}

/** Gatsby's `excerpt(pruneLength)` (default 140). */
export const excerpt = (entry, pruneLength = 140) =>
  prune(entry.rendered?.metadata?.frontmatter?.excerpt ?? "", pruneLength)

/** Gatsby's `timeToRead`: words in the rendered HTML / 265, rounded, at least 1. */
export function timeToRead(html) {
  const text = sanitizeHtml(html ?? "", { allowedTags: [] })
  return Math.max(1, Math.round(words(text).length / 265))
}

/** Gatsby `date(formatString: "MMMM DD, YYYY")`, evaluated in UTC. */
export const formatDate = date => dayjs.utc(date).format("MMMM DD, YYYY")

/** Gatsby `date(fromNow: true)` (Moment.js thresholds; dayjs uses the same ones). */
export const fromNow = date => dayjs.utc(date).fromNow()
