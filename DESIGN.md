# 🐝 SlideBee — Hero Section Design Specification & Architecture

> **Project:** SlideBee Design Studio (`xyz_templates`)  
> **Target Surface:** Home Page Hero Section (Above-the-Fold)  
> **Design Canvas Standard:** Wide-Format (1540px Max Grid • 1920px Viewport)  
> **Tooling Compatibility:** Stitch, Figma, Penpot, Tailwind CSS v4, React 19  

---

## 🎨 1. Brand Tokens & Design System

### A. Color Palette
| Token Name | Hex Code | RGB | HSL | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **`bg-cream`** | `#FFF9E8` | `rgb(255, 249, 232)` | `44°, 100%, 95%` | Primary background canvas & continuous page theme |
| **`primary-gold`** | `#FCBF14` | `rgb(252, 191, 20)` | `44°, 98%, 53%` | Primary brand accent, solid CTAs, focal badges |
| **`primary-dark`** | `#D99F06` | `rgb(217, 159, 6)` | `44°, 95%, 44%` | Button hover states, active borders |
| **`primary-amber`** | `#936610` | `rgb(147, 102, 16)` | `39°, 80%, 32%` | High-contrast text accents, eyebrow labels |
| **`dark-obsidian`** | `#111111` | `rgb(17, 17, 17)` | `0°, 0%, 7%` | Headings, secondary CTAs, high-contrast borders |
| **`slate-neutral`** | `#726F6D` | `rgb(114, 111, 109)` | `24°, 2%, 44%` | Subtitles, body text, placeholder states |
| **`pure-white`** | `#FFFFFF` | `rgb(255, 255, 255)` | `0°, 0%, 100%` | Card surfaces, search bar interior, badge fills |

---

### B. Typography Hierarchy (Font Family: `Manrope`)
*Google Fonts / Variable Font: `Manrope` (300 to 800 weight)*

| Level | Size (Desktop) | Weight | Line Height | Tracking | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Eyebrow** | `12px` / `0.75rem` | `900` (Black) | `1.2` | `+0.12em` | Section tag with `#FCBF14` rule |
| **Display H1** | `56px – 72px` | `900` (Black) | `1.08` | `-0.03em` | Primary Hero value proposition |
| **Subheadline**| `18px – 20px` | `400` / `500` | `1.6` | `0` | Editorial explanatory paragraph |
| **Primary CTA** | `15px – 16px` | `900` (Black) | `1` | `+0.01em` | Solid Honey Gold action buttons |
| **Search Text** | `14px – 15px` | `500` (Medium)| `1.4` | `0` | Interactive template search input |
| **Micro Badges**| `11px – 12px` | `800` (Extrabold)| `1` | `+0.05em` | Software compatibility & category pills |

---

## 📐 2. Viewport & Grid Specifications

```
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │ Viewport: 1920px (Full HD) / 1440px (Laptop)                                │
  │                                                                             │
  │   ┌────────────────────────── Max-Width: 1540px ────────────────────────┐   │
  │   │ Padding: Left 64px / Right 64px (Mobile: 24px)                      │   │
  │   │                                                                     │   │
  │   │  [COL 1 - 6: 48% Width]               [COL 7 - 12: 52% Width]       │   │
  │   │  EDITORIAL & ACTION ZONE              ASYMMETRICAL HEXAGON MOSAIC   │   │
  │   │                                                                     │   │
  │   │  ─ Eyebrow + Gold Rule                ⬡ Top-Right Category Slide    │   │
  │   │  ─ Display Title (Present...)         ⬡ Master Focal Hexagon (4K)   │   │
  │   │  ─ Editorial Subtitle                 ⬡ Executive KPI Slide         │   │
  │   │  ─ Dual Solid CTA Row                 ⬡ Solid Gold Action Hexagon   │   │
  │   │  ─ Interactive Search Bar             ⬡ Bottom Accent Hexagon       │   │
  │   │  ─ Platform Logos (PPT/Slides)                                      │   │
  │   │                                                                     │   │
  │   └─────────────────────────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────────────────────────┘
```

- **Container Max-Width:** `1540px` (eliminates empty side dead zones).
- **Horizontal Padding:** `px-6 sm:px-10 lg:px-14 xl:px-16`.
- **Top Section Padding:** `pt-28 lg:pt-32` (provides breathing space below floating Navbar).
- **Bottom Section Padding:** `pb-16 lg:pb-20`.

---

## 🧩 3. Component Anatomy & Stitch Layout

### Left Column: Editorial & Conversion Engine
1. **Eyebrow Badge:**
   - Gold Indicator Bar: `width: 40px`, `height: 2.5px`, `border-radius: 9999px`, `color: #FCBF14`.
   - Text: `SLIDEBEE DESIGN STUDIO` (`uppercase`, `tracking-widest`, `color: #726F6D`, `font-bold`).

2. **Headline Composition:**
   - Line 1: `Present With` (Obsidian `#111111`, font-black).
   - Line 2: `Unmatched Impact.` (Honey Amber `#936610` with subtle golden drop shadow `0 4px 20px rgba(252,191,20,0.25)`).

3. **Subheadline:**
   - Copy: *"From 24-hour investor pitch deck redesigns to enterprise master templates — we help founders and executives command the room."*
   - Max Width: `580px`, Line Height: `1.6`, Color: `#726F6D`.

