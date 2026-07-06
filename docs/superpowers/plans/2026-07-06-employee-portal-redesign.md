# Employee Portal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the existing Supreme International indigo/teal/glass design system to all 13 employee-portal pages + header (and the shared `CartView`), reworking layouts to match the rest of the app.

**Architecture:** Presentation-only. The design tokens already live in Tailwind v4 `@theme` (`app/globals.css`) and brand fonts are exposed app-wide via the root layout. This work applies utilities/markup — it does NOT change data hooks, the auth guard, Razorpay, or any API call. One small shared module (`components/employee/ui.ts`) holds reused className string constants.

**Tech Stack:** Next.js 16.2.9 (App Router, breaking changes — read `node_modules/next/dist/docs/` before writing code), React 19, Tailwind CSS v4, TanStack Query, Jest.

## Global Constraints

- **Tailwind only.** No plain-CSS stylesheets, no inline `style={{}}` — EXCEPT the auth-page mesh background may use one inline `style` for the layered `background` gradient if no arbitrary-value utility (`bg-[radial-gradient(...)]`) works (verbatim from spec; try the utility first). Only raw CSS permitted globally is `@keyframes` + the `@theme` block.
- **Next.js 16.2.9 has breaking changes** — consult `node_modules/next/dist/docs/` before writing any code (per `client/AGENTS.md`).
- **Do not change** data-fetching hooks, `EmployeeGuard` logic, Razorpay integration, API signatures, or component props/exports. Markup + className only.
- **Brand tokens (copy verbatim):** ink `#16173a`, indigo `#2a2b6a`, indigo2 `#3a3c98`, accent `#149b8e`, accent2 `#13b89f`, slate `#5b5d7a`, muted `#9295b6`, line `#e6e7f2`, page bg `#eef0f8`. Status: success `#1a8f5a`, warning `#b5801e`, error `#e0524d`. These have Tailwind utilities (`text-ink`, `bg-indigo`, `text-accent`, `border-line`, …) via `@theme`; use hex/rgba arbitrary values only for status colors and gradients.
- **Per-task done bar:** `npm test` still passes + the task's grep gate returns nothing + the touched route renders in `npm run dev`.

---

## File Structure

- **Create:** `components/employee/ui.ts` — shared className string constants.
- **Modify:** `components/employee/EmployeeHeader.tsx`, all `app/employee/**/page.tsx` (13 files), `components/CartView.tsx` (shared with public `/cart`).
- **Untouched:** `app/employee/layout.tsx` (guard logic — but may swap page bg wrapper), `components/CartBadge.tsx` (already on-brand), `components/ProductCard.tsx` (already on-brand), all `lib/**`.

Reference implementations to mirror: `app/page.tsx` (idioms: `eyebrow`, `AddButton` "Added ✓" swap, gradient CTA), `components/ProductCard.tsx` (glass card), `components/CartBadge.tsx`, `design-system/DESIGN-SYSTEM.md`.

---

### Task 1: Shared UI constants module

**Files:**
- Create: `components/employee/ui.ts`

**Interfaces:**
- Produces: `glass`, `primaryBtn`, `secondaryBtn`, `input`, `label`, `eyebrow`, `pageWrap`, `errorBanner` (all `string` exports), and `statusPill(status: string): string`.

- [ ] **Step 1: Create the module with exact content**

