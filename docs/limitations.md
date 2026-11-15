# Limitations

- OCR supports the bundled English model. Decorative fonts, low contrast, curved text, and language mismatch can create errors or omissions.
- Comparison normalizes letter case and punctuation, then checks token order. A punctuation-only change, a changed currency glyph, or a visual character distinction can be missed. Always inspect material amounts and contact details in the image.
- The reference is user supplied. If it is wrong, a matching poster can still be wrong.
- Reading order can differ from design order. Repeated decorative phrases and unusual layouts can create misleading alignment.
- A low-confidence value is Tesseract's own score, not a calibrated probability that a word is correct.
- Highlight boxes depend on current OCR word alignment. Missing words may have no location, and manually edited transcripts can lose all coordinate mapping.
- QR analysis uses the resized image and returns one decoded code. Multiple codes, tiny codes, severe distortions, or codes visible only at the original resolution may be missed. A matching destination is not fetched and is not certified safe, reachable, or owned by you.
- The area of a decoded QR code is excluded from the OCR image to reduce false text findings. Text overlapping the code may also be excluded and must be inspected manually. An undecoded or additional code is not masked and may produce OCR noise; the displayed and downloaded artwork is unchanged.
- Effective DPI is pixel count divided by physical size. It does not evaluate color space, bleed, safe areas, compression artifacts, print stock, or printer requirements.
- Images are bounded to 12 MB, 40 megapixels decoded, and a 3,200-pixel analysis edge. Very large files can still consume browser memory during decoding.
- Review/export state exists only in memory. Save a report before leaving the page if you need a record.

A zero-finding report is not a certificate. Keep your ordinary human proofreading and production checks.
