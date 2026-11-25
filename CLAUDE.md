# muralik.in

Personal site and blog of Murali Kummitha (Murali K), Staff Software Engineer.
Built with Quarto, served by GitHub Pages at https://muralik.in. This repo is
**public**, so nothing here or in any post may contain employer-internal detail.

## Build, preview, deploy

- Getting Quarto, in order:
  1. Use `quarto` if it's already on `PATH` (`command -v quarto`).
  2. Otherwise try installing it: `brew install --cask quarto`.
  3. If that fails (the cask's installer needs sudo, which this machine may
     not have), download the macOS tarball from the quarto-cli GitHub releases
     into a temp folder and run `<folder>/bin/quarto` from there.
- Local check: `quarto render`, then serve `_site/` (e.g. `python3 -m http.server`).
  Drafts are skipped by a full render; preview one with
  `quarto render posts/<post>/index.qmd -M draft:false`.
- Deploy: push to `master`. `.github/workflows/publish.yml` renders and
  publishes to the `gh-pages` branch; live in a couple of minutes.
- Claude may not be able to push from this machine. If a push is blocked,
  commit locally and ask the user to run `git push origin master`; don't try
  to work around the block.
- `_site/` is tracked in git but CI rebuilds it from scratch; it is harmless
  noise in commits.

## Layout

- `_quarto.yml`: site config, SEO (Open Graph, Twitter card, canonical URLs),
  giscus comments, `seo.lua` filter, `sitemap.py` post-render.
- `theme.scss`: the dark terminal theme. Tokens: bg `#0b0f0e`, panel `#0f1513`,
  line `#1f2a27`, text `#d7e2dc`, muted `#8a9a92`, green `#7ee787`,
  amber `#f2b866`, blue `#79b8ff`. JetBrains Mono for accents, Inter for prose.
- `index.qmd` (home, raw HTML hero + `posts.ejs` listing), `about.qmd`
  (bio + `git log --career` timeline).
- `posts/<YYYY-MM-DD-slug>/index.qmd`; shared post settings in
  `posts/_metadata.yml` (author box, giscus, ToC).
- `seo.lua`: JSON-LD (Person/WebSite on home, ProfilePage on about,
  BlogPosting on posts). `sitemap.py`: canonical URLs + front-matter lastmod.
- `images/`: favicon set (`>mk_` green block), `social-card.png` (1200x630).
- `_ideas.md`: post backlog (`_` prefix keeps Quarto from rendering it).

## Writing a post

### Voice
- Plain, simple English for an external reader. Short sentences, active voice.
- Explain the idea before the mechanism. One concept per section.
- First-hand: what we built, what broke, what we changed. Real numbers only
  when they are cleared for public use.
- No internal or employer-specific names, repo names, service names, asset
  IDs, team names, people, or unreleased metrics. Describe them generically
  ("the agent platform", "the skill server over MCP"). Public products are fine
  (GitHub Actions, MongoDB, Kafka, Claude Code, SBOMs).
- No internal acronyms or project code names; say what the thing does instead.
- Prefer cards, short lists and diagrams over long paragraphs.

### Front matter
```yaml
title: "Short, punchy title"
pagetitle: "Search title"          # 30-60 chars incl. " – Murali Kummitha" suffix
description: "120-160 chars, specific, contains the terms people search for."
date: "YYYY-MM-DD"
categories: [ai-agents, mcp, ...]  # lowercase, hyphenated
draft: true                        # flip to false to publish
```
- Every page `<title>` ends with " – Murali Kummitha" automatically.
- Old URL moved? Add `aliases: [/old/path/index.html]` to redirect.

### Diagrams
- Prefer animated `<canvas>` diagrams over Mermaid. Pattern: a `diagrams.js`
  next to the post, `<canvas data-diagram="name" data-minw="760">` inside
  `<figure class="diagram">` (add `wide column-page` for big ones), load with a
  raw-HTML `<script src="diagrams.js" defer></script>` at the end of the post,
  and list it under `resources:`.
- Keep them in the theme palette, pause off-screen, give a still frame for
  reduced motion, and put a full `aria-label` on each canvas.

### Before publishing
- Title and description lengths; one `<h1>` per page; descriptive alt text.
- Re-read for anything employer-internal. Work posts describing current
  employer systems: remind the user to check the employer's external
  publishing policy.
- Render locally, check the post on desktop and phone width, check the browser
  console for errors, then commit.

## Gotchas (all hit before)

- Quarto promotes the first `<h1>` to the page title. The home page has
  `title:` set and its title block visually hidden; the hero is a `div`.
- Don't name classes after Bootstrap components (`progress`, `card`, `badge`,
  `nav`): Bootstrap styles collide. Status pills use `is-live` / `is-wip` / `is-next`.
- Article rules (`main.content ...`) override component spacing; scope card
  styles under `main.content` too.
- A post's own `include-after-body` replaces the shared author box from
  `posts/_metadata.yml`; load post scripts from the body instead.
- Canvas animations: `requestAnimationFrame` timestamps can be earlier than the
  recorded start; clamp elapsed time to >= 0.
- Pandoc turns `--` into an en dash in Markdown; escape as `\-\-` in headings.
- giscus is appended to `#quarto-content`; it is constrained to the text column
  in `theme.scss`, reactions are disabled.

## SEO setup (done)

- Google Search Console is verified with a DNS TXT record and the sitemap is
  submitted. Never remove the `google-site-verification` TXT record, and don't
  change the domain's existing mail (MX/SPF) records when adding DNS entries.
- Remaining growth levers are off-site: profile links to muralik.in, sharing
  posts, cross-posting with canonical URLs, publishing regularly.
