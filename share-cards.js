// Share cards: the picture a link shows when it's posted somewhere.
// Every page asks for its card with the shareCard filter, which records
// what the card should say and returns its address. Once the site is
// built, every card asked for is drawn with Satori and saved as a PNG.
// The address carries a hash of the card's contents, so a card is only
// redrawn when it changes, and sites that cache previews see the change.

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const W = 1200;
const H = 630;
const DIR = "img/share";

const C = {
  char: "#0d0b0a",
  paper: "#f4ead2",
  faded: "rgba(244, 234, 210, 0.7)",
  ember: "#f0a040",
  ink: "#241a12",
};

const FONTS = [
  ["Cinzel", "cinzel/files/cinzel-latin-900-normal.woff", 900, "normal"],
  ["Uncial", "uncial-antiqua/files/uncial-antiqua-latin-400-normal.woff", 400, "normal"],
  ["Fell SC", "im-fell-english-sc/files/im-fell-english-sc-latin-400-normal.woff", 400, "normal"],
  ["Garamond", "eb-garamond/files/eb-garamond-latin-400-italic.woff", 400, "italic"],
];
let fonts;
const loadFonts = () =>
  (fonts ??= FONTS.map(([name, file, weight, style]) => ({
    name, weight, style, data: fs.readFileSync(`node_modules/@fontsource/${file}`),
  })));

