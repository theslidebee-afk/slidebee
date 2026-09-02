# Official SlideBee Brand Identity & Color Specification

This reference document records the official, approved SlideBee brand color palette extracted directly from Slide 3 of `SlideBEE.pptx`.

---

## 🎨 Master Color Palette

| Swatch | Color Name | Hex Code | RGB | HSL | Primary Usage |
| :---: | :--- | :--- | :--- | :--- | :--- |
| <div style="background-color:#111111;width:32px;height:32px;border-radius:6px;border:1px solid #444;"></div> | **Obsidian Black** | `#111111` | `rgb(17, 17, 17)` | `hsl(0, 0%, 7%)` | Dark backgrounds, primary dark containers, high-contrast headings |
| <div style="background-color:#FCBF14;width:32px;height:32px;border-radius:6px;border:1px solid #444;"></div> | **Honey Yellow** | `#FCBF14` | `rgb(252, 191, 20)` | `hsl(44, 98%, 53%)` | Primary CTA buttons, key highlight accents, active states, badge pills |
| <div style="background-color:#FFF9E8;width:32px;height:32px;border-radius:6px;border:1px solid #ccc;"></div> | **Warm Milk Cream** | `#FFF9E8` | `rgb(255, 249, 232)` | `hsl(44, 100%, 95%)` | Light cards, secondary backgrounds, high-readability light containers |
| <div style="background-color:#936610;width:32px;height:32px;border-radius:6px;border:1px solid #444;"></div> | **Amber Gold** | `#936610` | `rgb(147, 102, 16)` | `hsl(39, 80%, 32%)` | Subtitle highlights, secondary borders, hover states, deep gold accents |
| <div style="background-color:#726F6D;width:32px;height:32px;border-radius:6px;border:1px solid #444;"></div> | **Charcoal Slate Grey** | `#726F6D` | `rgb(114, 111, 109)` | `hsl(24, 2%, 44%)` | Secondary body text, neutral borders, inactive states, table metadata |

---

## 🔤 Typography & Brand Font

- **Primary Brand Font**: **Montserrat**
  - Light (300)
  - Regular (400)
  - Medium (500)
  - SemiBold (600)
  - Bold (700)
  - ExtraBold (800)
  - Black (900)
- **Local Implementation**: Loaded locally from `/fonts/` with zero external Google Fonts network latency.

---

## 🛠️ CSS & Tailwind Color Variables Mapping

```css
@theme {
  --color-primary: #FCBF14;       /* Honey Yellow */
  --color-primary-dark: #D99F06;  /* Deep Honey Yellow */
  --color-primary-amber: #936610; /* Amber Gold */
  --color-obsidian: #111111;      /* Obsidian Black */
  --color-cream: #FFF9E8;         /* Warm Milk Cream */
  --color-slate-custom: #726F6D;  /* Charcoal Slate Grey */
}
```
