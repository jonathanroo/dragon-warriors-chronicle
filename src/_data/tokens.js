// Design tokens: the single source of truth.
// Sass reads these through `@use "design-tokens"` (see eleventy.config.js),
// and the design system page reads them as data.

export default {
  colors: [
    { name: "parchment", value: "#ece0c2", role: "Page background" },
    { name: "parchment-deep", value: "#dccb9f", role: "Shadowed paper, page edges" },
    { name: "parchment-light", value: "#f4ead2", role: "Raised surfaces: cards, quotes, drop caps" },
    { name: "ink", value: "#241a12", role: "Text, rules, borders, shadows" },
    { name: "ink-soft", value: "#4a3b2c", role: "Secondary text, ledes" },
    { name: "ink-faint", value: "#6b5a46", role: "Labels and small print" },
    { name: "rubric", value: "#8b1e14", role: "Links, kickers, ornaments" },
    { name: "rubric-dark", value: "#6a150d", role: "Link hover" },
    { name: "line", value: "rgba(36, 26, 18, 0.25)", role: "Hairlines between rows", decorative: true },
    { name: "char", value: "#0d0b0a", role: "The masthead's black: series strip, nav bar, title outline" },
    { name: "flame", value: "#c2380f", role: "Nav diamonds on char", decorative: true },
    { name: "ember", value: "#f0a040", role: "Fire highlights on char: the current section", decorative: true },
  ],

  fonts: [
    {
      name: "display",
      stack: `"Uncial", "Garamond", Georgia, serif`,
      family: "Uncial Antiqua",
      role: "Headings and the site title",
    },
    {
      name: "body",
      stack: `"Garamond", "Iowan Old Style", "Palatino Linotype", Georgia, serif`,
      family: "EB Garamond",
      role: "Body text, ledes, quotes",
    },
    {
      name: "label",
      stack: `"Fell SC", "Garamond", Georgia, serif`,
      family: "IM Fell English SC",
      role: "Kickers, labels, navigation, table headings",
    },
    {
      name: "roman",
      stack: `"Cinzel", "Trajan Pro", Georgia, serif`,
      family: "Cinzel",
      role: "The masthead title, after the Dragon Warriors cover",
    },
  ],

  // Type scale, as rem. Fluid sizes use clamp() in the components.
  typeScale: [
    { name: "sm", value: "0.875rem" },
    { name: "md", value: "1rem" },
    { name: "lg", value: "1.25rem" },
    { name: "xl", value: "1.5rem" },
    { name: "2xl", value: "2rem" },
    { name: "3xl", value: "2.75rem" },
  ],

  space: [
    { name: "3xs", value: "0.25rem" },
    { name: "2xs", value: "0.5rem" },
    { name: "xs", value: "0.75rem" },
    { name: "sm", value: "1rem" },
    { name: "md", value: "1.5rem" },
    { name: "lg", value: "2rem" },
    { name: "xl", value: "2.5rem" },
    { name: "2xl", value: "3.5rem" },
  ],

  widths: [
    { name: "measure", value: "35rem", role: "Reading width for prose, about 65 characters a line" },
    { name: "wide", value: "62rem", role: "Page width for grids and the masthead" },
  ],

  breakpoints: [
    { name: "md", value: "40rem" },
    { name: "lg", value: "52rem" },
  ],
};