```ts
// Shared className constants for the employee portal (design-system utilities).
// ponytail: plain strings, not components — upgrade to components only if
// logic (not just classes) starts repeating.

export const glass =
  'bg-white/60 border border-white/85 backdrop-blur-[14px] backdrop-saturate-150 shadow-[0_12px_44px_rgba(34,36,90,.08)]';

export const primaryBtn =
  'bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] text-white font-semibold rounded-[13px] shadow-[0_8px_22px_rgba(42,43,106,.3)] transition-shadow hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50 disabled:cursor-not-allowed';

export const secondaryBtn =
  'bg-white/60 text-indigo border border-white/85 font-semibold rounded-[13px] backdrop-blur-[8px] transition-colors hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed';

export const input =
  'w-full bg-white/65 border border-line rounded-[13px] px-3.5 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-indigo transition-colors';

export const label = 'block text-sm font-medium text-slate mb-1.5';

export const eyebrow =
  'font-jbmono text-[11px] uppercase tracking-[.14em] text-accent';

export const pageWrap =
  'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-display';

export const errorBanner =
  'p-3 rounded-[13px] bg-[rgba(224,82,77,.1)] border border-[rgba(224,82,77,.3)] text-[#e0524d] text-sm';

// Pill classes per order/wallet status, mapped to DS status palette.
const STATUS_PILL: Record<string, string> = {
  pending:    'bg-[rgba(224,163,59,.14)] text-[#b5801e] border border-[rgba(224,163,59,.3)]',
  confirmed:  'bg-[rgba(42,43,106,.1)] text-indigo border border-[rgba(42,43,106,.2)]',
  processing: 'bg-[rgba(42,43,106,.1)] text-indigo border border-[rgba(42,43,106,.2)]',
  shipped:    'bg-[rgba(23,155,142,.12)] text-accent border border-[rgba(23,155,142,.25)]',
  delivered:  'bg-[rgba(31,170,107,.12)] text-[#1a8f5a] border border-[rgba(31,170,107,.25)]',
  cancelled:  'bg-[rgba(224,82,77,.1)] text-[#e0524d] border border-[rgba(224,82,77,.3)]',
  refunded:   'bg-white/60 text-muted border border-line',
};

export function statusPill(status: string): string {
  const base =
    'inline-flex items-center rounded-full px-2.5 py-0.5 font-jbmono text-[10px] uppercase tracking-[.08em] font-medium capitalize';
  return `${base} ${STATUS_PILL[status] ?? STATUS_PILL.refunded}`;
}
```

- [ ] **Step 2: Verify it compiles (type-check the module)**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors introduced by `components/employee/ui.ts`.

- [ ] **Step 3: Commit**

```bash
git add components/employee/ui.ts
git commit -m "feat(employee): add shared design-system className constants"
```

---

### Task 2: EmployeeHeader → glass nav

**Files:**
- Modify: `components/employee/EmployeeHeader.tsx`

**Interfaces:**
- Consumes: `glass` from `components/employee/ui.ts`. Keeps existing `CartBadge`, `useEmployeeAuth`, `useEmployeeCart`, `useWallet`, `handleLogout` — no logic change.

- [ ] **Step 1: Replace the returned JSX** (imports + handlers unchanged; add `import { glass } from '@/components/employee/ui';`)

```tsx
  return (
    <header className={`sticky top-0 z-50 border-b border-line ${glass} font-display`}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link
          href="/employee"
          className="text-lg font-extrabold tracking-[-.01em] text-ink no-underline transition-colors hover:text-indigo"
        >
          Supreme International <span className="text-muted font-semibold">— Employee Portal</span>
        </Link>
        <nav className="flex items-center gap-2">
          {isLoggedIn && (
            <>
              <Link
                href="/employee/products"
                className="rounded-xl px-3 py-[9px] text-sm font-medium text-slate no-underline transition-colors hover:bg-[rgba(42,43,106,.07)] hover:text-ink"
              >
                Products
              </Link>
              <Link
                href="/employee/orders"
                className="rounded-xl px-3 py-[9px] text-sm font-medium text-slate no-underline transition-colors hover:bg-[rgba(42,43,106,.07)] hover:text-ink"
              >
                Orders
              </Link>
              {walletData && (
                <Link
                  href="/employee/wallet"
                  className="rounded-full border border-[rgba(23,155,142,.25)] bg-[rgba(23,155,142,.12)] px-3 py-[7px] font-jbmono text-sm font-semibold text-accent no-underline transition-colors hover:bg-[rgba(23,155,142,.2)]"
                >
                  ₹{walletData.balance.toLocaleString('en-IN')}
                </Link>
              )}
              <CartBadge count={cartData?.itemCount ?? 0} href="/employee/cart" />
              <button
                onClick={handleLogout}
                className="rounded-xl px-3 py-[9px] text-sm font-medium text-slate transition-colors hover:bg-[rgba(42,43,106,.07)] hover:text-ink"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
```

> Note: adds an "Orders" nav link (previously only reachable indirectly) — small UX win while restyling.

- [ ] **Step 2: Grep gate**

