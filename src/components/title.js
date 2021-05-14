import React from 'react'
import { StaticImage } from "gatsby-plugin-image"

const Title = ({ siteTitle, size }) => {
  if (size === "small") {
    return (
      <div className="title-small">
        <StaticImage
          className="title-icon-small"
          layout="constrained"
          formats={["AUTO", "WEBP", "AVIF"]}
          src="../images/binoculars-40.png"
          width={25}
          height={25}
          quality={95}
          alt="logo"
        />
        <div>{siteTitle}</div>
      </div>
    )
  } else {
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
          alt="logo"
        />
        <h2>{siteTitle}</h2>
      </div>
    )
  }
}

export default Title