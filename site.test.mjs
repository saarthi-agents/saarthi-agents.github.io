import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const file = name => readFileSync(new URL(name, import.meta.url), 'utf8');
test('landing page has real content, semantic navigation and truthful preview state', () => {
  const html = file('./index.html');
  assert.match(html, /<main id="main">/);
  assert.match(html, /<h1 id="hero-title">Human ambition/);
  assert.match(html, /ENGINEERING PREVIEW/);
  assert.match(html, /Not a generally available service/i);
  assert.match(html, /href="#roles"/);
  assert.match(html, /aria-controls="nav-links"/);
  assert.match(html, /aria-pressed="false"/);
  assert.doesNotMatch(html, /Lorem ipsum|fake testimonials|1000\+ customers|sign up for free/i);
});
test('all referenced local static assets exist and SVG brand is accessible', () => {
  const html = file('./index.html');
  for (const path of ['styles.css','theme.css','reference-palette.css','site.js','assets/mark.svg']) {
    assert.ok(html.includes('./' + path));
    assert.ok(file('./' + path).length > 30);
  }
  assert.match(file('./assets/mark.svg'), /<title id="title">/);
});
test('motion respects reduced motion, filters maintain accessibility and no tracking is installed', () => {
  const css = file('./styles.css');
  const js = file('./site.js');
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(js, /IntersectionObserver/);
  assert.match(js, /setAttribute\('aria-pressed'/);
  assert.match(js, /setAttribute\('aria-expanded'/);
  assert.doesNotMatch(js, /analytics|gtag|pixel|fetch\(/i);
});


test('translucent two-theme design uses no lime or cyan palette', () => {
  const legacy = file('./styles.css');
  const css = file('./theme.css');
  const svg = file('./assets/mark.svg');
  const html = file('./index.html');
  assert.match(css, /:root\[data-theme="dark"\]/);
  assert.match(css, /prefers-color-scheme: dark/);
  assert.match(css, /background:var\(--surface\)/);
  assert.match(css, /backdrop-filter:blur/);
  assert.match(svg, /fill-opacity="\.52"/);
  assert.match(html, /color-scheme" content="light dark"/);
  assert.match(html, /theme-init\.js/);
  assert.match(html, /theme\.css/);
  for (const value of ['auto','light','dark']) {
    assert.match(html, new RegExp('data-theme-choice="' + value + '"'));
  }
  assert.doesNotMatch(legacy + css + svg,
    /--electric|var\(--electric\)|#78DDFB|#A6EBFF|#DFF5FF|#dfff7e|#C0FF77|#E6FF9A|--lime|var\(--lime\)/i);
});

function themeHarness({ prefersDark = false, saved = null, storageBroken = false } = {}) {
  const attributes = {};
  const handlers = new Map();
  const events = [];
  const values = new Map();
  if (saved !== null) values.set('saarthi-color-theme', saved);
  const media = {
    matches: prefersDark,
    addEventListener: (kind, callback) => handlers.set('media:' + kind, callback),
  };
  const localStorage = {
    getItem: key => { if (storageBroken) throw new Error('storage disabled'); return values.get(key) ?? null; },
    setItem: (key, value) => { if (storageBroken) throw new Error('storage disabled'); values.set(key, value); },
    removeItem: key => { if (storageBroken) throw new Error('storage disabled'); values.delete(key); },
  };
  const doc = {
    documentElement: { dataset: {} },
    querySelector: selector => selector === 'meta[name="theme-color"]'
      ? { setAttribute: (key, value) => { attributes[key] = value; } }
      : null,
  };
  const win = {
    matchMedia: () => media,
    localStorage,
    addEventListener: (kind, callback) => handlers.set(kind, callback),
    dispatchEvent: event => { events.push(event); },
  };
  class CustomEvent { constructor(type, options) { this.type = type; this.detail = options.detail; } }
  runInNewContext(file('./theme-init.js'), {
    window: win, document: doc, CustomEvent,
  });
  return { win, doc, media, handlers, events, values, attributes };
}
test('Auto follows system; switching Light or Dark persists and updates browser chrome', () => {
  const t = themeHarness({ prefersDark: true });
  assert.equal(t.doc.documentElement.dataset.theme, 'dark');
  assert.equal(t.doc.documentElement.dataset.themePreference, 'auto');
  assert.equal(t.attributes.content, '#10182D');
  assert.equal(t.win.__saarthiTheme.setChoice('light'), true);
  assert.equal(t.doc.documentElement.dataset.theme, 'light');
  assert.equal(t.values.get('saarthi-color-theme'), 'light');
  t.media.matches = true;
  t.handlers.get('media:change')();
  assert.equal(t.doc.documentElement.dataset.theme, 'light');
  t.win.__saarthiTheme.setChoice('dark');
  assert.equal(t.doc.documentElement.dataset.theme, 'dark');
  assert.equal(t.win.__saarthiTheme.setChoice('auto'), true);
  assert.equal(t.values.has('saarthi-color-theme'), false);
  t.media.matches = false;
  t.handlers.get('media:change')();
  assert.equal(t.doc.documentElement.dataset.theme, 'light');
  assert.equal(t.win.__saarthiTheme.setChoice('glow'), false);
  assert.equal(t.doc.documentElement.dataset.theme, 'light');
});
test('saved theme is respected; storage refusal safely falls back to system', () => {
  const a = themeHarness({ saved: 'dark', prefersDark: false });
  assert.equal(a.doc.documentElement.dataset.theme, 'dark');
  const b = themeHarness({ storageBroken: true, prefersDark: true });
  assert.equal(b.doc.documentElement.dataset.theme, 'dark');
  assert.equal(b.win.__saarthiTheme.setChoice('light'), true);
  assert.equal(b.doc.documentElement.dataset.theme, 'light');
});

test('header is sticky in document flow with frosted scrolling state', () => {
  const css = file('./theme.css');
  const js = file('./site.js');
  assert.match(css, /\.nav\s*\{\s*position:sticky;/);
  assert.match(css, /top:calc\(100% - 1px\)/);
  assert.match(css, /overflow-x:clip/);
  assert.match(css, /\.nav\.is-scrolled/);
  assert.match(css, /backdrop-filter:blur\(30px\)/);
  assert.match(js, /stickyHeader\?\.classList\.toggle\('is-scrolled'/);
});
test('theme switcher uses labelled inline icons, not visible text buttons', () => {
  const html = file('./index.html');
  const css = file('./theme.css');
  const block = html.match(/<div class="theme-switcher"[\s\S]*?<\/div>/)?.[0];
  assert.ok(block, 'theme switcher group must exist');
  const buttons = [...block.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)];
  assert.equal(buttons.length, 3);
  for (const value of ['auto', 'light', 'dark']) {
    const button = buttons.find(match => match[0].includes('data-theme-choice="' + value + '"'))?.[0];
    assert.ok(button, 'missing ' + value + ' choice');
    assert.match(button, /aria-label="[^"]+"/);
    assert.match(button, /aria-pressed="(?:true|false)"/);
    assert.match(button, /<svg aria-hidden="true" focusable="false"/);
    assert.doesNotMatch(button.replace(/<[^>]+>/g, '').trim(), /\S/,
      'icon control must not contain visible text');
  }
  assert.match(css, /\.theme-switcher button svg/);
  assert.match(file('./site.js'), /setAttribute\('aria-pressed'/);
});
test('pastel glass material uses meaningful alpha transparency in both themes', () => {
  const css = file('./theme.css');
  const surfaceTokens = [...css.matchAll(/--surface:\s*rgba\([^)]+\)/g)];
  assert.ok(surfaceTokens.length >= 2);
  for (const match of surfaceTokens) {
    const alpha = Number(match[0].match(/,\s*(0?\.\d+)\)/)?.[1]);
    assert.ok(alpha > 0 && alpha < 0.8, 'surface should be genuinely translucent');
  }
  assert.match(css, /--orb-lilac:/);
  assert.match(css, /--orb-blush:/);
  assert.match(css, /linear-gradient\(135deg,var\(--surface-strong\),var\(--surface\)\)/);
  assert.doesNotMatch(css, /#78DDFB|#A6EBFF|#dfff7e|--lime/i);
});

test('image-matched icy blue, pearl glass, royal blue and lilac-pink tokens are applied last', () => {
  const page = file('./index.html');
  const palette = file('./reference-palette.css');
  const svg = file('./assets/mark.svg');
  const init = file('./theme-init.js');
  assert.ok(page.indexOf('theme.css') < page.indexOf('reference-palette.css'));
  for (const hex of ['#D3E1FC', '#E8F1FE', '#F8FCFF', '#3E51E3', '#CD82D4', '#E94D96']) {
    assert.ok(palette.includes(hex), 'screenshot-derived reference color missing: ' + hex);
  }
  assert.match(palette, /:root\[data-theme="dark"\]/);
  assert.match(palette, /:root:not\(\[data-theme\]\)/);
  assert.match(palette, /--surface:rgba\(248,252,255,\.38\)/);
  assert.match(palette, /--surface-strong:rgba\(248,252,255,\.69\)/);
  assert.match(svg, /<stop stop-color="#3E51E3"/);
  assert.match(svg, /stop-color="#CD82D4"/);
  assert.match(svg, /stroke="#E94D96"/);
  assert.match(svg, /fill="#F8FCFF" fill-opacity="\.52"/);
  assert.match(init, /'#10182D' : '#D3E1FC'/);
  assert.doesNotMatch(palette + svg, /#78DDFB|#E6FF9A|#C0FF77|#DFFF7E/i);
});
