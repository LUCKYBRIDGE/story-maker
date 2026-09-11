---
name: code-review
description: Review a requested diff or material regression risk against this repository's contracts; ordinary edits do not require a separate review workflow.
---
# Review

- Read the scoped diff and affected contract. Report actionable defects with a concrete trigger and consequence; do not silently implement fixes during review.
- Preserve student works, prior Excel compatibility, asset IDs and edit/play separation. Use the current task card and G/A/B/D evidence contract; CI success is reusable only for matching revision and relevant inputs.
- Prioritize correctness, data loss, security and affected user behavior. Read design or architecture references only when the change touches them.
- Inspect existing matching evidence before choosing additional checks. Do not impose a full suite, build or zero-warning target beyond the project's gate.
- Distinguish verified defects from untested concerns. Keep findings in the response unless the user requested a review artifact.
