// Port of gatsby-remark-prismjs (default options) so code blocks keep the exact
// markup and Prism tokens the Gatsby site produced:
//   <div class="gatsby-highlight" data-language="x"><pre class="language-x"><code class="language-x">…</code></pre></div>
// Inline code becomes <code class="language-text">…</code>, which picks up the Prism theme.
import Prism from "prismjs"
import loadLanguages from "prismjs/components/index.js"
import { visit } from "unist-util-visit"

loadLanguages.silent = true

const HTML_ESCAPES = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  '"': "&quot;",
  "'": "&#39;",
}
const escapeHtml = code => code.replace(/[&><"']/g, c => HTML_ESCAPES[c])

function highlight(language, code) {
  if (!Prism.languages[language]) {
    try {
      loadLanguages([language])
    } catch {
      // ignore, handled below
    }
  }
  const grammar = Prism.languages[language]
  if (!grammar) return escapeHtml(code)
  return Prism.highlight(code, grammar, language)
}

export default function remarkPrism() {
  return tree => {
    visit(tree, "code", node => {
      // Language names are used in attributes, so accept only plausible ones
      // (c++, c#, objective-c, ...) and treat anything else as plain text.
      const requested = node.lang ? node.lang.toLowerCase() : "text"
      const lang = /^[\w#+.-]+$/.test(requested) ? requested : "text"
      const cls = `language-${lang}`
      node.type = "html"
      node.value =
        `<div class="gatsby-highlight" data-language="${lang}">` +
        `<pre class="${cls}"><code class="${cls}">${highlight(lang, node.value)}</code></pre>` +
        `</div>`
    })
    visit(tree, "inlineCode", node => {
      node.type = "html"
      node.value = `<code class="language-text">${escapeHtml(node.value)}</code>`
    })
  }
}
