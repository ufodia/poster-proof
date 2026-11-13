# Contributing to PosterProof

Use Node.js 24.18 or later. Run `npm ci`, then `npm run dev`. Run `npm run check` before opening a pull request against `main`.

The most useful reports include a small, synthetic poster, its approved copy, expected QR content, and the actual result. Explain whether the failure is in OCR, alignment, coordinate mapping, QR decoding, or the user interface. Keep original evidence: OCR corrections should never be silently treated as pixel-level facts.

New comparison rules need changed-content and unchanged-content examples. New languages need documented model assets, licenses, and practical recognition tests. Do not add cloud image processing or telemetry without a separate design proposal.

Keep changes focused, update the user guide when behavior changes, and preserve pinned dependencies and the lockfile. Never upload real client artwork or confidential event details to public issues. Follow [SECURITY.md](SECURITY.md) for vulnerabilities and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations.
