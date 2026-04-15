# Design System: LawTask — "The Judicial Atelier"
**Project ID:** `2160607169116219058`
**Stitch Theme:** The Judicial Atelier | Soft Structuralism | Hebrew-first RTL

---

## 1. Visual Theme & Atmosphere

**Mood:** Authoritative yet approachable — "A prestigious law office reimagined as a mobile-first workspace." The design lives between clinical precision and editorial warmth. Cards feel elevated, not flat. Background layers create a sense of depth through tonal shifts rather than heavy borders.

**Philosophy:** *Soft Structuralism* — hierarchy is established through light, space, and surface elevation, not lines or dividers. Hebrew typography sets the editorial rhythm; Inter handles numerical and label precision.

**Key rules:**
- No 1px borders for section dividers — use tonal background shifts instead
- Glassmorphism for navigation: `backdrop-filter: blur(20px)` with semi-transparent base
- Primary CTAs use a deep navy gradient: `135deg, #002452 → #1B3A6B`
- Ambient shadows are navy-tinted: `0 12px 32px -4px rgba(0,36,82,0.08)` on light; `rgba(0,0,0,0.3)` on dark
- RTL-optimized throughout: sidebar on right, FAB at bottom-left, text right-aligned
- Dark mode uses Tailwind Slate palette (`#0f172a` base, `#1e293b` cards, `#334155` borders)

---

## 2. Color Palette & Roles

### Light Mode
| Descriptive Name | Hex | Role |
|---|---|---|
| Midnight Admiral | `#002452` | Primary brand — headlines, active states, primary actions |
| Deep Navy Ink | `#1B3A6B` | Primary container — card headers, gradient endpoints |
| Royal Action Blue | `#0051d5` | Secondary — interactive links, active nav |
| Bright Cobalt | `#316bf3` | Secondary container — FAB (dark), accent fills |
| Legal Parchment | `#f8f9fa` | Surface / Background — page base |
| Pure White | `#ffffff` | Surface lowest — card backgrounds |
| Pale Linen | `#f3f4f5` | Surface low — input backgrounds |
| Silver Haze | `#edeeef` | Surface container — hover states |
| Soft Stone | `#e7e8e9` | Surface high — dividers |
| Steel Blue Fixed | `#d7e2ff` | Primary fixed — subtle accent chips |
| Periwinkle Dim | `#acc7ff` | Primary fixed dim — secondary chips |
| Warm Amber | `#fcb87d` | Tertiary fixed dim — urgent/warning accents |
| Judicial Rust | `#ba1a1a` | Error — overdue, destructive |
| Charcoal Ink | `#191c1d` | On-surface — body text |
| Slate Whisper | `#44474f` | On-surface variant — secondary text, metadata |
| Graphite Outline | `#747780` | Outline — borders, placeholders |
| Mist Border | `#c4c6d0` | Outline variant — subtle dividers |

### Dark Mode (Slate Override Palette)
| Descriptive Name | Hex | Role |
|---|---|---|
| Abyss Navy | `#0f172a` | Background / Surface — page base |
| Deep Slate Card | `#1e293b` | Card / Container backgrounds |
| Storm Border | `#334155` | Card borders, dividers |
| Frost White | `#f8fafc` | Primary text |
| Muted Slate | `#94a3b8` | Secondary text, metadata, placeholders |
| Sky Blue Active | `#38bdf8` | Primary (dark) — active states, highlights |
| Cornflower | `#60a5fa` | Secondary (dark) — action links |
| Coral Alert | `#ef4444` | Error (dark) — overdue |

---

## 3. Typography Rules

**Headline Font:** Heebo (Hebrew-optimized) + Manrope (Latin fallback)
- Used for all Hebrew titles, section headers, card headings
- Weight: `700` (bold) for section headers, `800` (extrabold) for hero stats
- Letter spacing: `tracking-tight` on large headings

**Body Font:** Heebo (Hebrew) + Inter (Latin/numbers)
- Task descriptions: `text-sm` at weight `400`
- Metadata labels: `text-xs` at weight `500` or `600`
- Case numbers: `font-mono text-xs` for legal precision

