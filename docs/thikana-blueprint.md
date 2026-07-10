# Thikana — Project Blueprint

Kolkata's own hyperlocal marketplace. Working name "Thikana" (ঠিকানা — Bengali for "address/place"), change freely.

---

## 1. The core idea

A structured classifieds marketplace for Kolkata that borrows the best of three things people already use and fixes what's broken in each:

| Existing option | What's broken | What Thikana does instead |
|---|---|---|
| OLX / Quikr | Generic, national, pay-to-be-seen, phone number exposed | Free to list, no forced payment for visibility |
| Facebook/WhatsApp groups | Hyperlocal and trusted, but posts vanish, no search | Structured, searchable, permanent listings |
| 99acres / Sulekha etc. | Corporate, broker-heavy, expensive | Direct seller-to-buyer, no middleman fees |

**Non-negotiable constraint:** delivery is never handled by Thikana itself. Sellers arrange delivery themselves (WhatsApp coordination) or optionally book through an integrated third-party delivery aggregator later. Thikana never becomes a logistics company.

---

## 2. Lesson from PV Platform (why this build stays lean)

PV Platform failed under its own architecture — a 15+ app monorepo, shared design system, custom auth service, AI Router pattern, CLI tooling, before a single app was fully working. Thikana deliberately avoids all of that:

- **Two repos, not a monorepo.** No shared packages, no Lerna/Turborepo.
- **One Express backend**, not services-per-feature.
- **Config-driven categories**, not code-per-category.
- **Manual delivery by default**, third-party API only once volume justifies the business-account onboarding.
- Every feature below is scoped to "basic but functional" first. Depth gets added only once the shallow version is live and being used.

---

## 3. Repo structure & deployment

```
thikana-backend/     → Render (Express API)
thikana-frontend/    → Vercel (buyer + seller, role-aware, one app)
thikana-admin/       → Vercel (separate deployment, admin.thikana.in)
```

