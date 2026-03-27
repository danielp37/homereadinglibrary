---
description: "Use when creating or updating handoff.md so work can be resumed safely and quickly by another agent or developer."
applyTo: "**/handoff.md"
---

# Handoff File Rules

## Purpose
- Keep handoff.md as the single source of truth for current status, next actions, and blockers.
- Write for continuity so another person can resume work without re-discovery.

## When To Update
- Update handoff.md after meaningful code changes.
- Update handoff.md before stopping when work is incomplete.
- Update handoff.md when a blocker or assumption changes.

## Required Sections
1. Context: ticket/task goal and scope boundaries.
2. Current Status: what is done and what is in progress.
3. Changes Made: files changed and a short reason for each.
4. Validation: commands run and outcomes.
5. Open Issues/Blockers: unresolved items and impact.
6. Next Steps: ordered, actionable steps to continue.

## Writing Standards
- Be factual and concise; avoid speculation.
- Prefer concrete references to files, commands, and observed outcomes.
- Mark assumptions clearly and separate them from confirmed facts.
- Keep older notes trimmed so the file stays readable.

## Safety
- Do not claim validation was run if it was not.
- Do not mark work complete with known failing tests caused by the latest changes.
