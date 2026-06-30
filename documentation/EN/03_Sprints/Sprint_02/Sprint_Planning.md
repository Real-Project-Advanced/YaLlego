# Sprint 02 Planning

## General Information

| Field            | Value                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Sprint           | Sprint 02                                                                                        |
| Duration         | 30 days                                                                                          |
| Scrum Master     | Tobias (later replaced by Juan Sebastián, who took on both PO and SM roles)                      |
| Product Owner    | Juan Sebastián Mosquera                                                                          |
| Development Team | Miguel Angel Restrepo, Daniel Perez Bustamante, Daniel Tobias Atehortúa, Juan Sebastian Mosquera |

---

# Sprint Description

After establishing the initial project structure during Sprint 01, Sprint 02 focused on implementing the first functional features of the system.

The main goal was to develop the complete user authentication flow (Registration and Login), build user-facing forms, connect the application to the backend via Next.js Server Actions, and begin integrating AI-related features through embedding generation and storage using Ollama.

This sprint represented the transition from project setup to the development of features that would be used directly by end users.

---

# Sprint Goal

By the end of Sprint 02, the system must allow:

- Registering new users.
- Logging in securely.
- Validating forms on the client side.
- Processing information via Server Actions.
- Configuring the database.
- Generating and storing embeddings.
- Preparing the system for future AI-driven queries.

---

# Selected User Stories

| ID      | Story                  | Priority | Story Points | Status    |
| ------- | ---------------------- | -------- | ------------ | --------- |
| Feature | Registration and Login | High     | 5            | Completed |
| US-012  | Forms                  | High     | 5            | Completed |
| US-013  | Server Actions         | High     | 5            | Completed |
| US-014  | Embeddings             | Medium   | 3            | Completed |
| US-015  | Vector Database        | High     | 5            | Completed |
| US-016  | Embedding Queries      | High     | 5            | Completed |
| US-017  | AI Responses           | Medium   | 5            | Completed |

---

# Sprint Scope

## Authentication

- User registration.
- Login.
- Credential validation.
- Session management.
- Route protection.
- Initial AI chat.

---

## Forms

- Interactive forms.
- TypeScript validation.
- Error handling.
- Backend communication.

---

## Backend

- Server Actions implementation.
- Prisma integration.
- Server-side validations.
- Exception handling.

---

## Artificial Intelligence

- Embedding generation.
- Storage in vector database.
- pgvector setup.
- Initial semantic queries.
- Model response handling.

---

# Identified Risks

| Risk                      | Probability | Impact | Mitigation Plan                                         |
| ------------------------- | ----------- | ------ | ------------------------------------------------------- |
| Authentication errors     | High        | High   | Continuously test Login and Registration flow.          |
| Server Actions issues     | Medium      | High   | Implement exception handling and validations.           |
| pgvector misconfiguration | Medium      | High   | Run local tests before integrating into the project.    |
| Git branch conflicts      | High        | Medium | Review changes before performing merge or rebase.       |
| Team member absences      | Medium      | Medium | Redistribute tasks and maintain constant communication. |

---

# Definition of Ready Applied

Before starting the sprint, all selected stories met the following criteria:

- User Story defined.
- Acceptance Criteria established.
- Estimation completed.
- Priority assigned.
- Dependencies identified.
- Tasks registered in Jira.

---

# Definition of Done Applied

Each story is considered done when:

- Development is complete.
- Code compiles successfully.
- No critical bugs remain.
- Functional tests pass.
- Documentation has been updated.
- Changes are integrated into the project's main branch.

---

# Sprint Schedule

| Week   | Activities                                              |
| ------ | ------------------------------------------------------- |
| Week 1 | Login and Registration implementation.                  |
| Week 2 | Forms and Server Actions development.                   |
| Week 3 | Embeddings and Vector Database integration.             |
| Week 4 | Semantic queries, AI responses, testing, and bug fixes. |

---

# Success Criteria

The sprint is considered successful if:

- All user stories were implemented.
- The authentication process works correctly.
- Forms validate data before submission.
- Frontend-to-backend communication is stable.
- Embeddings can be stored and retrieved correctly.
- Project documentation remains up to date.
- The system is ready for Sprint 03 development.
