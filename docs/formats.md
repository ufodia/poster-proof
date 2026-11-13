# Proof report format

Browser exports are JSON with `version: 1`. They contain:

| Field | Meaning |
| --- | --- |
| `expected`, `observed` | Approved copy and current recognized/edited transcript |
| `findings` | Report-local IDs, kind, expected/observed tokens, explanation, and available image boxes |
| `matched`, `total` | Matched approved tokens and total approved tokens; not an accuracy guarantee |
| `limitations` | Processing and interpretation limits |
| `image` | Filename, original dimensions, and analysis-canvas dimensions |
| `transcriptSource` | `demo-fixture`, `uploaded`, `local-ocr`, or `manual-transcript`; describes the current transcript origin |
| `qr` | State, explanation, decoded content, and expected destination |
| `density` | Horizontal/vertical effective DPI, or `null` for invalid print dimensions |
| `reviewed` | IDs of findings marked reviewed in this report |

Finding kinds are `missing`, `extra`, and `uncertain`. A missing finding can contain observed replacement text. Boxes use analysis-canvas pixel coordinates `{x0,y0,x1,y1}`. Never apply them directly to a different image or assume they use original-image dimensions. IDs are not stable across edits or rescans.

Editing the transcript changes its origin to `manual-transcript` and clears OCR word coordinates and confidence values. Empty boxes deliberately signal that coordinates cannot be mapped safely. Image bytes are not exported.

The current app exports reports but does not import and trust a saved report as a new OCR observation.
