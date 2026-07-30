# Profile Moderation & Compliance Operations

The Moderation module enforces platform quality guidelines by routing profile details, uploaded imagery, and account behavior through manual and automated evaluation stages.

## 1. Moderation Pipelines

Registrations requiring checking are placed in the profile ledger:
- **Pending Profiles**: Profiles with state `PENDING` must be manually reviewed before they appear in user searches.
- **Actions**: Approve (state -> `APPROVED`), Reject (state -> `REJECTED`, requires reason).
- **Fraud Checks**: Accounts flagged for suspicious session activity are logged in the Fraud ledger for inspection.

## 2. Suspensions & Blacklisting

When a user violates safety policies:
- **Suspension**: Suspends user authentication.
- **Blacklisting**: The user's verified email and phone hashes are written to the blacklist register. Future signups using blacklisted credentials are blocked during database validation.

## 3. Photo & ID Verification

Identity checks utilize a dual-image comparison layout:
- **ID Copy vs. Selfie**: Operators verify that the government document metadata (e.g., date of birth, name) matches the profile registration, and verify that the photo match matches the user's uploaded selfie.
- **Bulk Media Processing**: Allows approving or rejecting multiple uploads concurrently.
- **Re-upload Request**: Requests that a user resubmits documents with specific feedback when images are unreadable.