Run: `grep -nE 'bg-white\b|border-gray|text-gray|hover:text-blue|bg-gray|shadow-sm' components/employee/EmployeeHeader.tsx`
Expected: no matches.

- [ ] **Step 3: Tests + render**

Run: `npm test` → Expected: PASS (unchanged).
Run `npm run dev`, load `/employee`, confirm glass header, brand fonts, teal wallet pill.

- [ ] **Step 4: Commit**

```bash
git add components/employee/EmployeeHeader.tsx
git commit -m "feat(employee): glass brand header"
```

---

### Task 3: Dashboard → glass hero + quick links

**Files:**
- Modify: `app/employee/page.tsx`

**Interfaces:**
- Consumes: `glass`, `eyebrow`, `pageWrap` from ui. Keeps `useEmployeeAuth`, `useRecentlyViewed`, `ProductCard`, greeting-decode logic unchanged.

- [ ] **Step 1: Replace the returned JSX** (add `import { glass, eyebrow, pageWrap } from '@/components/employee/ui';`; keep the greeting logic block above `return`)

```tsx
  return (
    <div className="min-h-screen bg-[#eef0f8]">
      <div className={`${pageWrap} space-y-10`}>
        {/* Greeting hero */}
        <section className={`${glass} rounded-[24px] p-8`}>
          <p className={`${eyebrow} mb-2`}>EMPLOYEE PORTAL</p>
          <h1 className="text-3xl font-extrabold tracking-[-.02em] text-ink">{greeting}</h1>
          <p className="mt-2 text-[15px] text-slate">
            Browse curated products and manage your wallet.
          </p>
        </section>

        {/* Quick links */}
        <section className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { href: '/employee/products', icon: '🛍️', title: 'Browse Catalog', sub: 'Explore curated products' },
            { href: '/employee/wallet', icon: '💳', title: 'My Wallet', sub: 'View balance & transactions' },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`group flex items-center gap-4 rounded-[20px] p-5 no-underline transition-shadow hover:shadow-[0_16px_44px_rgba(34,36,90,.16)] ${glass}`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[13px] bg-[rgba(23,155,142,.12)] text-2xl">
                {c.icon}
              </span>
              <div>
                <p className="font-semibold text-ink transition-colors group-hover:text-indigo">{c.title}</p>
                <p className="text-xs text-muted">{c.sub}</p>
              </div>
            </Link>
          ))}
        </section>

        {/* Recently Viewed */}
        <section>
          <p className={`${eyebrow} mb-1`}>PICK UP WHERE YOU LEFT OFF</p>
          <h2 className="mb-4 text-xl font-extrabold tracking-[-.02em] text-ink">Recently Viewed</h2>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`h-56 animate-pulse rounded-[20px] ${glass}`} />
              ))}
            </div>
          ) : recentProducts.length === 0 ? (
            <div className={`rounded-[20px] border-dashed py-10 text-center ${glass}`}>
              <p className="text-sm text-slate">Browse the catalog to get started</p>
              <Link
                href="/employee/products"
                className="mt-3 inline-block text-sm font-semibold text-accent hover:underline"
              >
                Go to catalog →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {recentProducts.slice(0, 10).map((product) => (
                <ProductCard key={product._id} product={product} hrefBase="/employee/products" />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
```

- [ ] **Step 2: Grep gate**

Run: `grep -nE 'bg-zinc|text-zinc|text-blue|border-zinc|bg-white\b(?! )' app/employee/page.tsx`
Expected: no matches (glass/brand only).

- [ ] **Step 3: Tests + render** — `npm test` PASS; `npm run dev` → `/employee` shows glass hero + quick-link cards with teal icon tiles.

- [ ] **Step 4: Commit**

```bash
git add app/employee/page.tsx
git commit -m "feat(employee): brand dashboard layout"
```

---

### Task 4: Products list chrome

**Files:**
- Modify: `app/employee/products/page.tsx`

**Interfaces:**
- Consumes: `glass`, `input`, `eyebrow`, `pageWrap` from ui. Grid keeps `ProductCard`. No data/filter-logic change.

- [ ] **Step 1: Read the file, then restyle chrome only.** Apply these mappings across the file (leave all hooks, state, handlers, and the `ProductCard` grid intact):

