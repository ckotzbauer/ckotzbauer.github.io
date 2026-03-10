# CLAUDE.md - Project Guide

## Project Overview

Personal website and developer blog for Christian Hopf, hosted at **www.ckotzbauer.de** via GitHub Pages. Built with Astro and the Fuwari theme. The site includes a blog with Markdown posts, an about page, archive view, full-text search, RSS feed, and a LinkedIn post publishing pipeline.

The repository uses a **two-branch deployment model**:
- **`source` branch**: Contains all source code, content, and build configuration. All development happens here.
- **`master` branch**: Contains only the built static output (`dist/`). Deployed automatically via GitHub Pages.

## Tech Stack

| Layer | Technology | Version/Details |
|---|---|---|
| Static Site Generator | Astro | 5.18.0 |
| Theme | Fuwari (by saicaca) | Customized fork |
| UI Framework | Svelte | 5.x (interactive components) |
| CSS | Tailwind CSS | 3.x with `@tailwindcss/typography` |
| CSS Preprocessor | Stylus | For `variables.styl` and `markdown-extend.styl` |
| PostCSS | postcss-import, tailwindcss/nesting | `postcss.config.mjs` |
| TypeScript | Strict mode | `tsconfig.json` extends `astro/tsconfigs/strict` |
| Package Manager | pnpm | 9.15.9 (enforced via `preinstall` script and `.npmrc`) |
| Linter/Formatter | Biome | 2.4.4 |
| Code Highlighting | Expressive Code | 0.41.x with collapsible sections, line numbers |
| Search | Pagefind | Post-build indexing of `dist/` |
| Math Rendering | KaTeX | Via remark-math + rehype-katex |
| Image Processing | Sharp | 0.34.x |
| Page Transitions | Swup | Via `@swup/astro` |
| Image Lightbox | PhotoSwipe | 5.x |
| Custom Scrollbars | OverlayScrollbars | 2.x |
| Icons | Iconify | `@iconify-json/fa6-brands`, `fa6-regular`, `fa6-solid`, `material-symbols` |
| Fonts | Roboto (body), JetBrains Mono Variable (code) | Via `@fontsource` |
| Dependency Updates | Renovate | Monthly schedule, extends `ckotzbauer/renovate-config` |

## Project Structure (source branch)

```
ckotzbauer.github.io/
├── .github/workflows/
│   ├── build.yml              # PR build check (all branches)
│   ├── biome.yml              # Code quality check (Biome CI)
│   └── deploy.yml             # Build + deploy to master + LinkedIn publishing
├── .claude/
│   ├── WRITING.md             # Writing style guide (German, describes English blog style)
│   └── skills/
│       ├── write-post/SKILL.md
│       └── write-linkedin/SKILL.md
├── linkedin/                   # LinkedIn posts (outside Astro, published via webhook)
│   └── example-post.md
├── plans/
│   └── architecture.md         # Original architecture plan (German)
├── public/
│   ├── CNAME                   # Custom domain: www.ckotzbauer.de
│   └── favicon/                # Light/dark favicons in multiple sizes
├── scripts/
│   ├── new-post.js             # Scaffolds new blog post with frontmatter
│   └── publish-linkedin.mjs    # Reads linkedin/*.md, publishes via webhook
├── src/
│   ├── assets/images/          # avatar.jpeg, cka.png, cks.png
│   ├── config.ts               # Site config, navbar, profile, license, expressive-code
│   ├── content/
│   │   ├── config.ts           # Astro content collection schemas (posts, spec)
│   │   ├── posts/              # Blog posts as Markdown
│   │   └── spec/
│   │       └── about.md        # About page content
│   ├── components/             # Astro (.astro) and Svelte (.svelte) components
│   │   ├── ArchivePanel.svelte
│   │   ├── Search.svelte
│   │   ├── LightDarkSwitch.svelte
│   │   ├── PostCard.astro
│   │   ├── PostPage.astro
│   │   ├── PostMeta.astro
│   │   ├── Navbar.astro
│   │   ├── Footer.astro
│   │   ├── GlobalStyles.astro
│   │   ├── control/            # BackToTop, ButtonLink, ButtonTag, Pagination
│   │   ├── misc/               # ImageWrapper, License, Markdown
│   │   └── widget/             # SideBar, Profile, Categories, Tags, TOC, DisplaySettings
│   ├── constants/
│   │   ├── constants.ts        # PAGE_SIZE=8, theme modes, banner heights, PAGE_WIDTH=75rem
│   │   ├── icon.ts             # Default favicons
│   │   └── link-presets.ts     # Home, Archive, About nav presets
│   ├── i18n/                   # Translation system (en, es, ja, ko, zh_CN, zh_TW, etc.)
│   │   ├── i18nKey.ts
│   │   ├── translation.ts
│   │   └── languages/          # One file per locale
│   ├── layouts/
│   │   ├── Layout.astro        # Base HTML layout (head, body, theme init, scrollbar, PhotoSwipe)
│   │   └── MainGridLayout.astro # Grid layout with sidebar, navbar, banner, TOC
│   ├── pages/
│   │   ├── [...page].astro     # Home page with pagination (uses getStaticPaths)
│   │   ├── about.astro         # About page (renders spec/about.md)
│   │   ├── archive.astro       # Archive page (ArchivePanel Svelte component)
│   │   ├── posts/[...slug].astro # Individual post pages with JSON-LD schema
│   │   ├── rss.xml.ts          # RSS feed endpoint
│   │   └── robots.txt.ts       # robots.txt endpoint
│   ├── plugins/
│   │   ├── expressive-code/    # Custom copy button, language badge plugins
│   │   ├── rehype-component-admonition.mjs  # Admonition blocks (note, tip, warning, etc.)
│   │   ├── rehype-component-github-card.mjs # GitHub repo card embeds
│   │   ├── remark-directive-rehype.js
│   │   ├── remark-excerpt.js
│   │   └── remark-reading-time.mjs          # Word count and reading time calculation
│   ├── styles/
│   │   ├── main.css            # Tailwind component layer (card-base, btn-*, link styles)
│   │   ├── markdown.css        # Markdown content styling
│   │   ├── markdown-extend.styl
│   │   ├── variables.styl      # CSS custom properties / theme variables
│   │   ├── expressive-code.css
│   │   ├── photoswipe.css
│   │   ├── scrollbar.css
│   │   └── transition.css
│   ├── types/
│   │   └── config.ts           # TypeScript types for all config objects
│   └── utils/
│       ├── content-utils.ts    # getSortedPosts, getTagList, getCategoryList
│       ├── date-utils.ts       # Date formatting
│       ├── setting-utils.ts    # Theme/hue localStorage management
│       └── url-utils.ts        # URL helpers, path comparison, slug-to-URL
├── astro.config.mjs            # Full Astro config with all integrations and markdown plugins
├── biome.json                  # Biome linter/formatter config
├── frontmatter.json            # Front Matter CMS config (VS Code extension)
├── package.json
├── pagefind.yml                # Pagefind exclusion selectors (KaTeX, search panel)
├── postcss.config.mjs
├── renovate.json
├── svelte.config.js            # Svelte preprocessing with vitePreprocess
├── tailwind.config.cjs         # Tailwind: Roboto font, dark mode via class, typography plugin
└── tsconfig.json               # Path aliases: @components, @assets, @constants, @utils, @i18n, @layouts, @
```

