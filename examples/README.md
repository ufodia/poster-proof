# Reproduce the sample

Start the app with `npm run dev`. Select **Load demo** to build a synthetic poster in the browser. Its copy reads:

```text
OPEN
STUDIO
19 NOVEMBER 2026
18:00 - 22:00
THE FOUNDRY
12 RIVER STREET
ENTRY FREE
```

The approved text uses **14 NOVEMBER 2026**. The expected QR target is `https://example.com/tickets`; the generated code contains `https://example.com/studio`. These reserved example-domain destinations are fixtures, not ticket sales.

Select **Save artwork** to download the generated PNG, then upload that file and run local OCR. Text recognition can vary by browser/engine version; inspect the evidence rather than expecting an identical fixture report. The pure comparison tests use exact transcripts so OCR variability does not hide comparison regressions.
