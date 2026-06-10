# ANTIGRAFITY_RULES.md

# Antigravity AI System Rules

## Rule 1

Always use:

```typescript
strict: true
```

Never disable:

```typescript
any
```

---

## Rule 2

All database operations must use:

```typescript
Prisma ORM
```

Never use:

* Raw Mongo Query
* Direct Collection Access

Except audited repository layer.

---

## Rule 3

Every input must use:

```typescript
Zod Validation
```

Client validation alone is forbidden.

---

## Rule 4

All pages must perform:

Server Side RBAC Check

Before rendering.

---

## Rule 5

Never trust role sent by browser.

Role source:

Server Session Only.

---

## Rule 6

All protected routes must use:

Middleware

and

Server Verification.

---

## Rule 7

Never store password in plaintext.

Allowed:

* Argon2id
* bcrypt

---

## Rule 8

Every critical action must create:

AuditLog

Actions:

* Create
* Update
* Delete
* Revision
* Reject
* Bundle
* Manifest
* Upload
* Approval

---

## Rule 9

AuditLog is immutable.

Forbidden:

* UPDATE AuditLog
* DELETE AuditLog

---

## Rule 10

COMPLETED data is immutable.

No update.

No delete.

---

## Rule 11

All file uploads must use:

Presigned URL.

Forbidden:

```typescript
/public/uploads
```

---

## Rule 12

File validation required.

Allowed:

* PDF
* JPG
* PNG

Forbidden:

* EXE
* PHP
* JS
* SH

---

## Rule 13

Every service method must return:

```typescript
Result<T>
```

Pattern:

```typescript
type Result<T> = {
 success:boolean
 data?:T
 error?:string
}
```

---

## Rule 14

Business Rules belong in:

```text
services/
```

Never inside:

* UI
* API Route

---

## Rule 15

Database access only through:

```text
repositories/
```

---

## Rule 16

No Prisma call inside components.

Forbidden:

```typescript
await prisma.user.findMany()
```

inside React component.

---

## Rule 17

Server Components by default.

Client Components only when required.

---

## Rule 18

Use React Hook Form.

Never build forms manually.

---

## Rule 19

Use shadcn/ui.

Avoid custom components when equivalent exists.

---

## Rule 20

Every pull request must satisfy:

* Type Safe
* Lint Pass
* Build Pass
* No Any
* No Console Log
* Audit Enabled

---

# Definition of Production Ready

✔ RBAC Complete

✔ Validation Complete

✔ Audit Complete

✔ Notification Complete

✔ Responsive Complete

✔ Security Complete

✔ Build Success

✔ No Critical Bug
