# Vellum House — Interactive Atlas Design

## Creative direction
Inspired by the ScreenSpace showcase's interaction-first storytelling principle, not its exact visuals. The **atlas** is the visual metaphor for personalised guidance: a student starts at one place, explores possibilities, builds a plan, collects meaningful experience, and prepares for next steps. This is intentionally not a mandatory five-package service ladder.

## Interaction contract
1. Click/tap any of five stops to explore a chapter. Its panel updates (heading, 1–2 sentences and services), the drawn route advances or retreats, and a warm light travels along the SVG curve.
2. Previous/Next controls invite a sequential narrative. The endpoints are correctly disabled. A compact 01 / 05 status is always visible.
3. With keyboard focus on a stop, arrow keys navigate; Home/End select the first/last stop. Active state uses `aria-pressed`, `tabindex` and visible focus outlines. Panel changes have a polite live region.
4. On desktop, the map responds to pointer position with subtle illumination. On mobile, it becomes a clearly readable vertical set of choices with no drag interaction or obstructed scrolling.
5. Scroll-driven effects are secondary: a three-pixel gold reading indicator and gentle reveals on selected editorial elements.
6. `prefers-reduced-motion: reduce` disables animated transitions; all core content and navigation remain available.
7. Native JS and SVG; no heavy 3D library, external animation service or tracking library. The site remains meaningful without animations.
8. Fixed bottom CTA on mobile and persistent header CTA on desktop. Back-to-top becomes active after scrolling.

## Design tokens
- Navy #081723 / #0b1b2b
- Dark mid-blue #102b40
- Antique gold #d5ab6b
- Paper #f3f0e8
- Primary ink #10263a
- Persian typography: included licensed Vazirmatn; English wordmark: Georgia editorial styling.

## Honest content slots
Founder/team cards, verified results and testimonials have reserved places but no invented statistics, student outcomes or quotes. Replace only with sourced, approved material.

## Smoke tests
Source checks, Node syntax, and mock backend tests pass. In-memory Chromium tests exercised 320/390/768/1440px widths on Persian and English home and approach pages, five-stage controls, mobile menus, and contact-page configuration. Real deployment and full external form/calendar flow remain to be verified by the website owner.

## Developer note
`tools/build.py` belongs to the old V6 generator; **do not re-run it for the interactive release**. Edit the delivered HTML directly until a V7-aware generator is created. CSS cache busting is `v=7.1-interactive` and JS cache busting is the same.