| Old classes | New classes |
|---|---|
| page wrapper (`bg-zinc-50` / `max-w-7xl …`) | `min-h-screen bg-[#eef0f8]` outer + `${pageWrap}` inner |
| page `<h1>` | `text-2xl font-extrabold tracking-[-.02em] text-ink` (precede with `<p className={eyebrow}>CATALOG</p>`) |
| search/filter `<input>` / `<select>` | `${input}` |
| filter chips / pills | `rounded-full border border-line bg-white/60 px-3 py-1 font-jbmono text-[11px] uppercase tracking-[.08em] text-slate` (active: `bg-[rgba(42,43,106,.1)] text-indigo border-[rgba(42,43,106,.2)]`) |
| any `text-gray-*` labels | `text-slate` (body) / `text-muted` (meta) |
| loading skeleton blocks | `${glass} rounded-[20px] animate-pulse` |
| pagination buttons | primary → `import { primaryBtn }`; neutral → `import { secondaryBtn }` |

- [ ] **Step 2: Grep gate**

Run: `grep -nE 'bg-zinc|text-zinc|text-blue|bg-blue|border-gray|text-gray|bg-gray' app/employee/products/page.tsx`
Expected: no matches.

- [ ] **Step 3: Tests + render** — `npm test` PASS; `/employee/products` shows brand chrome + `ProductCard` grid; search/filter still work.

- [ ] **Step 4: Commit**

```bash
git add app/employee/products/page.tsx
git commit -m "feat(employee): brand products list chrome"
```

---

### Task 5: Product detail

**Files:**
- Modify: `app/employee/products/[slug]/page.tsx`

**Interfaces:**
- Consumes: `glass`, `primaryBtn`, `eyebrow`, `pageWrap` from ui. No data-fetch change.

- [ ] **Step 1: Read the file, then apply mappings** (structure stays; only surfaces change):

| Element | New treatment |
|---|---|
| page wrapper | `min-h-screen bg-[#eef0f8]` + `${pageWrap}` |
| image gallery panel | `${glass} rounded-[22px] p-3.5`; image `rounded-[14px] bg-[#eef0f8] aspect-square object-cover` |
| category label | `${eyebrow}` |
| product title | `text-2xl font-extrabold tracking-[-.02em] text-ink` |
| price | `text-2xl font-extrabold text-ink`; caption "tentative price" → `font-jbmono text-[10px] text-muted` |
| MOQ / stock badges | MOQ: `bg-[rgba(23,155,142,.12)] text-accent border border-[rgba(23,155,142,.25)]`; in-stock: `bg-[rgba(31,170,107,.12)] text-[#1a8f5a] border border-[rgba(31,170,107,.25)]` — pill + `font-jbmono text-[11px]` |
| description panel | `${glass} rounded-[20px] p-6`, body `text-slate leading-[1.6]` |
| add-to-cart button | `${primaryBtn} w-full py-3`; on success swap label to `Added ✓` with `bg-accent` for ~1.1s (mirror `AddButton` in `app/page.tsx`) |
| any `text-gray-*` | `text-slate` / `text-muted` |

- [ ] **Step 2: Grep gate**

Run: `grep -nE 'bg-zinc|text-blue|bg-blue|border-gray|text-gray|bg-gray|text-green-[0-9]' app/employee/products/[slug]/page.tsx`
Expected: no matches.

- [ ] **Step 3: Tests + render** — `npm test` PASS; `/employee/products/<slug>` shows glass panels; add-to-cart still adds + shows "Added ✓".

- [ ] **Step 4: Commit**

```bash
git add "app/employee/products/[slug]/page.tsx"
git commit -m "feat(employee): brand product detail"
```

---

### Task 6: Shared CartView + employee cart wrapper

**Files:**
- Modify: `components/CartView.tsx` (shared — also affects public `/cart`)
- Modify: `app/employee/cart/page.tsx`

**Interfaces:**
- Consumes: `glass`, `primaryBtn`, `secondaryBtn`, `input`, `pageWrap` from ui. Props/exports of `CartView` unchanged.

- [ ] **Step 1: Restyle `app/employee/cart/page.tsx`** — replace loading/error/empty markup (add `import { glass, primaryBtn, pageWrap } from '@/components/employee/ui';`):

