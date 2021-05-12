import React from 'react'
import { StaticImage } from "gatsby-plugin-image"

const Title = () => {
  return (
    <div className="title">
      <StaticImage
        className="title-icon"
        layout="fixed"
        formats={["AUTO", "WEBP", "AVIF"]}
        src="../images/binoculars-80.png"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      <h2>The Curious Engineer</h2>
    </div>
  )
}

export default Title