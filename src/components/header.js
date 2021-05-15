import React from 'react'
import { Link } from "gatsby"

import Binoculars from "../assets/svg/binoculars.svg";
import Github from "../assets/svg/github.svg";
import Twitter from "../assets/svg/twitter.svg";
import Rss from "../assets/svg/rss.svg";

const Header = ({ siteTitle }) => {
  return (
    <div class="global-header">
      <Link className="header-title" to="/">
        <Binoculars className="header-icon" width={35} height={35}/>
        <h3 className="header-text">{siteTitle}</h3>
      </Link>
      <div class="header-social-icons">
        <a href="https://github.com/nobodyme" target="_blank" rel="noopener noreferrer">
          <Github className="header-icon" width={30} height={30}/>
        </a>
        <a href="https://twitter.com/_nobodyme_" target="_blank" rel="noopener noreferrer">
          <Twitter className="header-icon" width={30} height={30}/>
        </a>
        <a href="/blog/rss.xml" target="_blank" rel="noopener noreferrer">
          <Rss className="header-icon" width={30} height={30}/>
        </a>
      </div>
    </div>
  )
}

export default Header