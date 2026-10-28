# Dilemma for his Dragon

A diary of our Dragon Warriors campaign, built with [Eleventy](https://www.11ty.dev/) and published on GitHub Pages.

Live site: https://jonathanroo.github.io/dragon-warriors-chronicle/

The site records the story only: no stats or equipment.

## Run it locally

```sh
npm install
npm start
```

Open http://localhost:8080. The site rebuilds when you save a file.

## Publish on GitHub Pages

1. Create a repository and push this folder to its `main` branch.
2. In the repository, go to **Settings > Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` builds and publishes the site to `https://<username>.github.io/<repo-name>/`.

If you use a custom domain or a `<username>.github.io` repository, edit `.github/workflows/deploy.yml` and remove the `--pathprefix` flag.

## Site settings

`src/_data/site.json` holds the site title, subtitle, Games Master name and navigation.

## Adding content

Everything is a Markdown file. The file name becomes the page address and the **slug** you use to link things together: `src/company/aldric.md` has the slug `aldric`.

### A session: `src/chronicle/`

Name files with the session number first so they sort in your editor, for example `02-the-road-to-ferromaine.md`.

```yaml
---
session: 2                        # required, sets the order
title: The Road to Ferromaine
date: 2026-11-10                  # real-world date you played
location: The Ferromaine road     # optional
days: 3                           # optional, in-game days passed
summary: One or two sentences for the contents page.
scribe: morwen                    # optional, a character slug if written in their voice
company: [aldric, morwen, grimbold]          # characters present
souls: [mother-hessel]                       # NPCs met
encountered: [skeleton, giant-rat]           # creatures met
slain:                                       # feeds every kill tally on the site
  - { creature: skeleton, by: aldric, count: 2 }
  - { creature: giant-rat, by: morwen }       # count defaults to 1
quotes:
  - { text: "I'm not opening the coffin.", who: Grimbold }
---

The entry itself, in Markdown. The first letter gets a drop cap.

## Use level-two headings for scenes
```

### A character: `src/company/`

```yaml
---
title: Sir Nockturn
profession: Knight
player: Luke
epithet: A one-line description.
status: alive            # alive, dead or missing. Dead characters move to The Fallen.
epitaph: Shown on The Fallen if dead.
portrait: /img/aldric.jpg              # optional, put the image in src/img/
portraitAlt: Sir Nockturn in his surcoat   # describe the image
---
```

The character page lists every session they appeared in and everything they killed, worked out from the session files.

### A creature: `src/bestiary/`

```yaml
---
title: Skeleton
kind: Undead
habitat: Churchyards and crypts
summary: One line.
---
```

### An NPC: `src/souls/`

```yaml
---
title: Brother Anselm
kind: miscreant          # soul or miscreant
role: Travelling pardoner
location: The Drowned Lamb
status: alive            # alive, dead or missing
opinion: The company's current view of them.
summary: One line for the listing.
---
```

## Design system

The full reference, with live examples of every component, is at `/design-system/` (linked from the footer).

```
src/
  _data/tokens.js            Design tokens: colours, fonts, sizes, space, widths
  _data/componentDocs.js     Component documentation and examples
  _includes/scss/            Foundations: settings and mixins, base, layout, utilities
  _includes/components/      One folder per component:
    card/card.njk              Nunjucks macro
    card/_card.scss            its styles
  _includes/layouts/         Page layouts built from components
  css/style.scss             Stylesheet entry point
  design-system.njk          The design system page
```

- **Tokens** are the single source of truth. Sass reads them with `@use "design-tokens"`, and they are written out as CSS custom properties (`--color-rubric`). In Sass, use `color(rubric)`, `space(md)`, `font(display)` and `@include mq(lg)` from `scss/settings`.
- **Components** are Nunjucks macros. Import one with `{% from "components/card/card.njk" import card %}`.
- **Sass** compiles during the Eleventy build, so GitHub Pages only ever serves plain CSS.
- **Adding a component:** create its folder with `name.njk` and `_name.scss`, add `@use "components/name/name"` to `src/css/style.scss`, and add an entry to `src/_data/componentDocs.js`.

## Other notes

- Fonts (EB Garamond, Uncial Antiqua, IM Fell English SC) are installed from npm and served from the site, so there are no third-party requests.
- `src/_data/site.json` sets `url`, used for share previews. Change it if the address changes.
- The share preview image is `src/img/share.jpg` (1200 × 630).
- The emblem is `src/_includes/emblem.svg`. The favicon copy is `src/img/emblem.svg`.
