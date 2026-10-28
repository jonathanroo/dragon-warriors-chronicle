import path from "node:path";
import * as sass from "sass";
import { HtmlBasePlugin, RenderPlugin } from "@11ty/eleventy";
import tokens from "./src/_data/tokens.js";

const ORDINALS = [
  "Zeroth", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh",
  "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth", "Fourteenth",
  "Fifteenth", "Sixteenth", "Seventeenth", "Eighteenth", "Nineteenth", "Twentieth",
];

function roman(n) {
  const map = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of map) while (n >= v) { out += s; n -= v; }
  return out;
}

// Turns src/_data/tokens.js into Sass maps, served as `@use "design-tokens"`.
function tokensScss() {
  const map = (name, items, key = "value") =>
    `$${name}: (\n${items.map((t) => `  "${t.name}": (${t[key]}),`).join("\n")}\n);`;
  return [
    map("colors", tokens.colors),
    map("fonts", tokens.fonts, "stack"),
    map("type-scale", tokens.typeScale),
    map("space", tokens.space),
    map("widths", tokens.widths),
    map("breakpoints", tokens.breakpoints),
  ].join("\n\n");
}

const tokensImporter = {
  canonicalize: (url) => (url === "design-tokens" ? new URL("tokens:design") : null),
  load: () => ({ contents: tokensScss(), syntax: "scss" }),
};