**Label Font:** Inter (numbers, dates, case codes)
- Priority badges: `text-[10px] font-bold uppercase tracking-wider`
- Navigation labels: `text-[11px] font-medium tracking-wide`

---

## 4. Component Stylings

### Buttons
- **Primary CTA:** Pill-shaped (`rounded-full`), deep navy gradient (`#002452 → #1B3A6B`), white text, `font-extrabold`, `py-5` generous padding, navy box-shadow `shadow-xl shadow-primary/20`. Active: `scale(0.98)`
- **Secondary Action:** Flat pill, `bg-secondary` (#0051d5), white text, `font-bold`
- **Ghost/Filter:** Softly rounded (`rounded-xl`), `bg-surface-container` background, `text-on-surface-variant`, no shadow

### Cards / Containers
- **Task Cards:** Generously rounded corners (`rounded-xl`), pure white background, `shadow-legal-sm` ambient shadow. Right-edge status strip: `w-1.5` colored bar (`absolute right-0 top-0 bottom-0`) — red for overdue, amber for urgent, emerald for new, blue for personal
- **Case Cards:** Same `rounded-xl`, with a gradient color-block header (80-96px tall) using `from-primary-container to-primary` or category-specific gradient
- **Stat Pills (summary strip):** Pill-shaped (`rounded-full`), white/slate background, colored dot indicator, soft navy shadow
- **Bottom Sheet / Modal:** Top-rounded `rounded-t-[32px]`, white background, drag handle (12px wide, 6px tall, `bg-outline-variant/30`), glassmorphism header with `backdrop-blur-md`

### Inputs / Forms
- **Search fields:** `bg-surface-container-highest`, no border, `rounded-xl`, `py-4` tall touch target, icon on right (RTL), focus ring `ring-2 ring-secondary/20`
- **Label style:** `text-xs font-semibold text-on-surface-variant`, positioned above field
- **Segmented control (type selector):** `bg-surface-container-low` pill container, active segment has white background + shadow

### Navigation
- **Bottom Nav (mobile):** Glassmorphism — `bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl`, top border `border-outline-variant/15`. Active item: `text-secondary dark:text-sky-400` with filled icon + 1px dot indicator below
- **Sidebar (desktop):** Right-anchored (`w-64 fixed right-0`), `bg-surface-container-low`, no heavy border. Active link: `bg-primary-fixed/40 text-secondary` rounded pill. Bottom: gradient "תיק חדש" button + user avatar + sign out
- **Material Symbols:** All icons use `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`. Active icons use `'FILL' 1`

### FAB (Floating Action Button)
- **Light:** `bg-gradient-to-br from-primary to-primary-container` (navy gradient), `rounded-full`, `w-14 h-14`
- **Dark:** `bg-sky-500` or `rgba(59,130,246,0.9) backdrop-blur`, white `+` icon
- **Position:** `fixed bottom-20 left-6 md:bottom-8 md:left-8 z-50`
- **Interaction:** `active:scale-90 transition-transform`

---

## 5. Layout Principles

**Mobile:** Single-column, full-width cards with `px-6` horizontal padding. Sections separated by `space-y-8`. Bottom nav consumes `pb-24` at page bottom. RTL flow.

**Desktop:** Two-column layout — right sidebar (`w-64`) + left main area. Main content has `max-w-4xl` constraint and is centered within the available space. Header is fixed top, spanning full content width.

**Spacing scale:** `3` (Stitch) → generous padding: `p-4` on cards, `p-6` on page margins, `py-8` for section spacing.

**Grid systems:**
- Summary strip: horizontal scroll `flex flex-row-reverse gap-3 overflow-x-auto`
- Case cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- KPI stats (desktop): `grid grid-cols-3 gap-4`
- Task cards: `space-y-3` on mobile, `grid grid-cols-2 lg:grid-cols-3 gap-6` on desktop

**RTL specifics:**
- Status border strip on **right** side of task cards
- `flex-row-reverse` on horizontal flex containers
- `text-right` on text blocks
- Material icons `direction: ltr` (inside RTL container)
- FAB: `bottom-left` position (ergonomic for right-handed RTL users)
