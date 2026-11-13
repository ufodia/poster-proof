# Third-party notices

PosterProof's own source and artwork are MIT-licensed by Ufodia. Dependencies retain their own licenses and notices.

| Component | Version | License | Purpose |
| --- | --- | --- | --- |
| Tesseract.js | 7.0.0 | Apache-2.0 | Browser OCR orchestration |
| tesseract.js-core | 7.0.0 | Apache-2.0 | WebAssembly OCR engine resolved from Tesseract.js |
| @tesseract.js-data/eng | 1.0.0 | MIT (npm package metadata) | Distributed English language model |
| jsQR | 1.4.0 | Apache-2.0 | QR decoding |
| qrcode | 1.5.4 | MIT | Synthetic demo QR generation |

The asset-preparation script copies worker/model/core files for same-origin execution. When redistributing builds, preserve relevant third-party notices and license files. Development tooling and transitive dependencies are recorded in `package-lock.json`; their installed package directories contain their full licenses. See the upstream repositories linked in the README for source and additional attribution.
