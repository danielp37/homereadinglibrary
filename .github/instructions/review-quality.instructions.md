---
description: "Use when the user asks for a review to prioritize concrete findings, behavioral risks, and missing tests over summaries."
---

# Review Quality Rules

## Findings First
- List concrete findings before any summary.
- Order findings by severity: correctness, regressions, security, data integrity, performance, maintainability.
- For each finding, include impacted file and why it matters.

## Evidence and Specificity
- Prefer verifiable issues over speculative style feedback.
- Call out missing test coverage for changed behavior.
- Note risky assumptions explicitly.

## Structure
1. Findings (ordered by severity).
2. Open questions or assumptions.
3. Brief change summary.
4. Residual risk and testing gaps.
