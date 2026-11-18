My [personal blog](https://nobodyme.github.io/blog/), built with [Astro](https://astro.build) (originally forked from the Gatsby blog starter).

## Writing

- Posts live in `content/blog/<slug>/index.md` (frontmatter: `title`, `date`, optional `description`). The folder name is the URL: `/blog/<slug>/`.
- Images go next to the post and are referenced relatively, e.g. `![](./diagram.png)`. Non-empty alt text becomes the caption.
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
| `npm run clean`   | Clear build output and Astro's content cache (needed after editing `src/plugins`) |

Pushing to `main` builds and publishes to the `gh-pages` branch via GitHub Actions (`.github/workflows/deploy.yml`). Pull requests are built but not deployed.