// Curly quotes and apostrophes, as the pages get from the smarten transform
const curly = (s = "") =>
  String(s)
    .replace(/(^|[\s(“])"/g, "$1“").replace(/"/g, "”")
    .replace(/(^|[\s(“])'/g, "$1‘").replace(/'/g, "’");

// Cut to whole words, so long summaries fit their lines
function clip(s, max) {
  s = curly(s);
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(" ", max)).replace(/[,;:.]$/, "") + "…";
}

// A tiny element builder for Satori: h("div", { style }, ...children)
const h = (type, style, ...children) => ({
  type,
  props: { style: { display: "flex", ...style }, children: children.flat().filter((c) => c !== null && c !== false && c !== undefined) },
});

const background = {
  backgroundColor: C.char,
  backgroundImage: "radial-gradient(ellipse 80% 70% at 50% 110%, rgba(168, 41, 13, 0.5), rgba(110, 21, 9, 0.15) 55%, rgba(13, 11, 10, 0) 100%)",
};

// DILEMMA for his DRAGON on one line, small, for every card but the home page's
const lockup = (size = 30) =>
  h("div", { alignItems: "center", fontFamily: "Cinzel", fontSize: size, letterSpacing: 2, color: C.paper },
    "DILEMMA",
    h("div", { fontSize: size * 0.6, color: C.ember, margin: "0 12px", letterSpacing: 3 }, "FOR HIS"),
    "DRAGON");

const kicker = (text, size = 28) =>
  text ? h("div", { fontFamily: "Fell SC", fontSize: size, letterSpacing: 2, color: C.ember }, curly(text)) : null;

const body = (text, size) =>
  text ? h("div", { fontFamily: "Garamond", fontStyle: "italic", fontSize: size, lineHeight: 1.35, color: C.faded }, text) : null;

const frame = (...children) =>
  h("div", { width: W, height: H, ...background, flexDirection: "column", borderBottom: `6px solid ${C.ember}` }, ...children);

function homeCard(card) {
  return frame(
    h("div", { flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, padding: "0 60px" },
      h("div", { fontFamily: "Fell SC", fontSize: 24, letterSpacing: 4, color: C.faded, marginBottom: 22 },
        "The chronicle of a Dragon Warriors campaign"),
      h("div", { fontFamily: "Cinzel", fontSize: 92, lineHeight: 1, color: C.paper, letterSpacing: 3 }, "DILEMMA"),
      h("div", { fontFamily: "Cinzel", fontSize: 38, color: C.ember, letterSpacing: 6, margin: "8px 0" }, "FOR HIS"),
      h("div", { fontFamily: "Cinzel", fontSize: 92, lineHeight: 1, color: C.paper, letterSpacing: 3 }, "DRAGON"),
      h("div", { marginTop: 38, gap: 70 },
        (card.tallies || []).map((t) =>
          h("div", { flexDirection: "column", alignItems: "center" },
            h("div", { fontFamily: "Cinzel", fontSize: 54, lineHeight: 1, color: C.ember }, String(t.value)),
            h("div", { fontFamily: "Fell SC", fontSize: 22, letterSpacing: 2, color: C.faded, marginTop: 6 }, t.label)))),
      card.latest ? h("div", { fontFamily: "Garamond", fontStyle: "italic", fontSize: 28, color: C.faded, marginTop: 30 },
        `Latest: ${curly(card.latest)}`) : null));
}

function textCard(card) {
  return frame(
    h("div", { padding: "44px 70px 0" }, lockup()),
    h("div", { flexDirection: "column", justifyContent: "center", flexGrow: 1, padding: "0 70px 30px" },
      kicker(card.kicker),
      h("div", { fontFamily: "Uncial", fontSize: card.title.length > 26 ? 70 : 84, lineHeight: 1.1, color: C.paper, margin: "14px 0 22px" },
        curly(card.title)),
      body(clip(card.text, 260), 29)));
}

function personCard(card, portrait) {
  return frame(
    h("div", { flexGrow: 1, alignItems: "center", padding: "0 70px 0 60px", gap: 56 },
      h("div", { padding: 10, backgroundColor: C.paper, border: `3px solid ${C.ink}`, boxShadow: `8px 8px 0 ${C.ember}` },
        { type: "img", props: { src: portrait, width: 360, height: 447, style: { objectFit: "cover" } } }),
      h("div", { flexDirection: "column", flexShrink: 1, flexGrow: 1 },
        lockup(24),
        h("div", { height: 40 }),
        kicker(card.kicker, 26),
        h("div", { fontFamily: "Uncial", fontSize: card.title.length > 18 ? 62 : 74, lineHeight: 1.1, color: C.paper, margin: "12px 0 20px" },
          curly(card.title)),
        body(clip(card.text, 150), 30))));
}

async function draw(card, srcDir) {
  let tree;
  if (card.kind === "home") tree = homeCard(card);
  else if (card.portrait) {
    const file = path.join(srcDir, card.portrait);
    const portrait = `data:image/jpeg;base64,${fs.readFileSync(file).toString("base64")}`;
    tree = personCard(card, portrait);
  } else tree = textCard(card);

  const svg = await satori(tree, { width: W, height: H, fonts: loadFonts() });
  // Satori has already turned the text into shapes, so resvg needs no fonts.
  // Letting it scan the system's fonts costs about a second a card.
  return new Resvg(svg, { fitTo: { mode: "width", value: W }, font: { loadSystemFonts: false } }).render().asPng();
}

function describe(card, site) {
  if (card.kind === "home") {
    const tallies = (card.tallies || []).map((t) => `${t.value} ${t.label}`).join(", ");
    return `${site.title}: the chronicle of a Dragon Warriors campaign. ${tallies}.`;
  }
  return [card.kicker, card.title].filter(Boolean).join(": ") + `, from ${site.title}`;
}

export default function shareCards(eleventyConfig, { srcDir = "src" } = {}) {
  const wanted = new Map();
  // Changing this file's design changes every card's hash, so they're redrawn
  const design = fs.readFileSync(new URL(import.meta.url));

  // {% set share = card | shareCard(site) %} → { url, alt }
  eleventyConfig.addFilter("shareCard", (card, site) => {
    const hash = createHash("sha1").update(design).update(JSON.stringify(card)).digest("hex").slice(0, 8);
    const slug = (card.slug || "home").replace(/^\/|\/$/g, "").replace(/\//g, "-") || "home";
    const url = `/${DIR}/${slug}-${hash}.png`;
    wanted.set(url, card);
    return { url, alt: describe(card, site) };
  });

  // Start each build's list afresh, so pages that have gone don't keep a card
  eleventyConfig.on("eleventy.before", () => wanted.clear());

  // `directories` is the folder actually built to, --output included
  eleventyConfig.on("eleventy.after", async ({ directories }) => {
    fs.mkdirSync(path.join(directories.output, DIR), { recursive: true });
    for (const [url, card] of wanted) {
      const out = path.join(directories.output, url);
      if (fs.existsSync(out)) continue;
      fs.writeFileSync(out, await draw(card, srcDir));
    }
  });
}
