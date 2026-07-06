# Employee Portal Redesign — Design

**Date:** 2026-07-06
**Scope:** Apply the existing Supreme International design system to the entire employee portal (13 pages + header), reworking layouts where it improves clarity. Restyle the shared `CartView`.

## Problem

The design system is already extracted and documented in `design-system/DESIGN-SYSTEM.md` and implemented in the marketing pages (`app/page.tsx`) and shared `ProductCard.tsx`: deep indigo + living teal, frosted glass over soft light, Plus Jakarta Sans / JetBrains Mono, tokens registered in Tailwind v4 `@theme` (`app/globals.css`).

The **employee portal is the one part that ignores it.** `EmployeeHeader.tsx` and every `app/employee/**/page.tsx` use generic `bg-zinc-50`, `text-blue-600`, `bg-white border-gray-200`, `bg-blue-600`, `text-green-600`, `bg-yellow-100`, etc. — no brand tokens, no glass, no brand fonts. It looks like a different product.

## Goal

Bring the employee portal fully onto the brand system and rework its layouts to match the polish of the rest of the app. This is **utility application, not a token/CSS refactor** — the `@theme` tokens (`text-ink`, `bg-indigo`, `text-accent`, `border-line`, `font-display`, `font-jbmono`, `animate-*`) already exist globally.

## Target design language (from DESIGN-SYSTEM.md)

- **Colors:** ink `#16173a`, indigo `#2a2b6a` → indigo2 `#3a3c98`, accent/teal `#149b8e` → accent2 `#13b89f`, slate `#5b5d7a`, muted `#9295b6`, line `#e6e7f2`, page bg `#eef0f8`.
- **Status:** success `#1a8f5a` (text) / `rgba(31,170,107,.12)` (bg), warning `#b5801e` / `rgba(224,163,59,.14)`, error `#e0524d`, indigo info `rgba(42,43,106,.1)`.
- **Glass panel:** `bg-white/60 border border-white/85 backdrop-blur-[14px] backdrop-saturate-150 shadow-[0_12px_44px_rgba(34,36,90,.08)]`.
- **Fonts:** `font-display` (Plus Jakarta Sans), `font-jbmono` (JetBrains Mono) — already exposed app-wide via root layout CSS vars.
- **Eyebrow:** `font-jbmono text-[11px] uppercase tracking-[.14em] text-accent`.
- **Primary button:** `bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] text-white rounded-[13px] shadow-[0_8px_22px_rgba(42,43,106,.3)]`.
- **Input:** `bg-white/65 border border-line rounded-[13px] px-3.5 py-3 text-ink placeholder:text-muted focus:border-indigo`.
- **Radii:** button 12–14px, card 16–22px, panel 24–30px, pill 999px.

## Shared module — `components/employee/ui.ts`

A single small module exporting className **string constants** (not components) reused across all pages, so the glass/input/button strings aren't pasted 13×:

```ts
export const glass = 'bg-white/60 border border-white/85 backdrop-blur-[14px] backdrop-saturate-150 shadow-[0_12px_44px_rgba(34,36,90,.08)]';
export const primaryBtn = 'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] text-white font-semibold rounded-[13px] shadow-[0_8px_22px_rgba(42,43,106,.3)] transition-shadow hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50';
export const input = 'w-full bg-white/65 border border-line rounded-[13px] px-3.5 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-indigo transition-colors';
export const eyebrow = 'font-jbmono text-[11px] uppercase tracking-[.14em] text-accent';
export const pageWrap = 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-display';
```

`// ponytail: plain string constants, not components — upgrade to components only if logic (not just classes) starts repeating.`

## Per-surface changes

### 1. `components/employee/EmployeeHeader.tsx`
Glass sticky nav: `sticky top-0 z-50` + glass surface + `border-b border-line`. Wordmark in `text-ink font-display font-extrabold`, hover `text-indigo`. Nav links `text-slate hover:text-ink hover:bg-[rgba(42,43,106,.07)]`. Wallet as teal-accent pill (`bg-[rgba(23,155,142,.12)] text-accent border border-[rgba(23,155,142,.25)]`). Cart via existing on-brand `CartBadge` (unchanged). Logout as ghost button (`text-slate hover:text-ink`).

### 2. `app/employee/page.tsx` (dashboard)
- Page bg `#eef0f8`, `font-display`.
- Greeting → glass hero card with eyebrow "EMPLOYEE PORTAL", `text-ink` heading, `text-slate` subtitle.
- Quick-link cards → glass cards; emoji replaced with teal icon tiles (`bg-[rgba(23,155,142,.12)] text-accent rounded-[13px]`); title `text-ink group-hover:text-indigo`.
- Recently-viewed section: eyebrow + heading; grid keeps on-brand `ProductCard` (unchanged); skeletons and empty-state restyled to glass + brand link.

