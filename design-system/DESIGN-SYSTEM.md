# Supreme International — Design System

Extracted from `Supreme International.dc.html`. B2B corporate-gifting platform (Supreme International × Elate Travel Essentials). Visual language: enterprise-SaaS trust + luxury-gifting warmth — **deep indigo, living teal, frosted glass over soft light**.

> **Styling rule (strict): Tailwind CSS only.** No plain-CSS stylesheets, no inline `style={{…}}` objects. Use Tailwind utilities; reach for arbitrary values (`bg-[#2a2b6a]`, `shadow-[0_12px_44px_rgba(34,36,90,.08)]`) when no token fits. Tokens below are registered in Tailwind v4 `@theme` (`app/globals.css`) so brand utilities like `text-ink`, `bg-indigo`, `border-line`, `animate-floaty` exist. The **only** raw CSS permitted is `@keyframes` (no utility form) and the `@theme` token block itself.

### Tailwind token map (`@theme` in `app/globals.css`)
```css
@theme {
  --color-ink: #16173a;      /* text-ink / bg-ink */
  --color-indigo: #2a2b6a;   /* text-indigo / bg-indigo */
  --color-indigo2: #3a3c98;
  --color-accent: #149b8e;   /* text-accent / bg-accent */
  --color-accent2: #13b89f;
  --color-slate: #5b5d7a;    /* text-slate */
  --color-muted: #9295b6;    /* text-muted */
  --color-line: #e6e7f2;     /* border-line */
  --font-display: var(--font-jakarta);   /* font-display  (Plus Jakarta Sans) */
  --font-jbmono: var(--font-mono-jb);    /* font-jbmono   (JetBrains Mono) */
  --animate-floaty:  dc-floaty  7s ease-in-out infinite;   /* animate-floaty  */
  --animate-floaty2: dc-floaty2 8s ease-in-out infinite;   /* animate-floaty2 */
  --animate-blob1:   dc-blobshift 16s ease-in-out infinite;
  --animate-blob2:   dc-blobshift 19s ease-in-out infinite reverse;
  --animate-blob3:   dc-blobshift 22s ease-in-out infinite;
}
```
Fonts load via `next/font` (`variable: '--font-jakarta' | '--font-mono-jb'`); apply the `.variable` classes on the page root. `::selection` → `selection:bg-[rgba(23,155,142,0.22)]` variant. Glass panel → `bg-white/55 border border-white/85 backdrop-blur-[14px] backdrop-saturate-150 shadow-[0_12px_44px_rgba(34,36,90,.08)]`. Reference implementation: `app/page.tsx`.

---

## Colors

### Brand
| Token | Hex | Role |
|-------|-----|------|
| Brand Indigo | `#2A2B6A` | Primary |
| Indigo 2 | `#3A3C98` | Primary gradient end / hover |
| Brand Teal | `#179B8E` | Accent |
| Teal 2 | `#13B89F` | Accent bright |
| Violet | `#5644D2` | Hero gradient mid |
| Purple | `#7C4DD2` | Ambient mesh only |

### Neutrals / Text
| Token | Hex | Role |
|-------|-----|------|
| Ink | `#16173A` | Primary text |
| Slate | `#5B5D7A` | Body / secondary text |
| Muted | `#9295B6` | Captions, meta, placeholders |
| Line | `#E6E7F2` | Borders, dividers |
| Page BG | `#EEF0F8` | Base background |

### Status
| Token | Hex |
|-------|-----|
| Success | `#1FAA6B` (text variant `#1A8F5A`) |
| Warning | `#E0A33B` (text variant `#B5801E`) |
| Error | `#E0524D` |

