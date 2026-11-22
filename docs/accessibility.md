# Accessibility development checklist

Target: WCAG 2.2 AA (not a conformance claim).

Automated: npm test; npm run build; npx playwright install chromium; npm run test:a11y. Browser tests assert keyboard focus and settings persistence and collect axe findings for every game route. Reports are diagnostic until existing findings are resolved. Do not interpret an empty report as full conformance.

Manual release checklist:
- [ ] Keyboard-only full game in every module; Tab order, Enter/Space, arrow navigation and focus after opponent turns.
- [ ] NVDA/Firefox or Chrome on Windows; TalkBack/Chrome on Android; VoiceOver/Safari on iOS. Verify card names, coordinates, legal moves, errors and results.
- [ ] Zoom 200%, 400% and 320 CSS px; ensure controls reflow and only essential two-dimensional boards scroll.
- [ ] Text contrast 4.5:1 (large 3:1); essential non-text cues 3:1. Review standard, friendly and monochrome palettes, forced colors.
- [ ] Touch targets 24 CSS px minimum subject to exceptions; aim 44 for controls. Verify pointer cancellation, tap alternatives and no accidental moves.
- [ ] Motion and settings persistence; offline launch and interaction with assistive technology.
- [ ] Review dynamic focus and announcements, dialogs, and full card-game play with no visual input.

Reference: https://www.w3.org/TR/WCAG22/
