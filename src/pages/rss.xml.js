// RSS feed at /blog/rss.xml, matching what gatsby-plugin-feed generated:
// newest first, 140-character excerpt as description, full post HTML in content:encoded.
import rss from "@astrojs/rss"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { getCollection, render } from "astro:content"
import { excerpt } from "../lib/text.js"
import { site } from "../site.js"

const siteUrl = site.siteUrl.replace(/\/$/, "")

export async function GET() {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  )
  const container = await AstroContainer.create()

  const items = await Promise.all(
    posts.map(async post => {
      const { Content } = await render(post)
      const link = `${siteUrl}/${post.id}/`
      return {
        title: post.data.title,
        description: excerpt(post),
        link,
        pubDate: post.data.date,
        content: await container.renderToString(Content),
        customData: `<guid isPermaLink="false">${link}</guid>`,
      }
    }),
  )

  return rss({
    title: site.title,
    description: site.description,
    site: siteUrl,
    trailingSlash: false,
    xmlns: {
      dc: "http://purl.org/dc/elements/1.1/",
      content: "http://purl.org/rss/1.0/modules/content/",
      atom: "http://www.w3.org/2005/Atom",
    },
    customData:
      `<image><url>${siteUrl}/icons/icon-144x144.png</url><title>${site.title}</title><link>${siteUrl}</link><width>144</width><height>144</height></image>` +
      `<generator>Astro</generator><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    items,
  })
}
