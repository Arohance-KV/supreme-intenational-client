# Supreme × Elate — Design System

Extracted from the live codebase (`app/globals.css` `@theme`, `components/employee/ui.ts`,
and the home/nav/footer components). This is the reference for keeping pages visually
consistent. Tailwind v4 with `@theme` tokens — most values are usable as utilities
(e.g. `text-ink`, `bg-accent`, `border-line`).

## Colors (`@theme` tokens → Tailwind utilities)

| Token | Value | Utility | Use |
|-------|-------|---------|-----|
| ink | `#16173a` | `text-ink` | Primary text / headings |
| indigo | `#2a2b6a` | `text-indigo` `bg-indigo` | Brand primary |
| indigo2 | `#3a3c98` | `bg-indigo2` | Gradient end / hover |
| accent | `#149b8e` | `text-accent` | Teal accent, eyebrows, links |
| accent2 | `#13b89f` | — | Gradient end |
| slate | `#5b5d7a` | `text-slate` | Body copy |
| muted | `#9295b6` | `text-muted` | Secondary/placeholder |
| line | `#e6e7f2` | `border-line` | Borders/dividers |

Semantic (inline rgba, no token): error `#e0524d`, success `#1a8f5a`, warning `#b5801e`.

## Typography

- Display / UI: `font-display` (Plus Jakarta Sans) — set globally on `<html>`.
- Mono / eyebrows: `font-jbmono` (JetBrains Mono).
- Headings: `font-extrabold tracking-[-.02em]` (hero uses `-.03em`).
- Eyebrow: `font-jbmono text-[11px] uppercase tracking-[.14em] text-accent`.

## Radii & shadows

- Cards: `rounded-[18px]` – `rounded-[24px]`. Inputs/buttons: `rounded-[13px]`. Pills: `rounded-full`.
- Glass card shadow: `shadow-[0_12px_44px_rgba(34,36,90,.08)]`.
- Primary button shadow: `shadow-[0_8px_22px_rgba(42,43,106,.3)]` (hover `.4`).

## Gradients

- Primary button: `bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)]`.
- Brand text (clip): `bg-[linear-gradient(120deg,#2a2b6a_0%,#4143b0_38%,#149b8e_100%)] bg-clip-text text-transparent`.
- Ambient auth/hero mesh (background):
  ```
  radial-gradient(60% 50% at 12% 8%, rgba(74,76,201,.20), transparent 60%),
  radial-gradient(52% 46% at 92% 12%, rgba(19,184,159,.18), transparent 60%),
  radial-gradient(46% 42% at 78% 92%, rgba(124,77,210,.14), transparent 62%),
  linear-gradient(180deg,#eceefb,#f4f1f8,#e9f1f3)
  ```

## Glass surface

`bg-white/60 border border-white/85 backdrop-blur-[14px] backdrop-saturate-150` (+ card shadow).
Header/nav variant: `bg-white/[.62] backdrop-blur-[20px] backdrop-saturate-[1.6]`.

## Component patterns (canonical class strings — `components/employee/ui.ts`)

- `input`: `w-full bg-white/65 border border-line rounded-[13px] px-3.5 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-indigo transition-colors`
- `label`: `block text-sm font-medium text-slate mb-1.5`
- `primaryBtn`: `bg-[linear-gradient(135deg,#2a2b6a,#3a3c98)] text-white font-semibold rounded-[13px] shadow-[0_8px_22px_rgba(42,43,106,.3)] hover:shadow-[0_10px_28px_rgba(42,43,106,.4)] disabled:opacity-50`
- `secondaryBtn`: `bg-white/60 text-indigo border border-white/85 font-semibold rounded-[13px] backdrop-blur-[8px] hover:bg-white/80`
- `errorBanner`: `p-3 rounded-[13px] bg-[rgba(224,82,77,.1)] border border-[rgba(224,82,77,.3)] text-[#e0524d] text-sm`

## Animations (`--animate-*` tokens + keyframes in `globals.css`)

`animate-floaty`, `animate-floaty2`, `animate-blob1/2/3` (ambient), `animate-marquee` (trusted-by loop).

## Auth pages (applied pattern)

Full-screen mesh background + centered glass card (`max-w-md`, `rounded-[24px]`, `p-8`):
wordmark → eyebrow (`<PORTAL> PORTAL`) → heading → subtext → form (`label`/`input`) →
`errorBanner` → full-width `primaryBtn` → footer links (`text-accent hover:underline`).
Live pages: `/login`, `/seller/login`, `/company/login`, `/employee/login`.
