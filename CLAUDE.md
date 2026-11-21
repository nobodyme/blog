# Personal blog

## Priorities

- It's important to me it works in mobile also in safari and iphone
- I want it fast as well, so any change I ask that'll hinder performance, warn me and always optimize for it without losing accuracy or reliability

## Design

- If we are brainstorming a design, create an artifact to show me the diff of before and after - then build it based on my suggestions

## Code

- Don't keep backwards-compat shims (e.g. legacy anchors). Explain what one does before removing it.

## Verifying

- For mobile checks, open the dev server in Safari in the iOS Simulator and show me the live panel, as part of verifying, without asking.
- Make sure things build via `npm run build` before raising PR
- Dev doesn't minify CSS, prod does (it once broke `animation-timeline`, #29). For CSS/JS behaviour changes, check `npm run build && npm run preview`, not just dev.
- GitHub Pages caches pages and CSS for ~10 min. After a deploy, check prod with `?v=<sha>` before deciding it's broken. A fix isn't done until it works on the live site.

## PRs and branches

- Things could be done in parallel, use a worktree unless specified otherwise
- When you raise a PR that involves a design change, always include the before and after screenshot in the PR
- Offer to raise a PR for typos you find, even when we are working on some other task
- PRs are squash-merged, so `git branch --merged` gets it wrong. Check `gh pr view` before deleting a branch or worktree.
- Cleanup any stale worktrees periodically
