---
description: How to test the application after making any changes.
---

# Testing Requirements Workflow

Before reporting that changes are done, you MUST test the application across unit, integration, and end-to-end levels, as well as visually verifying changes if vision support is available.

## 1. Unit Testing
- For new logic or components, write tests (e.g., using Vitest, React Testing Library).
- Ensure existing tests pass: `npm run test` or similar.

## 2. Integration & E2E Testing
- Run existing end-to-end test suites (e.g., Playwright or Cypress) if configured.
- If not configured, use the `browser_subagent` to step through the critical paths of the app related to your changes.
- Ensure the application successfully starts (e.g. `npm run build` and `npm run dev` start without crashing the tree).

## 3. Visual & Manual Verification
- Use the provided `browser_subagent` or Playwright scripts to launch the app and verify the specific components or pages you touched render properly.
- If you have vision support, take screenshots and verify components manually.
- Go through the relevant user journeys to ensure nothing is functionally broken.

// turbo-all