- **DB:** MongoDB Atlas (free tier to start)
- **Images:** Cloudinary (unsigned direct upload from frontend — never touches Render's ephemeral disk)
- **Auth:** JWT, phone or email/password to start; OTP later if sellers ask for it
- **AI:** Gemini free API (see §7) — kept off the critical path so listing creation never blocks on it

---

## 4. Data models (four core collections)

```
User      { name, email/phone, passwordHash, role: [buyer|seller|admin],
            verified, banned, storeName, storeSlug, avatar, bio, location }

Category  { name, slug, subcategories: [{ name, slug, attrs: [...] }], isActive }
          — admin-managed via UI, not a hardcoded config file

Listing   { sellerId, category, subcategory, title, description, price,
            images[], attributes: {}, status: [pending|active|rejected|sold],
            featured, location: { area, lat, lng } }

Report    { targetType: [listing|user], targetId, reason, status }
```

Phase 2 addition (delivery, not needed for MVP):
```
DeliveryBooking { listingId, sellerId, buyerId, pickupAddress, dropAddress,
                  provider, providerBookingId, status, cost }
```

One `Listing` collection serves all 8 categories — the `attributes` object plus the `Category` config decide which fields render per subcategory. No schema-per-category.

---

## 5. The 8 launch categories

Real Estate · Jobs & Opportunities · Buy & Sell · Business Services · Construction · Vehicles · Education · Community

Each has subcategories and attribute sets defined in the `Category` collection (admin-editable). Full breakdown already scoped in earlier planning — not repeated here, lives in the admin Categories page once built.

**Seeding priority:** Buy & Sell + Business Services first (your own network — DigiTech Champions clients, Kolkata dev/marketing contacts, Instagram sellers). Other categories switch on via config once there's traction, no redeploy needed.

---

## 6. The three surfaces

### Buyer/Seller app (thikana.in)
- Marketplace homepage: search, area selector, category rail, fresh listings, popular sellers
- Individual seller storefront (`/store/:slug`) — public, shareable, no login required to view. This is the "Instagram bio link" page.
- Seller dashboard (logged in): add/edit/delete listings, view storefront stats
- Buyer account: saved listings, message history reference (contact stays WhatsApp-based)

### Admin panel (admin.thikana.in) — separate deployment
| Page | MVP scope |
|---|---|
| Dashboard | Counts: listings, pending approval, users, active categories |
| Listings | Approve / Reject / Feature / Delete, filter by status |
| Users | Verify / Ban / Unban, filter by role |
| Categories | Add/Edit/Delete categories & subcategories, attribute lists |

Single admin login for now — no roles-within-admin, no audit log yet.

### Backend API (Render)
Versioned, role-protected, reusable by any future app — see §8.

---

## 7. AI features (Gemini free API) — ranked by value

1. **Photo → auto-filled listing** (title, description, suggested category) — highest leverage, removes the biggest friction point for casual sellers
2. **Pre-moderation flagging** — scam patterns, inappropriate images, duplicates flagged before admin review
3. **Natural-language search parsing** — "2BHK near Salt Lake under 20k" → structured filters
4. **Bengali ↔ English translation** on listings
5. **Smart attribute extraction from images** (size, BHK, storage, etc.)

Constraint to respect: Gemini free tier has real rate limits — AI calls are async/best-effort, never block core actions like saving a listing.

---

## 8. Backend API design (so it connects to anything later)

- **Versioned routes:** `/api/v1/...` — never breaks old clients when v2 ships
- **Consistent response envelope:** `{ success, data }` or `{ success, error: { code, message } }`
- **Two auth types:** JWT for real users, scoped API keys for machine-to-machine callers (future apps, integrations)
- **CORS allowlist:** explicit origins only, one line added per new frontend
- **Webhooks:** fire events (`listing.approved`, etc.) so future integrations react instead of polling
- **Rate limiting:** protects the server and, critically, the Gemini free quota
- **API documented** (OpenAPI/Swagger) as routes are built, not after

---

## 9. Browser/device permissions — ask in context, never on load

| Permission | Used for | Ask when |
|---|---|---|
| Geolocation | Auto-detect area | User taps "use my location" |
| Camera | Listing photos | User taps "Add photo" (offer gallery too) |
| Push notifications | New message / listing activity | After first listing goes live |
| Web Share API | Share listing/storefront link | Every listing/storefront share button |
| Clipboard | Copy storefront link | Seller dashboard |

**Compliance note:** DPDP Act 2023 applies — need a basic privacy policy, consent before storing location, and a data-deletion path before real launch.

---

## 10. Delivery (phase 2, not launch)

- Default: manual, seller-arranged, coordinated over WhatsApp
- Later: optional "Book delivery" button via an aggregator (Shiprocket Quick or ClickPost recommended over direct Porter integration — one API, multiple carrier fallback)
- Requires business KYC/GST onboarding before any API key is issued — cannot be part of day-one launch
- Admin gets a Delivery Settings + Delivery Bookings page once this ships; no fleet/rider management is ever built in-house

---

## 11. Revenue model

- Freemium subscription for sellers (free tier + paid tier for unlimited listings, no branding, analytics)
- Featured/boosted listings (pay for 7-day top placement)
- Real estate & business categories priced higher (higher-value transactions)
- Your own marketing agency services (DigiTech Champions) listed as a Business Services offering — reuses the platform, no new build

---

## 12. Build order (MVP)

1. Auth + `User` model → test in Postman
2. `Category` model + admin CRUD → seed 2–3 categories manually
3. `Listing` model + seller "post a listing" flow (config-driven fields)
4. Buyer-facing browse/filter page
5. Admin Listings + Users pages (approve, verify, ban)
6. Seller storefront page (public, shareable)
7. AI-assisted listing creation (Gemini photo → auto-fill)
8. Permissions layer (geolocation, share, notifications) + PWA install

Delivery API integration, advanced admin (roles, audit log, analytics charts), and additional categories all come after step 8, once real usage exists to justify them.

---

## 13. Already built (prototypes, sample data)

- Landing page with WhatsApp waitlist capture
- Buyer marketplace homepage mockup
- Individual seller storefront mockup

All three use the same design tokens (navy/taxi-yellow/brick-red/tram-green, Fraunces + IBM Plex) for brand consistency once real data replaces the placeholders.
