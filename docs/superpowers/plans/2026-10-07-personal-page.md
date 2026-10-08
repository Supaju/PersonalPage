# Personal Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Astro static portfolio site from the approved spec, matching the style of `mockup/index.html`.

**Architecture:** Astro static output, no client framework. Projects and case studies are Markdown files in content collections validated by zod schemas. Home is one scrolling page; detail pages are generated per Markdown file. Interactivity is three small vanilla scripts (theme init, theme toggle, tech filter).

**Tech Stack:** Astro 5, `@astrojs/sitemap`, plain CSS with variables, Node 20+.

**Spec:** `docs/superpowers/specs/2026-10-07-personal-page-design.html` (visual reference: `mockup/index.html`)

## Global Constraints

- Static output only; no third-party scripts, no analytics, no CMS, no blog, no contact form, no freelance section.
- Contact is `mailto:`, LinkedIn and GitHub links only.
- Light/dark: follows system preference, manual toggle persisted in `localStorage` key `theme`; theme set by inline `<head>` script before paint.
- Blue accent: light `#2563eb`, dark `#60a5fa`.
- Animations must be disabled under `prefers-reduced-motion`.
- Responsive from phone width; semantic HTML; visible focus states; AA contrast.
- Placeholder content: name "Your Name", email `you@example.com`.
- Internal links are root-relative (`/projects/...`); hosting is a user/root subdomain with no base path.
- Verification is `npm run check` (build plus dist smoke script), plus the manual pass in Task 6. No test framework.

## Review Focus

- Project with no `demo` or `repo` URL: no empty or dead link renders. (Task 4 check)
- Tech filter without JavaScript: every card is visible. (Task 4 check)
- Missing or invalid frontmatter: build fails, not a half-broken page. (Task 3 manual step)
- Theme flash: init script is in `<head>` before `<body>`. (Task 2 check)
- R&eacute;sum&eacute; button must not 404: placeholder PDF ships in `dist`. (Task 6 check)

---

### Task 1: Project scaffold and git

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/pages/index.astro`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run check` (check script added in Task 2).

- [ ] **Step 1: Init git and write config files**

Run in `C:\Code\PersonalPage`: `git init`

`.gitignore`:
```
node_modules/
dist/
.astro/
```

`package.json`:
```json
{
  "name": "personal-page",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro build && node scripts/check-dist.mjs"
  },
  "dependencies": {
    "@astrojs/sitemap": "^3.2.0",
    "astro": "^5.0.0"
  }
}
```

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Set `site` to the real URL once the host is chosen (needed for sitemap + OG tags).
export default defineConfig({
  site: 'https://yourname.github.io',
  integrations: [sitemap()],
});
```

`tsconfig.json`:
```json
{ "extends": "astro/tsconfigs/strict", "include": [".astro/types.d.ts", "**/*"], "exclude": ["dist"] }
```

`src/pages/index.astro`:
```astro
---
---
<html lang="en"><head><meta charset="utf-8"><title>Your Name</title></head><body><h1>Hello</h1></body></html>
```

- [ ] **Step 2: Install and build**

Run: `npm install` then `npm run build`
Expected: build succeeds, `dist/index.html` exists.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project"
```

---

### Task 2: Global styles, base layout, theme toggle, smoke script

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/ThemeToggle.astro`, `scripts/check-dist.mjs`
- Modify: none

**Interfaces:**
- Produces: `Base.astro` props `{ title: string; description?: string }` with a default `<slot />`; CSS classes `.wrap`, `.btn`, `.btn.primary`, `.card`, `.grid`, `.tags`, `.chip`, `.links`, `.work-item`, `.reveal` / `.reveal.in`, `.detail`; `ThemeToggle` renders `<button id="theme">`.

- [ ] **Step 1: Write the smoke script (initially asserting only the theme-flash rule)**

`scripts/check-dist.mjs`:
```js
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const exists = (p) => existsSync(new URL(`../dist/${p}`, import.meta.url));

const home = read('index.html');

// theme init must run in <head>, before <body>, to avoid a flash
assert.ok(home.indexOf("localStorage.getItem('theme')") !== -1, 'theme init script missing');
assert.ok(home.indexOf("localStorage.getItem('theme')") < home.indexOf('<body'), 'theme init must precede <body>');

