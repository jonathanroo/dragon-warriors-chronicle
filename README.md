# Dilemma for his Dragon

A diary of our Dragon Warriors campaign: one page of text, set like a book, built with [Eleventy](https://www.11ty.dev/).

## Run it locally

```sh
npm install
npm start
```

Open http://localhost:8080. The page rebuilds when you save a file.

## Adding an evening

Each evening is a Markdown file in `src/chronicle/`. Start the file name with the session number so they sort in order, for example `02-the-next-night.md`.

```yaml
---
session: 2
title: The Next Night
date: 2026-11-10
summary: One or two sentences about the evening.
photos:                      # optional
  the-company:
    src: /img/sessions/02/the-company.jpg
    width: 1200
    height: 1600
    alt: Describe what's in the photo.
---

The story, in Markdown.

## A scene heading

Every `##` heading becomes a scene, and is listed under the evening in the contents.
```

Photos appear side by side at the end of the evening. Put them in `src/img/sessions/<number>/`, resized to about 1600px on the long side with their metadata stripped: phone photos record where they were taken.

## How it's put together

```
src/
  index.njk          The whole page: title, contents, then every evening
  style.css          All the styles
  chronicle/         One Markdown file per evening
  img/sessions/      Photos, one folder per evening
  _data/site.json    Title, subtitle, description, Games Master
eleventy.config.js   Collects the evenings, links scene headings, and sets curly quotes, dashes and ellipses
```

The only typeface is EB Garamond, installed from npm and served with the site. Light and dark versions follow the reader's device setting.

## Publishing

Every push to `main` builds the page and publishes it to GitHub Pages: https://jonathanroo.github.io/dragon-warriors-chronicle/
