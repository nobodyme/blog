import * as React from "react"
import { Link } from "gatsby"
import Title from './title';

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (!isRootPath) {
    header = (
      <Link className="header-link-home" to="/">
        <Title siteTitle={title} size="small"></Title>
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      {!isRootPath && <header className="global-header">{header}</header>}
      <main>{children}</main>
      {isRootPath &&
        <footer>
          <a className="meta" href="/blog/rss.xml" target="_blank" rel="noopener noreferrer">
            <svg className="meta" viewBox="0 0 16 16" version="1.1" width="18" height="18" fill="#959da5" aria-hidden="true">
              <path fillRule="evenodd" d="M2.002 2.725a.75.75 0 01.797-.699C8.79 2.42 13.58 7.21 13.974 13.201a.75.75 0 11-1.497.098 10.502 10.502 0 00-9.776-9.776.75.75 0 01-.7-.798zM2 13a1 1 0 112 0 1 1 0 01-2 0zm.84-5.95a.75.75 0 00-.179 1.489c2.509.3 4.5 2.291 4.8 4.8a.75.75 0 101.49-.178A7.003 7.003 0 002.838 7.05z"></path>
            </svg>
            <span>Subscribe via rss</span>
          </a>
        </footer>
      }
    </div>
  )
}

export default Layout
