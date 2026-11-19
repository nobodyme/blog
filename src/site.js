// Formerly `siteMetadata` in gatsby-config.js.
export const site = {
  title: "The Curious Engineer",
  author: {
    name: "Naveen",
    url: "https://www.linkedin.com/in/naveen-kumar-b11464128/",
    summary: "I experiment and break things.",
  },
  description:
    "Engineer, architect, and habitual tinkerer building highly performant systems then turning the scars into posts",
  siteUrl: "https://nobodyme.github.io/blog/",
  social: {
    twitter: "_nobodyme_",
  },
  gtagId: "G-RTEDBEVJXZ",
}

/** Prefix an internal path with the site base ("/blog/"). */
export const url = (p = "") =>
  `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${p.replace(/^\//, "")}`
