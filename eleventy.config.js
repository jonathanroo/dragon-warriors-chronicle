import { HtmlBasePlugin } from "@11ty/eleventy";

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

// Gives each scene heading (h2) in an entry an id, and returns the
// headings so the contents can link to them.
function scenes(html, prefix) {
  const list = [];
  const out = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (m, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = `${prefix}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
    list.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: out, list };
}

const FONTS = [
  "eb-garamond-latin-400-normal.woff2",
  "eb-garamond-latin-400-italic.woff2",
  "eb-garamond-latin-600-normal.woff2",
];

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/img": "img", "src/style.css": "style.css" });
  for (const f of FONTS) {
    eleventyConfig.addPassthroughCopy({ [`node_modules/@fontsource/eb-garamond/files/${f}`]: `fonts/${f}` });
  }

  eleventyConfig.addTransform("smarten", function (content) {
    return (this.page.outputPath || "").endsWith(".html") ? smarten(content) : content;
  });

  // Evenings in the order they were played
  eleventyConfig.addCollection("evenings", (api) =>
    api.getFilteredByTag("evening").sort((a, b) => a.data.session - b.data.session)
  );

  eleventyConfig.addFilter("scenes", scenes);
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
