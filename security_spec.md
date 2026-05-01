# Firebase Security Specification

## Data Invariants
1. A customer must belong to the authenticated user (`userId`).
2. A milk entry must reference a valid customer and belong to the user.
3. A payment must reference a valid customer and belong to the user.
4. Settings are specific to each user.
5. `amount` in entries must be `quantity * rate`.
6. Timestamps/Dates should be valid strings or numbers.

## The Dirty Dozen Payloads
1. **Unauthenticated Write**: Create a customer without being logged in. (Deny)
2. **Spoofed User ID**: Create a customer with a `userId` that is not yours. (Deny)
3. **Ghost Fields**: Create a customer with an extra `isAdmin: true` field. (Deny)
4. **Invalid Milk Type**: Create a customer with `milkType: 'Camel'`. (Deny)
5. **Orphaned Entry**: Create a milk entry for a non-existent customer. (Deny)
6. **Account Hijack**: Try to read another user's settings. (Deny)
7. **Cross-User Query**: Try to list all customers from the entire database. (Deny - unless filtered by userId)
8. **Immutable Field Update**: Try to change the `userId` of an existing customer. (Deny)
9. **Zero Quantity Entry**: Create a milk entry with `quantity: 0`. (Deny)
10. **Future Entry**: (Optional but good) Create a milk entry with a date in the future. (Deny)
11. **Excessive String Length**: Create a customer name with 10,000 characters. (Deny)
12. **Negative Rate**: Create a milk entry with a negative rate. (Deny)

## Test Plan
- Verify that only authenticated users can read/write their own data.
- Verify that `userId` is strictly enforced.
- Verify that data types and enums are validated.
- Verify that relational records (entries, payments) are checked against their owners.
