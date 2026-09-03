---
schema_version: 1
id: only-bundles-readme
title: Only Bundles
type: repository-readme
status: active
summary: Development and architecture guide for the Only Bundles Shopify application and static website monorepo.
last_audited: 2026-09-02
owners:
  - engineering
domains:
  - application
systems:
  - repository
source_paths:
  - apps/OnlyBundles-app/
  - apps/OnlyBundles-website/
related_docs:
  - internal docs/index.md
tags:
  - shopify-app
  - bundles
keywords:
  - Only Bundles
  - product bundles
---

# Only Bundles

Only Bundles is the public name of the Shopify application formerly presented
as Wolfpack Product Bundles. It creates full-page build-a-box and product-page
mix-and-match experiences from products already in a merchant's catalog.

- Shopify listing: https://apps.shopify.com/wolfpack-product-bundles-1
- Company product page: https://topnotchhsolutions.com/products/wolfpack
- Developer: Top Notchh Solutions

## Current public product

The public listing, checked on August 31, 2026, describes:

- Full-page and product-page bundle experiences.
- Steps, categories, quantity rules, and live summaries.
- Tiered discounts, gifts, add-ons, upsells, and selling plans.
- Eight responsive templates: four full-page and four product-page layouts.
- Storefront preview and design customization.
- Engagement, order, attributed revenue, and conversion reporting.

Public listing pricing on the same date:

- Free: one public bundle and up to two enabled steps or categories.
- Growth: $19.99/month or $199/year, with a 14-day trial.
- Growth includes unlimited public bundles and steps, all templates, advanced
  design and analytics, and priority support.

The billing constants in `app/constants/plans.ts` and
`app/constants/pricing-data.ts` predate the current listing. Confirm the active
Partner Dashboard billing configuration before changing enforcement or
subscription amounts in code.

## Compatibility identity

The public rebrand does not rename technical contracts used by installed
shops. Keep these stable unless a separately planned migration covers every
producer and consumer:

- Shopify app handle and deployed callback URLs.
- Package and environment names.
- Cart attributes such as `_wolfpackProductBundle:OfferId`.
- Metafield namespaces, storage keys, SDK globals, and pixel identifiers.
- SIT and production configuration filenames.

Changing those values as a text replacement can break carts, checkout
functions, existing bundle data, app authentication, and storefront embeds.

## Architecture

- Remix application for the embedded Shopify admin.
- Prisma with PostgreSQL for app data.
- Shopify Theme App Extensions and storefront widget assets.
- Rust Cart Transform function.
- Shopify Discount Function and Checkout UI extension.
- App proxy, metafield synchronization, web pixel attribution, and webhooks.
- Full-page and product-page storefront runtimes built from `app/assets`.

## Local development

Requirements:

- Node.js 22 through 25.
- npm.
- Shopify CLI and a development store.
- PostgreSQL.
- Rust stable with `wasm32-unknown-unknown` for production function builds.

Install and prepare the repository:

```bash
npm install

# 3. Set up environment variables
cp apps/OnlyBundles-app/.env.example apps/OnlyBundles-app/.env
# Edit apps/OnlyBundles-app/.env with your credentials

# 4. Set up database
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev
```

Run the Shopify development environment:

```bash
npm run dev

# Visit: http://localhost:3000
# Login with your Shopify store
# Click "Create Bundle"
```

### 2. Configure Bundle Steps

```javascript
// Example bundle configuration
{
  "title": "Complete Skincare Set",
  "bundleType": "full_page",
  "steps": [
    {
      "title": "Choose Your Cleanser",
      "minQuantity": 1,
      "maxQuantity": 1,
      "products": ["gid://shopify/ProductVariant/123", ...]
    },
    {
      "title": "Pick a Moisturizer",
      "minQuantity": 1,
      "maxQuantity": 2,
      "products": ["gid://shopify/ProductVariant/456", ...]
    }
  ],
  "pricing": {
    "discountType": "percentage",
    "discountValue": 20,
    "requirementType": "min_products",
    "requirementValue": 3
  }
}
```

### 3. Install Widget on Storefront

**Option A: Automatic (Recommended)**
1. Click "Place Widget Now" in bundle settings
2. Select target product or page
3. Widget automatically injected

**Option B: Manual**
1. Go to Shopify Admin → Themes → Customize
2. Add "Bundle - Full Page" or "Bundle - Product Page" block
3. Configure bundle ID

### 4. Customize Appearance

1. Navigate to "Design Settings"
2. Choose bundle type (Product Page / Full Page)
3. Customize colors, fonts, spacing
4. Click "Save Changes"

