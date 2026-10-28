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

const FONTS = [
  "eb-garamond/files/eb-garamond-latin-400-normal.woff2",
  "eb-garamond/files/eb-garamond-latin-400-italic.woff2",
  "eb-garamond/files/eb-garamond-latin-600-normal.woff2",
  "uncial-antiqua/files/uncial-antiqua-latin-400-normal.woff2",
  "im-fell-english-sc/files/im-fell-english-sc-latin-400-normal.woff2",
];

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/css": "css", "src/img": "img" });
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