4. **Action Row (Dual Pill CTAs):**
   - **Primary Button (Start Your Project Brief):**
     - Dimensions: `px-8 py-4`, `rounded-full` (`border-radius: 9999px`).
     - Fill: `#FCBF14` (Honey Gold).
     - Text: `#111111` (Black), `font-extrabold`, with `ArrowRight` icon.
     - Shadow: `0 10px 25px rgba(252, 191, 20, 0.35)`.
     - Hover State: Scale `1.03`, Background `#E5AA0F`.
   - **Secondary Button (Explore 6 Core Services):**
     - Dimensions: `px-8 py-4`, `rounded-full`.
     - Fill: `#111111` (Dark Obsidian).
     - Border: `1.5px solid rgba(252, 191, 20, 0.45)`.
     - Text: `#FFFFFF` (White), `font-bold`.

5. **Integrated Search Input Bar:**
   - Container: `max-w-xl`, `height: 56px`, `bg: #FFFFFF`, `border: 2px solid rgba(252, 191, 20, 0.4)`.
   - Corner Radius: `rounded-2xl` (`16px`).
   - Left Element: `Search` icon (`#726F6D`).
   - Action Button: Solid `#FCBF14` pill with label `"Search"` (`px-6 py-2.5 rounded-xl`).

6. **Software Compatibility Badge Strip:**
   - Label: `COMPATIBLE WITH:` (`text-[10px] uppercase font-bold text-[#726F6D]`).
   - Pills (with official colored SVG platform logos):
     - **PowerPoint:** Orange `#D04423` badge + `PowerPoint` text.
     - **Google Slides:** Gold `#F4B400` badge + `Google Slides` text.
     - **Keynote:** Light Blue `#007AFF` badge + `Keynote` text.
     - **Canva:** Cyan Gradient `#00C4CC` badge + `Canva` text.

---

### Right Column: Asymmetrical Hexagonal Showcase Mosaic
*Inspired by high-end architectural editorial layouts (e.g. Visit Norway reference).*

```
                     ┌──────────────────┐
                     │ ⬡ 02. TOP RIGHT  │
                     │ Pitch Deck Slide │
                     │ Size: 220px      │
                     └────────┬─────────┘
                              │
     ┌────────────────────────┴────────┐      ┌──────────────────┐
     │                                 │      │ ⬡ 03. MID RIGHT  │
     │ ⬡ 01. MASTER FOCAL HEXAGON      │      │ Executive KPI    │
     │ Hero Presenter / Stage Slide    │      │ Size: 240px      │
     │ Size: 340px – 380px             ├──────┤                  │
     │ Border: 2.5px #FCBF14           │      └────────┬─────────┘
     │                                 │               │
     └──────────────┬──────────────────┘      ┌────────┴─────────┐
                    │                         │ ⬡ 04. ACTION HEX │
     ┌──────────────┴─────────┐               │ Solid #FCBF14    │
     │ ⬡ 05. BOTTOM ACCENT    │               │ "EXPLORE 5,000+  │
     │ Texture / Dark Slide   │               │  DECKS ▶"        │
     │ Size: 180px            │               │ Size: 190px      │
     └────────────────────────┘               └──────────────────┘
```

#### Hexagon Geometric Formulas:
- **Clip-Path Geometry:**
  ```css
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  ```
- **Aspect Ratio:** `0.866` (Strict Equilateral Hexagon).
- **Elevation / Depth Filter:**
  ```css
  filter: drop-shadow(0 20px 40px rgba(17, 17, 17, 0.14));
  ```
- **Focal Hexagon (01):** Features slide image `/portfolio/case_study_a_1.png` or presenter stage image with subtle ambient gold stroke.
- **Action Hexagon (04):** Solid Honey Gold fill (`#FCBF14`), containing centered dark obsidian text (`12px font-black uppercase tracking-wider`) with circular arrow button.

---

## 🔄 4. Micro-Interactions & Animation Standards

1. **Page Load Stagger (Framer Motion / CSS Keyframes):**
   - Left Column Elements: Stagger `y: +20px ➔ 0px`, `opacity: 0 ➔ 1`, duration `0.5s`, delay `0.1s` per item.
   - Right Hexagon Cluster: Staggered scale `0.92 ➔ 1.0`, duration `0.6s`, cubic-bezier ease out.
2. **Hexagon Hover Lift:**
   - Scale: `1.03`.
   - Subtle vertical float: `translateY(-6px)`.
   - Internal image zoom: `scale(1.06)` with transition `500ms ease-out`.
3. **Continuous Background Grid:**
   - Seamless SVG large honeycomb grid repeated infinitely on `body` / page wrapper without section seam breaks.

---

## 📁 5. Local Assets Reference
The following local files are available for import into Stitch / code:
- **Hero Image Placeholder:** `/src/assets/hero.png`
- **Portfolio Case Studies:** `/public/portfolio/case_study_a_1.png`, `case_study_a_14.png`, `global_brands_1.png`, `nike_hsbc_cvs_1.png`
- **Fonts:** `/public/fonts/Manrope-Variable.ttf`
- **Brand SVG Logo:** Located in `/src/components/SlideBeeLogo.tsx`
