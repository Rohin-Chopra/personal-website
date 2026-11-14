# Development Guide

This guide will help you set up the development environment for this project.

## Prerequisites

- Node.js (v18 or higher)
- pnpm (v9.5.0 or higher)
- Terraform (for infrastructure changes)
- AWS CLI (for server deployment)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd personal-website
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   # Start web app
   pnpm --filter web dev

   # Or start all apps
   pnpm dev
   ```

## Project Structure

- `apps/web/` - Next.js web application
- `apps/server/` - AWS Lambda serverless functions
- `apps/server/terraform/` - Infrastructure as Code

## Development Scripts

### Root Level

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm lint` - Lint all applications
- `pnpm validate:terraform` - Validate Terraform configuration
- `pnpm format:terraform` - Format Terraform files

### Web App

- `pnpm --filter web dev` - Start Next.js dev server
- `pnpm --filter web test` - Run tests
- `pnpm --filter web test:e2e` - Run E2E tests

### Server

- `pnpm --filter server test` - Run server tests
- `pnpm --filter server validate:terraform` - Validate Terraform

## Local Lambda Development

For local Lambda development, you can use:

1. **AWS SAM CLI** - For full Lambda emulation
2. **LocalStack** - For AWS service emulation (see docker-compose.yml)
3. **Direct testing** - Use Jest tests with mocked AWS SDK

## Terraform

Terraform configuration is in `apps/server/terraform/`.

```bash
# Initialize Terraform
cd apps/server/terraform
terraform init

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply
```

### Contact API protection

The API key in `NEXT_PUBLIC_API_KEY` ships in client JS, so it isn't a secret. The contact API is protected by:

- A hidden honeypot field (`website`); submissions that fill it in are dropped.
- Optional Cloudflare Turnstile: set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in the web app and the `turnstile_secret_key` Terraform variable, and the Lambda rejects submissions without a valid token.
- A WAF rate-based rule per IP (`waf_rate_limit_per_5_minutes`, default 20) and a low usage plan throttle (1 rps, burst 5).
- Emails only ever go to `admin_email`, with the sender as Reply-To. There is no auto-reply to the submitted address.

CloudWatch alarms (Lambda errors/throttles, API 5XX/4XX spikes, SES bounce/complaint rates) and SES bounce/complaint notifications go to an SNS topic emailed to `alarm_email` (defaults to `admin_email`). Confirm the SNS subscription email after the first apply.

## Testing

- Unit tests: `pnpm test`
- E2E tests: `pnpm --filter web test:e2e`
- Coverage: `pnpm --filter web test:coverage`

## Git Hooks

This project uses Husky for git hooks:

- Pre-commit: Runs lint-staged (ESLint + Prettier)
- Commit-msg: Validates commit messages (Conventional Commits)

## VS Code

Recommended extensions are listed in `.vscode/extensions.json`. The workspace includes:

- Prettier configuration
- ESLint configuration
- Debug configurations for Next.js and tests

## Troubleshooting

### Port already in use

If port 3000 is in use, Next.js will automatically use the next available port.

### Dependency issues

Clear node_modules and reinstall:

```bash
rm -rf node_modules apps/*/node_modules
pnpm install
```