```tsx
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef0f8]">
        <p className="font-display text-slate">Loading cart…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef0f8]">
        <p className="font-display text-[#e0524d]">Failed to load cart. Please try again.</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#eef0f8] font-display">
        <h1 className="text-2xl font-extrabold tracking-[-.02em] text-ink">Your cart is empty</h1>
        <p className="text-slate">Browse our catalog to add items.</p>
        <Link href="/employee/products" className={`${primaryBtn} px-6 py-2.5`}>
          Browse Products
        </Link>
      </div>
    );
  }
```

(The `CartView` render line stays unchanged.)

- [ ] **Step 2: Read `components/CartView.tsx`, then apply mappings** (28 off-brand classes → brand). Do NOT change logic/props/state:

| Element | New treatment |
|---|---|
| root container | `font-display` |
| line-item rows | `${glass} rounded-[16px] p-4` per row (or glass container with `divide-line`) |
| item title | `text-ink font-semibold`; meta | `text-muted font-jbmono text-[11px]` |
| price / totals text | `text-ink` (emphasis `font-extrabold`) |
| dividers / borders | `border-line` |
| qty steppers | `${secondaryBtn} h-8 w-8` |
| remove / clear buttons | `text-slate hover:text-[#e0524d]` |
| coupon `<input>` | `${input}` |
| apply-coupon button | `${secondaryBtn} px-4` |
| coupon error text | `text-[#e0524d] text-sm` |
| totals summary panel | `${glass} rounded-[20px] p-6` |
| checkout button | `${primaryBtn} w-full py-3` |
| all `bg-blue-*` / `text-blue-*` / `text-gray-*` / `bg-gray-*` / `text-green-*` / `text-red-*` | brand/status equivalents above |

- [ ] **Step 3: Grep gate (both files)**

Run: `grep -nE 'bg-blue-|text-blue-|bg-gray-|text-gray-|text-green-[0-9]|text-red-[0-9]|border-gray' components/CartView.tsx app/employee/cart/page.tsx`
Expected: no matches.

- [ ] **Step 4: Tests + render** — `npm test` PASS. Load BOTH `/employee/cart` AND `/cart`; confirm both on-brand and qty/coupon/checkout still work.

- [ ] **Step 5: Commit**

```bash
git add components/CartView.tsx app/employee/cart/page.tsx
git commit -m "feat(cart): brand shared CartView + employee cart wrapper"
```

---

### Task 7: Checkout

**Files:**
- Modify: `app/employee/checkout/page.tsx`

**Interfaces:**
- Consumes: `glass`, `primaryBtn`, `input`, `label`, `eyebrow`, `pageWrap`, `errorBanner` from ui. Razorpay + checkout/verify hooks unchanged.

- [ ] **Step 1: Read the file, then apply mappings** (address form + summary; logic untouched):

| Element | New treatment |
|---|---|
| page wrapper | `min-h-screen bg-[#eef0f8]` + `${pageWrap}` |
| page heading | precede with `<p className={eyebrow}>CHECKOUT</p>`; `text-2xl font-extrabold tracking-[-.02em] text-ink` |
| shipping-address card | `${glass} rounded-[22px] p-6` |
| each field `<label>` | `${label}` |
| each `<input>` | `${input}` |
| wallet balance callout | teal pill: `bg-[rgba(23,155,142,.12)] text-accent border border-[rgba(23,155,142,.25)] rounded-full px-3 py-1 font-jbmono text-sm` |
| coupon input + apply | `${input}` + `${secondaryBtn}` (import it) |
| order-summary card | `${glass} rounded-[20px] p-6`; totals `text-ink`, labels `text-slate` |
| error message | `${errorBanner}` |
| pay/place-order button | `${primaryBtn} w-full py-3` |
| any `text-gray-*` / `bg-blue-*` / `border-gray-*` | `text-slate`/`text-muted` / brand |

- [ ] **Step 2: Grep gate**

Run: `grep -nE 'bg-blue-|text-blue-|bg-gray-|text-gray-|border-gray|bg-zinc' app/employee/checkout/page.tsx`
Expected: no matches.

- [ ] **Step 3: Tests + render** — `npm test` PASS; `/employee/checkout` (with items in cart) shows glass form; Razorpay flow still triggers (test mode) and validation still fires.

