# Bugs — Sprint 02

## Summary

During Sprint 02, several errors were identified related to authentication, database integration, and AI feature development. Most were fixed within the same sprint.

---

# Bug Log

| ID      | Module          | Severity | Status |
| ------- | --------------- | -------- | ------ |
| BUG-001 | Login           | Critical | Closed |
| BUG-002 | Registration    | High     | Closed |
| BUG-003 | Middleware      | High     | Closed |
| BUG-004 | Server Actions  | Medium   | Closed |
| BUG-005 | Prisma          | Critical | Closed |
| BUG-006 | Embeddings      | Medium   | Closed |
| BUG-007 | Vector Database | High     | Closed |
| BUG-008 | AI Query        | Low      | Closed |

---

# Bug Details

## BUG-001 — Authentication Error

**Module:** Login
**Severity:** Critical

**Description:**
The system allowed login with invalid credentials due to incorrect validation.

**Resolution:**

- Fixed credential validation logic.
- Password hash is now verified before creating the session.

**Status:** Closed

---

## BUG-002 — Duplicate Registration

**Module:** Registration
**Severity:** High

**Description:**
It was possible to register a user with an already existing email address.

**Resolution:**

- Added a pre-validation check against the database.
- An informative message is now shown to the user.

**Status:** Closed

---

## BUG-003 — Access to Protected Routes

**Module:** Middleware
**Severity:** High

**Description:**
Some routes could be accessed without authentication.

**Resolution:**

- Middleware updated.
- Token is now validated before granting access.

**Status:** Closed

---

## BUG-004 — Server Actions Error

**Module:** Backend
**Severity:** Medium

**Description:**
Exceptions thrown by Server Actions were not handled correctly.

**Resolution:**
Implemented proper error handling using `try/catch` blocks.

**Status:** Closed

---

## BUG-005 — Prisma Migrations

**Module:** Database
**Severity:** Critical

**Description:**
Migrations failed due to inconsistencies between the schema and the database.

**Resolution:**

- Migrations were recreated.
- Prisma schema was synchronized.

**Status:** Closed

---

## BUG-006 — Embedding Generation

**Module:** AI
**Severity:** Medium

**Description:**
Generated embeddings did not have the expected format.

**Resolution:**
Processing was adjusted before storage.

**Status:** Closed

---

## BUG-007 — Vector Storage

**Module:** PostgreSQL + pgvector
**Severity:** High

**Description:**
The database was not storing some vectors correctly.

**Resolution:**
pgvector configuration was fixed and the data type used was validated.

**Status:** Closed

---

## BUG-008 — AI Responses

**Module:** AI Query
**Severity:** Low

**Description:**
In some queries, the AI responded without using the retrieved context.

**Resolution:**
System prompt and context passing were improved.

**Status:** Closed

---

# Final Summary

| Severity | Count |
| -------- | ----- |
| Critical | 2     |
| High     | 3     |
| Medium   | 2     |
| Low      | 1     |

**Total bugs logged:** **8**

All errors were fixed before Sprint 02 closed. No open issues were carried over to the next sprint.
