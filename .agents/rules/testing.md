# Testing & Verification Rules

## 1. Zero-Error Build Policy
- Every code change must maintain `npm run build` (or stack equivalent) with **0 errors**.
- Never commit broken code or disabled tests.

## 2. Self-Healing Verification
- Run local unit tests and build gates before completing a task.
- If verification fails, iteratively heal root causes up to 3 times before escalation.
