# Arc V2 — UI-1 Design System Consolidation

**Status:** Phase 1 foundation committed; build, tests, and browser review pending.
**Scope:** Visual consistency without changing existing Goals → Calendar → Today → Activity → Progress behavior.

## Audit findings

- `src/styles.css` has two historical root token declarations, with a later Arc blue/cyan/mint palette overriding an earlier lime palette.
- Component styles use legacy hard-coded colors and multiple override layers. A blanket conversion is unsafe before visual regression testing.
- Buttons, forms, page headers, and scrolling differ across screens. Focus manager is the approved reference for natural scrolling and restrained selection emphasis.

## Canonical foundation

- `src/arc/design-system.css` defines the canonical Arc tokens and is imported **after** legacy styles in `src/main.tsx`.
- Preserved current Arc dark blue/cyan/mint token values, rather than introducing a new visual identity.
- Introduced **opt-in** primitives: `arc-ui-button` (primary, quiet, danger), `arc-ui-field`, `arc-ui-panel`, `arc-ui-muted`. These do not globally restyle existing controls.
- Keyboard focus and reduced-motion behavior included.
- Legacy rules remain until individual components are migrated and tested; duplicate definitions in `styles.css` are technical debt, not yet deleted.

## Next migrations (separate reviewable changes)

1. Migrate shared page headers and primary/secondary buttons on one low-risk screen; compare against Focus manager.
2. Migrate form controls and interaction states, starting with Goals and Calendar.
3. Consolidate legacy tokens and remove superseded overrides only after confirming computed styles.
4. Validate desktop, mobile, zoom, dark theme, keyboard, focus, and page scrolling.

## Verification gate

Run `npm run check:release`. Inspect Today, Goals, Calendar, Progress, Focus manager, Integrations, and Programs for regressions. This phase does **not** authorize pilot invitations; Cloudflare retention and live first-use verification remain pending.