// Curly quotes, apostrophes, dashes and ellipses in the text of a page.
// Works on the finished HTML, so front matter and Markdown both get it.
// Tags are left alone, as is anything inside pre, code, script, style,
// textarea or svg. A word that starts with a dropped letter needs a real
// apostrophe in the source (’Ello), or it reads as an opening quote.
const SKIP = /^<(\/?)(pre|code|script|style|textarea|svg)\b/i;
const BLOCK = /^<\/?(p|li|h[1-6]|div|br|td|th|dt|dd|dl|ul|ol|blockquote|figcaption|figure|title|section|article|aside|header|footer|nav|main|body|head|table|tr)\b/i;
const OPENS_AFTER = /[\s(\[{–—‘“]/;

function smartText(text, prev) {
  let out = "";
  for (const [tok] of text.matchAll(/&quot;|&#34;|&#39;|&#x27;|&[a-z0-9#]+;|\.\.\.|---|--|[^&"'.-]+|./gi)) {
    let rep = tok;
    if (/^(&quot;|&#34;|")$/i.test(tok)) rep = OPENS_AFTER.test(prev) ? "“" : "”";
    else if (/^(&#39;|&#x27;|')$/i.test(tok)) rep = OPENS_AFTER.test(prev) ? "‘" : "’";
    else if (tok === "...") rep = "…";
    else if (tok === "---") rep = "—";
    else if (tok === "--") rep = "–";
    out += rep;
    prev = rep.startsWith("&") ? "x" : rep.slice(-1);
  }
  return [out, prev];
}

function smarten(html) {
  let prev = " ";
  let skip = 0;
  return html.replace(/(<!--[\s\S]*?-->|<[^>]*>)|([^<]+)/g, (m, tag, text) => {
    if (tag) {
      const s = tag.match(SKIP);
      if (s) skip = Math.max(0, skip + (s[1] ? -1 : 1));
      if (BLOCK.test(tag)) prev = " ";
      return tag;
    }
    if (skip) return text;
    const [out, last] = smartText(text, prev);
    prev = last;
    return out;
  });
}

// WCAG contrast ratio between two hex colours
function luminance(hex) {
  const [r, g, b] = hex.replace("#", "").match(/../g).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const FONTS = [
  "eb-garamond/files/eb-garamond-latin-400-normal.woff2",
  "eb-garamond/files/eb-garamond-latin-400-italic.woff2",
  "eb-garamond/files/eb-garamond-latin-600-normal.woff2",
  "uncial-antiqua/files/uncial-antiqua-latin-400-normal.woff2",
  "im-fell-english-sc/files/im-fell-english-sc-latin-400-normal.woff2",
  "cinzel/files/cinzel-latin-900-normal.woff2",
];

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(RenderPlugin);

  // Sass: src/css/style.scss compiles to /css/style.css.
  // Partials live in src/_includes/scss and beside each component.
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css",
    useLayouts: false,
    // Eleventy caches by the entry file's content, so without this an edit
    // to a partial alone would serve the old CSS until a restart
    compileOptions: { cache: false },
    compile: async function (inputContent, inputPath) {
      const parsed = path.parse(inputPath);
      if (parsed.name.startsWith("_")) return;
      const result = sass.compileString(inputContent, {
        loadPaths: [parsed.dir || ".", "src/_includes"],
        importers: [tokensImporter],
        style: "compressed",
        sourceMap: false,
      });
      this.addDependencies(inputPath, result.loadedUrls.filter((u) => u.protocol === "file:"));
      return async () => result.css;
    },
  });
  eleventyConfig.addWatchTarget("src/_includes/**/*.scss");
  eleventyConfig.addWatchTarget("src/_data/tokens.js");

  // Renders a Nunjucks snippet with the site's own environment, so the
  // design system page shows each component exactly as the site does.
  let njkEnv;
  eleventyConfig.amendLibrary("njk", (env) => { njkEnv = env; });
  eleventyConfig.addFilter("renderNjk", (source) => njkEnv.renderString(source, {}));

  eleventyConfig.addTransform("smarten", function (content) {
    return (this.page.outputPath || "").endsWith(".html") ? smarten(content) : content;
  });

  eleventyConfig.addPassthroughCopy({ "src/img": "img" });
  for (const f of FONTS) {
    eleventyConfig.addPassthroughCopy({
      [`node_modules/@fontsource/${f}`]: `fonts/${f.split("/").pop()}`,
    });
  }

  // Sessions in order of play
  eleventyConfig.addCollection("sessions", (api) =>
    api.getFilteredByTag("chronicle").sort((a, b) => a.data.session - b.data.session)
  );
  const byName = (tag) => (api) =>
    api.getFilteredByTag(tag).sort((a, b) => a.data.title.localeCompare(b.data.title));
  eleventyConfig.addCollection("company", byName("character"));
  eleventyConfig.addCollection("bestiary", byName("creature"));
  eleventyConfig.addCollection("souls", byName("soul"));

  // Find one item by its file name, e.g. "aldric"
  eleventyConfig.addFilter("bySlug", (items, slug) =>
    (items || []).find((i) => i.fileSlug === slug)
  );
  // Sessions whose front matter list `key` includes `slug`
  eleventyConfig.addFilter("mentioning", (sessions, key, slug) =>
    (sessions || []).filter((s) => (s.data[key] || []).includes(slug))
  );
  // Kills recorded in `slain` across sessions, filtered by character or creature
  eleventyConfig.addFilter("kills", (sessions, field, slug) => {
    const out = [];
    for (const s of sessions || []) {
      for (const k of s.data.slain || []) {
        if (k[field] === slug) out.push({ ...k, count: k.count || 1, session: s });
      }
    }
    return out;
  });
  eleventyConfig.addFilter("total", (rows) => rows.reduce((n, r) => n + (r.count || 1), 0));
  eleventyConfig.addFilter("slainTotal", (sessions) =>
    (sessions || []).reduce((n, s) => n + (s.data.slain || []).reduce((m, k) => m + (k.count || 1), 0), 0)
  );
  eleventyConfig.addFilter("where", (items, key, value) =>
    (items || []).filter((i) => i.data[key] === value)
  );
  eleventyConfig.addFilter("whereNot", (items, key, value) =>
    (items || []).filter((i) => i.data[key] !== value)
  );

  eleventyConfig.addFilter("contrast", (a, b) => contrast(a, b).toFixed(2));
  eleventyConfig.addFilter("ordinal", (n) => ORDINALS[n] || roman(n));
  eleventyConfig.addFilter("roman", roman);
  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
