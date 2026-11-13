# Browser verification

The workbench test exercises real inputs and exports, including the bundled OCR worker, then checks a 390px viewport for horizontal overflow and collects uncaught browser errors. Additional regressions verify that a pending artwork decode cannot overwrite a later demo, that OCR stays disabled while pixels are loading, and that a very narrow valid image keeps a nonempty analysis canvas. No API key or model service is required.

```sh
npm ci
npx playwright install chromium
npm run test:browser
```

Playwright starts the local Vite server automatically. Desktop/mobile screenshots and failure traces are written to ignored `test-results/`; the HTML report is in `playwright-report/`. To use an already running server, set `PLAYWRIGHT_BASE_URL`. To use installed Chrome, set `PLAYWRIGHT_CHANNEL=chrome`. The default CI browser is Playwright Chromium.

These tests are intentionally scoped to the documented workbench workflow. They do not establish all-browser compatibility, universal input support, or the correctness of arbitrary AI output. The README screenshot is from the real local application using synthetic data.
