# Test Cases

---

# TC-001

## Module

Authentication

## Requirement

Users must authenticate using valid credentials.

## Preconditions

- User exists.
- Database running.

## Test Data

Email:

admin@test.com

Password:

123456

## Steps

1. Open Login page.
2. Enter email.
3. Enter password.
4. Click Login.

## Expected Result

Dashboard is displayed.

JWT is created.

User session starts.

## Actual Result

(To be completed during execution)

## Status

☐ Pass

☐ Fail

---

# TC-002

Module

Authentication

Requirement

Invalid password.

Preconditions

Registered user.

Steps

...

Expected Result

Invalid credentials message.

Status

Pass / Fail

| ID     | Module    | Test              |
| ------ | --------- | ----------------- |
| TC-001 | Login     | Valid credentials |
| TC-002 | Login     | Wrong password    |
| TC-003 | Register  | Existing email    |
| TC-004 | Dashboard | Authorized access |
| TC-005 | Routes    | Create Route      |
| TC-006 | Favorites | Add Favorite      |
| TC-007 | Chat      | Send Message      |