- [ ] **Step 4: Commit**

```bash
git add app/employee/checkout/page.tsx
git commit -m "feat(employee): brand checkout"
```

---

### Task 8: Orders list + StatusBadge

**Files:**
- Modify: `app/employee/orders/page.tsx`

**Interfaces:**
- Consumes: `glass`, `secondaryBtn`, `eyebrow`, `pageWrap`, `statusPill` from ui. `useOrders` unchanged.

- [ ] **Step 1: Replace `StatusBadge`** with the shared helper:

```tsx
import { statusPill } from '@/components/employee/ui';

function StatusBadge({ status }: { status: string }) {
  return <span className={statusPill(status)}>{status}</span>;
}
```

- [ ] **Step 2: Restyle the page body** (add ui imports; keep pagination + `useOrders` logic):

| Element | New treatment |
|---|---|
| page wrapper | `min-h-screen bg-[#eef0f8]` + `${pageWrap} space-y-6` (max-w-3xl inner) |
| heading | `<p className={eyebrow}>YOUR ORDERS</p>` + `text-2xl font-extrabold tracking-[-.02em] text-ink` |
| orders container | `${glass} rounded-[20px] overflow-hidden divide-y divide-line` |
| `OrderRow` hover | `hover:bg-[rgba(42,43,106,.04)]`; order id `font-jbmono text-ink`; date `text-muted`; total `text-ink font-semibold`; chevron `text-muted` |
| empty state card | `${glass} rounded-[20px] p-10 text-center`; button → `import { primaryBtn }` |
| pagination buttons | `${secondaryBtn} px-4 py-2 text-sm`; page label `text-slate` |
| loading/error text | `text-slate` / `text-[#e0524d]` |

- [ ] **Step 3: Grep gate**

Run: `grep -nE 'bg-blue-|text-blue-|bg-yellow-|bg-green-|bg-purple-|bg-red-|text-gray-|bg-gray-|text-yellow-|text-green-[0-9]' app/employee/orders/page.tsx`
Expected: no matches (old StatusBadge color map removed).

- [ ] **Step 4: Tests + render** — `npm test` PASS; `/employee/orders` shows glass rows + DS status pills; pagination works.

- [ ] **Step 5: Commit**

```bash
git add app/employee/orders/page.tsx
git commit -m "feat(employee): brand orders list + status pills"
```

---

### Task 9: Order detail

**Files:**
- Modify: `app/employee/orders/[orderId]/page.tsx`

**Interfaces:**
- Consumes: `glass`, `eyebrow`, `pageWrap`, `statusPill` from ui.

- [ ] **Step 1: Read the file, then apply mappings** + add a simple status timeline:

| Element | New treatment |
|---|---|
| page wrapper | `min-h-screen bg-[#eef0f8]` + `${pageWrap}` |
| order id / heading | `font-jbmono text-ink` id; eyebrow "ORDER" |
| status badge | `statusPill(order.status)` |
| status timeline | vertical steps (pending→confirmed→shipped→delivered): completed dot `bg-accent`, pending dot `bg-line`, connector `border-line`, labels `font-jbmono text-[11px] uppercase text-slate` |
| items panel | `${glass} rounded-[20px] p-6`, `divide-line` rows |
| billing/summary panel | `${glass} rounded-[20px] p-6`; totals `text-ink`, labels `text-slate` |
| shipping address block | `${glass} rounded-[20px] p-6`, `text-slate` |
| any `text-gray-*` / `bg-*-100` status colors | `text-slate`/`text-muted` / DS status |

- [ ] **Step 2: Grep gate**

Run: `grep -nE 'bg-blue-|text-blue-|bg-yellow-|bg-green-|bg-purple-|text-gray-|bg-gray-|bg-zinc' "app/employee/orders/[orderId]/page.tsx"`
Expected: no matches.

- [ ] **Step 3: Tests + render** — `npm test` PASS; open an order detail; timeline + glass panels render.

- [ ] **Step 4: Commit**

```bash
git add "app/employee/orders/[orderId]/page.tsx"
git commit -m "feat(employee): brand order detail + status timeline"
```

---

### Task 10: Wallet

**Files:**
- Modify: `app/employee/wallet/page.tsx`

