// Same behaviour as gatsby-remark-smartypants: run retext-smartypants on each
// markdown text node separately. Astro's built-in smartypants works across
// nodes and produces different quotes next to links and inline code, so it is
// turned off in astro.config.mjs in favour of this.
import { retext } from "retext"
import smartypants from "retext-smartypants"
import { visit } from "unist-util-visit"

export default function remarkSmartypants() {
  const processor = retext().use(smartypants)
  return tree => {
    visit(tree, "text", node => {
      node.value = String(processor.processSync(node.value))
    })
  }
}
