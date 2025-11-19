import * as React from "react"
import { Link } from "gatsby"

import Binoculars from "../assets/svg/binoculars.svg"
import Github from "../assets/svg/github.svg"
import Twitter from "../assets/svg/twitter.svg"
import Rss from "../assets/svg/rss.svg"
import Heart from "../assets/svg/heart.svg"
import LinkedIn from "../assets/svg/linkedin.svg"

const Header = ({ siteTitle }) => {
  return (
    <div className="global-header">
      <Link className="header-title" to="/">
        <Binoculars className="header-icon" width={35} height={35} />
        <h3 className="header-text">{siteTitle}</h3>
      </Link>
      <div className="header-social">
        <Link className="header-social-link" style={{ color: 'black' }} to="/liked-posts">
          <Heart className="header-social-icon" width={35} height={35} />
        </Link>
        <a className="header-social-link" href="https://github.com/nobodyme" target="_blank" rel="noopener noreferrer">
          <Github className="header-social-icon" width={30} height={30} />
        </a>
        <a className="header-social-link" href="https://www.linkedin.com/in/naveen-kumar-b11464128/" target="_blank" rel="noopener noreferrer">
          <LinkedIn className="header-social-icon" width={30} height={30} />
        </a>
        <a className="header-social-link" href="https://twitter.com/_nobodyme_" target="_blank" rel="noopener noreferrer">
          <Twitter className="header-social-icon" width={25} height={25} />
        </a>
        <a className="header-social-link" href="/blog/rss.xml" target="_blank" rel="noopener noreferrer">
          <Rss className="header-social-icon" width={28} height={28} />
        </a>
      </div>
    </div>
  )
}

export default Header