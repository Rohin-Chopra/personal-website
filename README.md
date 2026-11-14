# rohinchopra.com

Source for [rohinchopra.com](https://www.rohinchopra.com): my portfolio, projects and technical blog, plus the serverless contact API behind it.

[![CI](https://github.com/Rohin-Chopra/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/Rohin-Chopra/personal-website/actions/workflows/ci.yml)

## Stack

| Part                                     | Tech                                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Web (`apps/web`)                         | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, MDX via `next-mdx-remote`, deployed on Vercel |
| Contact API (`apps/server`)              | AWS Lambda (TypeScript, bundled with esbuild), API Gateway, SES, WAF, CloudWatch alarms                    |
| Infrastructure (`apps/server/terraform`) | Terraform (AWS `ap-southeast-2`, ACM in `us-east-1`)                                                       |
| Tooling                                  | pnpm workspaces, Turborepo, ESLint, Prettier, Jest, Playwright, Husky, commitlint                          |

## Repository layout

```
apps/
  web/                Next.js site
    app/              routes, components and lib code
    posts/            blog posts (.mdx)
    e2e/              Playwright specs
  server/             contact Lambda
    src/              handler + tests
    terraform/        API Gateway, Lambda, SES, WAF, alarms
.github/workflows/    CI (lint, typecheck, test, build, e2e) and Terraform checks
```

## Getting started

Requirements: Node 26 (`.nvmrc`) and pnpm 10 (`corepack enable` picks up the version pinned in `package.json`).

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local   # contact API URL/key, optional Turnstile site key
pnpm --filter web dev                           # http://localhost:3000
```

The site works without the contact API. Only the contact form needs `NEXT_PUBLIC_API_URI`.

## Scripts

Run these from the repo root. Turborepo runs them in every package that defines them.

| Command                                             | What it does                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------ |
| `pnpm dev`                                          | Start dev servers                                                        |
| `pnpm lint`                                         | ESLint (web + server)                                                    |
| `pnpm typecheck`                                    | `tsc --noEmit`                                                           |
| `pnpm test`                                         | Jest unit tests                                                          |
| `pnpm build`                                        | Production build                                                         |
| `pnpm --filter web test:e2e`                        | Playwright e2e (starts the dev server, or `next start` when `CI` is set) |
| `pnpm format:terraform` / `pnpm validate:terraform` | Terraform fmt check / validate                                           |

Git hooks: pre-commit runs lint-staged, commit-msg enforces [Conventional Commits](https://www.conventionalcommits.org/), and pre-push runs lint and typecheck.

## Writing a blog post

Add `apps/web/posts/<slug>.mdx`. The build checks the frontmatter and fails on invalid fields:

```yaml
---
title: Autoscaling ECS workloads with event-driven SQS metrics
description: One-line summary used for listings, RSS and SEO
slug: ecs-sqs-autoscaling # lowercase kebab-case, unique
createdAt: 2024-04-12 # ISO date
updatedAt: 2024-05-01 # optional
tags: [AWS, ECS, Terraform]
draft: false # optional; drafts only show in dev
---
```

Put images under `apps/web/public/` and reference them by absolute path (`/my-image.png`). Their dimensions are read at build time. To preview drafts in a production build, run `SHOW_DRAFTS=true pnpm build`.

## Deployment

- **Web:** Vercel builds and deploys `apps/web` from `main`. Pull requests get preview deployments.
- **Contact API:** `apps/server/deploy.sh` bundles the handler with esbuild and runs `terraform apply`. See [DEVELOPMENT.md](DEVELOPMENT.md#terraform) for the Terraform variables and how the API is protected from abuse.

## More

- [DEVELOPMENT.md](DEVELOPMENT.md): detailed local setup, Terraform and troubleshooting
- [Issues](https://github.com/Rohin-Chopra/personal-website/issues): roadmap and bugs
