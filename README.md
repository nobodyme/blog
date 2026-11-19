My [personal blog](https://nobodyme.github.io/blog/), built with [Astro](https://astro.build) (originally forked from the Gatsby blog starter).

## Writing

- Posts live in `content/blog/<slug>/index.md` or `content/blog/<slug>.md` (frontmatter: `title`, `date`, optional `description`). The path is the URL: `/blog/<slug>/`. Dates without a timezone are read as UTC.
- Images go next to the post (subfolders are fine) and are referenced relatively, e.g. `![](./diagram.png)`. The image title, or else its alt text, becomes the caption. Phone photos are rotated using their EXIF orientation.
- Other static files (audio, etc.) go in `public/`, e.g. `public/<slug>/song.wav` → `/blog/<slug>/song.wav`.
- Liked posts: `content/liked-posts/likedPosts.json`.
- Drafts in `content/draft` and notes in `content/TIL` are not published.

## Commands

Requires Node 22.23.4+ (see `.nvmrc`).

| Command           | What it does                                                                   |
| ----------------- | ------------------------------------------------------------------------------ |
| `npm install`     | Install dependencies                                                           |
| `npm run dev`     | Dev server at http://localhost:4321/blog/                                      |
| `npm run build`   | Production build into `dist/`                                                  |
| `npm run preview` | Serve the production build locally                                             |
| `npm run clean`   | Delete build output and caches (`dev` and `build` already start with a fresh content cache) |

Pushing to `main` builds and publishes to the `gh-pages` branch via GitHub Actions (`.github/workflows/deploy.yml`). Pull requests are built but not deployed.