## Architecture & Patterns

### Content Model
- **Blog posts**: Astro content collections in `src/content/posts/*.md` with Zod schema validation (`src/content/config.ts`). Fields: `title`, `published` (date), `updated`, `draft`, `description`, `image`, `tags`, `category`, `lang`.
- **Special pages**: `src/content/spec/about.md` rendered via a separate `spec` collection.
- **Future post scheduling**: Posts with `published` date in the future are automatically filtered out in production builds (`content-utils.ts` checks `pubDate <= now` when `import.meta.env.PROD`). The daily cron rebuild at 06:00 UTC ensures scheduled posts go live automatically.

### Component Architecture
- **Astro components** (`.astro`): Used for static/server-rendered content (layouts, post cards, navigation, widgets).
- **Svelte components** (`.svelte`): Used for interactive client-side functionality (Search, ArchivePanel, LightDarkSwitch, DisplaySettings). Hydrated with `client:only="svelte"` or standard client directives.

### Markdown Processing Pipeline
The markdown pipeline is extensive (`astro.config.mjs`):
- **Remark plugins** (in order): remark-math, remark-reading-time, remark-excerpt, remark-github-admonitions-to-directives, remark-directive, remark-sectionize, custom directive parser.
- **Rehype plugins** (in order): rehype-katex, rehype-slug, rehype-components (with admonition and GitHub card components), rehype-autolink-headings.
- **Expressive Code**: Theme `github-dark`, with plugins for collapsible sections, line numbers, language badges, and a custom copy button.

### Theming
- Dark mode toggled via CSS class (`darkMode: "class"` in Tailwind config).
- Three modes: light, dark, auto (follows system preference).
- Theme hue is configurable (default 250) and stored in localStorage. CSS custom properties drive the color scheme via OKLCH color functions.
- Theme state persists across page navigations via localStorage.

### Page Transitions
- Swup handles smooth page transitions with fade animations (class `transition-swup-`).
- Containers `main` and `#toc` are swapped on navigation.
- Custom Swup hooks manage banner height changes, scroll position, and TOC visibility during transitions.

### SEO
- JSON-LD structured data (`BlogPosting` schema) on post pages.
- Open Graph and Twitter Card meta tags on all pages.
- Auto-generated `sitemap-index.xml` via `@astrojs/sitemap`.
- `robots.txt` generated as API route, disallows `/_astro/`.
- RSS feed at `/rss.xml` with sanitized HTML content.

### LinkedIn Publishing Pipeline
- LinkedIn posts live in `linkedin/*.md` with frontmatter: `title`, `pubDate`, `published`.
- `scripts/publish-linkedin.mjs` reads posts, publishes due ones via `LINKEDIN_WEBHOOK_URL` (POST JSON to webhook), and sets `published: true`.
- Currently **commented out** in the deploy workflow but fully implemented.

