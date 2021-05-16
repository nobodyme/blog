import * as React from "react"
import { graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../../components/layout"
import Seo from "../../components/seo"

import Heart from "../../assets/svg/heart.svg"
import Shuttle from "../../assets/svg/shuttle.svg"

const getEmoji = (reaction) => {

  switch (reaction) {
    case "love":
      return (
        <Heart className="liked-post-item-reaction" fill="red" width={25} height={25} />
      )
    case "to-the-moon":
      return (
        <Shuttle className="liked-post-item-reaction" width={25} height={25} />
      )
    case "exploding-head":
      return (
        <StaticImage
          className="liked-post-item-reaction"
          layout="fixed"
          formats={["AUTO", "WEBP", "AVIF"]}
          src="../../assets/images/exploding-head.png"
          width={30}
          height={30}
          quality={95}
          alt="exploding-head-emoji"
        />
      )
    default:
      return null
  }
}

const LikeIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`
  const likedPosts = data.allLikedPostsJson.nodes

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title={`${siteTitle} | Liked Posts`} />
        <div className="liked-page-header">Liked Posts</div>
        <hr/>
        <div className="liked-post">
          <ol style={{ listStyle: `none` }}>
            {likedPosts.map(post => {
              return (
                <li className="liked-post-item" key={post.id}>
                  <div>
                    {getEmoji(post.reaction)}
                  </div>
                  <a className="liked-post-item-link" href={post.link} target="_blank" rel="noopener noreferrer">
                        <div className="liked-post-item-link-text">{post.title}</div>
                        <small className="meta">{post.date}</small>
                  </a>
                </li>
              )
            })}
          </ol>
        </div>
    </Layout>
  )
}

export default LikeIndex

export const likedPostQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allLikedPostsJson(sort: {order: DESC, fields: date}) {
      nodes {
        link
        id
        date(fromNow: true)
        reaction
        title
      }
    }
  }
`