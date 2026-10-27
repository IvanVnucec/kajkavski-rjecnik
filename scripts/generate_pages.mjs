// Build script - the single source of truth for all HTML:
//   - index.html (home / search app)
//   - <slug>/index.html (one static page per dictionary entry at the site root,
//     e.g. zmehko/, prefilled search bar + prerendered results, so Google can
//     index "žmehko značenje")
//   - sitemap.xml
//
// Run after any change to dictionary.js, style.css or this template:
//     node scripts/generate_pages.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BASE = 'https://ivanvnucec.github.io/kajkavski-rjecnik';

// --- load words object from dictionary.js (worker script) ---
const dictSrc = fs.readFileSync(path.join(root, 'dictionary.js'), 'utf8');
const start = dictSrc.indexOf('{', dictSrc.indexOf('const words'));
const end = dictSrc.indexOf('\n};', start);
const words = new Function(`return ${dictSrc.slice(start, end + 2)}`)();

// real dictionary size, used everywhere instead of a hardcoded number
const COUNT = Object.keys(words).length;
// display count, rounded down to 100 so "više od X" stays factually true
const DISPLAY_COUNT = Math.floor(COUNT / 100) * 100;

// --- slugify: č ć -> c, š -> s, ž -> z, đ dž -> dz; keep ASCII-only URLs ---
function slugify(name) {
    return name.toLowerCase()
        .replaceAll('dž', 'dz').replaceAll('đ', 'dz')
        .replaceAll('č', 'c').replaceAll('ć', 'c')
        .replaceAll('š', 's').replaceAll('ž', 'z')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Slug from the first variant only: 'žmehko, žmefko, žmetno' -> 'zmehko'.
// Collisions get a numeric suffix (-2, -3, ...).
const usedSlugs = new Map();
function slugFor(key) {
    let slug = slugify(key.split(',')[0]);
    if (!slug) throw new Error(`Empty slug for key: ${key}`);
    const seen = usedSlugs.get(slug) ?? 0;
    usedSlugs.set(slug, seen + 1);
    if (seen > 0) {
        console.warn(`Slug collision: "${key}" -> "${slug}-${seen + 1}"`);
        slug += `-${seen + 1}`;
    }
    return slug;
}

const slugByName = new Map();
for (const name of Object.keys(words)) {
    slugByName.set(name, slugByName.get(name) ?? slugFor(name));
}

function esc(s) {
    return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

// --- replicate the SPA search: case-insensitive substring on key and value ---
const collator = new Intl.Collator('hr');
const entriesSorted = Object.entries(words).sort((a, b) => collator.compare(a[0], b[0]));
const entriesLower = entriesSorted.map(([k, v]) => [k, v, k.toLowerCase(), v.toLowerCase()]);

function searchResults(query) {
    return entriesLower.filter(([, , lk, lv]) => lk.includes(query) || lv.includes(query));
}

function staticResultsList(query) {
    return searchResults(query).map(([name, meaning]) =>
        `                <li>${esc(name)} - ${esc(meaning)}</li>`
    ).join('\n');
}

// --- home page structured data (site-wide graph) ---
const HOME_JSON_LD = `{
        "@context": "https://schema.org",
        "@graph": [
        {
            "@type": "WebSite",
            "@id": "${BASE}/#website",
            "url": "${BASE}/",
            "name": "Kajkavski rječnik",
            "inLanguage": "hr",
            "description": "Online kajkavski rječnik s brzim pretraživanjem više od ${DISPLAY_COUNT} najčešćih riječi.",
            "publisher": { "@id": "${BASE}/#person" },
            "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": "${BASE}/?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
            }
        },
        {
            "@type": "DefinedTermSet",
            "@id": "${BASE}/#dictionary",
            "name": "Kajkavski rječnik",
            "description": "Online kajkavski rječnik s brzim pretraživanjem više od ${DISPLAY_COUNT} najčešćih riječi.",
            "inLanguage": "hr",
            "numberOfItems": ${COUNT},
            "url": "${BASE}/"
        },
        {
            "@type": "Person",
            "@id": "${BASE}/#person",
            "name": "Ivan Vnučec",
            "url": "https://ivanvnucec.github.io/about/"
        },
        {
            "@type": "WebPage",
            "@id": "${BASE}/#webpage",
            "url": "${BASE}/",
            "name": "Kajkavski rječnik - pretraži više od ${DISPLAY_COUNT} najčešćih riječi",
            "isPartOf": { "@id": "${BASE}/#website" },
            "about": { "@id": "${BASE}/#dictionary" },
            "inLanguage": "hr",
            "author": { "@id": "${BASE}/#person" }
        }
        ]
    }`;

// --- the one and only page template; home and word pages differ only
//     through the parameters below ---
function renderPage({ prefix, title, description, canonical, jsonLd, extraHead, h1Html, searchValue, resultCount, listHtml }) {
    return `<!DOCTYPE html>
<html lang="hr">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    <link rel="canonical" href="${canonical}">
${extraHead}
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:locale" content="hr_HR">
    <meta property="og:site_name" content="Kajkavski rječnik">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${BASE}/og-image.png">
    <meta property="og:image:alt" content="${description}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${BASE}/og-image.png">

    <!-- Icons -->
    <link rel="shortcut icon" href="${prefix}favicon.ico">
    <link rel="icon" href="${prefix}favicon.ico" sizes="any">
    <link rel="apple-touch-icon" href="${prefix}favicon.ico">
    <meta name="theme-color" content="#4a0000">

    <!-- Structured data -->
    <script type="application/ld+json">
    ${jsonLd}
    </script>

    <link rel="stylesheet" href="${prefix}style.css">
</head>

<body onload="searchAndDisplay();">
    <header class="center" style="margin-bottom: 30px;">
        <div>
            <h1 style="margin-bottom: 10px;">${h1Html}</h1>
            <p style="margin-bottom: 10px; font-size: 12pt;">Pretraži više od ${DISPLAY_COUNT} najčešćih kajkavskih riječi.</p>
            <div style="margin-bottom: 30px; font-size: 9pt;">Autor: <a href="https://ivanvnucec.github.io/about/">Ivan Vnučec</a>, <a title="Statistika" href="https://librecounter.org/referer/show" target="_blank"><img src="https://librecounter.org/counter.svg" referrerpolicy="unsafe-url" alt="librecounter" style="height: 1em" loading="lazy"/></a></div>
        </div>
    </header>

    <main>
        <div class="center" style="margin-bottom: 30px;">
            <div>
                <form role="search" aria-label="Pretraži kajkavski rječnik" onsubmit="searchAndDisplay(true); return false;">
                    <label for="search" style="font-weight: bold;">Iskaj:</label>
                    <input type="search" id="search" name="q"${searchValue ? ` value="${searchValue}"` : ''} autofocus="" autocomplete="off" enterkeyhint="search" spellcheck="false" aria-describedby="search-hint">
                    <button type="button" id="clearBtn" onclick="onClear()">Zbriši</button>
                </form>

                <p id="search-hint" style="margin: 3px 0 8px 0; font-size: 10pt;">Režultatof: <span id="number-of-items">${resultCount}</span></p>
            </div>
        </div>

        <div class="center" style="max-width: 500px; justify-content: left;">
            <ul id="list" style="list-style-type: none; padding: 0;">${listHtml ? `\n${listHtml}\n            ` : ''}</ul>
        </div>
    </main>

    <script src="${prefix}dictionary.js" ></script>
    <script src="${prefix}app.js" ></script>
</body>

</html>
`;
}

// --- home page ---
const HOME_TITLE = `Kajkavski rječnik - pretraži više od ${DISPLAY_COUNT} najčešćih riječi`;
const HOME_DESCRIPTION = `Online kajkavski rječnik s brzim pretraživanjem više od ${DISPLAY_COUNT} najčešćih riječi.`;

fs.writeFileSync(path.join(root, 'index.html'), renderPage({
    prefix: '',
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    canonical: `${BASE}/`,
    jsonLd: HOME_JSON_LD,
    extraHead: `
    <meta name="keywords" content="kajkavski rječnik, kajkavština, kajkavske riječi, kajkavski prijevod, kajkavski online">
    <meta name="author" content="Ivan Vnučec">
    <meta name="language" content="Croatian">
    <meta name="geo.region" content="HR">
    <meta name="geo.placename" content="Hrvatska">
    <link rel="alternate" hreflang="hr" href="${BASE}/">
    <link rel="alternate" hreflang="x-default" href="${BASE}/">`,
    h1Html: `<a href="${BASE}/" class="plain-link">Kajkavski rječnik</a>`,
    searchValue: '',
    resultCount: '',
    listHtml: '',
}));

// --- word pages ---
const outDir = root;

const urls = [];
let n = 0;
for (const [name, meaning] of Object.entries(words)) {
    const slug = slugByName.get(name);
    const dir = path.join(outDir, slug);
    fs.mkdirSync(dir, { recursive: true });
    const url = `${BASE}/${slug}/`;
    const title = `${esc(name)} - značenje | Kajkavski rječnik`;
    const description = `Značenje kajkavske riječi ${esc(name)}: ${esc(meaning)}.`;

    fs.writeFileSync(path.join(dir, 'index.html'), renderPage({
        prefix: '../',
        title,
        description,
        canonical: url,
        jsonLd: `{
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        "@id": "${url}#term",
        "name": ${JSON.stringify(name)},
        "description": ${JSON.stringify(meaning)},
        "inLanguage": "hr",
        "url": "${url}",
        "inDefinedTermSet": {
            "@id": "${BASE}/#dictionary",
            "@type": "DefinedTermSet",
            "name": "Kajkavski rječnik",
            "url": "${BASE}/"
        }
    }`,
        extraHead: '',
        h1Html: `<a href="../" class="plain-link">Kajkavski rječnik</a>`,
        searchValue: esc(name),
        resultCount: String(searchResults(name.toLowerCase()).length),
        listHtml: staticResultsList(name.toLowerCase()),
    }));
    urls.push({ url });
    n++;
}

// --- sitemap.xml (home + all word pages) ---
const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
${urls.map(({ url }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);

console.log(`Generated index.html, ${n} word pages and sitemap.xml with ${urls.length + 1} URLs.`);