### Internationalization
- Translation system in `src/i18n/` supports 10 languages.
- Site language is set to `en` in `src/config.ts`.
- Posts can have individual `lang` fields for per-post language settings.

## Build & Development

### Prerequisites
- Node.js 24 (CI uses 24; README says 22+)
- pnpm 9.15.9 (enforced: `preinstall` script runs `npx only-allow pnpm`)

### Key Commands

| Command | Description |
|---|---|
| `pnpm install` | Install dependencies (pnpm enforced) |
| `pnpm dev` | Start Astro dev server (default port 4321) |
| `pnpm build` | Production build: `astro build && pagefind --site dist` |
| `pnpm preview` | Preview production build locally |
| `pnpm check` | Run `astro check` (type checking for Astro files) |
| `pnpm type-check` | Run `tsc --noEmit --isolatedDeclarations` |
| `pnpm new-post -- <filename>` | Scaffold a new blog post with frontmatter template |
| `pnpm format` | Format `./src` with Biome |
| `pnpm lint` | Lint and auto-fix `./src` with Biome |

### Build Output
- Static files are generated to `dist/`.
- Pagefind runs as a post-build step to create the search index in `dist/pagefind/`.
- The `dist/` directory is what gets deployed to the `master` branch.

## CI/CD & Deployment

### Workflows

**`deploy.yml`** - Main deployment pipeline:
- **Triggers**: Push to `source`, daily cron at 06:00 UTC, manual dispatch.
- **Steps**: Checkout -> `withastro/action@v5` (install + build) -> Add `.nojekyll` -> Deploy `dist/` to `master` branch using `JamesIves/github-pages-deploy-action`.
- **Permissions**: `contents: write`, `pages: write`, `id-token: write`.
- Uses `secrets.REPO_ACCESS_TOKEN` for the deploy action.
- LinkedIn publishing steps exist but are currently commented out.

**`build.yml`** - PR validation:
- **Triggers**: Pull requests to any branch.
- **Steps**: Checkout -> pnpm setup -> Node.js 24 setup -> `pnpm install --frozen-lockfile` -> `pnpm build` -> Verify `dist/` exists.
- Uses concurrency groups to cancel superseded runs.

**`biome.yml`** - Code quality:
- **Triggers**: Push/PR to `main` branch (note: may need updating to `source`).
- **Steps**: Checkout -> Setup Biome -> `biome ci ./src --reporter=github`.

### Deployment Model
1. Developer pushes to `source` branch.
2. GitHub Actions builds the Astro site on `source`.
3. Built `dist/` output is force-pushed to `master` branch.
4. GitHub Pages serves `master` branch at `www.ckotzbauer.de`.
5. Daily cron rebuild ensures future-dated posts go live on schedule.

## Important Conventions

### Code Style (Biome)
- **Indent style**: Tabs (configured in `biome.json`).
- **Quote style**: Double quotes for JavaScript/TypeScript.
- **Linting**: Biome recommended rules plus additional style rules (no parameter assign, self-closing elements, single var declarator, no inferrable types, no useless else).
- **Overrides**: Relaxed rules for `.svelte`, `.astro`, `.vue` files (useConst, useImportType, noUnusedVariables, noUnusedImports are off).

### TypeScript
- Strict mode with `strictNullChecks: true`, `allowJs: false`.
- Path aliases defined: `@components/*`, `@assets/*`, `@constants/*`, `@utils/*`, `@i18n/*`, `@layouts/*`, `@/*`.

### Blog Post Frontmatter
```yaml
---
title: Post Title
published: 2026-02-15T10:00:00Z    # ISO 8601 datetime with timezone
description: "Brief description"
image: ""                           # Optional cover image path
tags: [Tag1, Tag2]                  # Array of tags
category: "Category"                # Single category string
draft: false                        # Set true to hide in production
lang: "en"                          # Optional per-post language
---
```

### Writing Style (from `.claude/WRITING.md`)
- English, professional but not dry, with a slight personal touch.
- Structure: Introduction (problem/context) -> Main body (H2 sections) -> Code examples -> Conclusion (2-3 sentences).
- Patterns: "Let's...", "Given you have...", "And that's it!", "However...".
- No hype, no emojis (except occasional smiley), no clickbait.
- Problem -> Solution -> Example -> Conclusion flow.

### Site Configuration
- All site-wide settings are in `src/config.ts`: title ("Christian Hopf"), subtitle ("Developer Blog"), theme hue (250), navbar links, profile info, license (CC BY-NC-SA 4.0).
- Banner is disabled (`enable: false`).
- TOC is enabled with depth 2.
- Custom domain: `www.ckotzbauer.de` (via `public/CNAME`).

### Content Location
- Blog posts: `src/content/posts/*.md`
- About page: `src/content/spec/about.md`
- LinkedIn posts: `linkedin/*.md` (outside Astro)
- Static assets: `public/` (copied as-is to output)
- Images used in content: `src/assets/images/`
