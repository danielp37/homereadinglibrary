# Squad Decisions

## Active Decisions

### 2025-01-30: npm overrides for transitive dependency security fixes

**By:** Cassini (Frontend Dev)  
**Date:** 2025-01-30  
**Status:** Implemented

**Decision:**
Use npm `overrides` block in `HomeReadingLibraryWeb\ClientApp\package.json` to force patched versions of 5 transitive devDependencies:

```json
"overrides": {
  "vite": "7.3.2",
  "lodash": "4.18.1",
  "hono": "4.12.14",
  "@hono/node-server": "1.19.14",
  "follow-redirects": "1.16.0"
}
```

**Rationale:**
- GitHub Dependabot identified 14 open security alerts (3 HIGH, 10 MEDIUM, 1 MODERATE) in transitive devDependencies brought in by @angular/cli and @playwright/test; this change resolves 13 of those alerts and leaves 1 unresolved
- Direct version upgrades not feasible since these are transitive; npm overrides is the official npm v8.3+ mechanism for enforcing dependency versions
- All overridden versions are patch/minor upgrades within the same major version (low risk of breaking changes)
- Validation passed: build succeeded, all 21 backend tests passed, no new warnings

**Consequences:**
- ✅ Resolves 13 of the 14 Dependabot alerts without application code changes
- ✅ All overrides are transitive devDependencies only (zero production impact)
- 🔄 1 alert remains: uuid@8.3.2 buffer bounds check unresolved (no fix in 8.x line; monitoring for 9.x)
- Must periodically review overrides when upgrading Angular CLI or Playwright

**Validation:**
- ✅ npm install, npm ls, dotnet build, 21 tests all passed
- ✅ No runtime errors or warnings introduced

---

### 2026-04-16: AddBookModal implementation approach

**By:** Cassini (Frontend Dev)  
**Date:** 2026-04-16

**Decision:**
- Implement a local reusable component `AddBookModalComponent` using existing ngx-bootstrap ModalModule (BsModalService).
- Do not introduce a global modal service or new library; keep scope minimal and consistent with existing codebase patterns.

**Rationale:**
- Project already uses ngx-bootstrap ModalModule and several components rely on BsModalService, so reusing it keeps consistency.
- The requested feature is small and localized; a shared modal service would add indirection without immediate benefit.
- The component exposes an Output (bookAdded) so it can be reused by different pages.

**Consequences:**
- Future refactor may extract a shared modal utility if multiple widgets require consistent modal behaviors (focus management, modal stacking, etc.).
- The backend API expectation is POST /api/books (BaggyBookService.addBook). Ensure backend provides this endpoint.

---

### 2026-04-17: Project scaffolding and platform choices

**By:** Copilot (Kepler)  
**Date:** 2026-04-16

**Decision:**
- Keep existing project layout: AspnetCore.Identity.MongoDb (identity library), HomeReadingLibrary.Controllers (API surface), HomeReadingLibrary.Domain (domain logic), HomeReadingLibraryWeb (host + SPA static files).
- Target framework: .NET 10 for all backend projects.
- Frontend: Angular 21 (ClientApp under HomeReadingLibraryWeb).

**Rationale:**
- Matches seeded repo and simplifies onboarding.

**Consequences:**
- Developers must install .NET 10 SDK and Angular 21 tooling to run end-to-end.

---

### 2026-04-24: Column Sorting for Missing Check-ins Report

**By:** Cassini (Frontend Dev)  
**Date:** 2026-04-24  
**Status:** Implemented

**Decision:**
Sort `rows` in-place using `Array.sort()` directly on the component's data array. No pipe, no external library.

**Rationale:**
- The dataset is small (report output), so in-place sort is simple and efficient with no meaningful performance downside.
- Avoids introducing an Angular pipe or a new dependency just for sort, keeping the component self-contained and consistent with the existing pattern in this codebase.
- Reading Level sort uses a two-key comparison (readingLevel string → boxNumber integer) to handle the case where two books share the same level but differ in box; `parseInt(..., 10) || 0` safely handles empty/non-numeric boxNumber values.
- Sort direction is toggled per-column (asc on first click, desc on second), with a reset to asc whenever a different column is clicked — standard UX convention.

**Consequences:**
- ✅ No new imports or dependencies needed.
- ✅ `ng build` passes with no TypeScript errors.
- ⚠️ Sort state resets if `runReport()` is called again (rows replaced); this is acceptable since a fresh data load should start unsorted.

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
