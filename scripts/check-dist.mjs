import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const exists = (p) => existsSync(new URL(`../dist/${p}`, import.meta.url));

const home = read('index.html');

// theme init must run in <head>, before <body>, to avoid a flash
assert.ok(home.indexOf("localStorage.getItem('theme')") !== -1, 'theme init script missing');
assert.ok(home.indexOf("localStorage.getItem('theme')") < home.indexOf('<body'), 'theme init must precede <body>');

// hero + contact links
assert.ok(home.includes('mailto:you@example.com'), 'email link missing');
assert.ok(home.includes('href="/resume.pdf"'), 'resume link missing');

// projects render as cards linking to detail pages
assert.ok(home.includes('href="/projects/queue-runner/"'), 'project card link missing');

// tech filter must not hide anything in the static HTML (no-JS visibility)
const cards = home.match(/<article class="card"[^>]*>/g) ?? [];
assert.ok(cards.length >= 4, 'expected 4 project cards');
assert.ok(cards.every((c) => !/\shidden/.test(c)), 'cards must not be pre-hidden');

// a project with no demo URL must not render a dead "Live demo" link
const infra = home.slice(home.indexOf('Infra Blueprints'), home.indexOf('Budget Board'));
assert.ok(!infra.includes('Live demo'), 'no-demo project must not render a demo link');
assert.ok(infra.includes('GitHub'), 'repo link missing for Infra Blueprints');

// work entries link to case studies
assert.ok(home.includes('href="/work/fintech-platform/"'), 'case study link missing');

console.log('dist checks passed');