console.log('dist checks passed');
```

- [ ] **Step 2: Run the check to see it fail**

Run: `npm run check`
Expected: FAIL "theme init script missing" (home page has no layout yet).

- [ ] **Step 3: Write global.css**

`src/styles/global.css`:
```css
:root{--bg:#fafaf9;--fg:#1c1c1e;--muted:#6b7280;--line:#e5e7eb;--card:#fff;--accent:#2563eb;--accent-fg:#fff}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#0f1115;--fg:#e8e8ea;--muted:#9aa0aa;--line:#262a33;--card:#161922;--accent:#60a5fa;--accent-fg:#0f1115}}
:root[data-theme=dark]{--bg:#0f1115;--fg:#e8e8ea;--muted:#9aa0aa;--line:#262a33;--card:#161922;--accent:#60a5fa;--accent-fg:#0f1115}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--fg);font:17px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:var(--accent)}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
.wrap{max-width:880px;margin:0 auto;padding:0 20px}
header{position:sticky;top:0;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);z-index:5}
header .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
nav{display:flex;gap:22px;align-items:center}
nav a{color:var(--muted);text-decoration:none;font-size:15px}
nav a:hover{color:var(--fg)}
.logo{font-weight:700;color:var(--fg);text-decoration:none}
#theme{background:none;border:1px solid var(--line);color:var(--fg);border-radius:8px;width:36px;height:36px;cursor:pointer;font-size:16px}
#theme:hover{border-color:var(--accent)}
.hero{padding:96px 0 72px}
.hero h1{font-size:clamp(2.4rem,7vw,4rem);line-height:1.1;letter-spacing:-.03em;margin:0 0 18px}
.hero p{font-size:1.2rem;color:var(--muted);max-width:560px;margin:0 0 30px}
.btns{display:flex;flex-wrap:wrap;gap:12px}
.btn{display:inline-block;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;border:1px solid var(--line);color:var(--fg);transition:transform .15s,border-color .15s}
.btn:hover{transform:translateY(-2px);border-color:var(--accent)}
.btn.primary{background:var(--accent);color:var(--accent-fg);border-color:var(--accent)}
section{padding:64px 0;border-top:1px solid var(--line)}
h2{font-size:.85rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);margin:0 0 28px}
.filters{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px}
.chip{background:none;border:1px solid var(--line);color:var(--muted);padding:5px 14px;border-radius:999px;cursor:pointer;font:inherit;font-size:14px}
.chip:hover{border-color:var(--accent);color:var(--fg)}
.chip[aria-pressed=true]{background:var(--accent);border-color:var(--accent);color:var(--accent-fg)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:18px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:22px;transition:transform .2s,border-color .2s,box-shadow .2s}
.card:hover{transform:translateY(-4px);border-color:var(--accent);box-shadow:0 8px 24px rgb(0 0 0/.07)}
.card h3{margin:0 0 6px;font-size:1.1rem}
.card h3 a{color:var(--fg);text-decoration:none}
.card p{margin:0 0 14px;color:var(--muted);font-size:15px}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}
.tags span{font:12px ui-monospace,Consolas,monospace;color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,transparent);padding:2px 8px;border-radius:5px}
.links{display:flex;gap:16px;font-size:14px}
.work-item{display:grid;grid-template-columns:140px 1fr;gap:12px 24px;padding:20px 0;border-bottom:1px solid var(--line)}
.work-item:last-child{border:0}
.work-item .when{color:var(--muted);font-size:14px}
.work-item h3{margin:0 0 4px;font-size:1.05rem}
.work-item p{margin:0 0 10px;color:var(--muted);font-size:15px}
.detail{padding:64px 0}
.detail h1{font-size:clamp(2rem,6vw,3rem);letter-spacing:-.02em;margin:8px 0 12px;line-height:1.15}
.detail .lead{color:var(--muted);font-size:1.15rem;margin:0 0 20px}
.detail .back{font-size:14px;text-decoration:none}
@media(max-width:560px){.work-item{grid-template-columns:1fr}nav a.hide{display:none}}
footer{padding:48px 0;border-top:1px solid var(--line);color:var(--muted);font-size:14px}
.reveal{opacity:0;transform:translateY(14px);transition:opacity .6s,transform .6s}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}.reveal{opacity:1;transform:none}}
```

- [ ] **Step 4: Write ThemeToggle and Base layout**

`src/components/ThemeToggle.astro`:
```astro
<button id="theme" aria-label="Toggle light/dark theme">◐</button>
<script>
  document.getElementById('theme')!.addEventListener('click', () => {
    const d = document.documentElement;
    const dark = d.dataset.theme
      ? d.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme:dark)').matches;
    const next = dark ? 'light' : 'dark';
    d.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
  });
