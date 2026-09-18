# Cleopatra Beauty

Cleopatra Beauty is a modern, multilingual beauty-commerce storefront built with Next.js and TypeScript. The application combines a polished shopping experience with a Supabase-powered product catalog, customer and order data, admin tools, Stripe payments, analytics, and live translation support.

> **Project status:** Active development. The catalog currently includes soap products, with additional categories prepared for future expansion.

## Features

- Responsive storefront built with the Next.js App Router
- Product catalog with categories, product detail pages, imagery, ingredients, usage instructions, stock status, and pricing
- Shopping cart, wishlist, checkout, and order processing flows
- Stripe payment integration with webhook support
- Supabase integration for products, categories, customers, orders, order items, analytics, newsletter signups, translations, and admin access
- Supabase Row Level Security policies for public storefront data and protected administrative data
- Admin area for managing products and orders
- Admin authentication backed by Supabase Auth
- Multilingual content with local translations and a provider fallback chain
- Optional self-hosted LibreTranslate service through Docker Compose
- Product analytics for views, add-to-cart events, and purchases
- Smooth motion and scrolling interactions using Framer Motion and Lenis
- Optimized image delivery using AVIF and WebP formats
- TypeScript, ESLint, Tailwind CSS, and modern React/Next.js tooling

## Technology stack

- **Framework:** Next.js 16 with the App Router
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4, Lucide React
- **Animation and scrolling:** Framer Motion, Lenis
- **State management:** Zustand
- **Backend and authentication:** Supabase, Supabase Auth, Supabase SSR
- **Payments:** Stripe
- **Translation:** LibreTranslate, Azure Translator, or Google Cloud Translation
- **Runtime:** Node.js

## Getting started

### Prerequisites

Install the following before running the project locally:

- Node.js 20.9 or newer
- npm
- A Supabase project
- A Stripe account for payment functionality

### 1. Clone the repository

```bash
git clone https://github.com/ibraheem9900/cleopatra-beauty-web.git
cd cleopatra-beauty-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in the values for the services you want to use:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public Supabase client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server/scripts only | Privileged Supabase operations |
| `ADMIN_EMAIL` | For admin setup | Admin account email |
| `ADMIN_PASSWORD` | For admin setup | Admin account password |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For payments | Stripe publishable key |
| `STRIPE_SECRET_KEY` | For payments | Server-side Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Secret for `/api/webhooks/stripe` |
| `LIBRETRANSLATE_URL` | Optional | LibreTranslate instance URL; defaults to `http://localhost:5000` |
| `AZURE_TRANSLATOR_KEY` | Optional | Azure Translator API key |
| `AZURE_TRANSLATOR_REGION` | Optional | Azure Translator region |
| `AZURE_TRANSLATOR_ENDPOINT` | Optional | Azure Translator endpoint |
| `GOOGLE_TRANSLATE_API_KEY` | Optional | Google Cloud Translation API key |

Never commit `.env.local`, service-role keys, Stripe secret keys, webhook secrets, or other credentials. `SUPABASE_SERVICE_ROLE_KEY` must only be used in trusted server-side code and local administration scripts.

### 4. Apply the Supabase schema

The database schema is stored in [`supabase/schema.sql`](./supabase/schema.sql). You can run it in the Supabase Dashboard under **SQL Editor → New query**.

Alternatively, use the included Management API script after adding a Supabase access token:

```bash
SUPABASE_ACCESS_TOKEN=sbp_... node scripts/apply-schema.mjs
```

The schema creates the catalog, customer, order, analytics, newsletter, translation, and admin tables, enables Row Level Security, and configures the relevant policies.

### 5. Seed the catalog

After the schema has been applied, seed the initial categories and products:

```bash
node scripts/seed.mjs
```

The seed script reads `.env.local` and is idempotent, so it can safely be run again to upsert the initial data.