---

## ⚙️ How It Works

### System Flow

```
┌─────────────────────────────────────────────────────────┐
│                    MERCHANT ADMIN                        │
│                  (Remix Application)                     │
│                                                          │
│  1. Create bundle configuration                          │
│  2. Select products for each step                        │
│  3. Set pricing rules                                    │
│  4. Customize design                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                      DATABASE                            │
│                   (PostgreSQL)                           │
│                                                          │
│  • Bundle configuration                                  │
│  • Steps and products                                    │
│  • Pricing rules                                         │
│  • Design settings                                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                SHOPIFY METAFIELDS                        │
│                                                          │
│  • Product ← bundle_id (for product-page bundles)       │
│  • Page ← bundle_id (for full-page bundles)             │
│  • Shop ← serverUrl (app URL for API calls)             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              CUSTOMER STOREFRONT                         │
│                                                          │
│  1. Widget loads via Liquid template                    │
│  2. JavaScript fetches bundle data from API              │
│  3. Customer selects products                            │
│  4. Real-time price calculation                          │
│  5. Add to cart with bundle properties                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│                    SHOPIFY CART                          │
│                                                          │
│  Items with properties:                                  │
│  • _bundleId                                             │
│  • _bundleTitle                                          │
│  • _stepTitle                                            │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│              CART TRANSFORM FUNCTION                     │
│              (Shopify Function)                          │
│                                                          │
│  1. Groups items by bundleId                             │
│  2. Fetches pricing configuration                        │
│  3. Calculates discount                                  │
│  4. Applies discount to bundle items                     │
│  5. Returns modified cart                                │
└─────────────────────────────────────────────────────────┘
```

### Key Components

1. **Remix Admin App**
   - Bundle CRUD operations
   - Design control panel
   - Settings management

2. **Bundle Widget** (Storefront)
   - JavaScript-based UI
   - Fetches data via App Proxy
   - Handles product selection
   - Calculates pricing in real-time

3. **Cart Transform Function**
   - Rust/TypeScript function
   - Runs on Shopify's infrastructure
   - Applies discounts at checkout
   - Validates bundle requirements

4. **Database** (PostgreSQL)
   - Stores bundle configurations
   - Manages design settings
   - Tracks webhooks and subscriptions

---

## 🛠️ Technology Stack

### Frontend
- **Remix** - Full-stack web framework
- **React 18** - UI library
- **Shopify Polaris** - Design system
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool

### Backend
- **Node.js 22** - JavaScript runtime
- **Prisma** - Database ORM
- **PostgreSQL** - Relational database
- **Express** - HTTP server

### Shopify Integration
- **Shopify Admin API** - GraphQL API
- **Shopify Functions** - Cart transform
- **App Proxy** - Storefront API
- **Theme App Extensions** - Widget blocks

### Infrastructure
- **Render.com** - Cloud hosting
- **Google Cloud Pub/Sub** - Webhook processing
- **GitHub Actions** - CI/CD

---

## 🏗️ Architecture

### Application Structure

```
Only-Bundles/
├── apps/
│   ├── OnlyBundles-app/          # Shopify Remix application workspace
│   │   ├── app/                  # Admin routes, services, and storefront sources
│   │   ├── extensions/           # Shopify extensions and Functions
│   │   ├── prisma/               # Schema and migrations
│   │   ├── scripts/              # App build and operational tooling
│   │   ├── tests/                # Unit, integration, and E2E tests
│   │   └── test-spec/            # TDD specifications
│   └── OnlyBundles-website/      # Pre-rendered Astro website workspace
├── docs/                         # Project documentation and records
├── internal docs/                # Authoritative architecture and operations vault
├── marketing/                    # Listing and marketing artifacts
├── graphify-out/                 # Generated knowledge graph
├── package.json                  # npm workspace commands
├── package-lock.json             # Single dependency lockfile
├── prisma.config.ts              # Root Prisma schema discovery
└── Dockerfile                    # Render build from repository root
```

### Database Schema

```prisma
model Shop {
  id          String   @id @default(cuid())
  shopDomain  String   @unique
  accessToken String
  bundles     Bundle[]
}

model Bundle {
  id          String        @id @default(cuid())
  title       String
  status      BundleStatus  @default(draft)
  bundleType  BundleType
  steps       BundleStep[]
  pricing     BundlePricing?
  shopDomain  String
  shop        Shop          @relation(fields: [shopDomain])
}

model BundleStep {
  id           String         @id @default(cuid())
  title        String
  description  String?
  minQuantity  Int            @default(1)
  maxQuantity  Int?
  position     Int
  products     StepProduct[]
  bundleId     String
  bundle       Bundle         @relation(fields: [bundleId])
}

// ... see schema.prisma for complete models
```

