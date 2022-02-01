import * as React from "react"

const Comments = () => {
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
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-lang': 'en',
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
    <div className="comment-container">
      <h4>Comments</h4>
      <p>Want to share feedback, or discuss further ideas? Feel free to leave a comment here! This comment thread directly maps to a <a href="https://github.com/nobodyme/blog/discussions/categories/post-comments">discussion on GitHub</a>, so you can also comment there if you prefer.</p>
      <div className="giscus"></div>
    </div>
  )
}

export default Comments;