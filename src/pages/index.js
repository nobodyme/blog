import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const posts = data.allMarkdownRemark.nodes

  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <Seo title={`${siteTitle} | Home`} />
        <p>
          No blog posts found.
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title={`${siteTitle} | Home`} />
      <ol className="post-list">
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ marginTop: "0px" }}><a href="https://www.linkedin.com/in/naveen-kumar-b11464128/" target="_blank" rel="noopener noreferrer">Hi, I'm Naveen</a> 👋</h3>
          <div style={{ color: 'rgb(95 103 110)', marginBottom: "20px" }}>Engineer, architect, and habitual tinkerer building highly performant systems then turning the scars into posts</div>
          <hr></hr>
        </div>
        {posts.map(post => {
          const title = post.frontmatter.title || post.fields.slug
          return (
            <li className="post-list-item" key={post.fields.slug}>
              <article
                itemScope
                itemType="http://schema.org/Article"
              >
                <header>
                  <h2>
                    <Link to={post.fields.slug} itemProp="url">
                      <span itemProp="headline">{title}</span>
                    </Link>
                  </h2>
                  <small className="meta">{post.frontmatter.date}</small>
                </header>
                <section>
                  <p
                    style={{ color: 'rgb(95 103 110)' }}
                    dangerouslySetInnerHTML={{
                      __html: post.frontmatter.description || post.excerpt,
                    }}
                    itemProp="description"
                  />
                </section>
              </article>
            </li>
          )
        })}
      </ol>
    </Layout >
  )
}

export default BlogIndex

export const pageQuery = graphql`
        query {
          site {
          siteMetadata {
          title
        }
    }
        allMarkdownRemark(sort: {fields: [frontmatter___date], order: DESC }) {
          nodes {
          excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
        title
        description
        }
      }
    }
  }
        `
