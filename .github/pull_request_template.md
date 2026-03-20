## What does this PR do?

<!-- One or two sentences. Focus on *why*, not just *what*. -->

Closes #<!-- issue number -->

## Type

- [ ] Bug fix
- [ ] New feature
- [ ] Broker parser
- [ ] UI/UX improvement
- [ ] Refactor
- [ ] Documentation

## Changes

<!-- Bullet list of the key changes. Keep it concise. -->

-

## Screenshots / Video

<!-- Required for any UI change. Delete this section if not applicable. -->

## How was this tested?

<!-- Describe what you did to verify. Which broker files? Which pages? -->

- [ ] Tested with sample CSV from `public/demo-data/`
- [ ] Tested on mobile viewport
- [ ] Tested edge case: empty state / no data

## Broker Parser Checklist

<!-- Only for broker parser PRs. Delete this section otherwise. -->

- [ ] Created `lib/parsers/<broker>.ts` following the parser template
- [ ] Added header signatures to `lib/parsers/detect-broker.ts`
- [ ] Wired into `lib/parsers/index.ts`
- [ ] Added sample CSV to `public/demo-data/`
- [ ] Verified P&L matches broker's own P&L statement

## Checklist

- [ ] Self-reviewed my own code
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` completes successfully
- [ ] No console errors or warnings in browser
- [ ] No network requests carry user trade data
- [ ] Commits follow conventional format (`feat:`, `fix:`, `refactor:`, `docs:`)
