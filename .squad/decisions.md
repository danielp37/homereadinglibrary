# Squad Decisions

## Active Decisions

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
