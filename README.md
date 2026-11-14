# rohinchopra.com

Source for [rohinchopra.com](https://www.rohinchopra.com): my portfolio, projects and technical blog, plus the serverless contact API behind it.

[![CI / Deploy](https://github.com/Rohin-Chopra/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/Rohin-Chopra/personal-website/actions/workflows/ci.yml)

## Stack

| Part                     | Tech                                                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Web (`apps/web`)         | [TanStack Start](https://tanstack.com/start) (React 19, Vite 8), fully prerendered. Tailwind CSS 4, MDX with Shiki highlighting         |
| Contact API (`apps/api`) | Go on AWS Lambda (`provided.al2023`, arm64) behind API Gateway with an API key, a WAF rate limit and SES for email                      |
| Infra (`infra`)          | [Pulumi](https://www.pulumi.com) (TypeScript): S3 + CloudFront + ACM + Route 53 for the site, API Gateway + Lambda + SES + WAF + alarms |
| CI/CD                    | GitHub Actions with AWS OIDC (no stored credentials): checks and `pulumi preview` on PRs, deploy on `main`                              |
| Tooling                  | pnpm workspaces, Turborepo, ESLint, Prettier, Vitest, Playwright, golangci-lint, Husky, commitlint                                      |

## How it works

```
browser ──▶ CloudFront ──(OAC)──▶ S3: prerendered HTML, hashed assets, OG images
              │  viewer-request function: apex → www, /path → /path/index.html
              └─ response headers policy: CSP, HSTS, frame/referrer/permissions

contact form ──▶ api.rohinchopra.com (API Gateway, API key, WAF) ──▶ Go Lambda ──▶ SES ──▶ inbox
```

- **Every page is static.** `vite build` prerenders each route (crawling links from `/`), plus `/feed.xml`, `/sitemap.xml` and `/404.html`. The postbuild step renders Open Graph images with Satori and adds a per-page `<meta>` CSP that allows only that page's inline scripts by hash.
- **Posts are MDX in `apps/web/posts`.** A Vite plugin validates their frontmatter and exposes metadata as `virtual:posts`; each post body is compiled at build time into its own chunk.
- **Blog and project filters live in the URL** (`/blogs?tag=AWS`, `/projects?q=go`) through TanStack Router's typed search params.

## Repository layout

```
apps/
  web/            TanStack Start site
    src/routes/   file-based routes
    posts/        blog posts (.mdx)
    plugins/      Vite plugins (posts index, image sizes)
    scripts/      postbuild (OG images, CSP hashes) and the local CloudFront-like server
    e2e/          Playwright specs
  api/            Go contact Lambda (cmd/contact, internal/contact)
infra/
  app/            Pulumi stack `production`: site + contact API
  github/         Pulumi stack `main`: GitHub Actions OIDC roles (applied by hand)
.github/workflows/ci.yml   checks, preview and deploy
```

## Getting started

Requirements: Node 26 (`.nvmrc`), pnpm 10 (`corepack enable`), Go 1.27 for the API, and the Pulumi CLI plus AWS credentials for infrastructure work.

```bash
pnpm install
pnpm --filter web dev        # http://localhost:3000
```

The site works without the contact API. To point the form at one, copy `apps/web/.env.example` to `apps/web/.env.local`.

## Scripts

| Command                                      | What it does                                                                       |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm --filter web dev`                      | Dev server with HMR                                                                |
| `pnpm --filter web build`                    | Prerendered production build in `apps/web/dist/client`                             |
| `pnpm --filter web preview`                  | Serves the build the way CloudFront does (clean URLs, 404s, headers)               |
| `pnpm --filter web test`                     | Vitest unit tests                                                                  |
| `pnpm --filter web test:e2e`                 | Playwright against the build (build with `VITE_API_URL=http://localhost:4173/api`) |
| `pnpm --filter api test`                     | Go tests with the race detector                                                    |
| `pnpm --filter api build`                    | Lambda binary in `apps/api/dist/bootstrap` (linux/arm64)                           |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Everything, through Turborepo                                                      |

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

Put images under `apps/web/public/` and reference them by absolute path. Their dimensions are read at build time (`?w=`/`?h=` on the src override them). Run `SHOW_DRAFTS=true pnpm --filter web build` to include drafts in a production build. Posts can use `<BlogAlert>`, `<AlertTitle>` and `<BlogAlertDescription>`.

## Deployment

Pushing to `main` runs the checks, then the `deploy` job (GitHub environment `Production`):

1. builds the Go Lambda and runs `pulumi up` on `infra/app` (stack `production`)
2. builds the site with the API URL and key from the stack outputs
3. syncs it to S3 (immutable cache headers on hashed assets, revalidating HTML), invalidates CloudFront and smoke-tests the live site

Pulumi state is in `s3://personal-website-pulumi-state-677065002466`, and secrets are encrypted with the KMS key `alias/personal-website-pulumi`. Pull requests run `pulumi preview` with a read-only role.

### Pulumi config (`infra/app`)

| Key                           | Default                    | Notes                                                                |
| ----------------------------- | -------------------------- | -------------------------------------------------------------------- |
| `adminEmail` (secret)         | required with the API on   | Where contact form submissions are sent                              |
| `contactApiEnabled`           | `false`                    | Creates the contact API on `api.<domain>`                            |
| `noReplyEmail`                | `no-reply@rohinchopra.com` | SES-verified sender                                                  |
| `alarmEmail` (secret)         | `adminEmail`               | SNS email for alarms and SES bounces; confirm after the first deploy |
| `turnstileSecretKey` (secret) | unset                      | Enables Cloudflare Turnstile; pair with `VITE_TURNSTILE_SITE_KEY`    |
| `wafRateLimitPer5Minutes`     | `20`                       | Per-IP limit before WAF blocks                                       |

### Contact API protection

The API key ships in client JS, so it isn't a secret. The API is protected by a hidden honeypot field, optional Turnstile, a per-IP WAF rate rule, a low usage-plan throttle (1 rps, burst 5, 1000/day), and by only ever emailing the site owner (with the sender as Reply-To). CloudWatch alarms cover Lambda errors and throttles, API 5XX and 4XX spikes, and SES bounce and complaint rates.