---

## 🔧 Configuration

### Environment Variables

```bash
# Shopify App Credentials
SHOPIFY_API_KEY=your_app_client_id
SHOPIFY_API_SECRET=your_app_client_secret
SHOPIFY_APP_URL=https://your-app.onrender.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/database
DIRECT_URL=postgresql://user:pass@host:5432/database

# API Scopes
SCOPES=read_products,write_products,write_cart_transforms,read_orders

# Session
SESSION_SECRET=your_random_secret_key

# Google Cloud (for webhooks)
GOOGLE_CLOUD_PROJECT=your-project-id
PUBSUB_SUBSCRIPTION=your-subscription-name
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

See [.env.example](.env.example) for complete list.

### App Configuration

**Shopify Partner Dashboard:**
1. App URL: `https://your-app.onrender.com`
2. Allowed redirection URL: `https://your-app.onrender.com/auth/callback`
3. App proxy:
   - Subpath prefix: `apps`
   - Subpath: `product-bundles`
   - Proxy URL: `https://your-app.onrender.com`

---

## 💻 Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma migrate dev

# Seed sample data
npx prisma db seed

# Start SIT dev server
npm run dev:sit
```

`npm run dev:sit` delegates to `apps/OnlyBundles-app` and starts `shopify app dev --config shopify.app.wolfpack-product-bundles-sit.toml`. Configure Save, Sync Product, Sync Bundle, and Preview publish storefront data synchronously; no local storefront-sync queue is required for those flows.

### Development Workflow

```bash
npm run typecheck
npm run lint
npm test
npm run build

# Verify the static website workspace
npm run website:verify

# Verify both workspaces
npm run verify:all

# Deploy Shopify extensions
npm run deploy:sit
npm run deploy:prod
```

Build individual storefront surfaces:

```bash
npm run build:widgets:full-page
npm run build:widgets:product-page
npm run build:sdk
```

## Deployment

Production deployment builds the Rust Cart Transform function, deploys the
Shopify app configuration, and runs the general synchronization task:

```bash
# Commit changes
git add .
git commit -m "Your changes"
git push origin main

# Render dashboard → Manual Deploy
```

### Deploy Shopify Extensions

```bash
# Deploy with the guarded root scripts only
npm run deploy:sit
npm run deploy:prod
```

### Post-Deployment Checklist

- [ ] Verify app is running: Visit app URL
- [ ] Test admin dashboard: Create/edit bundle
- [ ] Test widget on storefront
- [ ] Test cart transform at checkout
- [ ] Check error logs in Render dashboard
- [ ] Verify webhooks are processing

---

## 📚 API Reference

### Widget API Endpoints

**Get Bundle Data**
```
GET /apps/product-bundles/api/bundle-data/:shopDomain?bundleId={id}

Response:
{
  "bundle": {
    "id": "bundle-123",
    "title": "Complete Set",
    "steps": [...],
    "pricing": {...}
  }
}
```

**Get Design Settings**
```
GET /apps/product-bundles/api/design-settings/:shopDomain?bundleType=full_page

Response: CSS file with design variables
```

### GraphQL Mutations

**Create Bundle**
```graphql
mutation CreateBundle($input: BundleInput!) {
  createBundle(input: $input) {
    id
    title
    status
  }
}
```

**Update Bundle**
```graphql
mutation UpdateBundle($id: ID!, $input: BundleInput!) {
  updateBundle(id: $id, input: $input) {
    id
    title
    status
  }
}
```

Review `shopify.app.toml`, database migrations, webhook configuration, and
Partner Dashboard billing before deploying. Do not rename legacy handles,
URLs, or cart contracts as part of a display-name change.

## Repository map

- `app/routes`: embedded admin routes and API endpoints.
- `app/assets`: storefront runtimes and shared bundle behavior.
- `app/services`: Shopify, billing, sync, analytics, and bundle services.
- `app/i18n/locales`: merchant-facing translations.
- `extensions`: Shopify Functions and checkout/theme extensions.
- `prisma`: database schema and migrations.
- `scripts`: build, deployment, synchronization, and audit utilities.
- `tests`: unit, integration, and end-to-end test harnesses.

## Rebrand rule

Merchant-visible copy uses **Only Bundles**. Legacy `wolfpack` identifiers are
technical compatibility values, not public branding.
