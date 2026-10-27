---
status: accepted
---

# 0004 — CV parsing runs in-process

## Context

FR-3 requires PDF/DOCX text extraction followed by AI extraction of skills,
technologies and level. The use-case diagram lists a CV Parser as an external
system, but a third-party parser adds an account, a quota and another place
where personal data leaves the system.

## Decision

Parse documents in the worker with `unpdf` (PDF) and `mammoth` (DOCX), then call
Gemini with a JSON schema. The parser is a library dependency, not a third-party
runtime service. If Gemini is unavailable, a local rules engine returns
candidate skills and labels the source as `RULES`.

The API stores the file in the private `cvs` bucket; the worker downloads it by
id. The browser never parses or receives the raw file back.

## Alternatives rejected

| Option | Why not |
|---|---|
| Paid CV parser API | New external service, personal data, free plan ends |
| Parse in the browser | File never leaves the client but adds a large bundle and bypasses the server limit |
| Store the raw text forever | Personal data retention beyond the extraction need |

## Consequences

- `unpdf` is ESM-only; the CJS API bridges with a native dynamic import in
  `cv.parser.ts`.
- Scanned PDFs without a text layer fail with a clear message.
- The AI call is metered; the rules fallback is free and honest.
- A future switch to OCR would be an additive worker change.

## Revisit

If scanned CVs become a requirement, or if `unpdf` stops supporting the Node LTS.
