// Documentation for each component, shown on /design-system/.
// `example` is real Nunjucks: it is rendered live and shown as code.

export default [
  {
    group: "Page furniture",
    items: [
      {
        name: "Masthead",
        slug: "masthead",
        macro: "masthead",
        description: "The series strip, the site title over a red glow, the subtitle and the section navigation. The current section is underlined and marked with aria-current.",
        params: [
          { name: "site", type: "object", desc: "Site data: title, subtitle, nav, and optionally tagline and titleLines (the title split for the stacked lockup, middle line small)." },
          { name: "currentUrl", type: "string", desc: "The page URL, to mark the current section." },
          { name: "compact", type: "boolean", desc: "A slim bar with just the title and nav, for every page but the home page." },
        ],
        example: `{% from "components/masthead/masthead.njk" import masthead %}
{{ masthead({
  site: {
    title: "Dilemma for his Dragon",
    titleLines: ["Dilemma", "for his", "Dragon"],
    subtitle: "Being a true account of our wanderings",
    tagline: "The chronicle of a Dragon Warriors campaign",
    nav: [
      { label: "The Chronicle", url: "/chronicle/" },
      { label: "Characters and Creatures", url: "/characters/" }
    ]
  },
  currentUrl: "/chronicle/"
}) }}`,
      },
      {
        name: "Page header",
        slug: "page-header",
        macro: "pageHeader",
        description: "The centred heading block at the top of every page. Meta items with no value are left out, so templates can pass optional fields freely.",
        params: [
          { name: "kicker", type: "string, HTML", desc: "Small capitals line above the title." },
          { name: "title", type: "string", desc: "The page's h1." },
          { name: "lede", type: "string", desc: "Italic standfirst." },
          { name: "status", type: "alive | dead | missing", desc: "Adds a status mark." },
          { name: "meta", type: "[{ label, value }]", desc: "A row of facts. Values may contain HTML." },
          { name: "caller", type: "block", desc: "Optional content after the meta, using {% call %}." },
        ],
        example: `{% from "components/page-header/page-header.njk" import pageHeader %}
{{ pageHeader({
  kicker: "Entry the First",
  title: "Fog over Maiden's Vale",
  lede: "Four ill-matched strangers and a great deal of fog.",
  meta: [
    { label: "Where", value: "The inn" },
    { label: "Days passed", value: 1 }
  ]
}) }}`,
      },
      {
        name: "Colophon",
        slug: "colophon",
        macro: "colophon",
        description: "The site footer, with credits and the link to this page.",
        params: [{ name: "site", type: "object", desc: "Site data: author and gm." }],
        example: `{% from "components/colophon/colophon.njk" import colophon %}
{{ colophon({ site: { author: "Jon", gm: "Flix" } }) }}`,
      },
      {
        name: "Skip link",
        slug: "skip-link",
        macro: "skipLink",
        description: "The first focusable element on every page. Hidden until focused: tab into the example to see it.",
        params: [
          { name: "target", type: "string", desc: "Defaults to #main." },
          { name: "text", type: "string", desc: "Defaults to “Skip to content”." },
        ],
        example: `{% from "components/skip-link/skip-link.njk" import skipLink %}
{{ skipLink("#ds-components") }}`,
      },
    ],
  },
  {
    group: "Story",
    items: [
      {
        name: "Prose",
        slug: "prose",
        macro: "prose",
        description: "Wraps Markdown content. Scene headings get a red diamond and the first paragraph can open with an illuminated drop cap.",
        params: [
          { name: "dropcap", type: "boolean", desc: "Illuminate the first letter." },
          { name: "caller", type: "block", desc: "The content, using {% call %}." },
        ],
        example: `{% from "components/prose/prose.njk" import prose %}
{% call prose({ dropcap: true }) %}
  <p>Rain had been falling for three days when we came to Maiden's Vale, and nobody asked our business until we had eaten.</p>
  <h2>The village</h2>
  <p>Dumpy was extremely keen to be indoors.</p>
{% endcall %}`,
      },
      {
        name: "Quote",
        slug: "quote",
        macro: "quote",
        description: "A line overheard at the table. Quotation marks are added for you.",
        params: [
          { name: "text", type: "string", desc: "The words, without quotation marks." },
          { name: "cite", type: "string", desc: "Who said it." },
        ],
        example: `{% from "components/quote/quote.njk" import quote %}
{{ quote({ text: "Dumpy is as Dumpy does.", cite: "Dumpy, often" }) }}`,
      },
      {
        name: "Session list",
        slug: "session-list",
        macro: "sessionList",
        description: "Sessions in order of play. The compact variant numbers them in Roman numerals; the contents variant sets each as a centred chapter block with the date, place and summary, and is used on The Chronicle.",
        params: [
          { name: "sessions", type: "collection", desc: "Items with data.session and data.title." },
          { name: "variant", type: "compact | contents", desc: "Defaults to compact." },
        ],
        example: `{% from "components/session-list/session-list.njk" import sessionList %}
{% set sessions = [
  { url: "#", data: { session: 1, title: "Fog over Maiden's Vale", date: "2026-10-27", location: "The inn", summary: "Visited in the night by the white women." } },
  { url: "#", data: { session: 2, title: "The Next Night", date: "2026-11-10" } }
] %}
{{ sessionList(sessions) }}
{{ sessionList(sessions, { variant: "contents" }) }}`,
      },
      {
        name: "Pager",
        slug: "pager",
        macro: "pager",
        description: "Previous and next links between entries. Renders nothing when there are neither.",
        params: [
          { name: "prev", type: "{ url, title }", desc: "Optional." },
          { name: "next", type: "{ url, title }", desc: "Optional." },
        ],
        example: `{% from "components/pager/pager.njk" import pager %}
{{ pager({
  prev: { url: "#", title: "Fog over Maiden's Vale" },
  next: { url: "#", title: "The Next Night" }
}) }}`,
      },
      {
        name: "Cast",
        slug: "cast",
        macro: "cast, castGroup",
        description: "A framed aside listing who and what appeared in an entry, grouped under labels.",
        params: [
          { name: "label", type: "string", desc: "Accessible name for the aside." },
          { name: "castGroup(label)", type: "block", desc: "One labelled group." },
        ],
        example: `{% from "components/cast/cast.njk" import cast, castGroup %}
{% call cast() %}
  {% call castGroup("Of the company") %}<a href="#">Brian Enorath</a>, <a href="#">Pedium</a>{% endcall %}
  {% call castGroup("Creatures met") %}<a href="#">Bobbit</a>{% endcall %}
{% endcall %}`,
      },
      {
        name: "Inline links",
        slug: "inline-links",
        macro: "inlineLinks",
        description: "Comma separated links to items in a collection, looked up by file name. Unknown names are shown as plain text, so a typo is visible rather than silent.",
        params: [
          { name: "collection", type: "collection", desc: "Where to look the names up." },
          { name: "slugs", type: "string[]", desc: "File names, without .md." },
        ],
        example: `{% from "components/inline-links/inline-links.njk" import inlineLinks %}
{% set company = [
  { fileSlug: "brian-enorath", url: "#", data: { title: "Brian Enorath" } },
  { fileSlug: "pedium", url: "#", data: { title: "Pedium" } }
] %}
{{ inlineLinks(company, ["brian-enorath", "pedium", "renard"]) }}`,
      },
    ],
  },
  {
    group: "Collections and figures",
    items: [
      {
        name: "Card",
        slug: "card",
        macro: "card, cardGrid",
        description: "A linked panel for a person or creature. The whole card is the click target. Cards must sit inside a card grid, which is a list.",
        params: [
          { name: "title", type: "string", desc: "Name, linked to href." },
          { name: "href", type: "string", desc: "Where the card goes." },
          { name: "sub", type: "string", desc: "Small capitals line." },
          { name: "body", type: "string", desc: "Short description." },
          { name: "foot", type: "string", desc: "Italic footnote." },
          { name: "muted", type: "boolean", desc: "Faded, for the dead." },
          { name: "image", type: "string", desc: "Picture across the top, cropped square and toned like a portrait." },
        ],
        example: `{% from "components/card/card.njk" import card, cardGrid %}
{% call cardGrid() %}
  {{ card({ title: "Brian Enorath", href: "#", sub: "Barbarian", body: "Raised by peace-loving wannabe druids.", foot: "Played by Jon", image: "/img/brian-enorath.jpg" }) }}
  {{ card({ title: "Sir Example", href: "#", sub: "Knight", body: "Muted, as on The Fallen.", muted: true }) }}
{% endcall %}`,
      },
      {
        name: "Ledger",
        slug: "ledger",
        macro: "ledger",
        description: "A ruled table. Write the body rows with {% call %}, and give numeric cells the ledger__num class so they align right with tabular figures.",
        params: [
          { name: "caption", type: "string", desc: "Table caption. Always give one." },
          { name: "hideCaption", type: "boolean", desc: "Keep the caption for screen readers only." },
          { name: "head", type: "[{ text, numeric }]", desc: "Column headings." },
        ],
        example: `{% from "components/ledger/ledger.njk" import ledger %}
{% call ledger({ caption: "The Tally of the Slain", head: [{ text: "Creature" }, { text: "Struck down by" }, { text: "Number", numeric: true }] }) %}
  <tr><td>Goblin</td><td>Sir Nockturn</td><td class="ledger__num">2</td></tr>
  <tr><td>Goblin</td><td>Brian Enorath</td><td class="ledger__num">1</td></tr>
{% endcall %}`,
      },
      {
        name: "Tally",
        slug: "tally",
        macro: "tally, tallies",
        description: "A big number with a label. Use tallies for a row of them.",
        params: [
          { name: "value", type: "number", desc: "The figure." },
          { name: "label", type: "string", desc: "What it counts." },
        ],
        example: `{% from "components/tally/tally.njk" import tally, tallies %}
{{ tallies([
  { value: 1, label: "entry" },
  { value: 4, label: "still standing" },
  { value: 4, label: "foes slain" }
], "The story so far") }}`,
      },
      {
        name: "Count badge",
        slug: "count-badge",
        macro: "countBadge",
        description: "A small red count beside a heading. The section component adds one when given a count.",
        params: [{ name: "n", type: "number", desc: "The count." }],
        example: `{% from "components/count-badge/count-badge.njk" import countBadge %}
<p>Slain by this hand {{ countBadge(2) }}</p>`,
      },
      {
        name: "Status mark",
        slug: "status-mark",
        macro: "statusMark",
        description: "Marks the dead and the missing. Renders nothing for the living.",
        params: [{ name: "status", type: "alive | dead | missing", desc: "" }],
        example: `{% from "components/status-mark/status-mark.njk" import statusMark %}
{{ statusMark("dead") }} {{ statusMark("missing") }}`,
      },
      {
        name: "Portrait",
        slug: "portrait",
        macro: "portrait",
        description: "A framed picture, toned to sepia to match the page. Renders nothing without a src.",
        params: [
          { name: "src", type: "string", desc: "Image path, from src/img/." },
          { name: "alt", type: "string", desc: "Describe the image. Required." },
        ],
        example: `{% from "components/portrait/portrait.njk" import portrait %}
{{ portrait({ src: "/img/share.jpg", alt: "The site's title card" }) }}`,
      },
    ],
  },
  {
    group: "Page sections",
    items: [
      {
        name: "Section",
        slug: "section",
        macro: "section",
        description: "A titled, labelled section of a page.",
        params: [
          { name: "title", type: "string", desc: "The h2." },
          { name: "id", type: "string", desc: "Heading id. Required, labels the section." },
          { name: "count", type: "number", desc: "Adds a count badge." },
          { name: "intro", type: "string", desc: "Italic line under the heading." },
          { name: "wide", type: "boolean", desc: "Span the full page width." },
        ],
        example: `{% from "components/section/section.njk" import section %}
{% call section({ title: "Miscreants", id: "ds-ex-section", intro: "Rogues, villains and the deeply suspicious", count: 0 }) %}
  <p>None yet.</p>
{% endcall %}`,
      },
      {
        name: "Hero",
        slug: "hero",
        macro: "hero",
        description: "The home page opening. Contains the page's h1, so use it once, on the home page only.",
        params: [
          { name: "kicker", type: "string", desc: "" },
          { name: "title", type: "string", desc: "The h1." },
          { name: "lede", type: "string", desc: "" },
          { name: "caller", type: "block", desc: "Optional extra content, such as tallies." },
        ],
        example: `{% from "components/hero/hero.njk" import hero %}
{{ hero({ kicker: "Here begins", title: "Dilemma for his Dragon", lede: "Being a true account of our wanderings" }) }}`,
      },
      {
        name: "Feature",
        slug: "feature",
        macro: "feature",
        description: "A centred teaser for one item, such as the latest entry on the home page.",
        params: [
          { name: "kicker", type: "string", desc: "" },
          { name: "title", type: "string", desc: "Linked h2." },
          { name: "href", type: "string", desc: "" },
          { name: "lede", type: "string", desc: "" },
          { name: "linkText", type: "string", desc: "Defaults to “Read more”." },
        ],
        example: `{% from "components/feature/feature.njk" import feature %}
{{ feature({ kicker: "The latest entry, the First", title: "Fog over Maiden's Vale", href: "#", lede: "Visited in the night by the white women.", linkText: "Read the entry" }) }}`,
      },
      {
        name: "Rule",
        slug: "rule",
        macro: "rule",
        description: "The ornamental divider. Decorative only, so hidden from assistive technology. A Markdown --- in an entry draws the same ornament.",
        params: [],
        example: `{% from "components/rule/rule.njk" import rule %}
{{ rule() }}`,
      },
    ],
  },
];
