# Security Specification - Assan School Portal

## Data Invariants
1. **State Isolation**: Users can only read/write state keys that are either public or owned by their school.
2. **Role-Based Access**: Only admins can modify critical school settings and financial records.
3. **User Integrity**: Users cannot modify their own roles or school associations.
4. **Data Ownership**: Every piece of synced data must be associated with a valid `schoolId`. (Note: The current `syncService.ts` doesn't explicitly handle multi-tenancy in the path, it uses a flat `state/{key}` structure. I should recommend or implement a more secure structure like `schools/{schoolId}/state/{key}`).

## The "Dirty Dozen" Payloads

1. **Identity Spoofing**: Attempt to create a user profile with `role: "admin"` as a guest.
2. **State Poisoning**: Attempt to write a 2MB string into `system_settings`.
3. **Unauthorized Read**: Attempt to read `fin_transactions` as a student.
4. **Cross-School Leak**: Attempt to read another school's `students` list.
5. **Role Escalation**: A teacher attempting to update their own user document to `role: "admin"`.
6. **Orphaned Write**: Writing a student record with a non-existent `schoolId`.
7. **Timestamp Fraud**: Sending a future `updatedAt` value.
8. **Shadow Field Injection**: Adding an `isVerified: true` field to a student record.
9. **ID Poisoning**: Using a 10KB string as a document ID for a state key.
10. **PII Leak**: Reading the `users` collection to scrape email addresses.
11. **State Shortcutting**: Updating `all_exam_results` without going through the proper exam process (e.g., adding marks directly).
12. **System Field Overwrite**: Attempting to overwrite a system-generated ID.

## Implementation Details
The application uses a flat `state` collection for syncing local storage. To secure this:
- We will transition to `state/{schoolId}_{key}` or similar if possible, OR enforce `schoolId` inside the `data` object.
- Since the current code uses `doc(db, 'state', key)`, we will restrict `state/{key}` to be readable/writable only by authorized staff of the active school.
