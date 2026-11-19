import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
  for (const path of ['styles.css','site.js','assets/mark.svg']) {
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