### 6. Create the admin account

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`, then run:

```bash
npm run setup-admin
```

The script creates or finds the Supabase Auth user and grants access through the `admin_users` table. Administrators can sign in through the admin login route.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server after building |
| `npm run lint` | Run ESLint |
| `npm run setup-admin` | Create or configure the Supabase admin account |
| `node scripts/apply-schema.mjs` | Apply `supabase/schema.sql` through the Supabase Management API |
| `node scripts/seed.mjs` | Seed the initial catalog data |

## Translation service

The application supports a provider fallback strategy. Configure providers in the following order depending on your deployment needs:

1. **LibreTranslate** — optional self-hosted service; free and suitable for local development
2. **Azure Translator** — optional managed provider
3. **Google Cloud Translation** — optional fallback provider

To run the included LibreTranslate service locally:

```bash
cd translator
docker compose up -d
```

Then make sure `LIBRETRANSLATE_URL` points to the running service. If no translation provider is configured, the application can continue using its bundled translation resources where supported.

## Stripe configuration

For local payment development:

1. Create Stripe API keys in the Stripe Dashboard.
2. Add the publishable and secret keys to `.env.local`.
3. Configure a webhook endpoint for `/api/webhooks/stripe`.
4. Store the webhook signing secret as `STRIPE_WEBHOOK_SECRET`.
5. Use Stripe test mode until the complete checkout and fulfillment flow has been verified.

Do not expose `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` to client-side code.

## Project structure

```text
.
├── public/                 # Static assets and product images
├── scripts/                # Database, seed, and admin setup scripts
├── src/
│   ├── app/                # App Router pages, layouts, and API routes
│   ├── components/         # Reusable UI components
│   ├── data/               # Local application data
│   ├── lib/                # Supabase, Stripe, i18n, analytics, stores, and utilities
│   └── middleware.ts       # Request middleware and session handling
├── supabase/
│   └── schema.sql          # Database schema and Row Level Security policies
├── translator/
│   └── docker-compose.yml  # Optional local LibreTranslate service
├── .env.example            # Environment variable template
├── next.config.ts          # Next.js image optimization configuration
└── package.json             # Scripts and dependencies
```

## Main routes

The storefront includes routes for:

- `/` — home page
- `/catalog` — product catalog
- `/product/[slug]` — product details
- `/cart` — shopping cart
- `/wishlist` — saved products
- `/checkout` — checkout flow
- `/about` — company information
- `/shipping-returns` — shipping and returns information
- `/impressum` — legal notice
- `/datenschutz` — privacy information
- `/agb` — terms and conditions
- `/admin` — protected administration area

API routes are located under `src/app/api`, including the Stripe webhook endpoint.

## Database and security

The Supabase schema enables Row Level Security across the application tables. In general:

- Active products and categories can be read by storefront visitors.
- Orders, customers, order items, and administrative data are restricted to admins.
- Analytics and newsletter records can be submitted publicly but are readable only by admins.
- Admin access is determined by membership in `public.admin_users`.
- The service-role key bypasses normal Row Level Security and must never be shipped to the browser.

Review and adapt the policies in `supabase/schema.sql` before using the application in production, especially if you add new routes, roles, or write operations.

## Production deployment

The project can be deployed to a Next.js-compatible host such as Vercel:

1. Create or connect a Supabase production project.
2. Apply the schema and seed production data.
3. Configure production environment variables in the hosting provider.
4. Configure the Stripe webhook using the deployed API URL.
5. Set the production domain and verify authentication redirects, checkout, webhooks, and admin access.
6. Build and start the application:

   ```bash
   npm run build
   npm run start
   ```

Before launch, verify that all secret variables are stored as server-side secrets, Stripe is using the intended mode, database policies are correct, and webhook events are being received successfully.

## Development guidelines

- Use TypeScript for application code.
- Keep secrets in environment variables and never commit them.
- Run `npm run lint` before opening a pull request.
- Update the Supabase schema and seed data together when changing the data model.
- Preserve accessible labels, responsive layouts, and keyboard-friendly interactions when changing UI components.
- Test payment and webhook changes with Stripe test mode first.

## Contributing

Contributions are welcome. To propose a change:

1. Create a feature branch from the default branch.
2. Make the change and add or update documentation where appropriate.
3. Run `npm run lint` and `npm run build` locally.
4. Open a pull request with a clear description of the problem and solution.

## License

No license file is currently included in this repository. Until a license is added, the project should be treated as **all rights reserved**. Add a `LICENSE` file before distributing or reusing the code publicly.

## Links

- [Repository](https://github.com/ibraheem9900/cleopatra-beauty-web)
- [Next.js documentation](https://nextjs.org/docs)
- [Supabase documentation](https://supabase.com/docs)
- [Stripe documentation](https://docs.stripe.com/)
