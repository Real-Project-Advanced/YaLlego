# Definition of Done (DoD)

## Purpose

The Definition of Done (DoD) establishes the minimum quality criteria that every Product Backlog Item (PBI) must satisfy before it can be considered complete.

The objective is to ensure consistency, maintain software quality, and reduce technical debt by defining a shared understanding of what "finished" means for the entire development team.

---

# Objectives

- Ensure every feature meets quality standards.
- Reduce production defects.
- Improve code maintainability.
- Standardize development practices.
- Guarantee that delivered functionality is deployable.

---

# Definition of Done Checklist

A task or User Story is considered **Done** only when all the following criteria are satisfied.

## Development

- Source code has been fully implemented.
- Business requirements have been completed.
- Coding standards have been followed.

---

## Code Quality

- ESLint reports no errors.
- TypeScript compilation succeeds.
- No unused variables or imports.
- Code follows project conventions.

---

## Database

- Required migrations have been created.
- Prisma schema is updated if necessary.
- Database relationships are validated.

---

## Testing

- Functional tests completed.
- Existing functionality verified.
- No Critical or High severity bugs remain.
- Acceptance Criteria successfully validated.

---

## Review

- Pull Request created.
- Code Review completed.
- Comments addressed.
- Approved by at least one team member.

---

# Exit Criteria

A User Story is considered complete only when every item in this checklist has been satisfied.

Failure to meet any criterion means the task remains **In Progress**.
