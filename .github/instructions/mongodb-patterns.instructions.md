---
description: "Use when changing MongoDB-related code or scripts to preserve data shape conventions, query safety, and index-aware behavior."
applyTo: "mongodb/**/*.js,AspnetCore.Identity.MongoDb/**/*.cs,HomeReadingLibrary.Domain/**/*.cs"
---

# MongoDB Guidance

## Data Shape and Compatibility
- Preserve existing document shapes and field naming conventions.
- Do not introduce implicit schema changes; make data-shape changes explicit and intentional.
- Keep serialization/deserialization behavior compatible with existing data.

## Query and Update Safety
- Keep filters explicit and narrowly scoped.
- Avoid broad update operations without precise predicates.
- Prefer deterministic query logic and stable sort/order assumptions when results are user-visible.

## Performance and Index Awareness
- Prefer query patterns aligned with known indexes.
- Call out potential index impacts when introducing new high-volume query paths.
- Keep aggregation pipelines readable and explain non-obvious stages briefly.

## Migration and Scripts
- For script updates in `mongodb/`, preserve script intent and idempotency where possible.
- Avoid destructive operations unless explicitly requested.
