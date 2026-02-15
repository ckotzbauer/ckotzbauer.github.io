# Christian Hopf - Personal Website & Blog

A personal website and blog built with [Astro](https://astro.build) and the [Fuwari](https://github.com/saicaca/fuwari) theme.

## 🚀 Features

- **Blog** - Markdown-based blog posts with syntax highlighting
- **About Page** - Personal profile, skills, and open source projects
- **Future Post Scheduling** - Posts with future publication dates are automatically hidden until published
- **LinkedIn Integration** - Schedule and auto-publish LinkedIn posts via webhook
- **Responsive Design** - Mobile-friendly with dark mode support
- **Full-text Search** - Powered by Pagefind

## 📁 Project Structure

```
├── .github/
│   └── workflows/        # GitHub Actions workflows
├── linkedin/             # LinkedIn posts (not part of Astro)
├── public/               # Static assets
│   └── CNAME             # Custom domain
├── scripts/
│   └── publish-linkedin.mjs  # LinkedIn publishing script
├── src/
│   ├── assets/images/    # Images used in the site
│   ├── config.ts         # Site configuration
│   ├── content/
│   │   ├── config.ts     # Content schema
│   │   ├── posts/        # Blog posts (Markdown)
│   │   └── spec/         # Special pages (About)
│   └── ...
└── package.json
```

## 🛠️ Development

### Prerequisites

- Node.js 22+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📝 Content Management

### Blog Posts

Create new posts in `src/content/posts/`:

```markdown
---
title: My Blog Post
published: 2026-03-15T10:00:00Z
description: "A brief description"
image: ""
tags: [Tag1, Tag2]
category: "Category"
draft: false
---

Post content here...
```

**Note:** Posts with `published` dates in the future are automatically hidden in production builds.

### LinkedIn Posts

Create LinkedIn posts in `linkedin/`:

```markdown
---
title: LinkedIn Post Title
pubDate: 2026-03-01T09:00:00Z
published: false
---

Post content here...
```

- `pubDate`: When to publish the post
- `published`: Set to `true` after successful publishing

## 🚢 Deployment

The site is automatically deployed via GitHub Actions:

- **Push to `source` branch** → Triggers build and deploy to `master` branch
- **Daily schedule (06:00 UTC)** → Checks for scheduled LinkedIn posts, publishes them, then builds and deploys

### Required Secrets

- `LINKEDIN_WEBHOOK_URL` - Webhook URL for LinkedIn publishing (e.g., Zapier, Buffer, Make.com)

## 🌐 Custom Domain

The site is configured for `www.ckotzbauer.de` via the `public/CNAME` file.

## 📄 License

Blog-Posts are licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/), code-snippets within the posts are licensed as [MIT](https://mit-license.org).
