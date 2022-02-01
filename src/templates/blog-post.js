import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogPostTemplate = ({ data, location }) => {
  const post = data.markdownRemark
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const { previous, next } = data

  React.useEffect(() => {
    const script = document.createElement('script');
    const attributes = {
      src: 'https://giscus.app/client.js',
      id: 'giscus-script',
      'data-repo': 'nobodyme/blog',
      'data-repo-id': 'MDEwOlJlcG9zaXRvcnkzNjU3NTQxMTI=',
      'data-category-id': 'DIC_kwDOFcz3AM4CA8kh',
      'data-mapping': 'pathname',
      'data-theme': 'light',
      crossOrigin: 'anonymous',
      async: '',
    };

    Object.entries(attributes).forEach(([name, value]) =>
      script.setAttribute(name, value),
    );
    document.body.appendChild(script);

    return () => {
      const existingScript = document.body.querySelector('#giscus-script');
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, []);

  return (
    <Layout location={location} title={siteTitle}>
      <Seo
        title={`${post.frontmatter.title} | ${siteTitle}`}
        description={post.frontmatter.description || post.excerpt}
      />
      <article
        className="blog-post"
        itemScope
        itemType="http://schema.org/Article"
      >
        <header>
          <h1 itemProp="headline">{post.frontmatter.title}</h1>
          <p className="meta">{post.frontmatter.date}</p>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          itemProp="articleBody"
          className="blog-content"
        />
        <hr />
        <div className="giscus"></div>
        <footer>
          {/* <Bio /> */}
        </footer>
      </article>
      <nav className="blog-post-nav">
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`
