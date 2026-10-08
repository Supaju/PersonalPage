import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const exists = (p) => existsSync(new URL(`../dist/${p}`, import.meta.url));

const home = read('index.html');

// theme init must run in <head>, before <body>, to avoid a flash
assert.ok(home.indexOf("localStorage.getItem('theme')") !== -1, 'theme init script missing');
assert.ok(home.indexOf("localStorage.getItem('theme')") < home.indexOf('<body'), 'theme init must precede <body>');

console.log('dist checks passed');
