# Thikana — Kolkata's Own Marketplace

MERN stack monorepo (three separate deployable apps, no shared packages — kept intentionally simple).

## Structure

```
thikana-backend/     Express + MongoDB API        → deploy to Render
thikana-frontend/    Buyer + seller React app      → deploy to Vercel
thikana-admin/       Admin panel React app         → deploy to Vercel (separate project/subdomain)
```

## 1. Backend setup

```bash
cd thikana-backend
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, Cloudinary keys, Gemini key
npm install
npm run seed               # seeds all 8 categories + subcategories
npm run create-admin "Your Name" your@email.com yourPassword123
npm run dev                 # runs on http://localhost:5000
```

You need, before this works:
- A free **MongoDB Atlas** cluster → connection string goes in `MONGO_URI`
- A free **Cloudinary** account → cloud name / API key / API secret for image uploads
- A **Gemini API key** (you already have one) → for the AI-assisted listing draft feature
- A random long string for `JWT_SECRET` (any password generator works)

## 2. Frontend setup (buyer + seller app)

```bash
cd thikana-frontend
cp .env.example .env       # set VITE_API_URL to your backend URL
npm install
npm run dev                 # runs on http://localhost:5173
```

## 3. Admin setup

```bash
cd thikana-admin
cp .env.example .env       # set VITE_API_URL to your backend URL
npm install
npm run dev                 # runs on http://localhost:5174
```

Log in with the email/password you created via `npm run create-admin`.

## 4. Deployment

**Backend → Render**
- New Web Service, connect the `thikana-backend` folder/repo
- Build command: `npm install`
- Start command: `npm start`
- Add all `.env` variables in Render's dashboard
- After first deploy, run `npm run seed` and `npm run create-admin` once (Render Shell, or run locally against the production `MONGO_URI`)

**Frontend → Vercel**
- New Project, root directory `thikana-frontend`
- Framework preset: Vite
- Add `VITE_API_URL` env var pointing to your Render backend URL

**Admin → Vercel (separate project)**
- New Project, root directory `thikana-admin`
- Same as above, ideally deployed to a separate subdomain like `admin.yourdomain.com`
- Add `VITE_API_URL` env var

Update the backend's `FRONTEND_URL` and `ADMIN_URL` env vars to match your real deployed URLs — this is what the CORS allowlist uses.

## What's built (MVP)

- Auth: register, login, JWT, become-a-seller flow
- 8 categories + subcategories, seeded and admin-editable
- Listings: create (pending → admin review), browse/search/filter, individual detail page
- Seller storefront: public page at `/store/:slug`, shareable as an Instagram bio link
- Admin panel: dashboard stats, listing moderation (approve/reject/feature/delete), user management (verify/ban), category management
- AI-assisted listing creation via Gemini (photo → auto title/description) — optional, never blocks manual posting
- Image upload via Cloudinary
- Versioned API (`/api/v1`), consistent response envelope, rate limiting, CORS allowlist — built to support future apps (mobile, WhatsApp bot, etc.) without rework

## What's intentionally NOT built yet (see thikana-blueprint.md)

- Delivery API integration (Porter/Shiprocket) — needs business KYC onboarding first
- PWA / installability
- Push notifications, geolocation "near me"
- Bengali translation, natural-language search
- Payment processing (this platform never handles money — WhatsApp handoff by design)

## Design system

Navy (#10192E) background, taxi-yellow (#F5B700) primary accent, brick-red (#C24A3D) and tram-green (#3C8562) secondary accents. Fraunces (display serif) + IBM Plex Sans (body) + IBM Plex Mono (labels). All three apps share these CSS variables in their `global.css` for visual consistency.