</script>
```

`src/layouts/Base.astro`:
```astro
---
import '../styles/global.css';
interface Props { title: string; description?: string }
const { title, description = 'Portfolio of Your Name: backend, cloud and full-stack engineer.' } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <meta name="description" content={description}>
  <link rel="canonical" href={canonical}>
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="sitemap" href="/sitemap-index.xml">
  <meta property="og:title" content={title}>
  <meta property="og:description" content={description}>
  <meta property="og:type" content="website">
  <meta property="og:url" content={canonical}>
  <script is:inline>
    try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}
  </script>
</head>
<body>
  <slot />
  <script>
    // scroll-in animation; content stays visible without JS via the noscript rule below
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  </script>
  <noscript><style>.reveal{opacity:1;transform:none}</style></noscript>
</body>
</html>
```

Note: the theme init script uses `localStorage.getItem('theme')` verbatim; the smoke script matches that string.

- [ ] **Step 5: Use the layout in index.astro and rerun the check**

Replace `src/pages/index.astro`:
```astro
---
import Base from '../layouts/Base.astro';
---
<Base title="Your Name"><main class="wrap"><h1>Hello</h1></main></Base>
```

Run: `npm run check`
Expected: build succeeds, "dist checks passed".

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: global styles, base layout, theme toggle, dist smoke check"
```

---

### Task 3: Content collections and sample content

**Files:**
- Create: `src/content.config.ts`, `src/content/projects/queue-runner.md`, `src/content/projects/trail-notes.md`, `src/content/projects/infra-blueprints.md`, `src/content/projects/budget-board.md`, `src/content/work/fintech-platform.md`, `src/content/work/logistics-saas.md`

**Interfaces:**
- Produces: collections `projects` and `work` via `getCollection('projects' | 'work')`. `entry.id` is the filename slug; `entry.data` fields:
  - projects: `{ title: string; summary: string; tech: string[]; demo?: string (url); repo?: string (url); featured: boolean (default true); order: number (default 0) }`
  - work: `{ title: string; role: string; period: string; summary: string; tech: string[]; order: number (default 0) }`

- [ ] **Step 1: Write the schemas**

`src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tech: z.array(z.string()).min(1),
    demo: z.string().url().optional(),
    repo: z.string().url().optional(),
    featured: z.boolean().default(true),
    order: z.number().default(0),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    role: z.string(),
    period: z.string(),
    summary: z.string(),
    tech: z.array(z.string()).min(1),
    order: z.number().default(0),
  }),
});

export const collections = { projects, work };
```

- [ ] **Step 2: Write sample content (placeholders)**

`src/content/projects/queue-runner.md`:
```md
---
title: Queue Runner
summary: Distributed job queue with retries, backoff and a live dashboard.
tech: [Go, AWS, PostgreSQL]
demo: https://example.com/queue-runner
repo: https://github.com/example/queue-runner
order: 1
---
## Overview
Placeholder: what the project does and why it exists.

## What was hard
Placeholder: the interesting engineering problem and how it was solved.
```

`src/content/projects/trail-notes.md`:
```md
---
title: Trail Notes
summary: Offline-first notes app with sync conflict resolution.
tech: [React, Go]
demo: https://example.com/trail-notes
repo: https://github.com/example/trail-notes
order: 2
---
## Overview
Placeholder: what the project does and why it exists.

## What was hard
Placeholder: the interesting engineering problem and how it was solved.
```

`src/content/projects/infra-blueprints.md` (repo only, covers the no-demo case):
```md
---
title: Infra Blueprints
summary: Reusable Terraform modules for secure, cost-aware AWS stacks.
tech: [AWS, Terraform]
repo: https://github.com/example/infra-blueprints
order: 3
---
## Overview
Placeholder: what the project does and why it exists.

## What was hard
Placeholder: the interesting engineering problem and how it was solved.
```

`src/content/projects/budget-board.md`:
```md
---
title: Budget Board
summary: Personal finance dashboard with CSV import and charts.
tech: [React, PostgreSQL]
demo: https://example.com/budget-board
repo: https://github.com/example/budget-board
order: 4
---
## Overview
Placeholder: what the project does and why it exists.

## What was hard
Placeholder: the interesting engineering problem and how it was solved.
```

