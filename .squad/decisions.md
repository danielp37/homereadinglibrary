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
- GitHub Dependabot identified 14 open security alerts (3 HIGH, 10 MEDIUM, 1 MODERATE) in transitive devDependencies brought in by @angular/cli and @playwright/test
- Direct version upgrades not feasible since these are transitive; npm overrides is the official npm v8.3+ mechanism for enforcing dependency versions
- All overridden versions are patch/minor upgrades within the same major version (low risk of breaking changes)
- Validation passed: build succeeded, all 21 backend tests passed, no new warnings

**Consequences:**
- ✅ Resolves 13 of 14 Dependabot alerts without application code changes
- ✅ All overrides are transitive devDependencies only (zero production impact)
- 🔄 uuid@8.3.2 buffer bounds check unresolved (no fix in 8.x line; monitoring for 9.x)
- Must periodically review overrides when upgrading Angular CLI or Playwright

**Validation:**
- ✅ npm install, npm ls, dotnet build, 21 tests all passed
- ✅ No runtime errors or warnings introduced

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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