**Interfaces:**
- Consumes: `glass`, `eyebrow`, `pageWrap` from ui. `useWallet`, `useWalletLedger`, `formatDate`, `formatAmount` unchanged; `amountClass` recolored.

- [ ] **Step 1: Replace balance hero + recolor amounts** (add `import { glass, eyebrow, pageWrap } from '@/components/employee/ui';`):

Balance hero:
```tsx
      {/* Balance hero */}
      <section className="rounded-[24px] bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] p-8 text-white shadow-[0_24px_60px_rgba(34,36,90,.2)]">
        <p className={`${eyebrow} mb-2 !text-white/70`}>WALLET BALANCE</p>
        {walletLoading ? (
          <p className="animate-pulse text-4xl font-extrabold">Loading…</p>
        ) : walletError || !wallet ? (
          <p className="text-2xl font-semibold opacity-80">Unavailable</p>
        ) : (
          <p className="text-5xl font-extrabold tracking-[-.02em]">₹{wallet.balance.toLocaleString('en-IN')}</p>
        )}
        {wallet?.currency && <p className="mt-2 text-sm opacity-70">{wallet.currency}</p>}
      </section>
```

`amountClass`:
```tsx
function amountClass(entry: LedgerEntry): string {
  const num = Number(entry.amount);
  if (isNaN(num)) return 'text-slate';
  return num >= 0 ? 'text-[#1a8f5a] font-semibold' : 'text-[#e0524d] font-semibold';
}
```

- [ ] **Step 2: Restyle ledger + wrapper**:

| Element | New treatment |
|---|---|
| page wrapper | `min-h-screen bg-[#eef0f8]` + `mx-auto max-w-3xl px-4 py-8 font-display space-y-8` |
| ledger heading | eyebrow "TRANSACTION HISTORY" + `text-xl font-extrabold tracking-[-.02em] text-ink` |
| table container | `${glass} rounded-[20px] overflow-hidden` |
| `<thead>` | `bg-white/40`; `<th>` → `font-jbmono text-[10px] uppercase tracking-[.08em] text-muted` |
| `<tbody>` dividers | `divide-line` |
| row hover | `hover:bg-[rgba(42,43,106,.04)]` |
| cell text | `text-slate` (date/desc), balance-after `text-ink` |
| loading/error/empty text | `text-slate` / `text-[#e0524d]` |

- [ ] **Step 3: Grep gate**

Run: `grep -nE 'from-blue|to-blue|bg-blue-|text-green-[0-9]|text-red-[0-9]|text-gray-|bg-gray-|border-gray' app/employee/wallet/page.tsx`
Expected: no matches.

- [ ] **Step 4: Tests + render** — `npm test` PASS; `/employee/wallet` shows indigo gradient hero + glass ledger with green/red DS amounts.

- [ ] **Step 5: Commit**

```bash
git add app/employee/wallet/page.tsx
git commit -m "feat(employee): brand wallet (indigo hero + glass ledger)"
```

---

### Task 11: Auth pages ×4 (login, activate, forgot-password, reset-password)

**Files:**
- Modify: `app/employee/login/page.tsx`, `app/employee/activate/page.tsx`, `app/employee/forgot-password/page.tsx`, `app/employee/reset-password/page.tsx`

**Interfaces:**
- Consumes: `glass`, `primaryBtn`, `input`, `label`, `eyebrow`, `errorBanner` from ui. All auth mutation hooks unchanged.

- [ ] **Step 1: Define the shared auth shell.** For EACH of the 4 pages, wrap the card in a mesh background. First try the arbitrary-value utility; if Tailwind can't express the layered gradient, use ONE inline `style` (permitted by Global Constraints). Shell pattern:

```tsx
    <div
      className="flex min-h-screen items-center justify-center px-4 font-display"
      style={{
        background:
          'radial-gradient(60% 50% at 12% 8%, rgba(74,76,201,.20), transparent 60%),' +
          'radial-gradient(52% 46% at 92% 12%, rgba(19,184,159,.18), transparent 60%),' +
          'radial-gradient(46% 42% at 78% 92%, rgba(124,77,210,.14), transparent 62%),' +
          'linear-gradient(180deg,#eceefb,#f4f1f8,#e9f1f3)',
      }}
    >
      <div className={`w-full max-w-md rounded-[24px] p-8 ${glass}`}>
        {/* card content */}
      </div>
    </div>
```