### 3. `app/employee/products/page.tsx`
Search/filter chrome → brand `input`, eyebrow section label, brand pill chips for any filters. Product grid already uses `ProductCard`. Loading/empty states → glass + brand.

### 4. `app/employee/products/[slug]/page.tsx`
Product detail → glass gallery/info panels, `text-ink` title, mono category eyebrow, `₹` price weight-800, MOQ/stock pill badges from DS, add-to-cart uses `primaryBtn` with the "Added ✓ → teal" swap idiom from `app/page.tsx`.

### 5. Cart — `app/employee/cart/page.tsx` + shared `components/CartView.tsx`
- Wrapper empty/loading/error states → glass + brand (indigo primary button, `text-slate`).
- **`CartView` (shared, ~28 off-brand classes):** restyle to brand — glass line-item rows, `border-line` dividers, `text-ink`/`text-slate` text, coupon input via `input`, totals panel as glass, checkout button as `primaryBtn`. **Blast radius:** also restyles the public `/cart` (approved) — both carts become consistent.

### 6. `app/employee/checkout/page.tsx`
Glass form panels for shipping address, brand `input` fields, glass order-summary card, wallet balance shown as teal pill, error banner uses DS error tokens (`bg-[rgba(224,82,77,.1)] text-[#e0524d] border`), pay button `primaryBtn`. Razorpay logic untouched.

### 7. Orders — `app/employee/orders/page.tsx` + `[orderId]/page.tsx`
- List: glass container, rows `hover:bg-[rgba(42,43,106,.04)]`, order id in `font-jbmono`, pagination buttons as brand secondary/outline.
- **`StatusBadge` remap to DS palette:** pending → warning, confirmed/processing → indigo info, shipped → accent/teal, delivered → success, cancelled → error, refunded → muted/line. All pill + `font-jbmono` uppercase.
- Detail: glass panels, simple vertical status timeline using accent/line, line-item list, billing summary card.

### 8. `app/employee/wallet/page.tsx`
- Balance hero → **indigo gradient** `bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)]` (currently wrong `blue-600→blue-800`), eyebrow label, large `font-display` balance.
- Ledger → glass table, `border-line` dividers, header row `text-muted font-jbmono uppercase`, +/− amounts use DS success (`#1a8f5a`) / error (`#e0524d`) text.

### 9. Auth pages ×4 — `login`, `activate`, `forgot-password`, `reset-password`
Centered glass card over a **light ambient mesh** background (approved): a subtle version of the DESIGN-SYSTEM mesh (`radial-gradient` layers over `linear-gradient(180deg,#eceefb,#f4f1f8,#e9f1f3)`), no animated blobs (keeps it calm). Card: glass panel, `text-ink` heading, `text-slate` subtitle, brand `input` fields, `primaryBtn` submit, teal (`text-accent`) links. Error banners use DS error tokens.

## Deliberately NOT doing (YAGNI)

- No ambient mesh or floating/blob animations on signed-in data pages — flat `#eef0f8` reads better for dense data and stays fast. Ambient mesh only on the 4 auth pages.
- No component-library extraction or design-token refactor — tokens already exist; this is utility application plus one string-constants module.
- No changes to data hooks, API calls, auth guard logic, or Razorpay integration — presentation only.
- No changes to other portals beyond the shared `CartView` (explicitly approved).

## Testing / verification

- Existing Jest tests must still pass (`npm test`) — changes are className/markup only, no logic.
- Manual: run `npm run dev`, walk each employee route (login → dashboard → products → detail → cart → checkout → orders → order detail → wallet) and confirm brand tokens render (indigo/teal/glass, brand fonts) with no generic gray/blue leftovers.
- Grep gate after implementation: `grep -rE 'bg-blue-|text-blue-|bg-gray-|bg-zinc-|text-green-[0-9]|bg-yellow-' app/employee components/employee components/CartView.tsx` should return nothing (allowing intentional DS status hex/rgba).
- After code changes: run `graphify update .` per project rule.

## Constraints (project rules)

- **Tailwind only** — no plain CSS stylesheets, no inline `style={{}}` (except the auth mesh, which may use a single `style` for the layered `background` gradient since it has no Tailwind utility form — mirrors how `@keyframes`/gradients are handled in the system). Confirm during implementation whether an arbitrary-value utility (`bg-[radial-gradient(...)]`) suffices instead.
- This is **Next.js 16.2.9 with breaking changes** — read `node_modules/next/dist/docs/` before writing code (per `AGENTS.md`).
