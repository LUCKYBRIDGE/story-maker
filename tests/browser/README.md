# Browser regression

```sh
npm ci
npx playwright install chromium
npm run build:github
npm run qa:smoke
```

CI uses `npx playwright install --with-deps chromium` on Linux. Playwright is pinned
in the development lockfile; no global Chrome or private module path is required.
`QA_CHANNEL=chrome` and `PLAYWRIGHT_MODULE` remain optional local overrides.

The runner serves `out` at `/story-maker/` on an ephemeral loopback port, then runs
start-screen, story-flow, sticky-memos, pinky-examples sequentially. This verifies
the production static export and base path rather than depending on dev compilation.
`QA_URL` selects an already running server. It must contain only disposable QA data;
each script uses isolated browser contexts. No real student storage is read.

Default smoke viewports are 1365×900 and 390×844. `QA_VIEWPORTS='[[820,1180]]'`
selects additional sizes for the first three suites; examples cover desktop/mobile
with their own theme matrix. Existing wider start-screen defaults remain available
when running that script directly. Each suite has a five-minute deadline, locator
waits 15 seconds, navigation 30 seconds. Failures are not retried or ignored.

Evidence is under `outputs/browser-smoke` (override `QA_OUTPUT`): per-suite logs,
JSON timing/results, success screenshots, failure screenshot/console/network errors
and Playwright trace. `npx playwright show-trace <trace.zip>` inspects a failure.
GitHub uploads available evidence for seven days even after a failed test. Fixture
content only; do not supply personal student documents to CI.

The existing `verify` job includes these steps after the Node suite and remains
the single check to require in branch protection. This does not itself configure
branch protection or change the Pages release workflow. Build/install errors are
visible in the Actions step log even if browser evidence has not been created.

npm caching is retained. Browser binary caching is omitted initially: only Chromium
is installed, Linux system packages must still be installed, and cache restoration
adds maintenance without measured benefit. Run serially for predictable resources.
See [Playwright CI guidance](https://playwright.dev/docs/ci).

The smoke is DOM/interaction regression, not pixel-baseline comparison, narrative
quality approval, physical iOS/Android, Korean IME or full accessibility certification.


## Classroom checks

`QA_OUTPUT=outputs/classroom npm run qa:classroom` reuses the static runner for
mobile-input and sheet-import (also in CI verify). `QA_SUITES` can select a comma
separated subset from the six known scripts. No arbitrary script paths are accepted.
Mobile CDP touch is emulation; Korean text fill is not IME. Sheet responses come
from an actual Excel-generated CSV fixture intercepted at the Google request boundary.
Normal import, optional memo-tab 404, 403 and login HTML are verified in the UI;
real Google permissions/transport remain a manual check with an approved public sheet.
