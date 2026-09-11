# Verification scope

- The repository AGENTS.md and affected task's required checks define the gate; this file adds no independent full-suite or build requirement.
- For documentation-only edits, check affected references and consistency. For code, select affected checks; preserve explicit release, security and data-compatibility gates.
- Reuse passing evidence only for matching relevant code, inputs and required environment. Do not repeat local checks already established by equivalent CI evidence.
- Distinguish pre-existing warnings from new regressions. Do not modify unrelated code to satisfy a generic zero-warning target.
- Use a focused regression case for meaningful logic changes when practical; do not add tests merely to mirror wording or trivial implementation.
