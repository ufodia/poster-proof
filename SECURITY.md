# Security policy

Security fixes target the latest `main` in the 0.1 development line. There is no response-time guarantee.

Use **Security → Report a vulnerability** on GitHub if private reporting is available. If it is not, open an issue requesting a private channel without disclosing the vulnerability, confidential images, or secrets.

The app processes user-provided PNG/JPEG files and text locally. File size, decoded dimensions, and comparison token counts are bounded. OCR runs in a worker using locally served assets. Input text is inserted as text nodes rather than HTML. Reports contain copy, OCR text, image metadata, and findings; handle them as sensitive documents.

Keep your development server bound to loopback. Static hosting, browser extensions, or a modified dependency can change the processing boundary. This tool does not certify safety, legal accuracy, accessibility, or print readiness.