`src/content/work/fintech-platform.md`:
```md
---
title: Fintech platform migration
role: Senior Backend Engineer
period: 2022 - Present
summary: Led migration of a monolith to services, cutting p95 latency 60% and deploy time from hours to minutes.
tech: [Go, Kubernetes, PostgreSQL]
order: 1
---
## Problem
Placeholder: the business and technical problem, anonymized.

## Approach
Placeholder: what you decided and why.

## Impact
Placeholder: measurable outcome.
```

`src/content/work/logistics-saas.md`:
```md
---
title: Real-time driver tracking
role: Full-Stack Engineer
period: 2019 - 2022
summary: Built the real-time tracking system used by 2,000+ drivers; owned API and web dashboard.
tech: [Node, React, AWS]
order: 2
---
## Problem
Placeholder: the business and technical problem, anonymized.

## Approach
Placeholder: what you decided and why.

## Impact
Placeholder: measurable outcome.
```

- [ ] **Step 3: Verify schema validation**

Run: `npm run build`
Expected: succeeds.

Then temporarily delete the `title:` line from `src/content/projects/queue-runner.md` and run `npm run build`.
Expected: FAIL with a content schema error naming `title`. Restore the line and rebuild to confirm success.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: content collections with placeholder projects and case studies"
```

---

### Task 4: Home page

**Files:**
- Create: `src/components/Header.astro`, `src/components/Hero.astro`, `src/components/ProjectCard.astro`, `src/components/TechFilter.astro`, `src/components/Footer.astro`
- Modify: `src/pages/index.astro`, `scripts/check-dist.mjs`

**Interfaces:**
- Consumes: `Base.astro`, `ThemeToggle.astro`, CSS classes from Task 2, collections from Task 3.
- Produces: `ProjectCard` props `{ slug: string; title: string; summary: string; tech: string[]; demo?: string; repo?: string }`; `TechFilter` props `{ techs: string[] }` (emits `<button class="chip" data-f=...>`; script hides `.card[data-tech]` not matching).

- [ ] **Step 1: Extend the smoke script with home-page rules (failing)**

Append before the final `console.log` in `scripts/check-dist.mjs`:
```js
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
```

Run: `npm run check`
Expected: FAIL "email link missing".

- [ ] **Step 2: Write the components**

`src/components/Header.astro`:
```astro
---
import ThemeToggle from './ThemeToggle.astro';
---
<header>
  <div class="wrap">
    <a class="logo" href="/">YN.</a>
    <nav>
      <a class="hide" href="/#projects">Projects</a>
      <a class="hide" href="/#work">Work</a>
      <a class="hide" href="/#about">About</a>
      <a href="/#contact">Contact</a>
      <ThemeToggle />
    </nav>
  </div>
</header>
```

`src/components/Hero.astro`:
```astro
<div class="hero reveal">
  <h1>Hi, I'm Your Name.<br>I build reliable backends.</h1>
  <p>Backend, cloud and full-stack engineer. I design services that scale, ship fast, and stay boring in production.</p>
  <div class="btns">
    <a class="btn primary" href="mailto:you@example.com">Email me</a>
    <a class="btn" href="https://github.com/">GitHub</a>
    <a class="btn" href="https://linkedin.com/">LinkedIn</a>
    <a class="btn" href="/resume.pdf">Résumé (PDF)</a>
  </div>
</div>
```

`src/components/ProjectCard.astro`:
```astro
---
interface Props { slug: string; title: string; summary: string; tech: string[]; demo?: string; repo?: string }
const { slug, title, summary, tech, demo, repo } = Astro.props;
---
<article class="card" data-tech={tech.join('|')}>
  <h3><a href={`/projects/${slug}/`}>{title}</a></h3>
  <p>{summary}</p>
  <div class="tags">{tech.map((t) => <span>{t}</span>)}</div>
  <div class="links">
    {demo && <a href={demo}>Live demo</a>}
    {repo && <a href={repo}>GitHub</a>}
  </div>
</article>
```

`src/components/TechFilter.astro`:
```astro
---
interface Props { techs: string[] }
const { techs } = Astro.props;
---
<div class="filters" role="group" aria-label="Filter projects by technology" id="filters" hidden>
  <button class="chip" aria-pressed="true" data-f="all">All</button>
  {techs.map((t) => <button class="chip" aria-pressed="false" data-f={t}>{t}</button>)}
