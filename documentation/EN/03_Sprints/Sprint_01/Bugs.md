# Bugs — Sprint 01

## Summary

During Sprint 01, several errors related to the initial project configuration were identified.

---

## Bug Log

| ID      | Description                          | Severity | Status |
| ------- | ------------------------------------ | -------- | ------ |
| BUG-001 | Prisma migration error               | High     | Closed |
| BUG-002 | Component not rendering correctly    | Medium   | Closed |
| BUG-003 | Routing issue                        | Medium   | Closed |
| BUG-004 | Tailwind styling error               | Low      | Closed |
| BUG-005 | Husky and ESLint configuration error | Low      | Closed |

---

## Detail

### BUG-001

Description:

The initial Prisma migration failed due to schema inconsistencies and an incorrect database call.

Resolution:

Migrations were regenerated and the schema was updated.

---

### BUG-002

Description:

Some components were not displaying information correctly.

Resolution:

Fixed component props and rendering logic.

---

### BUG-003

Description:

Using modified Link routes caused confusion and broken navigation.

Resolution:

Stopped using modified routes and switched to automatic routes provided by the Next.js App Router.

---

### BUG-004

Description:

Deprecated class usage error in Tailwind.

Resolution:

Updated class names and upgraded to the latest version of Tailwind.

---

### BUG-005

Description:

Husky configuration prevented reading commits and ESLint was not compiling.

Resolution:

Temporarily disabled Husky and fixed the ESLint configuration.
