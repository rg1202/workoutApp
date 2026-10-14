# Arc V2 — M2 Canonical Design Contract
Status: **M2.1 established; implementation migration in progress**
Branch: `chore/v2-stabilization`
Scope: V2 BJJ, Running, Cycling and the Goals → Calendar → Today → Activity → Progress loop.

## Source of truth

1. Brand and semantic design tokens: `src/arc/design-system.css`.
2. Existing visual intent: `docs/design/ARC_V2_UI_1_DESIGN_SYSTEM.md`.
3. Legacy styles: `src/styles.css`, `src/calendar.css`, `src/bjj.css`, `src/integrations.css`. These remain operational but are **not** sources for new component variants.
4. Import order in `src/main.tsx`: legacy stylesheets first, canonical design system last. Preserve until migration is proven visually.

## Design invariants

- **Identity:** dark navy surfaces; blue/cyan/mint accents. No reintroduction of legacy lime as a general brand accent.
- **Surfaces:** use `--arc-bg`, `--arc-surface`, `--arc-surface-2`, `--arc-border`; avoid unrelated one-off background colors.
- **Text:** `--arc-text` for primary content, `--arc-muted` for secondary content. Information hierarchy must not rely on color alone.
- **Actions:** canonical `arc-ui-button` with `--primary`, `--quiet`, and `--danger` variants. One clear primary action per decision area; secondary actions should not visually compete.
- **Fields:** `arc-ui-field` with associated visible labels, validation feedback, focus states and sensible defaults.
- **Panels:** `arc-ui-panel` for shared card surfaces; distinguish nested content through spacing and typography before adding more borders.
- **Geometry:** `--arc-radius`, `--arc-action-height`, `--arc-action-radius`; consistent tap/click areas and alignment.
- **Focus:** visible keyboard focus, with `--arc-focus-outline`; never remove outlines without an accessible replacement.
- **Motion:** honor reduced-motion preferences.
- **Scrolling:** page-level natural scrolling by default; nested scroll containers only when intentional, discoverable and keyboard accessible. Focus manager is the existing reference.
- **Responsive:** do not ship desktop-only assumptions during migration; dedicated device acceptance occurs in M5.
- **Terminology:** Goals, Calendar, Today, Activity, Progress remain the user's core vocabulary.

## UX invariants for each screen

- The screen answers **Where am I? What matters? What can I do next?**
- Important actions appear near the information that motivates them.
- Avoid duplicated controls, repeated summaries, gratuitous dropdowns, and hidden state changes.
- Every action gives immediate feedback and retains expected context after navigation.
- Empty, loading, error, and success states are understandable without prior knowledge.
- User data, activity identity, goal associations, and progress calculations are never altered by visual-only migrations.

## Current verified audit findings

- `src/styles.css` approximately 199 KB / 1,130 physical lines; multiple historical overrides and compressed selectors.
- `src/arc/design-system.css` approximately 18.6 KB / 369 lines; includes canonical tokens, opt-in primitives, and screen-specific migrations.
- The original UI-1 specification explicitly states legacy duplicate declarations remain and that a blanket conversion is unsafe.
- Canonical CSS is imported last. Selector specificity still matters; import order alone does not guarantee every legacy rule is superseded.
- Owner verified clean install/build, 104 Chromium regression tests, and 2 production tests on the stabilization branch. **Visual acceptance has not been completed.**

## Migration sequence and quality gates

### M2.1 — Contract and inventory
- [x] Identify token source, import order, shared primitive names, and known CSS debt.
- [x] Publish this canonical design contract.
- [ ] Inventory all conflicting declarations and identify active component owners.

### M2.2 — Shared shell and navigation
- [ ] Audit app header, sidebar, page titles, navigation, content width, and page scrolling.
- [ ] Implement small, reversible changes and visually compare key screens.

### M2.3 — Shared controls
- [ ] Migrate buttons, fields, selects, dialogs, and action groups to canonical primitives.
- [ ] Preserve accessible names and test selectors.

### M2.4–M2.5 — Product screens
- [ ] Goals and Calendar.
- [ ] Today and Progress.
- [ ] BJJ, Running, Cycling, Programs, You, Integrations.

### M2.6 — Consolidation
- [ ] Remove obsolete CSS only after identifying actual usage and computed-style parity.
- [ ] Reduce duplicated declarations; document any retained exceptions.

### M2.7 — Acceptance
- [ ] `npm run check:release` passes on the final M2 commit.
- [ ] Visual review of navigation, scrolling, primary actions, forms, dialogs, empty states and page hierarchy.
- [ ] No regression in Goals → Calendar → Today → Activity → Progress.
- [ ] Product owner approves the resulting canonical experience before M3 frictionless UX work.

## Change discipline

No global button restyle, wholesale stylesheet replacement, major layout rewrite, or broad file deletion without explicit before/after evidence. Prefer migrating one shared component or screen at a time; record changed selectors, test results and screenshots.
