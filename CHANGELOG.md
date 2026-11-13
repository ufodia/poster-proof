# Changelog

## Unreleased

- Prevent late image decodes from overwriting newer artwork or a newly loaded demo.
- Disable OCR, comparison, and artwork download while an image is being decoded; close stale decoded bitmaps.
- Keep resized analysis canvases at least one pixel wide and high, including very narrow valid images.
- Preserve the correct filename during asynchronous artwork export and report resizing on either dimension.
- Add browser regressions for pending image loads and narrow artwork.

## 0.1.0 — 2026-11-13

- Added a responsive proof desk with PNG/JPEG import and an explicitly labeled demo transcript.
- Added real browser-local English OCR with locally bundled worker, WASM, and model assets.
- Added order-aware approved-copy comparison, word-coordinate overlays, editable transcript, and human review.
- Added QR destination checking, effective print-density calculation, artwork download, and JSON proof reports.
- Added regression tests including a real generated QR decode fixture, documentation, and a checks-only CI workflow.

This is an initial development version. Human review remains required.