### CSS custom properties (root `--` tokens)
```css
--c-ink:#16173a; --c-indigo:#2a2b6a; --c-indigo2:#3a3c98;
--c-accent:#149b8e; --c-accent2:#13b89f;
--c-slate:#5b5d7a; --c-muted:#9295b6; --c-line:#e6e7f2;
--glass-bg:rgba(255,255,255,.52);
--glass-brd:rgba(255,255,255,.78);
--glass-blur:18px;
```
> Note: `--c-accent` default is `#149b8e` (runtime), while the swatch label documents `#179B8E`. Use `#149b8e` as the live value.

### Gradients
- **Primary CTA fill:** `linear-gradient(135deg,#2a2b6a,#3a3c98)`
- **Hero text / rich CTA:** `linear-gradient(120deg,#2a2b6a 0%,#5644d2 50%,#13b89f 100%)`
- **Teal accent fill:** `linear-gradient(135deg,#179b8e,#13b89f)`
- **Dark section (process/footer):** `linear-gradient(135deg,#1c1d44,#23254f)`

### Themeable accents (runtime toggle)
| Theme | accent | accent2 |
|-------|--------|---------|
| Teal (default) | `#149b8e` | `#13b89f` |
| Gold | `#b0823a` | `#d2a043` |
| Indigo | `#4143b0` | `#5a5cd0` |

---

## Typography

- **Display / UI:** `Plus Jakarta Sans` (400, 500, 600, 700, 800) — fallback `system-ui, sans-serif`
- **Labels / specs / mono:** `JetBrains Mono` (400, 500, 700)

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### Scale
| Use | Size | Weight | Tracking | Line-height |
|-----|------|--------|----------|-------------|
| Hero H1 | 60–64px | 800 | -.03em | 1.02 |
| H2 section | 40px | 800 | -.02em | 1.05 |
| H3 | 28–32px | 800 | -.02em | ~1.05 |
| Card title | 15–18px | 700 | -.01em | 1.25 |
| Body | 16–19px | 400 | — | 1.55–1.6 |
| Small / meta | 12–14px | 400–500 | — | 1.5 |
| Mono label | 10–12px | 500–600 | .08–.22em, UPPERCASE | 1.7 |

Mobile H1 drops to ~32px; global responsive clamps at 620/760/1040px breakpoints scale headings down (see `<style>` media queries).

---

## Glassmorphism (core surface language)

Standard frosted panel:
```css
background: rgba(255,255,255,.52);           /* --glass-bg */
backdrop-filter: blur(18px) saturate(1.5);
-webkit-backdrop-filter: blur(18px) saturate(1.5);
border: 1px solid rgba(255,255,255,.78);     /* --glass-brd */
box-shadow: 0 12px 44px rgba(34,36,90,.08), inset 0 1px 0 rgba(255,255,255,.6);
```
Card variants use `rgba(255,255,255,.55–.65)` fill, `blur(12–20px)`. Nav uses `blur(20px) saturate(1.6)`.

**Glass strength toggle:** Frosted = `.52` / `18px` · Subtle = `.8` / `7px`.

---

## Radii
| Token | Value | Use |
|-------|-------|-----|
| Button | 12–14px | CTAs, inputs |
| Card | 16–22px | Product/feature cards |
| Panel | 24–30px | Large glass panels, hero container |
| Pill | 999px | Badges, chips |
| Phone frame | 36–46px | Mobile mockup |

## Shadows
| Level | Value |
|-------|-------|
| Card | `0 8px 26px rgba(34,36,90,.08)` |
| Panel | `0 12px 44px rgba(34,36,90,.08)` |
| Elevated card | `0 12px 34px rgba(34,36,90,.1)` |
| Floating | `0 24px 60px rgba(34,36,90,.2)` |
| Hero container | `0 40px 100px rgba(34,36,90,.22)` |
| Primary button | `0 8px 22px rgba(42,43,106,.3)` |
| Teal button | `0 8px 22px rgba(23,155,142,.3)` |

Panels add `inset 0 1px 0 rgba(255,255,255,.6)` for a top highlight edge.

## Spacing
Section padding `40–64px` (desktop), `18–22px` (mobile). Card padding `14–32px`. Grid gaps `12–24px`.

