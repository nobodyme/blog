# Daily AI news: how to add a day

This folder holds the daily AI news shown at `/daily/` on the blog. Each day becomes its own page (`/daily/2026-11-27/`), and `/daily/` always shows the newest one. `CLAUDE.md` is a symlink to this file, so every agent reads the same rules.

## Where a day goes

- One JSON file per month, named `YYYY-MM.json` (for example `2026-11.json`).
- The file is an object with a `days` array: `{ "days": [ { ...day... }, { ...day... } ] }`.
- To add a day, append it to the end of `days` in that month's file. On the first day of a new month, create the new file with `days` holding just that day.
- Change only the day you were asked to add or fix. Never edit, reorder or delete other days.
- One entry per date. A date must sit in its own month's file: `2026-11-27` goes in `2026-11.json`.
- `date` is the day the news is published for, as `YYYY-MM-DD`.

## A day

```json
{
  "date": "2026-11-27",
  "source": "Your X feed and wider X news",
  "items": [
    {
      "tag": "Agents",
      "headline": "Mar de Haym laid out the six layers of a working agentic system.",
      "hook": "Start agents from events, not a chat box.",
      "body": "It's a production blueprint. Keep run state in Postgres so a run can resume. ...",
      "links": [{ "label": "Mar de Haym's post", "url": "https://x.com/mardehaym/status/2125913331915784509" }]
    },
    {
      "tag": "Tools",
      "headline": "Five more from builders.",
      "hook": "UI built for agents, a prototype as a spec, a $15 smog fix ...",
      "body": "",
      "links": [],
      "subitems": [
        {
          "headline": "shadcn posted a video on shadcn/ui, Base UI and why they're building UI SDK.",
          "body": "In UI SDK, `presentation=auto` makes any popup a popover on desktop and a sheet on mobile.",
          "links": [{ "label": "shadcn's video", "url": "https://x.com/shadcn/status/2126032449582813307" }]
        }
      ]
    }
  ],
  "prompts": [],
  "tryThis": {
    "text": "Ask the agent to define the minimum viable run before starting ...",
    "links": [{ "label": "Deedy's post", "url": "https://x.com/deedydas/status/2126140365208224057" }]
  }
}
```

`2026-11.json` has a complete real day to copy from.

### Fields

| Field | Required | What it is |
|---|---|---|
| `date` | yes | `YYYY-MM-DD`. |
| `source` | no | Where the news came from, shown at the bottom of the page. |
| `items` | yes, at least 1 | The stories, most important first. The first one is the top story. |
| `items[].tag` | yes | Exactly one of: `Models`, `Research`, `Agents`, `Tools`, `Safety`, `Policy`, `Industry`, `Deals`, `Security`, `Open source`, `Hardware`, `Reads`. Each has its own colour, so any other value fails the build. |
| `items[].headline` | yes | One sentence saying what happened. |
| `items[].hook` | no | A short line that makes someone want to read it: a number, a question, a quote. Shown large in the story's colour band. |
| `items[].body` | no | A few sentences of detail. Use `""` when the story is a group of `subitems`. |
| `items[].links` | no | Sources, each `{ "label", "url" }`. The label reads after "Read more at", so write "Simon's post", not "link". |
| `items[].subitems` | no | For a story that groups several small ones (“Five more from builders”). Each has `headline`, `body` and `links`. |
| `prompts` | no | Prompts worth copying, only from respected builders. Leave it `[]` on days with none; the page says so. Each prompt has `author` and `prompt`, and optionally `name`, `credit`, `likes` (a number), `setup` (when to use it), `why` and `links`. |
| `tryThis` | no | One concrete thing to try today, with `text` and optional `links`. |

### Writing rules

- Plain text only. No Markdown or HTML: `*bold*` and `<b>` show up literally. The one exception is backticks for code: `` `presentation=auto` `` renders as code.
- Every `url` must start with `https://`.
- Say what's a rumour or unconfirmed, and say when you haven't checked something yourself.
- Keep like and bookmark counts in the text when they show why something matters (“2.5k likes, about 9.1k bookmarks”).

## Check before committing

- The file must be valid JSON: `node -e "JSON.parse(require('fs').readFileSync('content/daily/2026-11.json'))"`.
- If you can, run `npm run build`. It checks every day against the schema in `src/content.config.ts` and fails with the field and the problem if something's wrong.
- Commit message: `Daily: 2026-11-27`.
