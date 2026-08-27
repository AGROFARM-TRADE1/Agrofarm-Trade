# Agrofarm-Trade

A GitHub-ready Next.js frontend and Express/Prisma API scaffold for the Agrofarm-Trade platform. The project includes the animated opening splash using the supplied logo, landing page, authentication, wallet/deposit/withdrawal workflows, products/investments, referrals, tasks, news, customer care, KYC document upload, and a protected multi-section admin control center.

> **Financial-product notice:** this code is a technical implementation scaffold, not legal, financial, tax, payment-provider, or regulatory advice. Before accepting real customer money or publishing returns, obtain the required professional/regulatory review and use only payment capabilities you are authorized to use. Do not describe calculated or target returns as guaranteed unless they are legally and operationally guaranteed.

## Repository layout

- `web/` — Next.js static frontend for GitHub Pages.
- `api/` — Express API + Prisma/PostgreSQL backend.
- `.github/workflows/deploy-pages.yml` — GitHub Pages frontend deployment.

## Admin dashboard

The admin UI at `/admin` contains: overview, user search/status/plan management, KYC review, product creation and activation, deposit review, withdrawal completion/rejection, investment history, task creation/activation, task-claim approval, news publishing, customer-care ticket responses, transaction ledger, and server-side platform settings. All admin API routes require a valid JWT for a user with the `ADMIN` role.

## Local setup

### Frontend

```bash
cd web
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `web/.env.local` to your API URL.

### API

```bash
cd api
npm install
npx prisma generate
npx prisma db push
npm run smoke
npm start
```

The smoke test is dependency-light and checks required files, admin UI/API wiring, environment-file protection, and JavaScript syntax. A full production build still requires installing the declared frontend/backend dependencies and a reachable PostgreSQL database.

For a real production database, use a reviewed Prisma migration process rather than treating `db push` as your long-term migration strategy.

## Admin seed

Set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in the API environment before running the seed. Never use the example password in production. The seed file creates an admin account and the initial agricultural product catalogue.

## Secrets

Never commit these values: database URL/passwords, JWT signing secrets, Gmail App Passwords, payment API keys/secrets, or production private keys. Keep only empty placeholders in `api/.env.example` and `web/.env.example`.

For a backend host, add them as protected environment variables. If a GitHub Action needs a secret for deployment, add it under the repository's **Settings → Secrets and variables → Actions** and reference it from the workflow. Do not put secrets in frontend `NEXT_PUBLIC_*` variables; anything with that prefix is intentionally exposed to the browser.

## GitHub Pages

Push the repository to GitHub, then enable **Settings → Pages → Build and deployment → Source: GitHub Actions**. The included workflow builds the static Next.js export. Set the repository variable `NEXT_PUBLIC_API_URL` to the public API base URL. GitHub Pages does not run the Express server or PostgreSQL database.

## Production file uploads

The API currently stores uploaded receipts/documents/product images in `api/uploads/` for development. A production deployment should use persistent object storage and private/signed access for sensitive KYC documents instead of relying on an ephemeral local filesystem.