</div>
<script>
  // filters are hidden in the HTML and revealed here, so no-JS visitors see all cards and no dead buttons
  const box = document.getElementById('filters')!;
  box.hidden = false;
  const chips = box.querySelectorAll<HTMLButtonElement>('.chip');
  const cards = document.querySelectorAll<HTMLElement>('.card[data-tech]');
  chips.forEach((c) => c.addEventListener('click', () => {
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    cards.forEach((k) => {
      k.hidden = c.dataset.f !== 'all' && !k.dataset.tech!.split('|').includes(c.dataset.f!);
    });
  }));
</script>
```

`src/components/Footer.astro`:
```astro
<footer id="contact">
  <div class="wrap">
    <p>Let's talk: <a href="mailto:you@example.com">you@example.com</a> · <a href="https://github.com/">GitHub</a> · <a href="https://linkedin.com/">LinkedIn</a></p>
    <p>© {new Date().getFullYear()} Your Name. Built with Astro.</p>
  </div>
</footer>
```

- [ ] **Step 3: Write the home page**

`src/pages/index.astro`:
```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import ProjectCard from '../components/ProjectCard.astro';
import TechFilter from '../components/TechFilter.astro';
import Footer from '../components/Footer.astro';

const projects = (await getCollection('projects'))
  .filter((p) => p.data.featured)
  .sort((a, b) => a.data.order - b.data.order);
const work = (await getCollection('work')).sort((a, b) => a.data.order - b.data.order);
const techs = [...new Set(projects.flatMap((p) => p.data.tech))].sort();
---
<Base title="Your Name - Backend & Full-Stack Engineer">
  <Header />
  <main class="wrap">
    <Hero />

    <section id="projects" class="reveal">
      <h2>Selected projects</h2>
      <TechFilter techs={techs} />
      <div class="grid">
        {projects.map((p) => (
          <ProjectCard slug={p.id} title={p.data.title} summary={p.data.summary} tech={p.data.tech} demo={p.data.demo} repo={p.data.repo} />
        ))}
      </div>
    </section>

    <section id="work" class="reveal">
      <h2>Professional work</h2>
      {work.map((w) => (
        <div class="work-item">
          <div class="when">{w.data.period}</div>
          <div>
            <h3>{w.data.role}: {w.data.title}</h3>
            <p>{w.data.summary}</p>
            <div class="tags">{w.data.tech.map((t) => <span>{t}</span>)}</div>
            <a href={`/work/${w.id}/`}>Read case study →</a>
          </div>
        </div>
      ))}
    </section>

    <section id="about" class="reveal">
      <h2>About</h2>
      <p>I'm a software developer who likes systems that are simple to operate and pleasant to change. I care about clear interfaces, good observability, and shipping work that people can rely on. Outside of work I build side projects and tinker with homelab infrastructure.</p>
      <p><strong>Skills:</strong> Go, TypeScript, React, PostgreSQL, AWS, Terraform, Docker, Kubernetes.</p>
      <p><a class="btn" href="/resume.pdf">Download résumé (PDF)</a></p>
    </section>
  </main>
  <Footer />
</Base>
```

- [ ] **Step 4: Run the check**

Run: `npm run check`
Expected: the new assertions through the work-link rule pass. The `resume.pdf` file check comes in Task 6, so no failure here yet. The detail-page links will 404 until Task 5; that is expected.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: home page with hero, filterable projects, work and about"
```

---

### Task 5: Detail pages

**Files:**
- Create: `src/pages/projects/[slug].astro`, `src/pages/work/[slug].astro`
- Modify: `scripts/check-dist.mjs`

**Interfaces:**
- Consumes: collections and `Base`, `Header`, `Footer`.
- Produces: routes `/projects/<id>/` and `/work/<id>/`.

- [ ] **Step 1: Add failing checks**

Append before the final `console.log`:
```js
// detail pages exist for every sample entry
for (const p of ['projects/queue-runner', 'projects/infra-blueprints', 'work/fintech-platform', 'work/logistics-saas']) {
  assert.ok(exists(`${p}/index.html`), `${p} page missing`);
}
// repo-only project page: no dead demo link
assert.ok(!read('projects/infra-blueprints/index.html').includes('Live demo'), 'detail page must not show a demo link');
assert.ok(read('projects/queue-runner/index.html').includes('Live demo'), 'demo link missing on queue-runner');
assert.ok(read('work/fintech-platform/index.html').includes('Senior Backend Engineer'), 'role missing on case study');
```

