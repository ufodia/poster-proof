# Proof your first poster

## Load artwork

Choose **Upload artwork** and select a PNG or JPEG smaller than 12 MB and no more than 40 megapixels. The app resizes the longest side to at most 3,200 pixels for OCR and QR processing. The original dimensions are retained for effective-DPI calculation. **Save artwork** downloads the analyzed, potentially resized PNG, not the untouched original file.

The initial sample is a synthetic Open Studio poster. Its approved date is 14 November; the poster says 19 November. Its QR content differs from the expected ticket URL. The first recognized text is a labeled demo fixture. Use **Run local OCR** to recognize the actual pixels.

## Provide the reference

Paste approved copy into **What should it say?** in the intended reading order. The comparison allows up to 30,000 characters and 1,500 normalized tokens per text. Add a QR destination if the poster contains a code. The comparison is exact: trailing slashes, query parameters, and casing can make two QR strings different.

Set the physical width and height in millimeters to calculate effective DPI. These values do not set a printer profile or resample the image. If the aspect ratio differs, horizontal and vertical DPI will differ.

## Run OCR and inspect

Select **Run local OCR**. Loading the bundled WASM and model can take a moment. The status message reports progress. No image is sent to a remote OCR service. Current OCR supports English only.

Check the recognized text against the actual artwork. Orange boxes identify observed mismatches or low-confidence words; missing words without recognized coordinates cannot be boxed. Editing the transcript clears OCR coordinates and confidence observations. Rescan the artwork to obtain fresh pixel-level evidence.

Choose **Compare current text** after edits. Review state resets when a new report is generated. Editing approved text, recognized text, or the expected QR target invalidates the previous report and disables export until comparison runs again.

## Record your decision

Select **Mark reviewed** on each finding you have inspected. This records a decision without changing the artwork. Export the report for your own records. It includes the approved copy, OCR transcript, QR result, dimensions, findings, and review IDs. It does not embed the image.

## Troubleshooting

If OCR assets fail to load, run `npm run dev` or `npm run build` again to prepare them and make sure `public/ocr/` or `dist/ocr/` is present. Do not open `index.html` directly from disk; workers require a local HTTP origin. If a code cannot be decoded, inspect it at the original resolution and verify it using your normal production workflow. A blank or sparse OCR result is a reason to inspect the image, not proof of missing printed text.
