# The Chronicle

A diary of our Dragon Warriors campaign, built with [Eleventy](https://www.11ty.dev/) and published on GitHub Pages.

All the content in `src/` (the first session, the three characters, the creatures and the NPCs) is **sample content**. Replace it with your own.

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
title: Aldric of Thornwood
profession: Knight
rank: 1
player: Sam
epithet: A one-line description.
status: alive            # alive, dead or missing. Dead characters move to The Fallen.
epitaph: Shown on The Fallen if dead.
portrait: /img/aldric.jpg              # optional, put the image in src/img/
portraitAlt: Aldric in his chainmail   # describe the image
stats:
  strength: 14
  reflexes: 11
  intelligence: 9
  psychic: 8
  looks: 12
  attack: 13
  defence: 7
  magicalAttack: 13
  magicalDefence: 3
  evasion: 4
  stealth: 13
  perception: 5
  health: 14
  armour: 5 (chainmail)
kit: [Sword, Chainmail, 12 florins]
---
```

Leave out any stat that doesn't apply. The character page lists every session they appeared in and everything they killed, worked out from the session files.

### A creature: `src/bestiary/`

```yaml
---
title: Skeleton
kind: Undead
habitat: Churchyards and crypts
summary: One line.
stats: { attack: 13, defence: 6, magicalDefence: 3, evasion: 3, health: 2d6, armour: 0, damage: "d6, 3", rank: 3 }
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

## Design notes

- Fonts (EB Garamond, Uncial Antiqua, IM Fell English SC) are installed from npm and served from the site, so there are no third-party requests.
- Colours, fonts and widths are CSS custom properties at the top of `src/css/style.css`.
- The emblem is `src/_includes/emblem.svg`. The favicon copy is `src/img/emblem.svg`.