Run: `npm run check`
Expected: FAIL "projects/queue-runner page missing".

- [ ] **Step 2: Write the pages**

`src/pages/projects/[slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';

export async function getStaticPaths() {
  const items = await getCollection('projects');
  return items.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}
const { entry } = Astro.props;
const { Content } = await render(entry);
const { title, summary, tech, demo, repo } = entry.data;
---
<Base title={`${title} - Your Name`} description={summary}>
  <Header />
  <main class="wrap detail">
    <a class="back" href="/#projects">← All projects</a>
    <h1>{title}</h1>
    <p class="lead">{summary}</p>
    <div class="tags">{tech.map((t) => <span>{t}</span>)}</div>
    <div class="btns">
      {demo && <a class="btn primary" href={demo}>Live demo</a>}
      {repo && <a class="btn" href={repo}>GitHub</a>}
    </div>
    <Content />
  </main>
  <Footer />
</Base>
```

`src/pages/work/[slug].astro`:
```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';

export async function getStaticPaths() {
  const items = await getCollection('work');
  return items.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}
const { entry } = Astro.props;
const { Content } = await render(entry);
const { title, role, period, summary, tech } = entry.data;
---
<Base title={`${title} - Your Name`} description={summary}>
  <Header />
  <main class="wrap detail">
    <a class="back" href="/#work">← All work</a>
    <h1>{title}</h1>
    <p class="lead">{role} · {period}</p>
    <p>{summary}</p>
    <div class="tags">{tech.map((t) => <span>{t}</span>)}</div>
    <Content />
  </main>
  <Footer />
</Base>
```

- [ ] **Step 3: Run the check**

Run: `npm run check`
Expected: "dist checks passed".

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: project and case study detail pages"
```

---

### Task 6: Assets, README, final verification

**Files:**
- Create: `public/favicon.svg`, `public/resume.pdf`, `README.md`
- Modify: `scripts/check-dist.mjs`

- [ ] **Step 1: Add failing checks**

Append before the final `console.log`:
```js
assert.ok(exists('resume.pdf'), 'resume.pdf must ship so the button does not 404');
assert.ok(exists('favicon.svg'), 'favicon missing');
assert.ok(exists('sitemap-index.xml'), 'sitemap missing');
```

Run: `npm run check`
Expected: FAIL "resume.pdf must ship...".

- [ ] **Step 2: Add assets**

`public/favicon.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#2563eb"/><text x="16" y="22" font-family="system-ui,sans-serif" font-size="16" font-weight="700" text-anchor="middle" fill="#fff">YN</text></svg>
```

`public/resume.pdf`: a one-page placeholder. Create it with PowerShell:
```powershell
$pdf = "%PDF-1.4`n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj`n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj`n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj`n4 0 obj<</Length 55>>stream`nBT /F1 24 Tf 72 700 Td (Placeholder resume) Tj ET`nendstream endobj`n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj`ntrailer<</Root 1 0 R/Size 6>>`n%%EOF"
[IO.File]::WriteAllText("$PWD\public\resume.pdf", $pdf)
```
Replace it with the real résumé before publishing.

`README.md`:
```md
# Personal Page

Astro static portfolio site.

- `npm run dev` - local dev server
- `npm run check` - build plus dist smoke checks
- Add a project: new file in `src/content/projects/`; add a case study: `src/content/work/`
- Replace placeholders: name/email/links in `src/components/Hero.astro` and `Footer.astro`, the About text in `src/pages/index.astro`, `public/resume.pdf`, and `site` in `astro.config.mjs`
- Deploy: build with `npm run build`, publish `dist/` to Cloudflare Pages / Netlify / GitHub Pages (user site)
```

- [ ] **Step 3: Run the check**

Run: `npm run check`
Expected: "dist checks passed".

- [ ] **Step 4: Manual pass**

Run: `npm run dev`, open the printed URL. Verify:
1. Home matches `mockup/index.html` in light and dark (toggle works and persists on reload).
2. Tech filter: clicking "Go" hides non-Go cards; "All" restores.
3. Click a project and a case study; back links work; Infra Blueprints shows no "Live demo" button.
4. Phone width (browser devtools ~375px): no horizontal scroll, nav shows only Contact + toggle.
5. OS "reduce motion" setting on: content visible immediately, no animation.
6. Tab through the page: focus ring is visible on links, chips and toggle.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: favicon, placeholder resume, README"
```