---

## Components

### Buttons
| Variant | Style |
|---------|-------|
| Primary | indigo gradient fill, `#fff`, radius 13–14px, shadow `0 8px 22px rgba(42,43,106,.3)` |
| Secondary | `rgba(255,255,255,.6)` glass, indigo text, `1px solid --glass-brd`, blur 8px |
| Outline | transparent, `1.5px solid --c-indigo`, indigo text |
| Ghost | transparent, no border, slate text |
| Icon / FAB | 44×44, teal fill, `#fff`, radius 13px |

All buttons: `font-weight:600`, `font-size:13–15px`, `cursor:pointer`, `font-family:inherit`.

### Inputs
`rgba(255,255,255,.65)` fill, `1px solid --c-line`, radius 13px, padding `12px 14px`, muted placeholder. Search shows a circle-outline icon; dropdowns append `▾`.

### Badges / chips (pill, JetBrains Mono, 11px, weight 500)
| Badge | BG | Text | Border |
|-------|----|----|--------|
| MOQ | `rgba(23,155,142,.12)` | accent | `rgba(23,155,142,.25)` |
| Recommended | `rgba(42,43,106,.1)` | indigo | `rgba(42,43,106,.2)` |
| In stock | `rgba(31,170,107,.12)` | `#1a8f5a` | `rgba(31,170,107,.25)` |
| Draft | `rgba(224,163,59,.14)` | `#b5801e` | `rgba(224,163,59,.3)` |

### Cards
Glass fill + white border + card shadow. Product card: square image (`aspect-ratio:1/1`, radius 14px), mono category label, title, price (`₹`, weight 800) with "tentative price" caption, MOQ pill, full-width add-to-cart button. Hover: lift.

### Section eyebrow
`JetBrains Mono`, 11–12px, `.14–.22em` tracking, UPPERCASE, teal accent — precedes every section heading.

---

## Motion
```css
@keyframes floaty  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-12px)} }
@keyframes floaty2 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(10px)}  }
@keyframes blobshift { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(4%,-3%) scale(1.08)} }
```
- Floating glass cards drift (`floaty` 7s / `floaty2` 8s).
- Ambient background blobs shift (`blobshift` 16–22s, blurred).
- Buttons: ~150ms ease with shadow bloom.
- Add-to-cart swaps label to "Added ✓" + teal fill for 1.1s, increments cart badge.
- Hero float cluster cycles product/category every 3s with a 420ms opacity fade.
- `::selection { background: rgba(23,155,142,.22); }`

---

## Ambient background
Fixed layered mesh over `linear-gradient(180deg,#eceefb,#f4f1f8,#e9f1f3)`:
```css
radial-gradient(60% 50% at 12% 8%,  rgba(74,76,201,.32), transparent 60%),
radial-gradient(52% 46% at 92% 12%, rgba(19,184,159,.30), transparent 60%),
radial-gradient(50% 48% at 78% 90%, rgba(124,77,210,.22), transparent 62%),
radial-gradient(46% 42% at 6% 88%,  rgba(20,155,142,.22), transparent 62%),
radial-gradient(42% 40% at 50% 48%, rgba(224,163,59,.12), transparent 60%);
```
Plus 3 animated blurred blobs (violet / teal / purple).

---

## Layout & responsive
- Content max-width `1180px`; hero showcase container `1280px`.
- Breakpoints: `1040px` (6→3, 4→2 col), `760px` (collapse to 1–2 col, hide search/secondary nav), `620px` (heading downscale, tighter padding).
- Mobile frame: 340px phone mock, sticky bottom cart bar, horizontal category chips.

## Logos / assets
- `assets/supreme-logo.png`, `assets/elate-logo.png` — paired with a 1px `--c-line` divider. On dark footer: `filter:brightness(0) invert(1); opacity:.92`.
- Category/product images under `assets/img/` (e.g. `bottle.png`, `backpack.png`, `cat-drinkware.png`).
