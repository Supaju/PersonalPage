import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const exists = (p) => existsSync(new URL(`../dist/${p}`, import.meta.url));

const home = read('index.html');

// theme init must run in <head>, before <body>, to avoid a flash
assert.ok(home.indexOf("localStorage.getItem('theme')") !== -1, 'theme init script missing');
assert.ok(home.indexOf("localStorage.getItem('theme')") < home.indexOf('<body'), 'theme init must precede <body>');

// hero + contact links
assert.ok(home.includes('mailto:Andrew.Chait@gmail.com'), 'email link missing');
assert.ok(home.includes('href="/resume.pdf"'), 'resume link missing');

// projects render as cards linking to detail pages
assert.ok(home.includes('href="/projects/personal-workout-tracker/"'), 'project card link missing');

// tech filter must not hide anything in the static HTML (no-JS visibility)
const cards = home.match(/<article class="panel"[^>]*>/g) ?? [];
assert.ok(cards.length >= 1, 'expected at least 1 project card');
assert.ok(cards.every((c) => !/\shidden/.test(c)), 'cards must not be pre-hidden');

// a project with no demo URL must not render a dead "live demo" link
assert.ok(!home.includes('live demo'), 'no-demo project must not render a demo link');
assert.ok(home.includes('>source<'), 'repo link missing');

// hero text must be in the static HTML (typing is progressive enhancement)
assert.ok(home.includes('agents that behave'), 'hero tagline missing from static HTML');
// filter flags ship hidden and are revealed by JS
assert.ok(!home.includes('id="flags"') || /id="flags"[^>]*hidden/.test(home), 'filter flags must start hidden');

// work entries link to case studies
assert.ok(home.includes('href="/work/sas/"'), 'case study link missing');

// detail pages exist
for (const p of ['projects/personal-workout-tracker', 'work/sas']) assert.ok(exists(`${p}/index.html`), `${p} page missing`);
assert.ok(!read('projects/personal-workout-tracker/index.html').includes('live demo'), 'detail page must not show a demo link');
assert.ok(read('work/sas/index.html').includes('Software Developer'), 'role missing on case study');
// placeholder guard: no template names left
assert.ok(!home.includes('Your Name') && !home.includes('example.com'), 'placeholder text left on home page');

assert.ok(exists('resume.pdf'), 'resume.pdf must ship so the button does not 404');
assert.ok(exists('favicon.svg'), 'favicon missing');
assert.ok(exists('sitemap-index.xml'), 'sitemap missing');

console.log('dist checks passed');
