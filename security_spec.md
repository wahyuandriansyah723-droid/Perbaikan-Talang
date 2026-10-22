# Security Specification: SiTalang Firestore Security

## 1. Data Invariants
- Each report document in `/reports/{reportId}` must contain valid identifier and code strings.
- Reports cannot have missing required fields: `id`, `code`, `title`, `location`, `gutterType`, `damageType`, `urgency`, `status`.
- Progress percentage must be between 0 and 100.
- String properties must be bounded in length to prevent wallet exhaustion / payload overflow.
- System settings in `/settings/{settingId}` must preserve structure and have valid field formats.
- Real-time updates must allow synchronized access across field devices, mobile phones, and office computers.

## 2. The "Dirty Dozen" Threat Payloads
1. Attempting to create a report with missing `code` or `title`.
2. Attempting to write a report with `progressPercentage` < 0 or > 100.
3. Attempting to inject oversized strings (> 20,000 characters) in description or metadata.
4. Attempting to alter unknown collections outside `/reports`, `/settings`, and `/test`.
5. Attempting to inject malicious script tags into status or enum values.
6. Attempting to delete settings documents.
7. Attempting to write non-array payloads to `timeline`.
8. Attempting to create documents with invalid IDs exceeding 128 characters.
9. Attempting to inject prototype poisoning keys `__proto__`.
10. Attempting to corrupt numeric cost fields with negative or non-numeric types.
11. Attempting to write malformed JSON or nested deep maps exceeding depth.
12. Attempting to bypass validation by providing empty object `{}`.

## 3. Test Runner
Verified against local emulator / security validation rules.