- [ ] **Step 2: Login** (`login/page.tsx`) — apply inside the shell:
  - Heading `text-2xl font-extrabold tracking-[-.02em] text-ink` (precede with `<p className={eyebrow}>EMPLOYEE PORTAL</p>`); subtitle `text-sm text-slate`.
  - Error banner → `${errorBanner}`.
  - Each `<label>` → `${label}`; each `<input>` → `${input}`.
  - Submit button → `${primaryBtn} w-full py-2.5`.
  - "Forgot password?" link → `text-accent hover:underline font-medium`.

- [ ] **Step 3: Activate / Forgot / Reset** — read each file; apply the SAME shell + the same element mappings (heading/eyebrow, `${label}`, `${input}`, `${primaryBtn}`, `${errorBanner}`, `text-accent` links). Keep all token/email/password state + mutation logic intact. Success/info messages → `text-[#1a8f5a]` (success) or `text-slate`.

- [ ] **Step 4: Grep gate (all four)**

Run: `grep -rnE 'bg-blue-|text-blue-|bg-gray-|text-gray-|border-gray|bg-gray-50|focus:ring-blue' app/employee/login app/employee/activate app/employee/forgot-password app/employee/reset-password`
Expected: no matches.

- [ ] **Step 5: Tests + render** — `npm test` PASS; load all 4 auth routes; mesh bg + glass card render; login/activate/forgot/reset submit still works.

- [ ] **Step 6: Commit**

```bash
git add app/employee/login/page.tsx app/employee/activate/page.tsx app/employee/forgot-password/page.tsx app/employee/reset-password/page.tsx
git commit -m "feat(employee): brand auth pages (glass card + ambient mesh)"
```

---

### Task 12: Final verification + graph update

**Files:** none (verification only).

- [ ] **Step 1: Full portal grep gate**

Run:
```bash
grep -rnE 'bg-blue-|text-blue-|bg-zinc|text-zinc|bg-gray-|text-gray-|bg-yellow-|bg-purple-|from-blue|to-blue|focus:ring-blue' app/employee components/employee components/CartView.tsx
```
Expected: no matches. (Intentional DS status hex like `#1a8f5a`, `#e0524d`, `#b5801e` are allowed and won't match.)

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: succeeds with no type errors.

- [ ] **Step 4: Manual walkthrough** — `npm run dev`, walk: login → dashboard → products → product detail → cart → checkout → orders → order detail → wallet. Confirm consistent indigo/teal/glass + brand fonts, no generic gray/blue leftovers, and every existing action still works. Also spot-check public `/cart` (shared CartView).

- [ ] **Step 5: Update knowledge graph** (project rule)

Run: `graphify update .`
Expected: completes (AST-only, no API cost).

- [ ] **Step 6: Commit any verification-driven fixes** (if steps 1–4 surfaced leftovers, fix per the mapping tables and commit)

```bash
git add -A
git commit -m "chore(employee): final brand-consistency pass"
```

---

## Self-Review

**Spec coverage:** Header (T2), dashboard (T3), products (T4), product detail (T5), cart + shared CartView (T6), checkout (T7), orders list + StatusBadge remap (T8), order detail + timeline (T9), wallet indigo hero + ledger (T10), auth ×4 + ambient mesh (T11), shared ui.ts (T1), NOT-doing items respected (no mesh on data pages, no logic changes), verification + graphify (T12). All spec sections mapped. ✅

**Placeholder scan:** ui.ts, header, dashboard, wallet hero, StatusBadge, auth shell given as complete code. Large existing files (products, product detail, CartView, checkout, orders, order detail, auth 2–4) use explicit old→new mapping tables + exact class strings rather than full re-paste, because the files are 100–309 lines and their logic must stay byte-identical — the table tells the implementer exactly which surface gets which brand class. Every class string is concrete (no "appropriate styling"). ✅

**Type consistency:** `statusPill(status: string): string` defined in T1, consumed in T8/T9. `glass`/`primaryBtn`/`secondaryBtn`/`input`/`label`/`eyebrow`/`pageWrap`/`errorBanner` names consistent across all tasks. No renamed identifiers. ✅
